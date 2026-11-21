import * as THREE from 'three';

// Proceduralne, kafelkowalne tekstury z canvasu — zero plików do pobrania.

function rng(seed: number) {
  let s = seed % 2147483647 || 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

// Periodyczny value noise + fbm (kafelkuje się na krawędziach tekstury).
function makeFbm(seed: number) {
  const r = rng(seed);
  const grid = new Float32Array(256 * 256).map(() => r());
  const at = (i: number, j: number, p: number) => grid[(((i % p) + p) % p) * 256 + (((j % p) + p) % p)];
  const smooth = (t: number) => t * t * (3 - 2 * t);
  const noise = (x: number, y: number, p: number) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const u = smooth(x - xi), v = smooth(y - yi);
    const a = at(xi, yi, p), b = at(xi + 1, yi, p), c = at(xi, yi + 1, p), d = at(xi + 1, yi + 1, p);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
  return (u: number, v: number, freq: number, octaves = 4) => {
    let sum = 0, amp = 0.5, f = freq;
    for (let o = 0; o < octaves; o++) {
      sum += amp * noise(u * f, v * f, f);
      amp *= 0.5;
      f *= 2;
    }
    return sum / (1 - Math.pow(0.5, octaves));
  };
}

type Rgb = [number, number, number];
const hex = (h: string): Rgb => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a: Rgb, b: Rgb, t: number): Rgb => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

function paint(size: number, fn: (u: number, v: number) => Rgb) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const c = fn(x / size, y / size);
      const i = (y * size + x) * 4;
      img.data[i] = c[0];
      img.data[i + 1] = c[1];
      img.data[i + 2] = c[2];
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return { canvas, ctx };
}

function toTexture(canvas: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

const cache = new Map<string, THREE.Texture>();
const memo = (key: string, make: () => THREE.Texture) => {
  if (!cache.has(key)) cache.set(key, make());
  return cache.get(key)!;
};

// Jasna, lekko nakrapiana baza — kolor nadaje materiał (beton, tynk).
export const concrete = () =>
  memo('concrete', () => {
    const n = makeFbm(7);
    const r = rng(3);
    const { canvas } = paint(256, (u, v) => {
      const k = 0.82 + n(u, v, 6) * 0.16 + (r() - 0.5) * 0.06;
      const c = 255 * Math.min(1, k);
      return [c, c, c];
    });
    return toTexture(canvas);
  });

const WOODS: Record<string, [string, string]> = {
  oak: ['#d7b384', '#a97e4f'],
  smoked: ['#8a6a4c', '#4f3a28'],
  walnut: ['#7a5236', '#3d2618'],
};

// Słoje biegną wzdłuż osi v (pionowe pasy w obrazie).
export const wood = (kind: keyof typeof WOODS = 'oak') =>
  memo('wood-' + kind, () => {
    const n = makeFbm(11);
    const [light, dark] = WOODS[kind].map(hex) as [Rgb, Rgb];
    const { canvas } = paint(256, (u, v) => {
      const rings = Math.sin((u + n(u, v * 0.25, 4) * 0.18) * Math.PI * 2 * 7);
      const t = Math.pow(0.5 + 0.5 * rings, 0.7) * 0.8 + n(u, v, 32, 2) * 0.2;
      return mix(dark, light, t);
    });
    return toTexture(canvas);
  });

const MARBLES: Record<string, [string, string]> = {
  carrara: ['#eeeae4', '#8e8a85'],
  nero: ['#1c1b1a', '#d9d3c9'],
};

export const marble = (kind: keyof typeof MARBLES = 'carrara') =>
  memo('marble-' + kind, () => {
    const n = makeFbm(kind === 'nero' ? 23 : 5);
    const [base, vein] = MARBLES[kind].map(hex) as [Rgb, Rgb];
    const { canvas } = paint(512, (u, v) => {
      const t = Math.abs(Math.sin((u + v) * Math.PI * 2 + n(u, v, 3, 5) * 7));
      const veinK = Math.pow(1 - t, kind === 'nero' ? 18 : 10) * 0.9;
      const cloud = n(u, v, 6, 3) * 0.08;
      return mix(mix(base, vein, cloud), vein, veinK);
    });
    return toTexture(canvas);
  });

export const travertine = () =>
  memo('travertine', () => {
    const n = makeFbm(31);
    const r = rng(9);
    const a = hex('#e2d3b8'), b = hex('#c4ad8a');
    const { canvas, ctx } = paint(256, (u, v) => {
      const band = 0.5 + 0.5 * Math.sin((v + n(u, v, 3) * 0.08) * Math.PI * 2 * 9);
      return mix(a, b, band * 0.55 + n(u, v, 16, 2) * 0.25);
    });
    ctx.fillStyle = 'rgba(120, 96, 64, 0.45)';
    for (let i = 0; i < 160; i++) {
      ctx.beginPath();
      ctx.ellipse(r() * 256, r() * 256, 1 + r() * 4, 0.6 + r() * 1.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    return toTexture(canvas);
  });
