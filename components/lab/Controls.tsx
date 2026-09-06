'use client';
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Power,
  Wind,
  Zap,
  ShieldAlert,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { sourceStatus, type SimState } from '@/lib/simulation';
export function Controls({
  state: s,
  onChange,
  disabled = false,
}: {
  state: SimState;
  onChange: (p: Partial<SimState>) => void;
  disabled?: boolean;
}) {
  const src = sourceStatus(s);
  return (
    <section className="control-deck panel" aria-label="Simülasyon kumandaları">
      <div className="control-heading">
        <span>KUMANDA PANELİ</span>
        <small>Değişikliklerin etkisini şemada izle</small>
      </div>
      <div className="control-grid">
        <div className="control-cell">
          <label htmlFor="main-pump">
            <Power size={16} />
            Ana pompa <small>ENGINE-DRIVEN</small>
          </label>
          <div className="switch-row">
            <span className={src.main ? 'green' : 'muted'}>
              {s.failure === 'main' ? 'ARIZALI' : s.mainOn ? 'ON' : 'OFF'}
            </span>
            <Switch
              id="main-pump"
              aria-label="Ana pompa"
              checked={s.mainOn}
              onCheckedChange={(v) => onChange({ mainOn: v })}
              disabled={disabled}
            />
          </div>
        </div>
        <div className="control-cell">
          <label htmlFor="electric-pump">
            <Zap size={16} />
            Elektrik pompası <small>ELECTRIC PUMP</small>
          </label>
          <div className="switch-row">
            <span className={src.electric ? 'green' : 'muted'}>
              {s.failure === 'electric'
                ? 'ARIZALI'
                : s.electricOn
                  ? 'ON'
                  : 'OFF'}
            </span>
            <Switch
              id="electric-pump"
              aria-label="Elektrik pompası"
              checked={s.electricOn}
              onCheckedChange={(v) => onChange({ electricOn: v })}
              disabled={disabled}
            />
          </div>
        </div>
        <div className="control-cell selector-control">
          <div className="control-label">
            Yön kontrol valfi <small>SELECTOR VALVE</small>
          </div>
          <fieldset className="segmented" aria-label="Valf yönü">
            <button
              aria-pressed={s.valve === -1}
              onClick={() => onChange({ valve: -1 })}
              disabled={disabled}
            >
              <ChevronLeft size={14} />
              Geri çek
            </button>
            <button
              aria-pressed={s.valve === 0}
              onClick={() => onChange({ valve: 0 })}
              disabled={disabled}
            >
              <Pause size={13} />
              Nötr
            </button>
            <button
              aria-pressed={s.valve === 1}
              onClick={() => onChange({ valve: 1 })}
              disabled={disabled}
            >
              Uzat
              <ChevronRight size={14} />
            </button>
          </fieldset>
        </div>
        <div className="control-cell">
          <label htmlFor="rat">
            <Wind size={16} />
            Acil kaynak <small>RAT</small>
          </label>
          <div className="switch-row">
            <span className={src.rat ? 'green' : 'muted'}>
              {s.ratOn ? 'AÇIK' : 'TOPLU'}
            </span>
            <Switch
              id="rat"
              aria-label="RAT acil kaynak"
              checked={s.ratOn}
              onCheckedChange={(v) => onChange({ ratOn: v })}
              disabled={disabled}
            />
          </div>
        </div>
      </div>
      <div className="secondary-controls">
        <div className="airspeed">
          <div id="airspeed-label" className="airspeed-label">
            RAT hava hızı{' '}
            <strong>
              {s.airspeed} <small>kt</small>
            </strong>
          </div>
          <Slider
            aria-labelledby="airspeed-label"
            value={[s.airspeed]}
            min={0}
            max={250}
            step={5}
            onValueChange={(v) =>
              onChange({ airspeed: Array.isArray(v) ? v[0] : v })
            }
            disabled={disabled}
          />
          <small>Öğretim eşiği: 90 kt</small>
        </div>
        <label className="stress-control" htmlFor="stress">
          <ShieldAlert size={19} />
          <span>
            Regülasyon arızası deneyi
            <small>Kontrol hedefi 3900 psi · relief tepkisini gözle</small>
          </span>
          <Switch
            id="stress"
            aria-label="Regülasyon arızası deneyi"
            checked={s.stress}
            onCheckedChange={(v) => onChange({ stress: v })}
            disabled={disabled}
          />
        </label>
      </div>
    </section>
  );
}
