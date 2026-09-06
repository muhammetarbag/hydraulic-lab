import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  initialState,
  stepSimulation,
  applyFailure,
  accumulatorVolume,
  gasPressure,
  consumerAvailable,
  warnings,
  RELIEF,
  type SimState,
  type Failure,
} from '../lib/simulation.ts';
import { components, questions, lessons, failures } from '../lib/content.ts';
function run(s: SimState, seconds: number): SimState {
  for (let t = 0; t < seconds; t += 0.05) s = stepSimulation(s, 0.05);
  return s;
}
void test('closed-center valve retains nominal pressure with small makeup flow', () => {
  const s = run(initialState(), 20);
  assert.ok(s.pressure > 2950 && s.pressure <= 3000);
  assert.equal(s.positions.flight, 0.15);
  assert.equal(s.actuatorFlow, 0);
  assert.ok(s.pumpFlow < 0.01);
});
void test('cold start charges accumulator from finite gas preload without fluid creation', () => {
  let s = initialState(true);
  assert.equal(accumulatorVolume(s.pressure), 0);
  assert.equal(gasPressure(s), 1000);
  s = run({ ...s, mainOn: true }, 15);
  assert.ok(s.pressure > 2950);
  assert.ok(accumulatorVolume(s.pressure) > 0.5);
  assert.ok(s.reservoir < 7.5);
  assert.ok(
    Math.abs(
      s.reservoir + accumulatorVolume(s.pressure) + s.pressure * 0.000035 - 7.5,
    ) < 0.000001,
  );
});
void test('selector extends, holds, and retracts; endpoint consumption stops', () => {
  let s = run({ ...initialState(), valve: 1 }, 10);
  assert.equal(s.positions.flight, 1);
  assert.equal(s.actuatorFlow, 0);
  s = run({ ...s, valve: 0 }, 5);
  assert.equal(s.positions.flight, 1);
  s = run({ ...s, valve: -1 }, 10);
  assert.equal(s.positions.flight, 0);
  assert.equal(s.actuatorFlow, 0);
});
void test('pump failure gives finite accumulator support and eventually low pressure', () => {
  const failed = applyFailure(initialState(), 'main'),
    early = run(failed, 1),
    late = run(failed, 240);
  assert.ok(early.positions.flight > 0.15);
  assert.ok(early.pressure < 3000 && early.pressure > 1500);
  assert.ok(late.pressure < 1500);
  assert.equal(accumulatorVolume(late.pressure), 0);
  assert.ok(warnings(late).includes('HYD LOW PRESS'));
});
void test('failed accumulator loses support faster than healthy accumulator', () => {
  const healthy = run({ ...initialState(), mainOn: false, valve: 1 }, 3),
    failed = run(
      { ...applyFailure(initialState(), 'accumulator'), mainOn: false },
      3,
    );
  assert.ok(healthy.pressure > failed.pressure + 500);
  assert.equal(gasPressure(failed), 0);
});
void test('auxiliary electric pump recovers main-pump failure', () => {
  const s = run(
    { ...applyFailure(initialState(), 'main'), electricOn: true },
    30,
  );
  assert.ok(s.pressure > 2900);
  assert.equal(s.mainFlow, 0);
  assert.ok(s.electricFlow > 0);
});
void test('electric failure scenario recovers using main pump', () => {
  let s = run(applyFailure(initialState(), 'electric'), 25);
  assert.ok(s.pressure < 2000);
  s = run({ ...s, mainOn: true }, 15);
  assert.ok(s.pressure > 2950);
  assert.equal(s.electricFlow, 0);
});
void test('RAT requires airspeed, cannot flow against a higher manifold pressure', () => {
  let s = run({ ...initialState(), ratOn: true }, 10);
  assert.equal(s.ratFlow, 0);
  s = run({ ...initialState(true), ratOn: true, airspeed: 85 }, 20);
  assert.equal(s.pressure, 0);
  assert.ok(warnings(s).includes('RAT AIRSPEED INSUFFICIENT'));
  s = run({ ...s, airspeed: 180 }, 30);
  assert.ok(s.pressure > 2600 && s.pressure <= 2700);
});
void test('RAT-only priority isolates gear and steering but permits flight and brakes', () => {
  const s = {
    ...initialState(true),
    ratOn: true,
    consumer: 'gear' as const,
    valve: 1 as const,
  };
  let result = run(s, 30);
  assert.equal(result.positions.gear, 0);
  assert.equal(consumerAvailable(result, 'steering'), false);
  assert.equal(consumerAvailable(result, 'brakes'), true);
  result = run({ ...result, consumer: 'flight', valve: 1 }, 12);
  assert.ok(result.positions.flight > 0.9);
});
void test('external leak depletes shared reservoir and reduces pressure even with backup', () => {
  const s = run(
    { ...applyFailure(initialState(), 'leak'), electricOn: true, ratOn: true },
    180,
  );
  assert.ok(s.reservoir < 1.8);
  assert.ok(s.pressure < 1500);
  assert.ok(warnings(s).includes('HYD RSVR LOW LEVEL'));
});
void test('low reservoir restricts pump performance under demand', () => {
  const normal = run({ ...initialState(), consumer: 'gear', valve: 1 }, 4),
    low = run(
      {
        ...applyFailure(initialState(), 'lowLevel'),
        consumer: 'gear',
        valve: 1,
      },
      4,
    );
  assert.ok(low.pressure < normal.pressure);
  assert.ok(low.positions.gear < normal.positions.gear);
  assert.ok(warnings(low).includes('HYD RSVR LOW LEVEL'));
});
void test('clogged main suction filter reduces pressure and actuator travel', () => {
  const normal = run({ ...initialState(), consumer: 'gear', valve: 1 }, 5),
    clogged = run(
      { ...applyFailure(initialState(), 'filter'), consumer: 'gear', valve: 1 },
      5,
    );
  assert.ok(clogged.pressure < normal.pressure - 500);
  assert.ok(clogged.positions.gear < normal.positions.gear);
  assert.ok(warnings(clogged).includes('FILTER RESTRICTION'));
});
void test('healthy relief opens during regulator fault and limits pressure', () => {
  const s = run({ ...initialState(), stress: true }, 20);
  assert.ok(s.pressure > RELIEF && s.pressure < RELIEF + 40);
  assert.ok(s.reliefFlow > 0.1);
});
void test('stuck-open relief produces bypass and lower pressure', () => {
  const s = run(applyFailure(initialState(), 'reliefOpen'), 20);
  assert.ok(s.pressure < 2000);
  assert.ok(s.reliefFlow > 0.1);
});
void test('stuck-closed relief alone does not overpressurize; added regulator fault does', () => {
  let s = run(applyFailure(initialState(), 'reliefClosed'), 20);
  assert.ok(s.pressure <= 3000);
  assert.equal(s.reliefFlow, 0);
  s = run({ ...s, stress: true }, 20);
  assert.ok(s.pressure > 3800);
  assert.equal(s.reliefFlow, 0);
  assert.ok(warnings(s).includes('HYD OVERPRESSURE'));
});
void test('stuck selector holds consumer while pressure remains normal', () => {
  const s = run(applyFailure(initialState(), 'selector'), 20);
  assert.equal(s.positions.flight, 0.15);
  assert.equal(s.actuatorFlow, 0);
  assert.ok(s.pressure > 2950);
});
void test('pause, reset and isolated scenarios are deterministic', () => {
  const s = { ...initialState(), paused: true };
  assert.deepEqual(stepSimulation(s, 1), s);
  assert.deepEqual(stepSimulation(s, NaN), s);
  const dirty = { ...s, stress: true, electricOn: true, ratOn: true };
  const reset = applyFailure(dirty, 'none');
  assert.equal(reset.stress, false);
  assert.equal(reset.electricOn, false);
  assert.equal(reset.ratOn, false);
  assert.equal(reset.paused, false);
});
void test('all 9 failures remain numerically bounded for 5 minutes', () => {
  for (const failure of failures) {
    const s = run(
      {
        ...applyFailure(initialState(), failure.id as Failure),
        stress: true,
        ratOn: true,
        electricOn: true,
      },
      300,
    );
    for (const n of [s.pressure, s.reservoir, s.pumpFlow, s.accFlow])
      assert.ok(Number.isFinite(n), failure.id);
    assert.ok(s.pressure >= 0 && s.pressure <= 4500);
    assert.ok(s.reservoir >= 0 && s.reservoir <= 9);
    for (const p of Object.values(s.positions)) assert.ok(p >= 0 && p <= 1);
  }
});
void test('education coverage has 16 complete components, 8 lessons and 24 explained questions', () => {
  assert.equal(components.length, 16);
  assert.equal(failures.length, 9);
  assert.equal(lessons.length, 8);
  assert.equal(questions.length, 24);
  assert.equal(new Set(questions.map((q) => q.id)).size, 24);
  for (const c of components)
    for (const value of Object.values(c)) assert.ok(value.length > 0);
  for (const l of lessons) {
    assert.equal(l.questions.length, 3);
    for (const id of l.questions) assert.ok(questions.some((q) => q.id === id));
  }
  for (const q of questions) {
    assert.equal(q.options.length, 3);
    assert.equal(q.reasons.length, 3);
    assert.ok(q.correct >= 0 && q.correct < 3);
    for (const reason of q.reasons) assert.ok(reason.length > 10);
  }
});
