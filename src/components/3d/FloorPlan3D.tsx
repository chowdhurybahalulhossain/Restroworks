// ============================================================
// NOVAPOS Phase 4 — Interactive 3D Floor Plan (React Three Fiber)
// Provides real-time 3D spatial visualization of restaurant
// tables, live status glows, orbit controls, and camera views.
// ============================================================

import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { Table, TableStatus } from '../../types';
import { sound } from '../../services/soundFx';

interface FloorPlan3DProps {
  tables: Table[];
  selectedTableId: string | null;
  onSelectTable: (tableId: string) => void;
}

// ── Status Color Map ─────────────────────────────────────────
const STATUS_3D_COLORS: Record<TableStatus, { color: string; emissive: string; intensity: number }> = {
  AVAILABLE:      { color: '#064e3b', emissive: '#10b981', intensity: 0.8 },
  OCCUPIED:       { color: '#1e3a8a', emissive: '#3b82f6', intensity: 0.9 },
  ORDERED:        { color: '#78350f', emissive: '#f59e0b', intensity: 1.0 },
  FOOD_READY:     { color: '#581c87', emissive: '#a855f7', intensity: 1.4 },
  BILL_REQUESTED: { color: '#0e7490', emissive: '#00f0ff', intensity: 1.5 },
  CLEANING:       { color: '#334155', emissive: '#64748b', intensity: 0.4 },
  RESERVED:       { color: '#4c1d95', emissive: '#8b5cf6', intensity: 0.9 },
  BLOCKED:        { color: '#450a0a', emissive: '#ef4444', intensity: 0.6 },
};

// ── Single 3D Table Component ────────────────────────────────
interface TableMeshProps {
  table: Table;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const TableMesh: React.FC<TableMeshProps> = ({ table, isSelected, onSelect }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Map 2D coordinate percentages (0..100) to 3D space (-12..12, -8..8)
  const posX = useMemo(() => ((table.x ?? 50) - 50) * 0.28, [table.x]);
  const posZ = useMemo(() => ((table.y ?? 50) - 50) * 0.22, [table.y]);

  const statusConfig = STATUS_3D_COLORS[table.status] || STATUS_3D_COLORS.AVAILABLE;

  // Gentle pulse animation for FOOD_READY or BILL_REQUESTED tables
  useFrame((state) => {
    if (!meshRef.current) return;
    if (table.status === 'FOOD_READY' || table.status === 'BILL_REQUESTED' || isSelected) {
      const pulse = Math.sin(state.clock.elapsedTime * 4) * 0.08;
      meshRef.current.position.y = 0.05 + Math.max(0, pulse);
    } else {
      meshRef.current.position.y = 0;
    }
  });

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    sound.playClick(600);
    onSelect(table.id);
  };

  const isRound = table.shape === 'ROUND' || table.shape === 'BAR_STOOL';
  const isBooth = table.shape === 'BOOTH';

  return (
    <group
      ref={meshRef}
      position={[posX, 0, posZ]}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      {/* Tabletop */}
      {isRound ? (
        <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[table.shape === 'BAR_STOOL' ? 0.6 : 1.1, table.shape === 'BAR_STOOL' ? 0.6 : 1.1, 0.12, 32]} />
          <meshStandardMaterial
            color={statusConfig.color}
            emissive={statusConfig.emissive}
            emissiveIntensity={hovered ? statusConfig.intensity + 0.6 : statusConfig.intensity}
            roughness={0.2}
            metalness={0.7}
          />
        </mesh>
      ) : isBooth ? (
        <group position={[0, 0.75, 0]}>
          {/* Table surface */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2.2, 0.12, 1.4]} />
            <meshStandardMaterial
              color={statusConfig.color}
              emissive={statusConfig.emissive}
              emissiveIntensity={hovered ? statusConfig.intensity + 0.5 : statusConfig.intensity}
              roughness={0.25}
              metalness={0.6}
            />
          </mesh>
          {/* Backrests */}
          <mesh position={[0, 0.5, -0.75]} castShadow>
            <boxGeometry args={[2.2, 0.9, 0.2]} />
            <meshStandardMaterial color="#1e293b" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.5, 0.75]} castShadow>
            <boxGeometry args={[2.2, 0.9, 0.2]} />
            <meshStandardMaterial color="#1e293b" roughness={0.7} />
          </mesh>
        </group>
      ) : (
        <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
          <boxGeometry args={[table.shape === 'RECTANGLE' ? 2.4 : 1.6, 0.12, 1.6]} />
          <meshStandardMaterial
            color={statusConfig.color}
            emissive={statusConfig.emissive}
            emissiveIntensity={hovered ? statusConfig.intensity + 0.5 : statusConfig.intensity}
            roughness={0.25}
            metalness={0.6}
          />
        </mesh>
      )}

      {/* Table Central Pedestal/Leg */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 0.7, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[0.45, 0.5, 0.04, 16]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Chairs (represented as stylized blocks around table) */}
      {Array.from({ length: Math.min(table.capacity, 6) }).map((_, i) => {
        const total = Math.min(table.capacity, 6);
        const angle = (i / total) * Math.PI * 2;
        const radius = isRound ? 1.4 : 1.5;
        const cx = Math.cos(angle) * radius;
        const cz = Math.sin(angle) * radius;

        return (
          <group key={i} position={[cx, 0, cz]} rotation={[0, -angle - Math.PI / 2, 0]}>
            {/* Seat */}
            <mesh position={[0, 0.45, 0]} castShadow>
              <boxGeometry args={[0.4, 0.08, 0.4]} />
              <meshStandardMaterial color="#1e293b" roughness={0.6} />
            </mesh>
            {/* Backrest */}
            <mesh position={[0, 0.75, -0.16]} castShadow>
              <boxGeometry args={[0.38, 0.55, 0.06]} />
              <meshStandardMaterial color="#0f172a" roughness={0.7} />
            </mesh>
            {/* Leg */}
            <mesh position={[0, 0.22, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.45, 8]} />
              <meshStandardMaterial color="#64748b" metalness={0.9} />
            </mesh>
          </group>
        );
      })}

      {/* Selection Holographic Ring */}
      {isSelected && (
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 1.7, 32]} />
          <meshBasicMaterial color="#00f0ff" side={THREE.DoubleSide} transparent opacity={0.8} />
        </mesh>
      )}

      {/* 3D Floating Table Badge */}
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        <group position={[0, 1.35, 0]}>
          {/* Badge Background */}
          <mesh>
            <planeGeometry args={[1.2, 0.45]} />
            <meshBasicMaterial color="#0b0f19" transparent opacity={0.85} side={THREE.DoubleSide} />
          </mesh>
          {/* Table Number */}
          <Text
            position={[0, 0.05, 0.01]}
            fontSize={0.22}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
          >
            {table.number}
          </Text>
          {/* Table Capacity & Status */}
          <Text
            position={[0, -0.12, 0.01]}
            fontSize={0.11}
            color={statusConfig.emissive}
            anchorX="center"
            anchorY="middle"
          >
            {`${table.capacity}P · ${table.status}`}
          </Text>
        </group>
      </Float>
    </group>
  );
};

// ── Restaurant 3D Environment Ground Plane ────────────────────
const RestaurantFloor: React.FC = () => {
  return (
    <group position={[0, 0, 0]}>
      {/* Main Floor Surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[34, 24]} />
        <meshStandardMaterial
          color="#07090e"
          roughness={0.4}
          metalness={0.7}
        />
      </mesh>

      {/* Neon Floor Grid */}
      <gridHelper args={[34, 34, '#00f0ff', '#161d2e']} position={[0, 0.005, 0]} />

      {/* Border Glow Rails */}
      {/* North */}
      <mesh position={[0, 0.1, -12]}>
        <boxGeometry args={[34, 0.2, 0.2]} />
        <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={0.8} />
      </mesh>
      {/* South */}
      <mesh position={[0, 0.1, 12]}>
        <boxGeometry args={[34, 0.2, 0.2]} />
        <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={0.8} />
      </mesh>
      {/* West */}
      <mesh position={[-17, 0.1, 0]}>
        <boxGeometry args={[0.2, 0.2, 24]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.8} />
      </mesh>
      {/* East */}
      <mesh position={[17, 0.1, 0]}>
        <boxGeometry args={[0.2, 0.2, 24]} />
        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
};

// ── Main 3D Canvas Controller ────────────────────────────────
export const FloorPlan3D: React.FC<FloorPlan3DProps> = ({ tables, selectedTableId, onSelectTable }) => {
  const controlsRef = useRef<any>(null);

  const resetCamera = (mode: 'isometric' | 'top' | 'bar') => {
    sound.playClick(900);
    if (!controlsRef.current) return;
    if (mode === 'top') {
      controlsRef.current.object.position.set(0, 22, 0.1);
      controlsRef.current.target.set(0, 0, 0);
    } else if (mode === 'bar') {
      controlsRef.current.object.position.set(-10, 4, 12);
      controlsRef.current.target.set(0, 1, 0);
    } else {
      // Default Isometric
      controlsRef.current.object.position.set(0, 15, 17);
      controlsRef.current.target.set(0, 0, 0);
    }
    controlsRef.current.update();
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-[#07090e] rounded-2xl overflow-hidden border border-white/10 select-none">
      {/* 3D Viewport Controls HUD */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-[#0e131f]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 text-xs text-white">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span className="font-mono text-[11px] text-cyan-300 font-semibold tracking-wider">
          LIVE 3D SPATIAL ENGINE
        </span>
      </div>

      {/* Preset Camera View Buttons */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={() => resetCamera('isometric')}
          className="px-3 py-1.5 rounded-xl bg-[#0e131f]/90 hover:bg-white/10 border border-white/15 text-xs text-slate-200 transition-all font-mono"
        >
          Isometric 45°
        </button>
        <button
          onClick={() => resetCamera('top')}
          className="px-3 py-1.5 rounded-xl bg-[#0e131f]/90 hover:bg-white/10 border border-white/15 text-xs text-slate-200 transition-all font-mono"
        >
          Bird's Eye (Top)
        </button>
        <button
          onClick={() => resetCamera('bar')}
          className="px-3 py-1.5 rounded-xl bg-[#0e131f]/90 hover:bg-white/10 border border-white/15 text-xs text-slate-200 transition-all font-mono"
        >
          Bar View
        </button>
      </div>

      {/* Live Floor Legend HUD */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-wrap items-center gap-3 bg-[#0e131f]/90 backdrop-blur-md px-4 py-2 rounded-xl border border-white/15 text-[11px] font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-glow-emerald" />
          <span className="text-slate-300">Free</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="text-slate-300">Seated</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="text-slate-300">Ordered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-slate-300">Food Ready</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-glow-cyan" />
          <span className="text-slate-300">Bill Reqd</span>
        </div>
      </div>

      {/* Interaction Hint */}
      <div className="absolute bottom-4 right-4 z-10 text-[11px] font-mono text-slate-400 bg-black/40 px-3 py-1 rounded-lg pointer-events-none">
        Rotate: Left Click + Drag | Pan: Right Click | Zoom: Scroll
      </div>

      {/* R3F Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 15, 17], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        onPointerDown={() => sound.playClick(400)}
      >
        <color attach="background" args={['#07090e']} />
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 20, 15]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[0, 10, 0]} intensity={0.8} color="#00f0ff" />
        <pointLight position={[-10, 6, -5]} intensity={0.6} color="#10b981" />
        <pointLight position={[10, 6, 5]} intensity={0.6} color="#a855f7" />

        {/* 3D Floor Grid & Environment */}
        <RestaurantFloor />

        {/* Render Tables */}
        {tables.map((table) => (
          <TableMesh
            key={table.id}
            table={table}
            isSelected={selectedTableId === table.id}
            onSelect={onSelectTable}
          />
        ))}

        {/* Soft Contact Shadows on Floor */}
        <ContactShadows position={[0, 0.01, 0]} opacity={0.6} scale={32} blur={1.5} far={10} />

        {/* Orbit Controls with bounded angles so camera stays above floor */}
        <OrbitControls
          ref={controlsRef}
          makeDefault
          maxPolarAngle={Math.PI / 2.1}
          minDistance={5}
          maxDistance={35}
          dampingFactor={0.08}
        />
      </Canvas>
    </div>
  );
};

