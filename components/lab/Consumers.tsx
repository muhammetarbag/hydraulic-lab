'use client';
import { consumers } from '@/lib/content';
import {
  consumerAvailable,
  type Consumer,
  type SimState,
} from '@/lib/simulation';
export function ConsumerVisual({
  id,
  position,
}: {
  id: Consumer;
  position: number;
}) {
  return (
    <svg viewBox="0 0 100 57" className="consumer-visual" aria-hidden="true">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {id === 'flight' ? (
          <>
            <path d="M14 28 H81 M49 28 L26 14 M49 28 L28 42" opacity=".5" />
            <g transform={`rotate(${(position - 0.5) * 45} 65 28)`}>
              <path
                d="M50 22 H87 V34 H50 Z"
                fill="currentColor"
                fillOpacity=".12"
              />
            </g>
            <circle cx="65" cy="28" r="3" />
          </>
        ) : id === 'gear' ? (
          <>
            <path d="M19 11 H79" opacity=".5" />
            <g transform={`rotate(${-68 + position * 68} 51 12)`}>
              <path d="M51 12 V42 M42 23 H51" />
              <circle cx="51" cy="44" r="10" />
              <circle cx="51" cy="44" r="3" />
            </g>
          </>
        ) : id === 'brakes' ? (
          <>
            <circle cx="66" cy="29" r="19" opacity=".6" />
            <circle cx="66" cy="29" r="12" />
            <rect x="15" y="19" width="22" height="20" rx="3" />
            <path d={`M37 29 H${41 + position * 11}`} />
            <path d={`M${41 + position * 11} 17 V41`} strokeWidth="5" />
          </>
        ) : (
          <>
            <circle cx="51" cy="28" r="23" opacity=".2" />
            <g transform={`rotate(${(position - 0.5) * 75} 51 28)`}>
              <rect x="39" y="8" width="24" height="40" rx="7" />
              <path d="M51 10 V46 M38 28 H23 M63 28 H78" />
            </g>
          </>
        )}
      </g>
    </svg>
  );
}
export function Consumers({
  state: s,
  onSelect,
}: {
  state: SimState;
  onSelect: (c: Consumer) => void;
}) {
  return (
    <section className="consumer-panel panel">
      <div className="consumer-heading">
        <h2>Hidrolik tüketiciler</h2>
        <span>SYSTEM INTERFACES</span>
      </div>
      <div className="consumer-grid">
        {consumers.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            aria-pressed={s.consumer === c.id}
            className={!consumerAvailable(s, c.id) ? 'isolated-consumer' : ''}
          >
            <div className="consumer-top">
              <small>{c.ata}</small>
              <span>
                {consumerAvailable(s, c.id)
                  ? `${Math.round(s.positions[c.id] * 100)}%`
                  : 'İZOLE'}
              </span>
            </div>
            <ConsumerVisual id={c.id} position={s.positions[c.id]} />
            <strong>{c.name}</strong>
            <small>{c.english}</small>
          </button>
        ))}
      </div>
      <p>Seçili tüketiciyi alt paneldeki valfle hareket ettir.</p>
    </section>
  );
}
