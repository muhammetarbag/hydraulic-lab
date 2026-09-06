'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import {
  initialState,
  stepSimulation,
  applyFailure,
  type Failure,
  type SimState,
} from './simulation';
const failureIds: Failure[] = [
  'none',
  'main',
  'electric',
  'leak',
  'lowLevel',
  'filter',
  'accumulator',
  'reliefOpen',
  'reliefClosed',
  'selector',
];
export function useSimulation() {
  const [state, setState] = useState(initialState),
    ref = useRef(state);
  const commit = useCallback((next: SimState) => {
    ref.current = next;
    setState(next);
  }, []);
  const change = useCallback(
    (patch: Partial<SimState>) => commit({ ...ref.current, ...patch }),
    [commit],
  );
  const reset = useCallback(
    (cold = false) => commit(initialState(cold)),
    [commit],
  );
  const fail = useCallback(
    (id: Failure) => commit(applyFailure(ref.current, id)),
    [commit],
  );
  useEffect(() => {
    let previous = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      commit(
        stepSimulation(ref.current, Math.min((now - previous) / 1000, 0.25)),
      );
      previous = now;
    }, 50);
    return () => clearInterval(timer);
  }, [commit]);
  useEffect(() => {
    type Tool = {
      name: string;
      description: string;
      inputSchema: object;
      annotations: { readOnlyHint: boolean };
      execute: (input: unknown) => unknown;
    };
    const context = (
      document as Document & {
        modelContext?: {
          registerTool: (
            tool: Tool,
            options: { signal: AbortSignal },
          ) => void | Promise<void>;
        };
      }
    ).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const snapshot = () => ({
      pressurePsi: Math.round(ref.current.pressure),
      reservoirLitres: ref.current.reservoir,
      mainOn: ref.current.mainOn,
      electricOn: ref.current.electricOn,
      ratOn: ref.current.ratOn,
      valve: ref.current.valve,
      consumer: ref.current.consumer,
      failure: ref.current.failure,
      positions: { ...ref.current.positions },
    });
    const tools: Tool[] = [
      {
        name: 'read_hydraulic_state',
        description:
          'Read the live training simulator pressure, controls and consumer positions.',
        inputSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true },
        execute: () => snapshot(),
      },
      {
        name: 'set_hydraulic_training_scenario',
        description:
          'Reset the visible training system to one of its nine single-failure scenarios, or a healthy state.',
        inputSchema: {
          type: 'object',
          properties: { failure: { type: 'string', enum: failureIds } },
          required: ['failure'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false },
        execute: (input: unknown) => {
          if (
            typeof input !== 'object' ||
            input === null ||
            Object.keys(input).length !== 1 ||
            !('failure' in input) ||
            !failureIds.includes(input.failure as Failure)
          )
            throw new Error('Geçerli bir failure değeri gerekli.');
          flushSync(() => fail(input.failure as Failure));
          return snapshot();
        },
      },
    ];
    for (const tool of tools) {
      try {
        Promise.resolve(
          context.registerTool(tool, { signal: lifecycle.signal }),
        ).catch(() => {});
      } catch {
        /* İsteğe bağlı tarayıcı uzantısı simülasyonu durdurmaz. */
      }
    }
    return () => lifecycle.abort();
  }, [fail]);
  return { state, change, reset, fail };
}
