import * as THREE from 'three';
import { Canvas, useFrame, useThree, type CanvasProps } from '@react-three/fiber';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { useEffect, useMemo, useRef, useState } from 'react';
import { sectionProgress } from '../lib/stages';

export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOutBack = (t: number) => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2);

// Lokalny postęp i-tego z n elementów pojawiających się kaskadowo w ramach t ∈ [0,1].
export function stagger(t: number, i: number, n: number, d = 0.3) {
  const start = n > 1 ? (i / (n - 1)) * (1 - d) : 0;
  return THREE.MathUtils.clamp((t - start) / d, 0, 1);
}

// Wygładzony postęp przewinięcia sekcji (selector) — czytany w useFrame przez ref.
export function useScrollProgress(selector: string, lambda = 4) {
  const p = useRef(0);
  const el = useMemo(() => document.querySelector(selector), [selector]);
  useFrame((_, dt) => {
    if (el) p.current = THREE.MathUtils.damp(p.current, sectionProgress(el), lambda, Math.min(dt, 0.1));
  });
  return p;
}

export function RoomEnv({ intensity = 0.5 }: { intensity?: number }) {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = intensity;
    return () => {
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

// Canvas renderuje klatki tylko gdy jest (prawie) na ekranie.
export function GatedCanvas({ className, children, ...props }: CanvasProps & { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '150px' });
    io.observe(ref.current!);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}>
      <Canvas frameloop={visible ? 'always' : 'never'} dpr={[1, 2]} {...props}>
        {children}
      </Canvas>
    </div>
  );
}

export const no3d = () => document.documentElement.classList.contains('no-3d');
