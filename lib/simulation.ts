/** Öğretim modeli: debi dengesi + hat esnekliği + politropik gaz akümülatörü.
 * Eşikler uygulamaya aittir; hiçbir uçağın performans verisi değildir. */
export type Failure =
  | 'none'
  | 'main'
  | 'electric'
  | 'leak'
  | 'lowLevel'
  | 'filter'
  | 'accumulator'
  | 'reliefOpen'
  | 'reliefClosed'
  | 'selector';
export type Consumer = 'flight' | 'gear' | 'brakes' | 'steering';
export type ComponentId =
  | 'reservoir'
  | 'fluid'
  | 'filter'
  | 'pump'
  | 'electric'
  | 'accumulator'
  | 'regulator'
  | 'relief'
  | 'check'
  | 'selector'
  | 'actuator'
  | 'pressure'
  | 'return'
  | 'rat'
  | 'priority'
  | 'indication';
export const NOMINAL = 3000,
  RELIEF = 3450,
  PRECHARGE = 1000,
  RESERVOIR_CAPACITY = 9;
export const clamp = (x: number, a: number, b: number): number =>
  Math.max(a, Math.min(b, x));
export function accumulatorVolume(pressure: number): number {
  return pressure <= PRECHARGE
    ? 0
    : Number(
        (1 - Math.pow((PRECHARGE + 14.7) / (pressure + 14.7), 1 / 1.4)).toFixed(
          9,
        ),
      );
}
export interface SimState {
  pressure: number;
  reservoir: number;
  mainOn: boolean;
  electricOn: boolean;
  ratOn: boolean;
  airspeed: number;
  valve: -1 | 0 | 1;
  consumer: Consumer;
  positions: Record<Consumer, number>;
  failure: Failure;
  stress: boolean;
  paused: boolean;
  time: number;
  mainFlow: number;
  electricFlow: number;
  ratFlow: number;
  pumpFlow: number;
  returnFlow: number;
  actuatorFlow: number;
  reliefFlow: number;
  accFlow: number;
}
export function initialState(cold = false): SimState {
  return {
    pressure: cold ? 0 : NOMINAL,
    reservoir: cold
      ? 7.5
      : 7.5 - accumulatorVolume(NOMINAL) - NOMINAL * 0.000035,
    mainOn: !cold,
    electricOn: false,
    ratOn: false,
    airspeed: 180,
    valve: 0,
    consumer: 'flight',
    positions: { flight: 0.15, gear: 0, brakes: 0, steering: 0.5 },
    failure: 'none',
    stress: false,
    paused: false,
    time: 0,
    mainFlow: 0,
    electricFlow: 0,
    ratFlow: 0,
    pumpFlow: 0,
    returnFlow: 0,
    actuatorFlow: 0,
    reliefFlow: 0,
    accFlow: 0,
  };
}
export function sourceStatus(s: SimState) {
  const main = s.mainOn && s.failure !== 'main',
    electric = s.electricOn && s.failure !== 'electric',
    rat = s.ratOn && s.airspeed >= 90;
  return { main, electric, rat, emergencyOnly: !main && !electric && s.ratOn };
}
export function consumerAvailable(s: SimState, consumer: Consumer): boolean {
  return (
    !sourceStatus(s).emergencyOnly ||
    consumer === 'flight' ||
    consumer === 'brakes'
  );
}
export function gasPressure(s: SimState): number {
  return s.failure === 'accumulator' ? 0 : Math.max(PRECHARGE, s.pressure);
}
export function stepSimulation(state: SimState, elapsed: number): SimState {
  if (state.paused || !Number.isFinite(elapsed) || elapsed <= 0) return state;
  let s = state,
    remaining = Math.min(elapsed, 1);
  while (remaining > 0.000001) {
    const dt = Math.min(remaining, 0.02),
      src = sourceStatus(s);
    const supply = clamp((s.reservoir - 0.15) / 1.6, 0, 1),
      target = s.stress ? 3900 : NOMINAL;
    const mainQ = src.main
      ? (s.failure === 'filter' ? 0.007 : 0.18) *
        clamp((target - s.pressure) / 100, 0, 1)
      : 0;
    const electricQ = src.electric
      ? 0.11 * clamp((NOMINAL - s.pressure) / 100, 0, 1)
      : 0;
    const ratQ = src.rat
      ? 0.065 *
        clamp(s.airspeed / 180, 0, 1) *
        clamp((2700 - s.pressure) / 100, 0, 1)
      : 0;
    const pumpFlow = (mainQ + electricQ + ratQ) * supply,
      position = s.positions[s.consumer];
    const allowed =
      consumerAvailable(s, s.consumer) && s.failure !== 'selector';
    const move =
      allowed &&
      ((s.valve === 1 && position < 1) || (s.valve === -1 && position > 0));
    const requestedQ = move
      ? 0.065 * Math.sqrt(clamp((s.pressure - 800) / 2200, 0, 1.5))
      : 0;
    const travelVolume =
      s.consumer === 'gear' ? 0.55 : s.consumer === 'brakes' ? 0.1 : 0.25;
    const nextPosition = clamp(
      position + ((s.valve * requestedQ) / travelVolume) * dt,
      0,
      1,
    );
    const actuatorFlow =
      (Math.abs(nextPosition - position) * travelVolume) / dt;
    const reliefFlow =
      s.failure === 'reliefOpen'
        ? 0.25 * Math.sqrt(s.pressure / NOMINAL)
        : s.failure === 'reliefClosed'
          ? 0
          : Math.max(0, (s.pressure - RELIEF) * 0.01);
    const internalLeak = 0.008 * (s.pressure / NOMINAL),
      externalLeak =
        s.failure === 'leak' ? 0.14 * Math.sqrt(s.pressure / NOMINAL) : 0;
    const oldAccVolume =
      s.failure === 'accumulator' ? 0 : accumulatorVolume(s.pressure);
    const compliance =
      0.000035 +
      (s.failure !== 'accumulator' && s.pressure > PRECHARGE
        ? (1 - oldAccVolume) / (1.4 * (s.pressure + 14.7))
        : 0);
    const pressure = clamp(
      s.pressure +
        ((pumpFlow - actuatorFlow - reliefFlow - internalLeak - externalLeak) /
          compliance) *
          dt,
      0,
      4500,
    );
    const newAccVolume =
        s.failure === 'accumulator' ? 0 : accumulatorVolume(pressure),
      accFlow = (newAccVolume - oldAccVolume) / dt;
    const reservoir = clamp(
      s.reservoir -
        (newAccVolume - oldAccVolume) -
        (pressure - s.pressure) * 0.000035 -
        externalLeak * dt -
        (nextPosition - position) * 0.015,
      0,
      RESERVOIR_CAPACITY,
    );
    s = {
      ...s,
      pressure,
      reservoir,
      time: s.time + dt,
      positions: { ...s.positions, [s.consumer]: nextPosition },
      mainFlow: mainQ * supply,
      electricFlow: electricQ * supply,
      ratFlow: ratQ * supply,
      pumpFlow,
      actuatorFlow,
      reliefFlow,
      accFlow,
      returnFlow: actuatorFlow + reliefFlow + internalLeak,
    };
    remaining -= dt;
  }
  return s;
}
export function applyFailure(s: SimState, failure: Failure): SimState {
  const next = { ...initialState(), airspeed: s.airspeed, failure };
  if (failure === 'electric') {
    next.mainOn = false;
    next.electricOn = true;
  }
  if (failure === 'lowLevel') next.reservoir = 0.7;
  if (['main', 'electric', 'selector', 'accumulator'].includes(failure))
    next.valve = 1;
  return next;
}
export function warnings(s: SimState): string[] {
  const list: string[] = [];
  if (s.failure === 'main') list.push('ENG HYD PUMP FAULT');
  if (s.failure === 'electric') list.push('ELEC HYD PUMP FAULT');
  if (s.pressure < 1500) list.push('HYD LOW PRESS');
  if (s.reservoir < 1.8) list.push('HYD RSVR LOW LEVEL');
  if (s.failure === 'filter') list.push('FILTER RESTRICTION');
  if (s.failure === 'leak') list.push('HYD QTY DECREASING');
  if (s.pressure > RELIEF + 80) list.push('HYD OVERPRESSURE');
  if (s.reliefFlow > 0.02) list.push('RELIEF BYPASS ACTIVE');
  if (s.ratOn && s.airspeed < 90) list.push('RAT AIRSPEED INSUFFICIENT');
  return list;
}
export const normalSteps: {
  component: ComponentId;
  title: string;
  text: string;
}[] = [
  {
    component: 'reservoir',
    title: 'Sıvı kaynağı',
    text: 'Depo sıvıyı saklar ve pompa girişini besler. Depodaki düşük besleme basıncı, ana sistemin çalışma basıncı değildir.',
  },
  {
    component: 'pump',
    title: 'Mekanik enerjiden hidrolik güce',
    text: 'Pompa sıvı üretmez. Mekanik enerjiyi akışa aktarır; bu akışın karşılaştığı direnç sonucunda basınç oluşur.',
  },
  {
    component: 'pressure',
    title: 'Basınç dağıtımı',
    text: 'Check valve ters akışı engeller. Basınç hattı enerjiyi dağıtır; kapalı bir valfin önünde, sürekli büyük debi olmadan basınç bulunabilir.',
  },
  {
    component: 'accumulator',
    title: 'Akümülatör şarj oluyor',
    text: 'Sıvı akümülatöre girer ve ayrı bölmedeki azotu sıkıştırır. Enerji sıkışan gazda depolanır; gaz ile sıvı karışmaz.',
  },
  {
    component: 'selector',
    title: 'Akışın yönü seçiliyor',
    text: 'Selector valve P portunu A odasına, B odasını T dönüş portuna bağlar. Ters komut, bağlantıları değiştirir.',
  },
  {
    component: 'actuator',
    title: 'Basınç kuvvete dönüşüyor',
    text: 'İki oda arasındaki basınç farkı piston üzerinde net kuvvet oluşturur. Yük aşılırsa piston hareket eder; debi hareket hızını etkiler.',
  },
  {
    component: 'return',
    title: 'Çevrim tamamlanıyor',
    text: 'Pistonun diğer odasındaki sıvı düşük basınçlı dönüş hattından depoya gider. Uç konumda hareket ve tüketici debisi durur.',
  },
];
