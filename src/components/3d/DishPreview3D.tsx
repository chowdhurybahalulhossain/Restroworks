// ============================================================
// Restroworks Phase 4 — High-Definition 3D Dish Showcase
// Procedural gourmet 3D food models, 360° orbit rotation,
// multi-layer explode-view inspection, and robust WebGL render.
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

// ── Gentle Procedural Steam Rings ───────────────────────────
const SafeSteam: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, idx) => {
      const mesh = child as THREE.Mesh;
      mesh.position.y = 0.5 + ((t * 0.4 + idx * 0.35) % 1.4);
      const scale = 0.6 + ((t * 0.3 + idx * 0.3) % 1.0) * 0.8;
      mesh.scale.set(scale, scale, scale);
      if (mesh.material instanceof THREE.MeshBasicMaterial) {
        mesh.material.opacity = Math.max(0, 0.3 - (mesh.position.y - 0.5) * 0.22);
      }
    });
  });

  return (
    <group ref={groupRef} position={[0, 0.2, 0]}>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, (i * Math.PI) / 4]}>
          <ringGeometry args={[0.2, 0.45, 24]} />
          <meshBasicMaterial
            color="#e2e8f0"
            transparent
            opacity={0.25}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
};

// ── Gourmet Ceramic Plate with Gold/Cyan Trim ────────────────
const Plate: React.FC = () => {
  return (
    <group position={[0, -0.06, 0]}>
      {/* Plate Base & Rim */}
      <mesh receiveShadow castShadow>
        <cylinderGeometry args={[2.5, 1.8, 0.16, 48]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.2}
          metalness={0.4}
        />
      </mesh>
      {/* Luminous Inner Rim Ring */}
      <mesh position={[0, 0.085, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.2, 2.38, 48]} />
        <meshStandardMaterial
          color="#00f0ff"
          emissive="#00f0ff"
          emissiveIntensity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

// ── 1. Seared Prime Angus Ribeye Steak Model ─────────────────
const SteakModel: React.FC<{ exploded: boolean }> = ({ exploded }) => {
  const lift = exploded ? 0.65 : 0;
  return (
    <group position={[0, 0.12, 0]}>
      {/* Creamy Truffle Mash Base */}
      <mesh position={[0.25, 0.06, -0.2]} castShadow receiveShadow>
        <cylinderGeometry args={[1.05, 1.25, 0.18, 32]} />
        <meshStandardMaterial color="#fef08a" roughness={0.9} />
      </mesh>

      {/* Seared Beef Steak */}
      <group position={[-0.1, 0.24 + lift, 0.05]}>
        <mesh castShadow receiveShadow rotation={[0, 0.2, 0]}>
          <boxGeometry args={[1.9, 0.38, 1.3]} />
          <meshStandardMaterial color="#381a08" roughness={0.45} metalness={0.15} />
        </mesh>

        {/* Charred Cross-Grill Marks */}
        {[-0.55, -0.15, 0.25, 0.65].map((x) => (
          <mesh key={x} position={[x, 0.195, 0]} rotation={[0, Math.PI / 4, 0]}>
            <boxGeometry args={[0.07, 0.02, 1.4]} />
            <meshStandardMaterial color="#1a0701" roughness={0.95} />
          </mesh>
        ))}

        {/* Herb Garlic Butter Melting Dollop */}
        <mesh position={[0.2, 0.25 + (exploded ? 0.35 : 0), 0.1]} castShadow>
          <sphereGeometry args={[0.24, 16, 16]} />
          <meshStandardMaterial color="#84cc16" roughness={0.3} emissive="#4d7c0f" emissiveIntensity={0.2} />
        </mesh>
      </group>

      {/* Fresh Rosemary Sprig */}
      <mesh position={[0.85, 0.15 + (exploded ? 0.6 : 0), 0.4]} rotation={[0.4, 0.5, 0.8]}>
        <cylinderGeometry args={[0.035, 0.035, 1.2, 8]} />
        <meshStandardMaterial color="#166534" roughness={0.8} />
      </mesh>
    </group>
  );
};

// ── 2. Artisan Wagyu Burger Model (Explodable Layers) ────────
const BurgerModel: React.FC<{ exploded: boolean }> = ({ exploded }) => {
  const gap = exploded ? 0.42 : 0;
  return (
    <group position={[0, 0.1, 0]}>
      {/* 1. Bottom Brioche Bun */}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.25, 1.1, 0.26, 32]} />
        <meshStandardMaterial color="#b45309" roughness={0.55} />
      </mesh>

      {/* 2. Grilled Wagyu Beef Patty */}
      <mesh position={[0, 0.36 + gap * 1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.3, 1.3, 0.32, 32]} />
        <meshStandardMaterial color="#451a03" roughness={0.75} />
      </mesh>

      {/* 3. Melted Aged Cheddar Cheese */}
      <mesh position={[0, 0.54 + gap * 2, 0]} castShadow>
        <boxGeometry args={[1.4, 0.06, 1.4]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.3} />
      </mesh>

      {/* 4. Ripe Tomato Slices */}
      <group position={[0, 0.64 + gap * 3, 0]}>
        <mesh position={[-0.32, 0, 0]} castShadow>
          <cylinderGeometry args={[0.55, 0.55, 0.08, 24]} />
          <meshStandardMaterial color="#dc2626" roughness={0.25} />
        </mesh>
        <mesh position={[0.32, 0, 0]} castShadow>
          <cylinderGeometry args={[0.55, 0.55, 0.08, 24]} />
          <meshStandardMaterial color="#dc2626" roughness={0.25} />
        </mesh>
      </group>

      {/* 5. Crisp Green Lettuce */}
      <mesh position={[0, 0.76 + gap * 4, 0]} castShadow>
        <cylinderGeometry args={[1.45, 1.35, 0.08, 24]} />
        <meshStandardMaterial color="#22c55e" roughness={0.8} />
      </mesh>

      {/* 6. Top Glazed Brioche Bun with Sesame Seeds */}
      <group position={[0, 1.0 + gap * 5, 0]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[1.28, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#b45309" roughness={0.5} />
        </mesh>
        {/* Sesame Seeds */}
        {[-0.5, -0.2, 0, 0.2, 0.5].map((x, i) => (
          <mesh key={i} position={[x * 1.4, 0.8, (i % 2 === 0 ? 0.3 : -0.3)]}>
            <sphereGeometry args={[0.035, 6, 6]} />
            <meshStandardMaterial color="#fef3c7" roughness={0.9} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

// ── 3. Woodfired Artisan Pizza Model ─────────────────────────
const PizzaModel: React.FC<{ exploded: boolean }> = ({ exploded }) => {
  const lift = exploded ? 0.45 : 0;
  return (
    <group position={[0, 0.1, 0]}>
      {/* Golden Crispy Crust */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[2.0, 1.85, 0.12, 36]} />
        <meshStandardMaterial color="#d97706" roughness={0.8} />
      </mesh>

      {/* Bubbling Mozzarella Layer */}
      <mesh position={[0, 0.08, 0]} castShadow>
        <cylinderGeometry args={[1.75, 1.75, 0.06, 36]} />
        <meshStandardMaterial color="#fef08a" roughness={0.35} />
      </mesh>

      {/* Pepperoni & Basil Leaves */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const dist = 1.05;
        const px = Math.cos(angle) * dist;
        const pz = Math.sin(angle) * dist;
        return (
          <mesh key={i} position={[px, 0.14 + lift, pz]} castShadow>
            <cylinderGeometry args={[0.32, 0.32, 0.04, 16]} />
            <meshStandardMaterial color="#991b1b" roughness={0.4} />
          </mesh>
        );
      })}

      {/* Basil Sprig in Center */}
      <mesh position={[0, 0.16 + lift * 1.5, 0]} rotation={[0.2, 0.5, 0]}>
        <boxGeometry args={[0.3, 0.02, 0.3]} />
        <meshStandardMaterial color="#15803d" roughness={0.6} />
      </mesh>
    </group>
  );
};

// ── 4. Golden Truffle Fries / Starter Basket Model ───────────
const FriesModel: React.FC = () => {
  return (
    <group position={[0, 0.1, 0]}>
      {/* Chic Stainless Wire Basket */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[1.2, 0.9, 0.7, 16, 1, true]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.2} wireframe />
      </mesh>

      {/* Pile of Crispy Golden Shoestring Fries */}
      {Array.from({ length: 18 }).map((_, i) => {
        const angle = (i / 18) * Math.PI * 2;
        const radius = (i % 3) * 0.28 + 0.1;
        const fx = Math.cos(angle) * radius;
        const fz = Math.sin(angle) * radius;
        const tiltX = ((i % 5) - 2) * 0.15;
        const tiltZ = ((i % 4) - 2) * 0.15;
        return (
          <mesh key={i} position={[fx, 0.65, fz]} rotation={[tiltX, (i * Math.PI) / 6, tiltZ]} castShadow>
            <boxGeometry args={[0.1, 0.9, 0.1]} />
            <meshStandardMaterial color="#eab308" roughness={0.7} />
          </mesh>
        );
      })}

      {/* Dipping Sauce Ramekin */}
      <mesh position={[1.4, 0.15, 0.6]} castShadow>
        <cylinderGeometry args={[0.45, 0.35, 0.25, 24]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </mesh>
      <mesh position={[1.4, 0.26, 0.6]}>
        <cylinderGeometry args={[0.4, 0.4, 0.04, 24]} />
        <meshStandardMaterial color="#dc2626" roughness={0.3} />
      </mesh>
    </group>
  );
};

// ── 5. Handcrafted Pasta Bowl Model ──────────────────────────
const PastaBowlModel: React.FC = () => {
  return (
    <group position={[0, 0.1, 0]}>
      {/* Deep Pasta Bowl */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.9, 1.1, 0.65, 32]} />
        <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.3} />
      </mesh>

      {/* Twisted Fettuccine Nest */}
      <mesh position={[0, 0.52, 0]} castShadow>
        <torusGeometry args={[0.7, 0.35, 16, 32]} />
        <meshStandardMaterial color="#fef08a" roughness={0.8} />
      </mesh>

      {/* Rich Pomodoro Sauce Glaze */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.3} />
      </mesh>

      {/* Shaved Parmesan Flakes */}
      {[-0.3, 0.1, 0.35].map((px, i) => (
        <mesh key={i} position={[px, 0.78, 0.1 * i]} rotation={[0.4, 0.2 * i, 0]}>
          <boxGeometry args={[0.25, 0.02, 0.18]} />
          <meshStandardMaterial color="#fffbeb" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
};

// ── 6. Luminous Mocktail / Beverage Model ─────────────────────
const BeverageModel: React.FC = () => {
  return (
    <group position={[0, 0.05, 0]}>
      {/* Heavy Base Crystal Glass */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.7, 0.75, 0.18, 32]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.1} />
      </mesh>

      {/* Highball Cylindrical Glass Body */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.85, 0.72, 1.8, 32, 1, true]} />
        <meshStandardMaterial
          color="#e0f2fe"
          roughness={0.1}
          metalness={0.2}
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Glowing Neon Cyan Liquid */}
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.8, 0.68, 1.5, 32]} />
        <meshStandardMaterial
          color="#00f0ff"
          emissive="#00f0ff"
          emissiveIntensity={0.85}
          roughness={0.15}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Floating Ice Cubes */}
      <mesh position={[0.2, 1.45, 0.1]} rotation={[0.3, 0.4, 0.2]}>
        <boxGeometry args={[0.35, 0.35, 0.35]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} transparent opacity={0.65} />
      </mesh>

      {/* Fresh Lime Wheel on Rim */}
      <mesh position={[0.8, 2.0, 0]} rotation={[0.3, 0, 0.75]}>
        <cylinderGeometry args={[0.4, 0.4, 0.06, 16]} />
        <meshStandardMaterial color="#84cc16" roughness={0.4} />
      </mesh>
    </group>
  );
};

// ── 7. Artisanal Dessert & Cake Model ─────────────────────────
const DessertModel: React.FC = () => {
  return (
    <group position={[0, 0.1, 0]}>
      {/* Triangular Cheesecake / Torte Wedge */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow rotation={[0, 0.3, 0]}>
        <cylinderGeometry args={[1.4, 1.4, 0.6, 3]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.7} />
      </mesh>

      {/* Graham Cracker Crust Base */}
      <mesh position={[0, 0.08, 0]} receiveShadow rotation={[0, 0.3, 0]}>
        <cylinderGeometry args={[1.42, 1.42, 0.12, 3]} />
        <meshStandardMaterial color="#92400e" roughness={0.9} />
      </mesh>

      {/* Glossy Strawberry Coulis Drizzle */}
      <mesh position={[0, 0.66, 0]} rotation={[0, 0.3, 0]}>
        <cylinderGeometry args={[1.35, 1.35, 0.04, 3]} />
        <meshStandardMaterial color="#dc2626" roughness={0.2} />
      </mesh>

      {/* Fresh Mint Leaf & Berry */}
      <mesh position={[0.2, 0.78, 0.1]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#991b1b" roughness={0.3} />
      </mesh>
      <mesh position={[0.35, 0.82, 0.2]} rotation={[0.4, 0.2, 0.5]}>
        <boxGeometry args={[0.2, 0.02, 0.15]} />
        <meshStandardMaterial color="#22c55e" roughness={0.6} />
      </mesh>
    </group>
  );
};

// ── Main 3D Dish Viewport Component ──────────────────────────
export const DishPreview3D: React.FC<DishPreview3DProps> = ({ item, exploded = false }) => {
  const name = (item.nameEn || '').toLowerCase();
  const categoryId = item.categoryId || '';

  // Classify food item into specialized high-detail model
  const isSteak = categoryId === 'cat-steaks' || name.includes('steak') || name.includes('tenderloin') || name.includes('ribeye') || name.includes('beef');
  const isBurger = categoryId === 'cat-burgers' || name.includes('burger') || name.includes('wrap') || name.includes('sandwich');
  const isPizza = categoryId === 'cat-pizza' || name.includes('pizza');
  const isFries = name.includes('fries') || name.includes('chips') || name.includes('wings') || name.includes('appetizer');
  const isPasta = categoryId === 'cat-pasta' || name.includes('pasta') || name.includes('spaghetti') || name.includes('fettuccine');
  const isBeverage = categoryId === 'cat-beverages' || name.includes('mojito') || name.includes('tea') || name.includes('coffee') || name.includes('drink') || name.includes('brew');
  const isDessert = categoryId === 'cat-desserts' || name.includes('cake') || name.includes('gelato') || name.includes('pastry') || name.includes('dessert');

  return (
    <div className="w-full h-full min-h-[380px] relative select-none rounded-3xl overflow-hidden bg-gradient-to-b from-[#0b101d] via-[#07090e] to-[#040609]">
      
      {/* 360° Interactive HUD Badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/15 text-[11px] font-mono text-cyan-300 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span className="font-bold tracking-wider">360° INTERACTIVE 3D DISH</span>
      </div>

      <Canvas
        shadows
        camera={{ position: [0, 2.5, 4.0], fov: 44 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Balanced Luxury Bistro Studio Lighting */}
        <ambientLight intensity={0.9} />
        <directionalLight
          position={[5, 10, 6]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-6, 8, -4]} intensity={0.7} color="#38bdf8" />
        <pointLight position={[3, 4, 3]} intensity={0.9} color="#f59e0b" />
        <pointLight position={[-3, 4, -3]} intensity={0.6} color="#00f0ff" />

        <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.15}>
          <group position={[0, -0.4, 0]}>
            {!isBeverage && <Plate />}

            {isSteak ? (
              <SteakModel exploded={exploded} />
            ) : isBurger ? (
              <BurgerModel exploded={exploded} />
            ) : isPizza ? (
              <PizzaModel exploded={exploded} />
            ) : isFries ? (
              <FriesModel />
            ) : isPasta ? (
              <PastaBowlModel />
            ) : isBeverage ? (
              <BeverageModel />
            ) : isDessert ? (
              <DessertModel />
            ) : (
              <BurgerModel exploded={exploded} />
            )}

            {!isBeverage && <SafeSteam />}
          </group>
        </Float>

        {/* Soft Contact Shadows on Table Surface */}
        <ContactShadows position={[0, -0.85, 0]} opacity={0.65} scale={8} blur={2.2} />

        {/* Smooth Orbit Controls with bounded angles */}
        <OrbitControls
          autoRotate
          autoRotateSpeed={1.2}
          enableZoom={true}
          minDistance={2.2}
          maxDistance={7}
          maxPolarAngle={Math.PI / 2.05}
          dampingFactor={0.08}
        />
      </Canvas>
    </div>
  );
};
