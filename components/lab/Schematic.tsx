/* oxlint-disable jsx-a11y/prefer-tag-over-role -- SVG elements cannot contain HTML buttons or fieldsets; interactive groups have keyboard handlers and accessible roles. */
'use client';
import type { ReactNode } from 'react';
import {
  accumulatorVolume,
  consumerAvailable,
  sourceStatus,
  type ComponentId,
  type SimState,
} from '@/lib/simulation';
interface Props {
  state: SimState;
  selected: ComponentId;
  onSelect: (id: ComponentId) => void;
  highlight?: ComponentId;
}
const pressure = '#ff6670',
  ret = '#59aaff',
  emergency = '#63d9b0';
export function Schematic({ state: s, selected, onSelect, highlight }: Props) {
  const src = sourceStatus(s),
    moving = s.actuatorFlow > 0.001,
    pos = s.positions[s.consumer];
  const acc = s.failure === 'accumulator' ? 0 : accumulatorVolume(s.pressure);
  const failures: Partial<Record<ComponentId, boolean>> = {
    pump: s.failure === 'main',
    electric: s.failure === 'electric',
    pressure: s.failure === 'leak',
    reservoir: s.failure === 'lowLevel',
    filter: s.failure === 'filter',
    accumulator: s.failure === 'accumulator',
    relief: s.failure === 'reliefClosed' || s.failure === 'reliefOpen',
    selector: s.failure === 'selector',
  };
  function node(
    id: ComponentId,
    x: number,
    y: number,
    name: string,
    english: string,
    content: ReactNode,
    w = 104,
    h = 76,
  ) {
    return (
      <g
        role="button"
        tabIndex={0}
        aria-label={`${name} (${english})`}
        aria-pressed={selected === id}
        onClick={() => onSelect(id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(id);
          }
        }}
        className={`schematic-node ${selected === id ? 'selected' : ''} ${highlight === id ? 'highlight' : ''} ${failures[id] ? 'fault-node' : ''}`}
        transform={`translate(${x} ${y})`}
        key={id}
      >
        <title>{`${name} — ayrıntıları aç`}</title>
        <rect
          className="node-bg"
          x={-w / 2}
          y={-h / 2}
          width={w}
          height={h}
          rx={8}
        />
        {content}
        <text className="node-name" y={h / 2 + 24} textAnchor="middle">
          {name}
        </text>
        <text className="node-english" y={h / 2 + 42} textAnchor="middle">
          {english}
        </text>
      </g>
    );
  }
  function pipe(
    d: string,
    color: string,
    flow = false,
    reverse = false,
    key = d,
  ) {
    return (
      <g key={key}>
        <path d={d} stroke={color} className="pipe-base" />
        <path
          d={d}
          stroke={color}
          className={`pipe-color ${flow ? 'pressurized' : ''}`}
        />
        {flow && !s.paused && (
          <path
            d={d}
            stroke={color}
            className={`pipe-flow ${reverse ? 'reverse' : ''}`}
          />
        )}
      </g>
    );
  }
  const pumpSymbol = (on: boolean) => (
    <>
      <circle r="25" className="symbol" />
      <g className={on && !s.paused ? 'pump-spin' : ''}>
        <path d="M-14 8 L0 -17 L14 8 Z" fill={on ? pressure : '#708597'} />
        <path
          d="M-14 -8 L0 17 L14 -8 Z"
          fill={on ? pressure : '#708597'}
          opacity=".28"
        />
      </g>
    </>
  );
  return (
    <svg
      className="system-svg"
      viewBox="0 0 1060 640"
      role="group"
      aria-label="İnteraktif hidrolik sistem şeması"
    >
      <defs>
        <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r=".8" fill="#294052" />
        </pattern>
      </defs>
      <rect width="1060" height="640" fill="url(#grid)" opacity=".48" />
      <text x="30" y="32" className="diagram-meta">
        ATA 29 / SİSTEM MİMARİSİ
      </text>
      <text x="1030" y="32" className="diagram-meta" textAnchor="end">
        P · BASINÇ / T · DÖNÜŞ / A–B · İŞ HATLARI
      </text>
      {pipe('M115 305 H280', ret, s.mainFlow > 0.003)}
      {pipe('M325 266 V175 H545', pressure, s.mainFlow > 0.003)}
      {pipe(
        'M545 175 H800',
        pressure,
        s.mainFlow > 0.003 || s.accFlow < -0.003,
      )}
      {pipe(
        'M545 175 V118',
        pressure,
        Math.abs(s.accFlow) > 0.002,
        s.accFlow < 0,
      )}
      <path d="M405 114 V145 H325 V266" className="sense-line" />
      {pipe('M670 175 V295', pressure, s.reliefFlow > 0.005)}
      {pipe(
        'M670 370 V566 H80 V340',
        ret,
        s.reliefFlow > 0.003,
        false,
        'relief-return',
      )}
      {pipe('M800 175 V317', src.emergencyOnly ? emergency : pressure, moving)}
      {pipe(
        'M800 393 V566 H80 V340',
        ret,
        s.actuatorFlow > 0.003,
        false,
        'selector-return',
      )}
      {pipe(
        'M850 342 H886 V205 H927 V163',
        s.valve < 0 ? ret : pressure,
        moving,
        s.valve < 0,
      )}
      {pipe(
        'M850 368 H1020 V163',
        s.valve < 0 ? pressure : ret,
        moving,
        s.valve > 0,
      )}
      {pipe('M80 340 V464 H274', ret, s.electricFlow > 0.003)}
      {pipe('M371 464 H440 V211 H800', pressure, s.electricFlow > 0.003)}
      {pipe('M80 464 V608 H500 V503', ret, s.ratFlow > 0.003)}
      {pipe('M577 465 H606 V238 H800', emergency, s.ratFlow > 0.003)}
      {[
        [381, 175],
        [395, 464],
        [588, 465],
      ].map(([x, y]) => (
        <g
          key={y + x}
          transform={`translate(${x} ${y})`}
          className="check-symbol"
        >
          <path d="M-9 -8 L2 0 L-9 8 Z M4 -9 V9" />
        </g>
      ))}
      {[545, 670, 800].map((x) => (
        <circle key={x} cx={x} cy="175" r="4" fill={pressure} />
      ))}
      <g
        role="button"
        tabIndex={0}
        aria-label="Basınç hattı (Pressure line)"
        onClick={() => onSelect('pressure')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect('pressure');
          }
        }}
        className={highlight === 'pressure' ? 'line-highlight' : ''}
      >
        <rect x="440" y="153" width="207" height="43" fill="transparent" />
        <text x="459" y="191" className="line-label" fill={pressure}>
          PRESSURE MANIFOLD
        </text>
      </g>
      <g
        role="button"
        tabIndex={0}
        aria-label="Dönüş hattı (Return line)"
        onClick={() => onSelect('return')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect('return');
          }
        }}
        className={highlight === 'return' ? 'line-highlight' : ''}
      >
        <rect x="812" y="525" width="222" height="52" fill="transparent" />
        <text x="840" y="550" className="line-label" fill={ret}>
          RETURN → RESERVOIR
        </text>
      </g>
      <text x="614" y="230" className="line-label" fill={emergency}>
        EMERGENCY
      </text>
      <text x="133" y="287" className="line-label" fill={ret}>
        EMİŞ
      </text>
      {node(
        'reservoir',
        80,
        305,
        'Depo',
        'Reservoir',
        <>
          <rect
            x="-29"
            y="-26"
            width="58"
            height="53"
            rx="5"
            className="symbol"
          />
          <rect
            x="-25"
            y={24 - (s.reservoir / 9) * 44}
            width="50"
            height={(s.reservoir / 9) * 44}
            rx="2"
            fill={ret}
            opacity=".4"
          />
          <path
            d="M-22 -14 H22 M-22 -3 H22 M-22 8 H22"
            stroke={ret}
            opacity=".3"
          />
          <text y="5" textAnchor="middle" className="symbol-value">
            {Math.round((s.reservoir / 9) * 100)}%
          </text>
        </>,
        85,
      )}
      {node(
        'filter',
        205,
        305,
        'Emiş filtresi',
        'Suction filter',
        <>
          <path d="M0 -25 L28 0 L0 25 L-28 0 Z" className="symbol" />
          <path
            d="M-12 -12 L12 12 M-19 -5 L5 19 M-5 -19 L19 5"
            stroke="#7d97aa"
          />
        </>,
        76,
      )}
      {node(
        'pump',
        325,
        305,
        'Ana pompa',
        'Engine-driven pump',
        pumpSymbol(src.main),
        92,
      )}
      {node(
        'regulator',
        405,
        86,
        'Basınç regülatörü',
        'Pump compensator',
        <>
          <path
            d="M-26 0 H-14 L-9 -10 L-2 10 L5 -10 L12 10 L19 0 H27"
            className="symbol"
          />
          <text y="-19" textAnchor="middle" className="symbol-small">
            {s.stress ? 'FAULT' : '3000 PSI'}
          </text>
        </>,
        104,
        56,
      )}
      {node(
        'accumulator',
        545,
        83,
        'Akümülatör',
        'Accumulator',
        <>
          <rect
            x="-22"
            y="-30"
            width="44"
            height="60"
            rx="20"
            className="symbol"
          />
          <rect
            x="-18"
            y={26 - acc * 50}
            width="36"
            height={acc * 50}
            fill={pressure}
            opacity=".55"
          />
          <path
            d={`M-19 ${26 - acc * 50} H19`}
            stroke="#d8e8f1"
            strokeWidth="3"
          />
          <text y="-10" textAnchor="middle" className="symbol-small">
            N₂
          </text>
        </>,
        84,
        70,
      )}
      {node(
        'relief',
        670,
        332,
        'Tahliye valfi',
        'Pressure relief valve',
        <>
          <path d="M-17 -22 V22 H17 V-22 Z" className="symbol" />
          <path
            d={
              s.reliefFlow > 0.005
                ? 'M0 -15 V15 M-6 8 L0 15 L6 8'
                : 'M-10 -6 H10 M-10 6 H10'
            }
            stroke={s.reliefFlow > 0.005 ? ret : '#8fa6b6'}
            strokeWidth="3"
            fill="none"
          />
          <path d="M18 0 H24 L28 -9 L33 9 L38 0" className="symbol" />
        </>,
        96,
      )}
      {node(
        'priority',
        800,
        256,
        'Öncelik',
        'Priority',
        <>
          <path d="M-17 0 H17 M0 -12 V12" className="symbol" />
          <circle r="6" fill={src.emergencyOnly ? emergency : '#8da5b7'} />
        </>,
        80,
        34,
      )}
      {node(
        'selector',
        800,
        355,
        'Yön kontrol valfi',
        'Selector valve',
        <>
          <rect x="-33" y="-20" width="66" height="40" className="symbol" />
          <path
            d={
              s.valve === 0 || s.failure === 'selector'
                ? 'M-24 -8 H-9 M-24 8 H-9 M8 -8 H24 M8 8 H24'
                : s.valve === 1
                  ? 'M-23 -10 H23 M-23 10 H23 M16 -15 L23 -10 L16 -5 M-16 5 L-23 10 L-16 15'
                  : 'M-23 -10 L23 10 M-23 10 L23 -10'
            }
            className="symbol"
          />
          <text x="-36" y="-26" className="symbol-small">
            P
          </text>
          <text x="-36" y="34" className="symbol-small">
            T
          </text>
          <text x="34" y="-26" className="symbol-small">
            A
          </text>
          <text x="34" y="34" className="symbol-small">
            B
          </text>
        </>,
        100,
      )}
      {node(
        'actuator',
        962,
        125,
        'Aktüatör',
        'Double-acting actuator',
        <>
          <rect
            x="-47"
            y="-25"
            width="94"
            height="50"
            rx="4"
            className="symbol"
          />
          <rect
            x="-43"
            y="-21"
            width={14 + pos * 49}
            height="42"
            fill={s.valve < 0 ? ret : pressure}
            opacity=".3"
          />
          <rect
            x={-29 + pos * 49}
            y="-21"
            width={72 - pos * 49}
            height="42"
            fill={s.valve < 0 ? pressure : ret}
            opacity=".2"
          />
          <g transform={`translate(${-29 + pos * 49} 0)`}>
            <path d="M0 -23 V23" stroke="#d6e4ef" strokeWidth="7" />
            <path d="M4 0 H66" stroke="#afbdcb" strokeWidth="8" />
          </g>
        </>,
        134,
      )}
      {node(
        'electric',
        325,
        465,
        'Elektrik pompası',
        'Electric hydraulic pump',
        pumpSymbol(src.electric),
        92,
      )}
      {node(
        'rat',
        525,
        465,
        'Acil güç kaynağı',
        'RAT · hydraulic pump',
        <>
          <g className={src.rat && !s.paused ? 'pump-spin fast' : ''}>
            <path
              d="M0 -5 C-26 -42 18 -38 8 -4 C46 -18 35 24 4 9 C6 50 -33 29 -8 1 Z"
              fill={src.rat ? emergency : '#64818f'}
            />
          </g>
          <circle r="6" fill="#dbe8ef" />
        </>,
        104,
      )}
      {node(
        'check',
        225,
        86,
        'Çek valf',
        'Non-return valve ×3',
        <path
          d="M-25 0 H-12 M-12 -10 L5 0 L-12 10 Z M8 -13 V13 M8 0 H25"
          className="symbol"
        />,
        112,
        56,
      )}
      <text x="894" y="433" className="consumer-meta">
        SEÇİLİ TÜKETİCİ
      </text>
      <text x="894" y="456" className="node-name">
        {
          {
            flight: 'Uçuş kumandaları',
            gear: 'İniş takımı',
            brakes: 'Frenler',
            steering: 'Burun yönlendirme',
          }[s.consumer]
        }
      </text>
      <text x="894" y="481" className="symbol-value">
        {consumerAvailable(s, s.consumer)
          ? `${Math.round(pos * 100)}% KONUM`
          : 'RAT: İZOLE'}
      </text>
      <text x="30" y="631" className="diagram-meta">
        ŞEMATİK · ÖLÇEKLİ DEĞİLDİR · HER PARÇAYI SEÇEREK KEŞFET
      </text>
      {s.failure === 'leak' && (
        <g className="fault-node" transform="translate(722 175)">
          <circle r="16" fill="#381c27" stroke={pressure} />
          <text textAnchor="middle" y="6" fill={pressure}>
            !
          </text>
        </g>
      )}
    </svg>
  );
}
