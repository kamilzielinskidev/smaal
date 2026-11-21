// Stawki orientacyjne (brutto) — do podmiany na cennik S-Maal.
export type StandardId = 'komfort' | 'premium' | 'signature';

export const standards: { id: StandardId; name: string; min: number; max: number; materials: string }[] = [
  { id: 'komfort', name: 'Komfort', min: 900, max: 1150, materials: 'Dąb naturalny, matowa biel, beton' },
  { id: 'premium', name: 'Premium', min: 1150, max: 1600, materials: 'Marmur Carrara, dąb wędzony, mosiądz' },
  { id: 'signature', name: 'Signature', min: 1600, max: 2250, materials: 'Nero Marquina, trawertyn, orzech, mosiądz' },
];

export const houseMultiplier = 1.08;

export const area = { min: 20, max: 300, default: 75 };

export type Addon = {
  id: string;
  name: string;
  min: number;
  max: number;
  unit: 'm2' | 'flat';
  icon: string; // ścieżka SVG (viewBox 0 0 24 24, stroke)
};

export const addons: Addon[] = [
  { id: 'led', name: 'Oświetlenie LED i sufity podwieszane', min: 60, max: 110, unit: 'm2', icon: 'M3 5h18M7 5v3h10V5M12 8v4M9 18a3 3 0 1 0 6 0 3 3 0 0 0-6 0M12 13v2' },
];

export function estimate(opts: { type: 'mieszkanie' | 'dom'; area: number; standard: StandardId; addons: string[] }) {
  const s = standards.find((x) => x.id === opts.standard)!;
  const k = opts.type === 'dom' ? houseMultiplier : 1;
  let min = opts.area * s.min * k;
  let max = opts.area * s.max * k;
  for (const a of addons) {
    if (!opts.addons.includes(a.id)) continue;
    min += a.unit === 'm2' ? a.min * opts.area : a.min;
    max += a.unit === 'm2' ? a.max * opts.area : a.max;
  }
  return { min, max };
}
