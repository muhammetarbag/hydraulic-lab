'use client';
import { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Eye,
  FlaskConical,
  RotateCcw,
} from 'lucide-react';
import { failures } from '@/lib/content';
import type { Failure, SimState } from '@/lib/simulation';
export function FailurePanel({
  state,
  onFailure,
}: {
  state: SimState;
  onFailure: (f: Failure) => void;
}) {
  const [guess, setGuess] = useState(''),
    [reveal, setReveal] = useState(false);
  const failure = failures.find((f) => f.id === state.failure);
  const select = (f: Failure) => {
    setGuess('');
    setReveal(false);
    onFailure(f);
  };
  return (
    <section className="failure-lab panel">
      <div className="panel-heading">
        <div>
          <FlaskConical size={18} />
          <h2>Arıza laboratuvarı</h2>
        </div>
        <span className="subtle-badge">9 SENARYO</span>
      </div>
      <fieldset className="failure-options" aria-label="Arıza senaryoları">
        {failures.map((f) => (
          <button
            aria-pressed={state.failure === f.id}
            key={f.id}
            onClick={() => select(f.id)}
          >
            <AlertTriangle size={15} />
            <span>
              {f.name}
              <small>{f.english}</small>
            </span>
          </button>
        ))}
      </fieldset>
      {failure ? (
        <div className="prediction-panel">
          <div>
            <div className="section-eyebrow">ÖNCE TAHMİN ET</div>
            <h3>{failure.prediction}</h3>
            <label className="sr-only" htmlFor="prediction">
              Bu durumda sistemde ne olur?
            </label>
            <textarea
              id="prediction"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Sence basınç, debi ve hareket nasıl değişir?"
              rows={2}
            />
            <button onClick={() => setReveal((v) => !v)}>
              <Eye size={15} />
              {reveal ? 'Açıklamayı gizle' : 'Doğru açıklamayı göster'}
            </button>
          </div>
          <div className="prediction-explanation" aria-live="polite">
            {reveal ? (
              <>
                <strong>Ne oluyor?</strong>
                <p>{failure.explanation}</p>
              </>
            ) : (
              <>
                <strong>
                  <ArrowRight size={15} /> Gözlem ipucu
                </strong>
                <p>{failure.hint}</p>
              </>
            )}
            <button onClick={() => select('none')}>
              <RotateCcw size={14} />
              Arızayı temizle ve sıfırla
            </button>
          </div>
        </div>
      ) : (
        <p className="failure-instruction">
          Bir arıza seç. Her senaryo aynı şarjlı başlangıç durumundan başlar;
          basıncı, akışı ve tüketici hareketini karşılaştır.
        </p>
      )}
    </section>
  );
}
