/* oxlint-disable jsx-a11y/prefer-tag-over-role -- Inline SVG cutaways expose accessible descriptions while retaining vector geometry. */
'use client';
import { useId } from 'react';
import {
  ArrowDownToLine,
  Lightbulb,
  Power,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { componentMap } from '@/lib/content';
import {
  accumulatorVolume,
  gasPressure,
  sourceStatus,
  type ComponentId,
  type SimState,
} from '@/lib/simulation';
export interface DetailProps {
  id: ComponentId;
  state: SimState;
  onChange: (patch: Partial<SimState>) => void;
  compact?: boolean;
}
export function Cutaway({ id, state: s }: Pick<DetailProps, 'id' | 'state'>) {
  const uniqueId = useId().replace(/:/g, '');
  const acc = s.failure === 'accumulator' ? 0 : accumulatorVolume(s.pressure),
    piston = Number((196 - acc * 174).toFixed(3));
  const pos = s.positions[s.consumer],
    active =
      id === 'electric'
        ? sourceStatus(s).electric
        : id === 'rat'
          ? sourceStatus(s).rat
          : id === 'pump'
            ? sourceStatus(s).main
            : s.pumpFlow > 0.002,
    reverse = s.valve < 0;
  if (id === 'accumulator')
    return (
      <svg
        className="cutaway"
        viewBox="0 0 310 230"
        role="img"
        aria-label={`Akümülatör kesiti: azot basıncı ${Math.round(gasPressure(s))} psi, sıvı hacmi ${acc.toFixed(2)} litre`}
      >
        <defs>
          <clipPath id={`${uniqueId}-acc-inner`}>
            <rect x="39" y="22" width="126" height="174" rx="45" />
          </clipPath>
          <pattern
            id={`${uniqueId}-gas-dots`}
            width="14"
            height="14"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="4" cy="4" r="1.4" fill="#a1cfdf" />
          </pattern>
        </defs>
        <path d="M103 5 V22 M103 196 V224" stroke="#8aa6b9" strokeWidth="5" />
        <g clipPath={`url(#${uniqueId}-acc-inner)`}>
          <rect x="39" y="22" width="126" height="174" fill="#203e50" />
          <rect
            x="39"
            y="22"
            width="126"
            height={piston - 22}
            fill={`url(#${uniqueId}-gas-dots)`}
          />
          <rect
            x="39"
            y={piston}
            width="126"
            height={196 - piston}
            fill="#994c5a"
          />
          <path d={`M39 ${piston} H165`} stroke="#c8dce7" strokeWidth="8" />
        </g>
        <rect
          x="34"
          y="17"
          width="136"
          height="184"
          rx="49"
          className="symbol"
          strokeWidth="3"
        />
        <text x="103" y="66" textAnchor="middle" className="gas-label">
          N₂
        </text>
        <text x="103" y="86" textAnchor="middle" className="symbol-small">
          AZOT
        </text>
        <path d="M163 62 H193" stroke="#91b9cb" />
        <text x="202" y="59" className="node-name">
          Gaz bölmesi
        </text>
        <text x="202" y="79" className="node-english">
          {Math.round(gasPressure(s)).toLocaleString('en-US')} psi
        </text>
        <path d={`M170 ${piston} H190`} stroke="#d2e2e9" />
        <text x="202" y={piston + 4} className="node-english">
          Ayırıcı
        </text>
        <path d="M156 182 H193" stroke="#ff6670" />
        <text x="202" y="181" className="node-name">
          Hidrolik sıvı
        </text>
        <text x="202" y="201" className="node-english">
          {acc.toFixed(2)} L rezerv
        </text>
        <text x="103" y="225" textAnchor="middle" className="symbol-small">
          {s.accFlow > 0.002
            ? 'ŞARJ ↑'
            : s.accFlow < -0.002
              ? 'DEŞARJ ↓'
              : 'DENGE'}
        </text>
      </svg>
    );
  if (id === 'actuator' || id === 'selector') {
    const x = 68 + pos * 125;
    return (
      <svg
        className="cutaway"
        viewBox="0 0 310 205"
        role="img"
        aria-label={`Çift etkili aktüatör kesiti, konum yüzde ${Math.round(pos * 100)}`}
      >
        <path d="M48 160 V119 M231 160 V119" stroke="#809bae" strokeWidth="5" />
        <rect
          x="27"
          y="45"
          width="226"
          height="83"
          rx="9"
          className="symbol"
          strokeWidth="3"
        />
        <rect
          x="32"
          y="50"
          width={x - 32}
          height="73"
          fill={reverse ? '#274f77' : '#804653'}
        />
        <rect
          x={x}
          y="50"
          width={248 - x}
          height="73"
          fill={reverse ? '#804653' : '#274f77'}
        />
        <rect x={x - 5} y="48" width="10" height="77" fill="#bfd5e2" />
        <path
          d={`M${x + 5} 87 H${x + 100}`}
          stroke="#b8c7d2"
          strokeWidth="12"
        />
        <text x="48" y="177" className="symbol-small">
          A
        </text>
        <text x="229" y="177" className="symbol-small">
          B
        </text>
        <text x="155" y="25" textAnchor="middle" className="symbol-small">
          ÇİFT ETKİLİ SİLİNDİR
        </text>
        <text x="155" y="200" textAnchor="middle" className="node-english">
          {s.valve === 0
            ? 'Nötr · iş portları kapalı'
            : s.valve === 1
              ? 'Uzat · P → A / B → T'
              : 'Geri çek · P → B / A → T'}
        </text>
      </svg>
    );
  }
  return (
    <svg
      className="cutaway mini-cutaway"
      viewBox="0 0 310 150"
      role="img"
      aria-label={`${componentMap[id].name} çalışma ilkesi`}
    >
      <path
        d="M10 75 H100 M210 75 H300"
        className="pipe-base"
        stroke="#ff6670"
      />
      <path
        d="M10 75 H100 M210 75 H300"
        className={`pipe-color ${active ? 'pressurized' : ''}`}
        stroke="#ff6670"
      />
      {active && !s.paused && (
        <path
          d="M10 75 H100 M210 75 H300"
          className="pipe-flow"
          stroke="#ff6670"
        />
      )}
      <rect
        x="105"
        y="25"
        width="100"
        height="100"
        rx="14"
        className="node-bg"
      />
      {id === 'filter' ? (
        <g>
          <path d="M155 39 L190 75 L155 111 L120 75 Z" className="symbol" />
          <path
            d="M134 62 L168 97 M141 54 L177 89 M150 45 L185 81"
            className="symbol"
          />
        </g>
      ) : id === 'relief' || id === 'regulator' ? (
        <g>
          <path
            d="M133 45 V103 H166 V45 Z M167 75 H174 L180 60 L187 90 L194 75"
            className="symbol"
          />
          <path
            d={
              s.reliefFlow > 0.01
                ? 'M150 48 V100 M141 88 L150 100 L159 88'
                : 'M138 69 H161 M138 81 H161'
            }
            className="symbol"
          />
        </g>
      ) : id === 'reservoir' || id === 'fluid' ? (
        <g>
          <rect
            x="126"
            y="45"
            width="58"
            height="64"
            rx="5"
            className="symbol"
          />
          <rect
            x="130"
            y={103 - (s.reservoir / 9) * 52}
            width="50"
            height={(s.reservoir / 9) * 52}
            fill="#4687bc"
            opacity=".55"
          />
        </g>
      ) : id === 'check' ? (
        <path
          d="M122 75 H136 M136 56 L165 75 L136 94 Z M168 55 V95 M168 75 H192"
          className="symbol"
        />
      ) : id === 'pump' || id === 'electric' || id === 'rat' ? (
        <g transform="translate(155 75)">
          <circle r="32" className="symbol" />
          <g className={active && !s.paused ? 'pump-spin' : ''}>
            <path d="M-18 11 L0 -23 L18 11 Z" fill="#d78690" />
          </g>
        </g>
      ) : (
        <g>
          <path d="M123 75 H187 M176 63 L189 75 L176 87" className="symbol" />
          <circle cx="155" cy="75" r="27" className="symbol" />
        </g>
      )}
      <text x="40" y="109" textAnchor="middle" className="node-english">
        Giriş
      </text>
      <text x="266" y="109" textAnchor="middle" className="node-english">
        Çıkış
      </text>
    </svg>
  );
}
export function ComponentDetail({
  id,
  state,
  onChange,
  compact = false,
}: DetailProps) {
  const c = componentMap[id];
  return (
    <div className={`component-detail ${compact ? 'compact' : ''}`}>
      <div className="detail-kicker">
        <Layers size={14} /> PARÇA İNCELEMESİ <span>ATA 29</span>
      </div>
      <h3>{c.name}</h3>
      <p className="english-name">{c.english}</p>
      <Cutaway id={id} state={state} />
      {(id === 'accumulator' || id === 'actuator' || id === 'selector') && (
        <div className="cutaway-controls">
          <button onClick={() => onChange({ mainOn: !state.mainOn })}>
            <Power size={13} />
            {state.mainOn ? 'Pompayı kapat' : 'Pompayı aç'}
          </button>
          <button
            onClick={() => onChange({ valve: state.valve === 1 ? -1 : 1 })}
          >
            <ArrowRight size={13} />
            {state.valve === 1 ? 'Geri çek' : 'Uzat'}
          </button>
        </div>
      )}
      <p className="component-duty">{c.duty}</p>
      <dl>
        {(
          [
            ['Sistemdeki yeri', c.location],
            ['Girişinde ne olur?', c.input],
            ['Çıkışında ne olur?', c.output],
            ['Arızalanırsa', c.failure],
          ] as const
        ).map(([label, text]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{text}</dd>
          </div>
        ))}
      </dl>
      <div className="critical-note">
        <Lightbulb size={18} />
        <div>
          <strong>Sınavda hatırla</strong>
          <p>{c.critical}</p>
        </div>
      </div>
      <div className="detail-footer">
        <ArrowDownToLine size={13} /> Kesit şematiktir; üretici çizimi değildir.
      </div>
    </div>
  );
}
