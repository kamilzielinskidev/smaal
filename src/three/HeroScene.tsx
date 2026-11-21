import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { useLayoutEffect, useMemo, useRef, type ReactNode, type RefObject } from 'react';
import { GatedCanvas, RoomEnv, easeInOut, easeOut, easeOutBack, no3d, stagger, useScrollProgress } from './util';
import { concrete, marble, wood } from './textures';
import { heroPhases, seg } from '../lib/stages';

type Phases = { plaster: number; floor: number; tiles: number; furniture: number; light: number };
type PhaseRef = RefObject<Phases>;
type V3 = [number, number, number];

const H = 2.6;
const PH = 1.35; // ścianki działowe niższe, żeby było widać wnętrza
const T = 0.2;
const C = new THREE.Color();

// [x1, z1, x2, z2, wysokość] — ściany osiowe; przednie ucięte jak w makiecie.
const WALLS: [number, number, number, number, number][] = [
  [-5, -4, 5, -4, H],
  [-5, -4, -5, 4, H],
  [-5, 4, 5, 4, 0.35],
  [5, -4, 5, 4, 0.35],
  [-1, -4, -1, -1.1, PH],
  [-5, 0, -1, 0, PH],
  [-2, 0, -2, 2.9, PH],
];

const mats = {
  cabinet: new THREE.MeshStandardMaterial({ color: '#34352f', roughness: 0.55 }),
  fabric: new THREE.MeshStandardMaterial({ color: '#8f877b', roughness: 1 }),
  fabricLight: new THREE.MeshStandardMaterial({ color: '#b6ab99', roughness: 1 }),
  linen: new THREE.MeshStandardMaterial({ color: '#f1ece4', roughness: 0.95 }),
  dark: new THREE.MeshStandardMaterial({ color: '#2b2824', roughness: 0.7 }),
  brass: new THREE.MeshStandardMaterial({ color: '#b08d57', metalness: 1, roughness: 0.3 }),
  ceramic: new THREE.MeshStandardMaterial({ color: '#f6f4ef', roughness: 0.12 }),
  rug: new THREE.MeshStandardMaterial({ color: '#d6cab7', roughness: 1 }),
  leaf: new THREE.MeshStandardMaterial({ color: '#4d6a43', roughness: 0.9, flatShading: true }),
  pot: new THREE.MeshStandardMaterial({ color: '#c9b9a0', roughness: 0.8 }),
  mirror: new THREE.MeshStandardMaterial({ color: '#dfe5e7', metalness: 0.3, roughness: 0.2 }),
  frame: new THREE.MeshStandardMaterial({ color: '#2f2b26', roughness: 0.6 }),
  lamp: new THREE.MeshStandardMaterial({ color: '#f7efe2', emissive: '#ffcf8f', emissiveIntensity: 0, roughness: 0.5, side: THREE.DoubleSide }),
  window: new THREE.MeshStandardMaterial({ color: '#a9c6d6', emissive: '#bcd6e6', emissiveIntensity: 0.55, roughness: 0.1 }),
};

function Box({ p, s, m, r }: { p: V3; s: V3; m: THREE.Material; r?: number }) {
  if (r)
    return <RoundedBox args={s} radius={r} smoothness={3} position={p} material={m} castShadow receiveShadow />;
  return (
    <mesh position={p} material={m} castShadow receiveShadow>
      <boxGeometry args={s} />
    </mesh>
  );
}

function Cyl({ p, r, h, m, r2 }: { p: V3; r: number; h: number; m: THREE.Material; r2?: number }) {
  return (
    <mesh position={p} material={m} castShadow receiveShadow>
      <cylinderGeometry args={[r, r2 ?? r, h, 32]} />
    </mesh>
  );
}

// Grupa mebli opadająca na miejsce w swojej kolejności.
function Drop({ ph, i, n, children }: { ph: PhaseRef; i: number; n: number; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null!);
  useFrame(() => {
    const k = stagger(ph.current!.furniture, i, n, 0.32);
    ref.current.visible = k > 0.001;
    ref.current.position.y = (1 - easeOut(k)) * 3;
    ref.current.scale.setScalar(0.9 + 0.1 * easeOutBack(k));
  });
  return <group ref={ref}>{children}</group>;
}

function Shell({ ph }: { ph: PhaseRef }) {
  const wallMat = useMemo(() => {
    const map = concrete().clone();
    map.repeat.set(2, 1);
    map.needsUpdate = true;
    return new THREE.MeshStandardMaterial({ map, color: '#8d8984', roughness: 1 });
  }, []);
  const slabMat = useMemo(() => new THREE.MeshStandardMaterial({ map: concrete(), color: '#7a7671', roughness: 1 }), []);
  const raw = useMemo(() => new THREE.Color('#8d8984'), []);
  const plaster = useMemo(() => new THREE.Color('#efe9df'), []);

  useFrame(() => {
    wallMat.color.copy(raw).lerp(plaster, easeInOut(ph.current!.plaster));
  });

  return (
    <group>
      <Box p={[0, -0.36, 0]} s={[11.6, 0.12, 9.6]} m={mats.dark} />
      <Box p={[0, -0.15, 0]} s={[10.6, 0.3, 8.6]} m={slabMat} />
      {WALLS.map(([x1, z1, x2, z2, h], i) => {
        const alongZ = x1 === x2;
        const len = (alongZ ? Math.abs(z2 - z1) : Math.abs(x2 - x1)) + T;
        return (
          <Box
            key={i}
            p={[(x1 + x2) / 2, h / 2, (z1 + z2) / 2]}
            s={alongZ ? [T, h, len] : [len, h, T]}
            m={wallMat}
          />
        );
      })}
      {/* okna */}
      <Box p={[0.1, 1.55, -3.89]} s={[1.7, 1.5, 0.05]} m={mats.frame} />
      <Box p={[0.1, 1.55, -3.86]} s={[1.56, 1.36, 0.04]} m={mats.window} />
      <Box p={[-4.89, 1.55, -2.2]} s={[0.05, 1.5, 1.5]} m={mats.frame} />
      <Box p={[-4.86, 1.55, -2.2]} s={[0.04, 1.36, 1.36]} m={mats.window} />
    </group>
  );
}

function Planks({ ph }: { ph: PhaseRef }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const list = useMemo(() => {
    const w = 0.3;
    const out: { x: number; z0: number; z1: number }[] = [];
    for (let x = -4.9 + w / 2; x < -1.1; x += w) out.push({ x, z0: -3.9, z1: -0.1 });
    for (let x = -1.9 + w / 2; x < -1.1; x += w) out.push({ x, z0: 0.1, z1: 3.9 });
    for (let x = -0.9 + w / 2; x < 4.9; x += w) out.push({ x, z0: -3.9, z1: 3.9 });
    return out;
  }, []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ map: wood('oak'), roughness: 0.6 }), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    const r = Math.random;
    list.forEach((_, i) => ref.current.setColorAt(i, C.setHSL(0.08, 0.1, 0.86 + r() * 0.14)));
    ref.current.instanceColor!.needsUpdate = true;
  }, [list]);

  useFrame(() => {
    const t = ph.current!.floor;
    list.forEach((pl, i) => {
      const k = easeOut(stagger(t, i, list.length, 0.25));
      const len = (pl.z1 - pl.z0) * Math.max(k, 0.0001);
      dummy.position.set(pl.x, 0.02, pl.z0 + len / 2);
      dummy.scale.set(1, k > 0 ? 1 : 0, len);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, list.length]} material={mat} receiveShadow castShadow>
      <boxGeometry args={[0.29, 0.04, 1]} />
    </instancedMesh>
  );
}

function Tiles({ ph }: { ph: PhaseRef }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const list = useMemo(() => {
    const g = 0.015;
    const out: { p: V3; s: V3 }[] = [];
    // podłoga łazienki 6×8
    for (let j = 0; j < 8; j++)
      for (let i = 0; i < 6; i++) {
        const tx = 2.8 / 6, tz = 3.8 / 8;
        out.push({ p: [-4.9 + tx * (i + 0.5), 0.035, 0.1 + tz * (j + 0.5)], s: [tx - g, 0.03, tz - g] });
      }
    // ściana zewnętrzna (x = -5)
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 6; c++) {
        const tz = 3.8 / 6, ty = 0.6;
        out.push({ p: [-4.88, ty * (r + 0.5), 0.1 + tz * (c + 0.5)], s: [0.03, ty - g, tz - g] });
      }
    // ściana działowa (z = 0)
    for (let r = 0; r < 2; r++)
      for (let c = 0; c < 4; c++) {
        const tx = 2.8 / 4, ty = 0.6;
        out.push({ p: [-4.9 + tx * (c + 0.5), ty * (r + 0.5), 0.12], s: [tx - g, ty - g, 0.03] });
      }
    return out;
  }, []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ map: marble('carrara'), roughness: 0.22 }), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    const t = ph.current!.tiles;
    list.forEach((tile, i) => {
      const k = easeOutBack(stagger(t, i, list.length, 0.2));
      dummy.position.set(...tile.p);
      dummy.scale.set(tile.s[0] * k, tile.s[1] * k, tile.s[2] * k);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, list.length]} material={mat} receiveShadow castShadow>
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  );
}

function Plant({ p, s = 1 }: { p: V3; s?: number }) {
  return (
    <group position={p} scale={s}>
      <Cyl p={[0, 0.2, 0]} r={0.2} r2={0.16} h={0.4} m={mats.pot} />
      <mesh position={[0, 0.78, 0]} material={mats.leaf} castShadow>
        <icosahedronGeometry args={[0.38, 1]} />
      </mesh>
      <mesh position={[0.12, 1.08, 0.05]} material={mats.leaf} castShadow>
        <icosahedronGeometry args={[0.24, 1]} />
      </mesh>
    </group>
  );
}

function Furniture({ ph }: { ph: PhaseRef }) {
  const walnut = useMemo(() => new THREE.MeshStandardMaterial({ map: wood('walnut'), roughness: 0.5 }), []);
  const stone = useMemo(() => new THREE.MeshStandardMaterial({ map: marble('carrara'), roughness: 0.2 }), []);
  const n = 11;
  return (
    <>
      {/* kuchnia */}
      <Drop ph={ph} i={0} n={n}>
        <Box p={[2.95, 0.45, -3.58]} s={[3.7, 0.86, 0.62]} m={mats.cabinet} />
        <Box p={[2.95, 0.9, -3.57]} s={[3.76, 0.05, 0.66]} m={stone} />
        <Box p={[2.95, 0.78, -3.26]} s={[3.4, 0.02, 0.02]} m={mats.brass} />
        <Box p={[2.95, 2.0, -3.73]} s={[3.7, 0.75, 0.34]} m={mats.cabinet} />
      </Drop>
      <Drop ph={ph} i={1} n={n}>
        <Box p={[2.9, 0.44, -1.75]} s={[2.2, 0.86, 0.95]} m={mats.cabinet} />
        <Box p={[2.9, 0.9, -1.75]} s={[2.32, 0.06, 1.07]} m={stone} />
        {[2.4, 3.4].map((x) => (
          <group key={x}>
            <Cyl p={[x, 0.35, -0.98]} r={0.025} h={0.7} m={mats.brass} />
            <Cyl p={[x, 0.71, -0.98]} r={0.19} h={0.06} m={mats.dark} />
          </group>
        ))}
      </Drop>
      {/* jadalnia */}
      <Drop ph={ph} i={2} n={n}>
        <Box p={[0.1, 0.74, -2.3]} s={[1.7, 0.05, 0.9]} m={walnut} />
        {[
          [-0.6, -2.7],
          [0.8, -2.7],
          [-0.6, -1.9],
          [0.8, -1.9],
        ].map(([x, z], i) => (
          <Box key={i} p={[x, 0.36, z]} s={[0.05, 0.72, 0.05]} m={mats.dark} />
        ))}
        {[-0.35, 0.55].flatMap((x) =>
          [
            [-2.95, -3.15],
            [-1.65, -1.45],
          ].map(([z, zb]) => (
            <group key={`${x}${z}`}>
              <Box p={[x, 0.45, z]} s={[0.44, 0.06, 0.44]} m={mats.fabricLight} r={0.02} />
              <Box p={[x, 0.7, zb]} s={[0.44, 0.46, 0.05]} m={mats.fabricLight} r={0.02} />
              <Box p={[x, 0.21, z]} s={[0.04, 0.42, 0.04]} m={mats.dark} />
            </group>
          )),
        )}
      </Drop>
      <Drop ph={ph} i={3} n={n}>
        {[-0.35, 0.55].map((x) => (
          <group key={x}>
            <Cyl p={[x, 2.2, -2.3]} r={0.006} h={0.8} m={mats.dark} />
            <mesh position={[x, 1.72, -2.3]} material={mats.lamp}>
              <sphereGeometry args={[0.14, 32, 16]} />
            </mesh>
          </group>
        ))}
      </Drop>
      {/* salon */}
      <Drop ph={ph} i={4} n={n}>
        <Box p={[3.2, 0.05, 2.25]} s={[2.9, 0.02, 2.1]} m={mats.rug} />
        <Box p={[3.2, 0.42, 3.62]} s={[2.3, 0.42, 0.42]} m={mats.dark} />
        <Box p={[3.2, 0.64, 3.62]} s={[2.3, 0.02, 0.42]} m={mats.brass} />
      </Drop>
      <Drop ph={ph} i={5} n={n}>
        <Box p={[3.2, 0.22, 1.35]} s={[2.5, 0.32, 0.95]} m={mats.fabric} r={0.06} />
        <Box p={[3.2, 0.58, 0.98]} s={[2.5, 0.55, 0.22]} m={mats.fabric} r={0.08} />
        <Box p={[2.02, 0.42, 1.35]} s={[0.2, 0.42, 0.95]} m={mats.fabric} r={0.06} />
        <Box p={[4.38, 0.42, 1.35]} s={[0.2, 0.42, 0.95]} m={mats.fabric} r={0.06} />
        <Box p={[2.62, 0.45, 1.42]} s={[1.08, 0.14, 0.74]} m={mats.fabricLight} r={0.06} />
        <Box p={[3.78, 0.45, 1.42]} s={[1.08, 0.14, 0.74]} m={mats.fabricLight} r={0.06} />
        <Cyl p={[3.2, 0.2, 2.45]} r={0.14} h={0.34} m={mats.dark} />
        <Cyl p={[3.2, 0.4, 2.45]} r={0.48} h={0.06} m={walnut} />
        <Cyl p={[4.6, 0.82, 0.95]} r={0.015} h={1.64} m={mats.brass} />
        <mesh position={[4.6, 1.7, 0.95]} material={mats.lamp}>
          <cylinderGeometry args={[0.14, 0.2, 0.26, 32, 1, true]} />
        </mesh>
      </Drop>
      {/* sypialnia */}
      <Drop ph={ph} i={6} n={n}>
        <Box p={[-3.0, 0.62, -3.82]} s={[1.95, 1.24, 0.12]} m={mats.fabricLight} r={0.05} />
        <Box p={[-3.0, 0.18, -2.85]} s={[1.8, 0.26, 2.0]} m={walnut} />
        <Box p={[-3.0, 0.4, -2.85]} s={[1.7, 0.2, 1.9]} m={mats.linen} r={0.06} />
        <Box p={[-3.0, 0.52, -2.45]} s={[1.76, 0.07, 1.15]} m={mats.fabricLight} r={0.03} />
        <Box p={[-3.4, 0.58, -3.5]} s={[0.62, 0.14, 0.32]} m={mats.linen} r={0.06} />
        <Box p={[-2.6, 0.58, -3.5]} s={[0.62, 0.14, 0.32]} m={mats.linen} r={0.06} />
        <Box p={[-3.0, 0.22, -1.5]} s={[1.3, 0.2, 0.4]} m={mats.dark} r={0.03} />
      </Drop>
      <Drop ph={ph} i={7} n={n}>
        {[-4.3, -1.7].map((x) => (
          <group key={x}>
            <Box p={[x, 0.24, -3.6]} s={[0.46, 0.46, 0.4]} m={walnut} />
            <mesh position={[x, 0.6, -3.6]} material={mats.lamp}>
              <sphereGeometry args={[0.1, 24, 12]} />
            </mesh>
          </group>
        ))}
      </Drop>
      {/* łazienka */}
      <Drop ph={ph} i={8} n={n}>
        <Box p={[-3.9, 0.3, 0.6]} s={[1.7, 0.56, 0.82]} m={mats.ceramic} r={0.14} />
        <Cyl p={[-3.0, 0.55, 0.6]} r={0.02} h={0.5} m={mats.brass} />
      </Drop>
      <Drop ph={ph} i={9} n={n}>
        <Box p={[-4.6, 0.62, 2.4]} s={[0.5, 0.34, 1.2]} m={walnut} />
        <Box p={[-4.6, 0.84, 2.4]} s={[0.44, 0.12, 0.54]} m={mats.ceramic} r={0.04} />
        <Box p={[-4.84, 1.6, 2.4]} s={[0.03, 0.9, 0.8]} m={mats.mirror} />
        <Box p={[-4.62, 0.28, 3.5]} s={[0.5, 0.42, 0.38]} m={mats.ceramic} r={0.1} />
      </Drop>
      <Drop ph={ph} i={10} n={n}>
        <Plant p={[4.5, 0, 3.0]} />
        <Plant p={[-0.6, 0, -3.5]} s={0.85} />
        <Plant p={[-4.45, 0, -0.55]} s={0.8} />
      </Drop>
    </>
  );
}

function Lights({ ph }: { ph: PhaseRef }) {
  const sun = useRef<THREE.DirectionalLight>(null!);
  const hemi = useRef<THREE.HemisphereLight>(null!);
  const lamps = useRef<THREE.Group>(null!);
  const { scene } = useThree();
  const white = useMemo(() => new THREE.Color('#ffffff'), []);
  const dusk = useMemo(() => new THREE.Color('#ffae73'), []);
  const day = useMemo(() => new THREE.Color('#bcd6e6'), []);
  const night = useMemo(() => new THREE.Color('#24304a'), []);

  useFrame(() => {
    const l = easeInOut(ph.current!.light);
    sun.current.intensity = THREE.MathUtils.lerp(2.6, 0.45, l);
    sun.current.color.copy(white).lerp(dusk, l);
    hemi.current.intensity = THREE.MathUtils.lerp(0.9, 0.22, l);
    scene.environmentIntensity = THREE.MathUtils.lerp(0.55, 0.18, l);
    mats.lamp.emissiveIntensity = l * 3.2;
    mats.window.emissive.copy(day).lerp(night, l);
    mats.window.emissiveIntensity = THREE.MathUtils.lerp(0.55, 0.9, l);
    lamps.current.children.forEach((c) => ((c as THREE.PointLight).intensity = l * 5));
  });

  return (
    <>
      <hemisphereLight ref={hemi} args={['#ffffff', '#8a7f70', 0.9]} />
      <directionalLight
        ref={sun}
        position={[6, 11, 5]}
        intensity={2.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <group ref={lamps}>
        {(
          [
            [0.1, 1.5, -2.3],
            [4.6, 1.5, 1.0],
            [-3.0, 1.0, -3.1],
            [-4.2, 1.9, 2.4],
            [3.0, 1.6, -2.4],
          ] as V3[]
        ).map((p, i) => (
          <pointLight key={i} position={p} color="#ffc98a" intensity={0} distance={5.5} decay={1.6} />
        ))}
      </group>
    </>
  );
}

function Rig({ prog }: { prog: RefObject<number> }) {
  const { camera, size, pointer } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  const tilt = useRef(0);

  useFrame((_, dt) => {
    const p = prog.current!;
    const aspect = size.width / size.height;
    const portrait = aspect < 0.9;
    const k = portrait ? 1.55 : aspect < 1.3 ? 1.2 : 1;
    tilt.current = THREE.MathUtils.damp(tilt.current, pointer.x, 2, dt);
    const a = THREE.MathUtils.lerp(1.0, 0.66, easeInOut(p)) + tilt.current * 0.04;
    const R = THREE.MathUtils.lerp(23, 20, easeInOut(p)) * k;
    const y = THREE.MathUtils.lerp(18, 13.5, easeInOut(p)) * k;
    cam.position.set(Math.cos(a) * R, y, Math.sin(a) * R);
    cam.lookAt(0, portrait ? -0.6 : 0.3, 0);
    // model przesunięty w prawo, żeby nie wchodził pod nagłówek; z postępem wraca ku środkowi
    cam.filmOffset = portrait ? 0 : THREE.MathUtils.lerp(-7.5, -5.5, easeInOut(p));
    cam.updateProjectionMatrix();
  });
  return null;
}

function Scene() {
  const prog = useScrollProgress('#hero', 3.5);
  const ph = useRef<Phases>({ plaster: 0, floor: 0, tiles: 0, furniture: 0, light: 0 });

  useFrame(() => {
    const p = prog.current;
    for (const key of Object.keys(heroPhases) as (keyof Phases)[]) {
      ph.current[key] = seg(p, heroPhases[key][0], heroPhases[key][1]);
    }
  });

  return (
    <>
      <color attach="background" args={['#161513']} />
      <RoomEnv intensity={0.55} />
      <Lights ph={ph} />
      <Rig prog={prog} />
      <Shell ph={ph} />
      <Planks ph={ph} />
      <Tiles ph={ph} />
      <Furniture ph={ph} />
    </>
  );
}

export default function HeroScene() {
  if (no3d()) return null;
  return (
    <GatedCanvas className="hero-canvas" shadows="percentage" camera={{ fov: 30, position: [12, 12, 12], near: 0.1, far: 100 }}>
      <Scene />
    </GatedCanvas>
  );
}
