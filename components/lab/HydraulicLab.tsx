/* oxlint-disable react/react-compiler -- These effects synchronize a running simulation clock with its sampled chart and scripted teaching stages. */
'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  Activity,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleHelp,
  FlaskConical,
  Gauge,
  GraduationCap,
  Layers,
  Pause,
  Plane,
  Play,
  RotateCcw,
  ShieldAlert,
  Wind,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Schematic } from './Schematic';
import { ComponentDetail } from './ComponentDetail';
import { Controls } from './Controls';
import { Instruments, PressureHistory } from './Instruments';
import { Consumers } from './Consumers';
import { FailurePanel } from './FailurePanel';
import { LearnMode, ExamMode } from './Learning';
import { Explorer, Sources } from './Explorer';
import { useSimulation } from '@/lib/useSimulation';
import { failures } from '@/lib/content';
import {
  normalSteps,
  sourceStatus,
  warnings,
  type ComponentId,
  type Failure,
} from '@/lib/simulation';
type Mode = 'simulation' | 'failure' | 'learn' | 'explore' | 'exam' | 'sources';
const stages = [0, 2, 3.2, 4.5, 6, 7, 8.4];
export default function HydraulicLab() {
  const { state, change, reset, fail } = useSimulation();
  const [mode, setMode] = useState<Mode>('simulation'),
    [selected, setSelected] = useState<ComponentId>('accumulator');
  const [tour, setTour] = useState(false),
    [tourStep, setTourStep] = useState(-1),
    [history, setHistory] = useState<number[]>([]);
  const sample = useRef(-1),
    currentStage = useRef(-1);
  const src = sourceStatus(state),
    alerts = warnings(state),
    failure = failures.find((f) => f.id === state.failure);
  useEffect(() => {
    const bucket = Math.floor(state.time * 4);
    if (bucket !== sample.current) {
      sample.current = bucket;
      setHistory((h) => [...h.slice(-119), state.pressure]);
    }
  }, [state.time, state.pressure]);
  useEffect(() => {
    if (!tour) return;
    if (state.time >= 11) {
      setTour(false);
      return;
    }
    const i = stages.findLastIndex((t) => state.time >= t);
    if (i !== currentStage.current) {
      currentStage.current = i;
      setTourStep(i);
      setSelected(normalSteps[i].component);
      if (i === 1) change({ mainOn: true });
      if (i === 4) change({ valve: 1 });
    }
  }, [state.time, tour, change]);
  function normal() {
    reset(true);
    setHistory([]);
    sample.current = -1;
    currentStage.current = -1;
    setTourStep(0);
    setTour(true);
    setMode('simulation');
  }
  function manualChange(p: Parameters<typeof change>[0]) {
    if (tour) {
      setTour(false);
      setTourStep(-1);
    }
    change(p);
  }
  function clear() {
    setTour(false);
    setTourStep(-1);
    reset();
    setHistory([]);
    sample.current = -1;
  }
  function apply(id: Failure) {
    setTour(false);
    setTourStep(-1);
    fail(id);
    setHistory([]);
    sample.current = -1;
    const f = failures.find((f) => f.id === id);
    if (f) setSelected(f.component);
  }
  function experiment(id: ComponentId) {
    setTour(false);
    setTourStep(-1);
    setSelected(id);
    setMode('simulation');
  }
  function navigate(next: Mode) {
    if (next !== 'simulation' && next !== 'failure') setTour(false);
    setMode(next);
  }
  function simulationView(withFailures = false) {
    return (
      <>
        {withFailures && <FailurePanel state={state} onFailure={apply} />}
        <Instruments state={state} />
        <div className="simulation-layout">
          <div className="simulation-main">
            <section className="panel schematic-panel">
              <div className="panel-heading">
                <div>
                  <span className="status-dot" />
                  <h2>İnteraktif sistem şeması</h2>
                  <span className="subtle-badge">CANLI</span>
                </div>
                <div className="legend">
                  <span className="red">Basınç</span>
                  <span className="blue">Dönüş</span>
                  <span className="green">Acil / yedek</span>
                </div>
              </div>
              <div className="diagram-scroll-hint">
                Şemanın tamamı için yatay kaydır ↔
              </div>
              <div className="schematic-scroll">
                <Schematic
                  state={state}
                  selected={selected}
                  onSelect={setSelected}
                  highlight={
                    tour && tourStep >= 0
                      ? normalSteps[tourStep].component
                      : undefined
                  }
                />
              </div>
              <div className="schema-status">
                <span>
                  <span
                    className={`status-dot ${state.paused ? 'paused-dot' : ''}`}
                  />
                  {state.paused
                    ? 'SİMÜLASYON DURAKLATILDI'
                    : src.emergencyOnly
                      ? 'EMERGENCY SUPPLY'
                      : state.failure === 'none'
                        ? 'NORMAL CONFIGURATION'
                        : failure?.english.toUpperCase()}
                </span>
                <button onClick={() => change({ paused: !state.paused })}>
                  {state.paused ? <Play size={13} /> : <Pause size={13} />}
                  {state.paused ? 'Devam et' : 'Duraklat'}
                </button>
              </div>
            </section>
            <section className="operation-guide panel">
              <div className="guide-top">
                <div>
                  <div className="section-eyebrow">AKIŞI ADIM ADIM İZLE</div>
                  <h2>Normal çalışma çevrimi</h2>
                </div>
                <button
                  className="primary-button"
                  onClick={tour ? () => setTour(false) : normal}
                >
                  {tour ? <Pause size={15} /> : <Play size={15} />}{' '}
                  {tour ? 'Kılavuzu durdur' : 'Çevrimi başlat'}
                </button>
              </div>
              <div className="step-timeline">
                {normalSteps.map((step, i) => (
                  <div
                    key={step.title}
                    className={
                      tourStep === i
                        ? 'current-step'
                        : tourStep > i
                          ? 'completed-step'
                          : ''
                    }
                  >
                    <span>
                      {tourStep > i ? <CheckCircle2 size={14} /> : i + 1}
                    </span>
                    <small>
                      {
                        [
                          'Depo',
                          'Pompa',
                          'Basınç',
                          'Akümülatör',
                          'Valf',
                          'Aktüatör',
                          'Dönüş',
                        ][i]
                      }
                    </small>
                  </div>
                ))}
              </div>
              <div className="guide-caption" aria-live="polite">
                <span className="caption-number">
                  {tourStep >= 0 ? (
                    String(tourStep + 1).padStart(2, '0')
                  ) : (
                    <CircleHelp size={22} />
                  )}
                </span>
                <div>
                  <strong>
                    {tourStep >= 0
                      ? normalSteps[tourStep].title
                      : 'Bir çevrim, yedi bağlantı.'}
                  </strong>
                  <p>
                    {tourStep >= 0
                      ? normalSteps[tourStep].text
                      : 'Çevrimi başlat veya kontrolleri kendin yönet. Gerçek sistemde eşzamanlı gerçekleşen olaylar burada sırayla vurgulanır.'}
                  </p>
                </div>
              </div>
            </section>
            <Controls state={state} onChange={manualChange} disabled={tour} />
            <section className="emergency-section panel">
              <div>
                <Wind size={25} />
                <div>
                  <h3>Ana güç kaybolursa?</h3>
                  <p>
                    Önce akümülatör desteğini, ardından RAT beslemesini gözle.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  apply('main');
                  setMode('simulation');
                }}
              >
                <ShieldAlert size={16} />
                Main Pump Failure
                <ArrowRight size={15} />
              </button>
              {src.emergencyOnly && (
                <p className="emergency-active">
                  <span className="status-dot" />
                  RAT önceliği: uçuş kumandaları ve frenler. Diğer tüketiciler
                  izole.
                </p>
              )}
            </section>
            <div className="telemetry-bottom panel">
              <div className="cockpit-panel">
                <div className="detail-kicker">
                  KOKPİT İZLEME <span>ÖRNEK MESAJLAR</span>
                </div>
                <div className="warning-screen" aria-live="polite">
                  {alerts.length ? (
                    alerts.map((a) => (
                      <div
                        className={a.includes('OVERPRESSURE') ? 'red' : 'amber'}
                        key={a}
                      >
                        ▸ {a}
                      </div>
                    ))
                  ) : (
                    <div className="green">HYD PRESSURE NORMAL</div>
                  )}
                </div>
                <p>
                  {state.failure === 'accumulator' ||
                  state.failure === 'selector' ||
                  state.failure === 'reliefClosed'
                    ? 'Bu arıza için özel kokpit ikazı varsayılmıyor. Basınç, rezerv ve hareketi birlikte değerlendir.'
                    : 'İkazlar bu modelin eşiklerine bağlı örneklerdir; uçak tipine göre değişir.'}
                </p>
              </div>
              <PressureHistory values={history} />
            </div>
          </div>
          <aside className="simulation-aside">
            <Consumers
              state={state}
              onSelect={(consumer) => manualChange({ consumer, valve: 0 })}
            />
            <section className="panel inspector-panel">
              <ComponentDetail
                id={selected}
                state={state}
                onChange={manualChange}
                compact
              />
            </section>
          </aside>
        </div>
      </>
    );
  }
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" href="/">
          <span className="brand-mark">
            <Activity size={23} />
          </span>
          <span>
            HYDRAULIC<span className="brand-lab"> / LAB</span>
          </span>
        </Link>
        <div className="course-tag">
          HEE 305 <span>HAVA ARACI SİSTEMLERİ–II</span>
        </div>
        <span className="session-badge">
          <span className="status-dot" />
          EĞİTİM OTURUMU
        </span>
      </header>
      <main className="main-workspace">
        <div className="page-heading">
          <div>
            <div className="eyebrow">
              SİSTEM LABORATUVARI <span>/ ATA 29</span>
            </div>
            <h1>
              Hidrolik güç<span>.</span>
            </h1>
            <p>Akışı izle. Sistemi yönet. Çalışma mantığını keşfet.</p>
          </div>
          <div className="heading-right">
            <div className="aircraft-label">
              <Plane size={21} />
              <div>
                GENERIC TRANSPORT AIRCRAFT
                <small>Hydraulic power training simulator</small>
              </div>
            </div>
            <div className="heading-actions">
              {(mode === 'simulation' || mode === 'failure') && (
                <button className="primary-button" onClick={normal}>
                  <Play size={15} />
                  Normal Operation
                </button>
              )}
              <button className="reset-button" onClick={clear}>
                <RotateCcw size={14} />
                Sistemi sıfırla
              </button>
            </div>
          </div>
        </div>
        <Tabs value={mode} onValueChange={(v) => navigate(v as Mode)}>
          <TabsList
            className="workspace-tabs"
            variant="line"
            aria-label="Eğitim modları"
          >
            <TabsTrigger value="simulation">
              <Gauge />
              Simülasyon
            </TabsTrigger>
            <TabsTrigger value="failure">
              <FlaskConical />
              Arıza laboratuvarı
            </TabsTrigger>
            <TabsTrigger value="learn">
              <BookOpen />
              Öğrenme modu
            </TabsTrigger>
            <TabsTrigger value="explore">
              <Layers />
              Parça kütüphanesi
            </TabsTrigger>
            <TabsTrigger value="exam">
              <GraduationCap />
              Sınav provası
            </TabsTrigger>
            <TabsTrigger value="sources">
              <CircleHelp />
              Model & kaynaklar
            </TabsTrigger>
          </TabsList>
          <TabsContent value="simulation">{simulationView()}</TabsContent>
          <TabsContent value="failure">{simulationView(true)}</TabsContent>
          <TabsContent value="learn" keepMounted>
            <LearnMode
              state={state}
              onExperiment={experiment}
              onChange={manualChange}
            />
          </TabsContent>
          <TabsContent value="explore">
            <Explorer state={state} onChange={manualChange} />
          </TabsContent>
          <TabsContent value="exam" keepMounted>
            <ExamMode />
          </TabsContent>
          <TabsContent value="sources">
            <Sources />
          </TabsContent>
        </Tabs>
        <footer>
          <span>
            <span className="status-dot" /> Öğretim amaçlı yaklaşık model ·
            Gerçek bakım prosedürü değildir.
          </span>
          <button onClick={() => navigate('sources')}>
            Model varsayımları <ArrowRight size={13} />
          </button>
        </footer>
      </main>
    </div>
  );
}
