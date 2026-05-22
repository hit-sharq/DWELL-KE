'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── CONFIGURATION ─── */
const CITY_COLOR   = 0x0d2d52;   // dark navy glass
const GLOW_COLOR   = 0x22D3EE;   // neon cyan
const GLOW2_COLOR  = 0x60A5FA;   // royal blue glow
const FOG_COLOR    = 0x03050A;
const FLOOR_ID     = '#050505';

/* ── Architectural building block ── */
function Building({ pos, scale = 1 }: { pos: [number, number, number]; scale?: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (mesh.current) {
      mesh.current.position.y = pos[1] + Math.sin(Date.now() * 0.0004 + pos[0] * 0.1) * 0.08 * scale;
    }
  });

  const w = (0.35 + Math.random() * 0.55) * scale;
  const d = (0.35 + Math.random() * 0.55) * scale;
  const h = (0.8  + Math.random() * 2.5)  * scale;

  return (
    <group position={pos}>
      {/* ─ Solid dark glass body ─ */}
      <mesh ref={mesh} position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshPhysicalMaterial
          color={CITY_COLOR}
          transparent
          opacity={0.82}
          roughness={0.18}
          metalness={0.65}
          envMapIntensity={1.8}
          transmission={0.08}
        />
      </mesh>

      {/* ─ Neon edge glow ─ */}
      <lineSegments position={[0, h / 2, 0]} rotation={[0, 0, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(w, h, d)] as any} />
        <lineBasicMaterial color={GLOW_COLOR} transparent opacity={0.55} />
      </lineSegments>

      {/* ─ Top plate ─ */}
      <mesh position={[0, h + 0.005, 0]}>
        <planeGeometry args={[w + 0.04, d + 0.04]} />
        <meshBasicMaterial color={GLOW_COLOR} transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

/* ── Cinematic rotating camera ── */
function CinematicCamera() {
  const { camera } = useThree();

  React.useEffect(() => {
    camera.position.set(12, 7, 14);
    camera.lookAt(0, 0.8, 0);
  }, [camera]);

  useFrame((_, delta) => {
    const { x, y } = camera.position;
    camera.position.x = Math.sin(Date.now() * 0.00012) * 14;
    camera.position.z = Math.cos(Date.now() * 0.00012) * 14;
    camera.position.y = 7 + Math.sin(Date.now() * 0.0003) * 0.5;
    camera.lookAt(0, 0.6, 0);
  });

  return null;
}

/* ── Floating ambient lights ── */
function AmbientLights() {
  return (
    <>
      <ambientLight intensity={0.25} color="#0B1938" />
      <pointLight position={[8, 9, 4]}  intensity={1.4} color={GLOW_COLOR} decay={2.2} distance={30} />
      <pointLight position={[-7, 10, -6]} intensity={1.1} color={GLOW2_COLOR} decay={2} distance={30} />
      <pointLight position={[0, 14, 0]}   intensity={0.6} color="#10B981" decay={2.5} distance={40} />
      <pointLight position={[0, 0, 0]}    intensity={0.3} color="#8B5CF6" decay={3}   distance={20} />
    </>
  );
}

/* ── Neo-grid floor ── */
function NeonGrid() {
  const gridRef = useRef<THREE.GridHelper>(null);

  useFrame((_, delta) => {
    if (gridRef.current) {
      gridRef.current.rotation.y += delta * 0.04;
    }
  });

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
      <gridHelper
        ref={gridRef}
        args={[60, 60, GLOW_COLOR, GLOW2_COLOR]}
        position={[0, 0, 0]}
      />
    </group>
  );
}

/* ── Floating drone orbs (accent lights) ── */
function DroneLight({ pos, color, delay }: { pos: [number, number, number]; color: number; delay: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.position.x = pos[0] + Math.sin(Date.now() * 0.0006 + delay) * 3;
      ref.current.position.z = pos[2] + Math.cos(Date.now() * 0.0005 + delay) * 2;
      ref.current.position.y = pos[1] + Math.sin(Date.now() * 0.0008 + delay) * 0.6;
    }
  });

  return (
    <mesh ref={ref} position={pos}>
      <sphereGeometry args={[0.22, 16, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.9} />
    </mesh>
  );
}

/* ── Light streak beams (vertical) ── */
function LightBeam({ pos, color, height = 14 }: { pos: [number, number, number]; color: number; height?: number }) {
  return (
    <group position={pos}>
      <mesh rotation={[0, 0, 0]}>
        <planeGeometry args={[0.06, height]} />
        <meshBasicMaterial color={color} transparent opacity={0.07} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ── Main city scene ── */
function CityScene() {
  const buildings = useMemo(() => {
    const b: Array<{ pos: [number, number, number]; scale: number }> = [];
    // Downtown core — tightly packed towers
    for (let i = 0; i < 22; i++) {
      const x = (Math.random() - 0.5) * 8;
      const z = (Math.random() - 0.5) * 8;
      b.push({ pos: [x, 0, z], scale: 0.9 + Math.random() * 0.7 });
    }
    // Premium cluster — tall标志性 towers
    for (let x = -5; x <= 5; x += 2.2) {
      b.push({ pos: [x, 0, -2 + Math.random()], scale: 1.3 + Math.random() * 0.8 });
    }
    // Lakeside strip — individual premium properties
    for (let z = 4; z <= 9; z += 1.8) {
      b.push({ pos: [2, 0, z], scale: 0.5 + Math.random() * 0.4 });
      b.push({ pos: [-2.5, 0, z], scale: 0.5 + Math.random() * 0.4 });
    }
    return b;
  }, []);

  return (
    <group>
      <AmbientLights />
      <CinematicCamera />
      <NeonGrid />

      {/* Building clusters */}
      <group>
        {buildings.map((b, i) => (
          <Building key={i} pos={b.pos} scale={b.scale} />
        ))}
      </group>

      {/* Drone orbs */}
      <DroneLight pos={[6,  9,  2]} color={GLOW_COLOR} delay={0} />
      <DroneLight pos={[-7, 11, -4]} color={GLOW2_COLOR} delay={2.1} />
      <DroneLight pos={[4,  12, -6]} color={GLOW_COLOR} delay={4.2} />
      <DroneLight pos={[-5,  8,  8]} color={GLOW2_COLOR} delay={1.5} />
      <DroneLight pos={[9,  10, -1]} color={GLOW_COLOR} delay={3.7} />

      {/* Vertical light beams */}
      <LightBeam pos={[3,  0,  0]} color={GLOW_COLOR} />
      <LightBeam pos={[-4, 0,  3]} color={GLOW2_COLOR} />
      <LightBeam pos={[0,  0, -5]} color={GLOW_COLOR} />
      <LightBeam pos={[-7, 0, -2]} color={GLOW2_COLOR} />
      <LightBeam pos={[6,  0, -8]} color={GLOW_COLOR} />

      {/* Volumetric glow orbs */}
      <mesh position={[0, 0.1, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshBasicMaterial
          color={FOG_COLOR}
          transparent
          opacity={0.0}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ════════════════════════════════════════
   LUXURY CITY 3D — EXPORT
════════════════════════════════════════ */
export function LuxuryCity3D() {
  return (
    <Canvas
      className="absolute inset-0 w-full h-full"
      camera={{ position: [14, 8, 14], fov: 55, near: 0.1, far: 200 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      dpr={[1, 1.5]}
      style={{ pointerEvents: 'none' }}
    >
      <color attach="background" args={[FOG_COLOR]} />
      <fog attach="fog" args={[FOG_COLOR, 16, 52]} />
      <CityScene />
    </Canvas>
  );
}
