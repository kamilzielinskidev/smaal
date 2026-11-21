import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Float, RoundedBox } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import { GatedCanvas, RoomEnv } from './util';
import { concrete, marble, travertine, wood } from './textures';
import type { StandardId } from '../data/pricing';

const brass = (rough: number) => new THREE.MeshStandardMaterial({ color: '#b08d57', metalness: 1, roughness: rough });
const tex = (map: THREE.Texture, rough: number, color = '#ffffff') =>
  new THREE.MeshStandardMaterial({ map, roughness: rough, color });

function makeSet(id: StandardId): THREE.Material[] {
  if (id === 'komfort') return [tex(wood('oak'), 0.6), new THREE.MeshStandardMaterial({ color: '#f2efe9', roughness: 0.9 }), tex(concrete(), 1, '#b3aea6')];
  if (id === 'premium') return [tex(marble('carrara'), 0.15), tex(wood('smoked'), 0.5), brass(0.3)];
  return [tex(marble('nero'), 0.1), tex(travertine(), 0.7), brass(0.15)];
}

function Board({ id, active }: { id: StandardId; active: boolean }) {
  const group = useRef<THREE.Group>(null!);
  const [a, b, c] = useMemo(() => makeSet(id), [id]);
  useFrame((state, dt) => {
    const speed = active ? 0.5 : 0.18;
    group.current.rotation.y += dt * speed;
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, 0.35 + state.pointer.y * 0.25, 3, dt);
  });
  return (
    <group ref={group}>
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
        <RoundedBox args={[1.5, 1.5, 0.14]} radius={0.04} smoothness={4} material={a} position={[-0.25, 0.1, 0]} rotation={[0, 0.3, 0.08]} />
        <RoundedBox args={[1.0, 1.0, 0.14]} radius={0.04} smoothness={4} material={b} position={[0.55, -0.35, 0.35]} rotation={[0, -0.4, -0.1]} />
        {id === 'komfort' ? (
          <RoundedBox args={[0.6, 0.6, 0.6]} radius={0.06} smoothness={4} material={c} position={[0.7, 0.55, -0.3]} />
        ) : (
          <mesh material={c} position={[0.75, 0.5, -0.2]} rotation={[0.4, 0, 0.9]}>
            <cylinderGeometry args={[0.09, 0.09, 1.3, 48]} />
          </mesh>
        )}
      </Float>
    </group>
  );
}

export default function MaterialSample({ id, active }: { id: StandardId; active: boolean }) {
  return (
    <GatedCanvas className="sample-canvas" gl={{ alpha: true }} camera={{ fov: 35, position: [0, 0, 4.3] }}>
      <RoomEnv intensity={0.9} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} />
      <pointLight position={[-3, -1, 2]} color="#b08d57" intensity={active ? 8 : 3} />
      <Board id={id} active={active} />
    </GatedCanvas>
  );
}
