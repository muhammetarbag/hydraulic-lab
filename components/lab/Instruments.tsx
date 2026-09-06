/* oxlint-disable jsx-a11y/prefer-tag-over-role -- Inline SVG gauges need an accessible image role; img cannot contain vector geometry. */
'use client';
import { Activity, Droplets } from 'lucide-react';
import { accumulatorVolume, RELIEF, type SimState } from '@/lib/simulation';
export function PressureGauge({ value }: { value: number }) {
  const angle = Math.PI + Math.min(value / 4500, 1) * Math.PI;
  return (
    <svg
      viewBox="0 0 150 95"
      className="pressure-gauge"
      role="img"
      aria-label={`${Math.round(value)} psi analog basınç`}
    >
      <path
        d="M12 78 A63 63 0 0 1 138 78"
        fill="none"
        stroke="#2a3d4d"
        strokeWidth="5"
      />
      <path
        d="M130 47 A63 63 0 0 1 138 78"
        fill="none"
        stroke="#ff6670"
        strokeWidth="5"
      />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
        const a = Math.PI + (i / 9) * Math.PI;
        return (
          <line
            key={i}
            x1={(75 + Math.cos(a) * 52).toFixed(3)}
            y1={(78 + Math.sin(a) * 52).toFixed(3)}
            x2={(75 + Math.cos(a) * 58).toFixed(3)}
            y2={(78 + Math.sin(a) * 58).toFixed(3)}
            stroke="#69869c"
          />
        );
      })}
      <path
        d={`M75 78 L${(75 + Math.cos(angle) * 49).toFixed(3)} ${(78 + Math.sin(angle) * 49).toFixed(3)}`}
        stroke={value > RELIEF ? '#ff6670' : '#93d7e6'}
        strokeWidth="2.5"
      />
      <circle cx="75" cy="78" r="5" fill="#b9d0dc" />
      <text x="4" y="93" className="diagram-meta">
        0
      </text>
      <text x="125" y="93" className="diagram-meta">
        4.5k
      </text>
      <text x="75" y="11" textAnchor="middle" className="diagram-meta">
        PSI
      </text>
    </svg>
  );
}
export function Instruments({ state: s }: { state: SimState }) {
  return (
    <div className="instrument-strip">
      <div className="pressure-instrument">
        <div>
          <div className="instrument-label">SİSTEM BASINCI</div>
          <strong
            className={
              s.pressure < 1500
                ? 'amber'
                : s.pressure > RELIEF + 80
                  ? 'red'
                  : ''
            }
            data-testid="system-pressure"
          >
            {Math.round(s.pressure).toLocaleString('en-US')} <small>PSI</small>
          </strong>
          <span className="instrument-caption">Nominal 3000 psi</span>
        </div>
        <PressureGauge value={s.pressure} />
      </div>
      <div>
        <div className="instrument-label">
          <Droplets size={12} /> DEPO SEVİYESİ
        </div>
        <strong className={s.reservoir < 1.8 ? 'amber' : ''}>
          {Math.round((s.reservoir / 9) * 100)}
          <small>%</small>
        </strong>
        <div className="level-track">
          <span style={{ width: `${(s.reservoir / 9) * 100}%` }} />
        </div>
      </div>
      <div>
        <div className="instrument-label">AKÜMÜLATÖR</div>
        <strong>
          {Math.round(s.pressure).toLocaleString('en-US')} <small>PSI</small>
        </strong>
        <span className="instrument-caption">
          Sıvı tarafı ·{' '}
          {s.failure === 'accumulator'
            ? '0.00'
            : accumulatorVolume(s.pressure).toFixed(2)}{' '}
          L rezerv
        </span>
      </div>
      <div>
        <div className="instrument-label">
          <Activity size={12} /> TÜKETİCİ DEBİSİ
        </div>
        <strong>
          {(s.actuatorFlow * 60).toFixed(1)} <small>L/dk</small>
        </strong>
        <span className="instrument-caption">
          Pompa toplamı {(s.pumpFlow * 60).toFixed(1)} L/dk
        </span>
      </div>
      <div>
        <div className="instrument-label">TAHLİYE VALFİ</div>
        <strong
          className={`instrument-word ${s.reliefFlow > 0.005 ? 'amber' : ''}`}
        >
          {s.reliefFlow > 0.005 ? 'AÇIK' : 'KAPALI'}
        </strong>
        <span className="instrument-caption">Açılma eşiği 3450 psi</span>
      </div>
    </div>
  );
}
export function PressureHistory({ values }: { values: number[] }) {
  const points = values
    .map((p, i) => `${(i / 119) * 450},${90 - (p / 4500) * 75}`)
    .join(' ');
  return (
    <div className="history-chart">
      <div>
        <span>BASINÇ GEÇMİŞİ</span>
        <small>Son 30 sn · 0–4500 psi</small>
      </div>
      <svg
        viewBox="0 0 450 106"
        role="img"
        aria-label="Son 30 saniyenin sistem basıncı grafiği"
      >
        <path
          d="M0 90 H450 M0 40 H450"
          stroke="#2b3f4e"
          strokeDasharray="3 5"
        />
        <path d="M0 32.5 H450" stroke="#744d50" strokeDasharray="3 5" />
        <polyline
          points={points}
          fill="none"
          stroke="#82c9e0"
          strokeWidth="2"
        />
        <text x="450" y="28" textAnchor="end" className="diagram-meta">
          RELIEF 3450
        </text>
      </svg>
    </div>
  );
}
