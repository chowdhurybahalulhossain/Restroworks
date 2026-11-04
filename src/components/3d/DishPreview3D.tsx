// ============================================================
// NOVAPOS Phase 4 — Interactive 3D Dish Showcase (React Three Fiber)
// Procedural gourmet 3D food models, 360° orbit rotation,
// layer explode-view inspection, and steam particle effects.
// ============================================================

import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { MenuItem } from '../../types';

interface DishPreview3DProps {
  item: MenuItem;
  exploded?: boolean;
}

// ── Steam Particles Effect ───────────────────────────────────
const SteamParticles: React.FC = () => {
  const count = 28;
  const meshRef = useRef<THREE.Points>(null);

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 1.2;
      pos[i * 3 + 1] = Math.random() * 2 + 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 1.2;
      spd[i] = 0.01 + Math.random() * 0.02;
    }
    return [pos, spd];
  }, []);

  useFrame(() => {
    if (!meshRef.current) return;
    const pos = meshRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += speeds[i];
      if (pos[i * 3 + 1] > 2.8) {
        pos[i * 3 + 1] = 0.6;
        pos[i * 3] = (Math.random() - 0.5) * 1.0;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 1.0;
      }
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.16}
        color="#cbd5e1"
        transparent
        opacity={0.35}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

// ── Gourmet Ceramic Plate ────────────────────────────────────
const Plate: React.FC = () => {
  return (
    <group position={[0, -0.05, 0]}>
      {/* Plate Rim */}
      <mesh receiveShadow castShadow>
        <cylinderGeometry args={[2.4, 1.8, 0.16, 48]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.15}
          metalness={0.3}
        />
      </mesh>
      {/* Gold/Cyan Rim Accent */}
      <mesh position={[0, 0.085, 0]}>
        <ringGeometry args={[2.25, 2.35, 48]} />
        <meshStandardMaterial
          color="#00f0ff"
          emissive="#00f0ff"
          emissiveIntensity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

// ── 3D Food Models Based on Category / Name ──────────────────

// 1. Steak Model
const SteakModel: React.FC<{ exploded: boolean }> = ({ exploded }) => {
  const explodeOffset = exploded ? 0.7 : 0;
  return (
    <group position={[0, 0.15, 0]}>
      {/* Mashed potato base */}
      <mesh position={[0.2, 0.08, -0.2]} castShadow receiveShadow>
        <cylinderGeometry args={[1.0, 1.2, 0.18, 24]} />
        <meshStandardMaterial color="#fef08a" roughness={0.9} />
      </mesh>

      {/* Seared Ribeye Steak */}
      <group position={[-0.1, 0.25 + explodeOffset, 0]}>
        <mesh castShadow receiveShadow rotation={[0, 0.2, 0]}>
          <boxGeometry args={[1.8, 0.35, 1.2]} />
          <meshStandardMaterial
            color="#3f1a08"
            roughness={0.4}
            metalness={0.1}
          />
        </mesh>
        {/* Grill Marks */}
        {[-0.5, 0, 0.5].map((x) => (
          <mesh key={x} position={[x, 0.185, 0]} rotation={[0, Math.PI / 4, 0]}>
            <boxGeometry args={[0.08, 0.02, 1.4]} />
            <meshStandardMaterial color="#1a0802" roughness={0.9} />
          </mesh>
        ))}
        {/* Herb butter dollop */}
        <mesh position={[0.2, 0.25 + (exploded ? 0.4 : 0), 0.1]} castShadow>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color="#84cc16" roughness={0.3} />
        </mesh>
      </group>

      {/* Rosemary Sprig */}
      <mesh position={[0.8, 0.15 + (exploded ? 0.8 : 0), 0.4]} rotation={[0.4, 0.5, 0.8]}>
        <cylinderGeometry args={[0.03, 0.03, 1.1, 8]} />
        <meshStandardMaterial color="#15803d" roughness={0.8} />
      </mesh>
    </group>
  );
};

// 2. Burger Model (Supports Exploded Layers View)
const BurgerModel: React.FC<{ exploded: boolean }> = ({ exploded }) => {
  const gap = exploded ? 0.45 : 0;
  return (
    <group position={[0, 0.1, 0]}>
      {/* Bottom Bun */}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.2, 1.05, 0.25, 32]} />
        <meshStandardMaterial color="#b45309" roughness={0.6} />
      </mesh>

      {/* Wagyu Beef Patty */}
      <mesh position={[0, 0.35 + gap * 1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.25, 1.25, 0.3, 32]} />
        <meshStandardMaterial color="#451a03" roughness={0.7} />
      </mesh>

      {/* Melted Cheddar Cheese */}
      <mesh position={[0, 0.52 + gap * 2, 0]} castShadow>
        <boxGeometry args={[1.5, 0.06, 1.5]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Tomato Slices */}
      <group position={[0, 0.62 + gap * 3, 0]}>
        <mesh position={[-0.3, 0, 0]} castShadow>
          <cylinderGeometry args={[0.55, 0.55, 0.08, 24]} />
          <meshStandardMaterial color="#dc2626" roughness={0.2} />
        </mesh>
        <mesh position={[0.3, 0, 0]} castShadow>
          <cylinderGeometry args={[0.55, 0.55, 0.08, 24]} />
          <meshStandardMaterial color="#dc2626" roughness={0.2} />
        </mesh>
      </group>

      {/* Crisp Lettuce */}
      <mesh position={[0, 0.72 + gap * 4, 0]} castShadow>
        <cylinderGeometry args={[1.4, 1.3, 0.08, 24]} />
        <meshStandardMaterial color="#22c55e" roughness={0.7} />
      </mesh>

      {/* Top Brioche Bun with Sesame seeds */}
      <group position={[0, 0.95 + gap * 5, 0]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[1.25, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#b45309" roughness={0.5} />
        </mesh>
        {/* Sesame Seeds */}
        {Array.from({ length: 30 }).map((_, i) => {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.random() * (Math.PI / 3.5);
          const r = 1.26;
          const sx = r * Math.sin(phi) * Math.cos(theta);
          const sy = r * Math.cos(phi);
          const sz = r * Math.sin(phi) * Math.sin(theta);
          return (
            <mesh key={i} position={[sx, sy, sz]}>
              <sphereGeometry args={[0.03, 6, 6]} />
              <meshStandardMaterial color="#fef3c7" roughness={0.9} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
};

// 3. Pizza Model
const PizzaModel: React.FC<{ exploded: boolean }> = ({ exploded }) => {
  return (
    <group position={[0, 0.1, 0]}>
      {/* Crust */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[1.9, 1.8, 0.12, 36]} />
        <meshStandardMaterial color="#d97706" roughness={0.8} />
      </mesh>
      {/* Mozzarella melt */}
      <mesh position={[0, 0.08, 0]} castShadow>
        <cylinderGeometry args={[1.65, 1.65, 0.06, 36]} />
        <meshStandardMaterial color="#fef08a" roughness={0.3} />
      </mesh>
      {/* Pepperoni & Basil Toppings */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const dist = 0.95;
        const px = Math.cos(angle) * dist;
        const pz = Math.sin(angle) * dist;
        const lift = exploded ? 0.4 : 0;
        return (
          <mesh key={i} position={[px, 0.13 + lift, pz]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.04, 16]} />
            <meshStandardMaterial color="#991b1b" roughness={0.4} />
          </mesh>
        );
      })}
    </group>
  );
};

// 4. Beverage Cocktail / Mocktail Model
const BeverageModel: React.FC = () => {
  return (
    <group position={[0, 0.1, 0]}>
      {/* Glass Base & Stem */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.6, 0.7, 0.08, 24]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.95} opacity={1} roughness={0.05} ior={1.5} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 1.1, 16]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.95} opacity={1} roughness={0.05} ior={1.5} />
      </mesh>
      {/* Glass Bowl */}
      <mesh position={[0, 1.45, 0]}>
        <cylinderGeometry args={[0.9, 0.15, 1.2, 24, 1, true]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.95} opacity={1} roughness={0.05} ior={1.5} />
      </mesh>
      {/* Glowing Neon Liquid */}
      <mesh position={[0, 1.35, 0]}>
        <cylinderGeometry args={[0.82, 0.18, 0.95, 24]} />
        <meshStandardMaterial
          color="#00f0ff"
          emissive="#00f0ff"
          emissiveIntensity={0.8}
          roughness={0.1}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Lime Garnish on Rim */}
      <mesh position={[0.8, 2.0, 0]} rotation={[0.4, 0, 0.8]}>
        <cylinderGeometry args={[0.35, 0.35, 0.06, 16]} />
        <meshStandardMaterial color="#84cc16" roughness={0.4} />
      </mesh>
    </group>
  );
};

// ── Main 3D Dish Scene ───────────────────────────────────────
export const DishPreview3D: React.FC<DishPreview3DProps> = ({ item, exploded = false }) => {
  const name = item.nameEn.toLowerCase();
  const isSteak = name.includes('steak') || name.includes('tenderloin') || name.includes('beef');
  const isBurger = name.includes('burger') || name.includes('sandwich');
  const isPizza = name.includes('pizza');
  const isBeverage = name.includes('mojito') || name.includes('cocktail') || name.includes('tea') || name.includes('drink');

  return (
    <div className="w-full h-full min-h-[380px] relative select-none rounded-2xl overflow-hidden bg-gradient-to-b from-[#0a0f1d] to-[#07090e]">
      {/* 360 Hint Badge */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[11px] font-mono text-cyan-300">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span>360° INTERACTIVE 3D DISH</span>
      </div>

      <Canvas
        shadows
        camera={{ position: [0, 2.8, 4.2], fov: 42 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[5, 10, 6]}
          intensity={1.4}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-4, 3, -3]} intensity={0.6} color="#00f0ff" />
        <pointLight position={[4, 3, 2]} intensity={0.6} color="#f59e0b" />

        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.2}>
          <group position={[0, -0.4, 0]}>
            {!isBeverage && <Plate />}

            {isSteak ? (
              <SteakModel exploded={exploded} />
            ) : isBurger ? (
              <BurgerModel exploded={exploded} />
            ) : isPizza ? (
              <PizzaModel exploded={exploded} />
            ) : isBeverage ? (
              <BeverageModel />
            ) : (
              // Default Gourmet Platter
              <BurgerModel exploded={exploded} />
            )}

            {!isBeverage && <SteamParticles />}
          </group>
        </Float>

        <ContactShadows position={[0, -0.85, 0]} opacity={0.5} scale={8} blur={2} />

        <OrbitControls
          autoRotate
          autoRotateSpeed={1.0}
          enableZoom={true}
          minDistance={2.5}
          maxDistance={8}
          maxPolarAngle={Math.PI / 2.05}
        />
      </Canvas>
    </div>
  );
};

