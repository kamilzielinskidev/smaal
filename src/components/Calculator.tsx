import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { addons, area as AREA, estimate, standards, type StandardId } from '../data/pricing';

const MaterialSample = lazy(() => import('../three/MaterialSample'));

const fmt = new Intl.NumberFormat('pl-PL');
const thousands = (v: number) => fmt.format(Math.round(v / 1000));
const addonPrice = (a: (typeof addons)[number]) =>
  a.unit === 'm2' ? `+${fmt.format(a.min)}–${fmt.format(a.max)} zł/m²` : `+${a.min / 1000}–${a.max / 1000} tys. zł`;

function useTween(target: number, ms = 700) {
  const [v, setV] = useState(target);
  const cur = useRef(target);
  useEffect(() => {
    const from = cur.current;
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / ms);
      cur.current = from + (target - from) * (1 - Math.pow(1 - k, 3));
      setV(cur.current);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

export default function Calculator() {
  const [type, setType] = useState<'mieszkanie' | 'dom'>('mieszkanie');
  const [area, setArea] = useState(AREA.default);
  const [standard, setStandard] = useState<StandardId>('premium');
  const [picked, setPicked] = useState<string[]>([]);
  const [show3d, setShow3d] = useState(false);

  useEffect(() => setShow3d(!document.documentElement.classList.contains('no-3d')), []);

  const { min, max } = estimate({ type, area, standard, addons: picked });
  const tMin = useTween(min);
  const tMax = useTween(max);
  const range = `${thousands(min)}–${thousands(max)} tys. zł`;
  // czytnik ekranu dostaje tylko końcową wartość, nie każdą klatkę animacji liczby
  const [spoken, setSpoken] = useState(range);
  useEffect(() => {
    const t = setTimeout(() => setSpoken(range), 700);
    return () => clearTimeout(t);
  }, [range]);
  const std = standards.find((s) => s.id === standard)!;

  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const book = () => {
    const names = addons.filter((a) => picked.includes(a.id)).map((a) => a.name.toLowerCase());
    window.dispatchEvent(
      new CustomEvent('smaal:estimate', {
        detail: {
          area,
          type,
          text:
            `Wstępna wycena z kalkulatora: ${type === 'dom' ? 'dom' : 'mieszkanie'}, ${area} m², standard ${std.name}` +
            (names.length ? `, dodatki: ${names.join(', ')}` : '') +
            `. Orientacyjnie ${thousands(min)}–${thousands(max)} tys. zł brutto.`,
        },
      }),
    );
    // przewinięcie do formularza i fokus robi Kontakt.astro po odebraniu zdarzenia
  };

  const fill = ((area - AREA.min) / (AREA.max - AREA.min)) * 100;

  return (
    <div className="calc">
      <div className="calc-controls">
        <fieldset className="calc-group">
          <legend>Rodzaj nieruchomości</legend>
          <div className="seg-toggle">
            {(['mieszkanie', 'dom'] as const).map((t) => (
              <label key={t} className={type === t ? 'on' : ''}>
                <input type="radio" name="typ" value={t} checked={type === t} onChange={() => setType(t)} />
                {t === 'mieszkanie' ? 'Mieszkanie' : 'Dom'}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="calc-group">
          <label className="legend" htmlFor="calc-area">
            Metraż <output htmlFor="calc-area">{area} m²</output>
          </label>
          <input
            id="calc-area"
            className="range"
            type="range"
            min={AREA.min}
            max={AREA.max}
            step={1}
            value={area}
            style={{ ['--fill' as string]: `${fill}%` }}
            onChange={(e) => setArea(Number(e.target.value))}
          />
          <div className="range-scale">
            <span>{AREA.min} m²</span>
            <span>{AREA.max} m²</span>
          </div>
        </div>

        <fieldset className="calc-group">
          <legend>Standard wykończenia</legend>
          <div className="std-grid">
            {standards.map((s) => (
              <label key={s.id} className={`std-card ${standard === s.id ? 'on' : ''}`}>
                <input type="radio" name="standard" value={s.id} checked={standard === s.id} onChange={() => setStandard(s.id)} />
                <span className={`std-visual swatch-${s.id}`} aria-hidden="true">
                  {show3d && (
                    <Suspense fallback={null}>
                      <MaterialSample id={s.id} active={standard === s.id} />
                    </Suspense>
                  )}
                </span>
                <span className="std-name">{s.name}</span>
                <span className="std-price">
                  {fmt.format(s.min)}–{fmt.format(s.max)} zł/m²
                </span>
                <span className="std-mat">{s.materials}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="calc-group">
          <legend>Dodatki</legend>
          <div className="addon-grid">
            {addons.map((a) => (
              <label key={a.id} className={`addon ${picked.includes(a.id) ? 'on' : ''}`}>
                <input type="checkbox" checked={picked.includes(a.id)} onChange={() => toggle(a.id)} />
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d={a.icon} />
                </svg>
                <span className="addon-name">{a.name}</span>
                <span className="addon-price">{addonPrice(a)}</span>
                <span className="addon-check" aria-hidden="true" />
              </label>
            ))}
          </div>
        </fieldset>

        {/* telefon: podsumowanie jest pod kontrolkami, więc cena przykleja się do dołu ekranu */}
        <a className="calc-peek" href="#calc-summary">
          <span>Wstępna wycena</span>
          <strong>
            ok. {thousands(tMin)}–{thousands(tMax)} tys. zł
          </strong>
        </a>
      </div>

      <aside id="calc-summary" className="calc-summary">
        <p className="sr-only" aria-live="polite">
          Wstępna wycena: ok. {spoken}
        </p>
        <span className="eyebrow">Wstępna wycena</span>
        <p className="calc-total">
          <small>ok.</small> {thousands(tMin)}–{thousands(tMax)} <small>tys. zł</small>
        </p>
        <p className="calc-sub">brutto · robocizna i materiały wykończeniowe · sprzątanie w cenie</p>
        <dl className="calc-break">
          <div>
            <dt>Nieruchomość</dt>
            <dd>
              {type === 'dom' ? 'Dom' : 'Mieszkanie'}, {area} m²
            </dd>
          </div>
          <div>
            <dt>Standard</dt>
            <dd>{std.name}</dd>
          </div>
          <div>
            <dt>Dodatki</dt>
            <dd>{picked.length || 'brak'}</dd>
          </div>
          <div>
            <dt>Za m²</dt>
            <dd>
              {fmt.format(Math.round(min / area / 10) * 10)}–{fmt.format(Math.round(max / area / 10) * 10)} zł
            </dd>
          </div>
        </dl>
        <button type="button" className="btn calc-cta" onClick={book}>
          Umów konsultację z tą wyceną
        </button>
        <p className="calc-note">Stawki orientacyjne i przykładowe. Dokładny kosztorys przygotujemy po bezpłatnej konsultacji.</p>
      </aside>
    </div>
  );
}
