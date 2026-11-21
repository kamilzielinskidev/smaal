// Współdzielone przez sceny 3D (React) i skrypty sekcji (Astro).

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

// Postęp przewinięcia sekcji sticky: 0 gdy góra sekcji na górze ekranu, 1 gdy dół sekcji na dole.
export function sectionProgress(el: Element) {
  const r = el.getBoundingClientRect();
  const span = r.height - window.innerHeight;
  return span > 0 ? clamp01(-r.top / span) : 0;
}

export const heroStages = [
  { at: 0, n: '01', title: 'Stan deweloperski', text: 'Tu zaczynamy. Przejmujemy mieszkanie prosto od dewelopera.' },
  { at: 0.12, n: '02', title: 'Tynki i gładzie', text: 'Robimy tynki, gładzie i malowanie. Ściany przygotowujemy pod każdy kolejny materiał.' },
  { at: 0.28, n: '03', title: 'Podłogi', text: 'Układamy deski, panele i płytki — razem z listwami i progami.' },
  { at: 0.46, n: '04', title: 'Łazienka', text: 'Robimy łazienki od hydroizolacji, przez płytki, aż po biały montaż.' },
  { at: 0.62, n: '05', title: 'Detale', text: 'Montujemy drzwi, listwy i osprzęt. Doradzamy też przy wyborze wyposażenia, żeby wszystko do siebie pasowało.' },
  { at: 0.82, n: '06', title: 'Pod klucz', text: 'Sprzątanie mamy wliczone w cenę. Oddajemy klucze, a Ty możesz się wprowadzać.' },
];

// Progi kolejnych faz animacji makiety (start, koniec).
export const heroPhases = {
  plaster: [0.12, 0.28],
  floor: [0.28, 0.46],
  tiles: [0.46, 0.62],
  furniture: [0.62, 0.82],
  light: [0.82, 0.96],
} as const;
