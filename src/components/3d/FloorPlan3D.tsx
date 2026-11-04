// ============================================================
// Restroworks Phase 4 — Interactive 3D Spatial Floor Plan
// Real-time 3D spatial visualization of restaurant dining rooms,
// table statuses, interactive selection HUD, and orbit controls.
// ============================================================

import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Table, TableStatus } from '../../types';
import { sound } from '../../services/soundFx';
import { 
  Users, Clock, Utensils, ArrowRightLeft, Sparkles, 
  CheckCircle2, RefreshCw, Eye, Layers, Compass, ChevronRight 
} from 'lucide-react';
import { usePosStore } from '../../store/posStore';

interface FloorPlan3DProps {
  tables: Table[];
  selectedTableId: string | null;
  onSelectTable: (tableId: string) => void;
  onOpenOrder?: (tableId: string) => void;
  onOpenTransfer?: () => void;
}

// ── Status Color Configurations ──────────────────────────────
const STATUS_3D_COLORS: Record<TableStatus, { color: string; emissive: string; intensity: number; label: string; badgeBg: string }> = {
  AVAILABLE:      { color: '#047857', emissive: '#10b981', intensity: 0.9, label: 'Free', badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  OCCUPIED:       { color: '#1d4ed8', emissive: '#3b82f6', intensity: 1.0, label: 'Seated', badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  ORDERED:        { color: '#b45309', emissive: '#f59e0b', intensity: 1.1, label: 'Ordered', badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  FOOD_READY:     { color: '#7e22ce', emissive: '#d946ef', intensity: 1.5, label: 'Food Ready', badgeBg: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40 animate-pulse' },
  BILL_REQUESTED: { color: '#0891b2', emissive: '#00f0ff', intensity: 1.6, label: 'Bill Reqd', badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-glow-cyan' },
  CLEANING:       { color: '#475569', emissive: '#94a3b8', intensity: 0.5, label: 'Cleaning', badgeBg: 'bg-slate-500/20 text-slate-300 border-slate-500/40' },
  RESERVED:       { color: '#581c87', emissive: '#a855f7', intensity: 1.0, label: 'Reserved', badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  BLOCKED:        { color: '#991b1b', emissive: '#ef4444', intensity: 0.8, label: 'Blocked', badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
};

// ── Single 3D Table Mesh ─────────────────────────────────────
interface TableMeshProps {
  table: Table;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const TableMesh: React.FC<TableMeshProps> = ({ table, isSelected, onSelect }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Map 2D coordinates percentages (0..100) to 3D space (-12..12, -8..8)
  const posX = useMemo(() => ((table.x ?? 50) - 50) * 0.28, [table.x]);
  const posZ = useMemo(() => ((table.y ?? 50) - 50) * 0.22, [table.y]);

  const statusConfig = STATUS_3D_COLORS[table.status] || STATUS_3D_COLORS.AVAILABLE;

  // Gentle float pulse animation for active tables
  useFrame((state) => {
    if (!meshRef.current) return;
    if (table.status === 'FOOD_READY' || table.status === 'BILL_REQUESTED' || isSelected) {
      const pulse = Math.sin(state.clock.elapsedTime * 3.5) * 0.06;
      meshRef.current.position.y = 0.04 + Math.max(0, pulse);
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
  const isRectangle = table.shape === 'RECTANGLE';

  return (
    <group
      ref={meshRef}
      position={[posX, 0, posZ]}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => {
        setHovered(false);
      }}
    >
      {/* Tabletop */}
      {isRound ? (
        <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[table.shape === 'BAR_STOOL' ? 0.65 : 1.15, table.shape === 'BAR_STOOL' ? 0.65 : 1.15, 0.12, 32]} />
          <meshStandardMaterial
            color={statusConfig.color}
            emissive={statusConfig.emissive}
            emissiveIntensity={hovered ? statusConfig.intensity + 0.6 : isSelected ? statusConfig.intensity + 0.4 : statusConfig.intensity}
            roughness={0.25}
            metalness={0.5}
          />
        </mesh>
      ) : isBooth ? (
        <group position={[0, 0.75, 0]}>
          {/* Table surface */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2.3, 0.12, 1.45]} />
            <meshStandardMaterial
              color={statusConfig.color}
              emissive={statusConfig.emissive}
              emissiveIntensity={hovered ? statusConfig.intensity + 0.6 : isSelected ? statusConfig.intensity + 0.4 : statusConfig.intensity}
              roughness={0.25}
              metalness={0.5}
            />
          </mesh>
          {/* Plush Velvet Booth Backrests */}
          <mesh position={[0, 0.52, -0.8]} castShadow>
            <boxGeometry args={[2.3, 0.95, 0.22]} />
            <meshStandardMaterial color="#1e293b" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.52, 0.8]} castShadow>
            <boxGeometry args={[2.3, 0.95, 0.22]} />
            <meshStandardMaterial color="#1e293b" roughness={0.7} />
          </mesh>
        </group>
      ) : (
        <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
          <boxGeometry args={[isRectangle ? 2.5 : 1.65, 0.12, 1.65]} />
          <meshStandardMaterial
            color={statusConfig.color}
            emissive={statusConfig.emissive}
            emissiveIntensity={hovered ? statusConfig.intensity + 0.6 : isSelected ? statusConfig.intensity + 0.4 : statusConfig.intensity}
            roughness={0.25}
            metalness={0.5}
          />
        </mesh>
      )}

      {/* Table Central Pedestal / Base */}
      <mesh position={[0, 0.36, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.14, 0.7, 16]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[0.48, 0.52, 0.04, 20]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Modern Chairs Around Table */}
      {!isBooth && Array.from({ length: Math.min(table.capacity, 6) }).map((_, i) => {
        const total = Math.min(table.capacity, 6);
        const angle = (i / total) * Math.PI * 2;
        const radius = isRound ? 1.45 : 1.55;
        const cx = Math.cos(angle) * radius;
        const cz = Math.sin(angle) * radius;

        return (
          <group key={i} position={[cx, 0, cz]} rotation={[0, -angle - Math.PI / 2, 0]}>
            {/* Seat */}
            <mesh position={[0, 0.46, 0]} castShadow>
              <boxGeometry args={[0.42, 0.08, 0.42]} />
              <meshStandardMaterial color="#1e293b" roughness={0.6} />
            </mesh>
            {/* Backrest */}
            <mesh position={[0, 0.76, -0.17]} castShadow>
              <boxGeometry args={[0.4, 0.55, 0.06]} />
              <meshStandardMaterial color="#0f172a" roughness={0.7} />
            </mesh>
            {/* Legs */}
            <mesh position={[0, 0.23, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.46, 8]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.8} />
            </mesh>
          </group>
        );
      })}

      {/* Selection Holographic Glowing Ring */}
      {isSelected && (
        <group position={[0, 0.03, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.5, 1.75, 36]} />
            <meshBasicMaterial color="#00f0ff" side={THREE.DoubleSide} transparent opacity={0.9} />
          </mesh>
        </group>
      )}

      {/* Native HTML 3D Interactive Floating Badge (Zero Font Fetch Risk) */}
      <Html position={[0, 1.45, 0]} center distanceFactor={14}>
        <div
          onClick={handleClick}
          className={`cursor-pointer px-2.5 py-1 rounded-xl backdrop-blur-md border shadow-lg transition-all transform hover:scale-110 flex items-center gap-1.5 whitespace-nowrap select-none ${
            isSelected
              ? 'bg-cyan-500 text-black border-white font-black shadow-glow-cyan scale-105'
              : 'bg-[#0b0f19]/85 text-white border-white/20 hover:border-cyan-400'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${
            table.status === 'AVAILABLE' ? 'bg-emerald-400' :
            table.status === 'OCCUPIED' ? 'bg-blue-400' :
            table.status === 'ORDERED' ? 'bg-amber-400 animate-pulse' :
            table.status === 'FOOD_READY' ? 'bg-fuchsia-400 animate-ping' :
            table.status === 'BILL_REQUESTED' ? 'bg-cyan-400' : 'bg-slate-400'
          }`} />
          <span className="font-bold text-xs">{table.number}</span>
          <span className="text-[10px] opacity-75 font-mono">({table.capacity}P)</span>
        </div>
      </Html>
    </group>
  );
};

// ── Restaurant 3D Environment (Parquet Floor & Accents) ──────
const RestaurantFloor: React.FC = () => {
  return (
    <group position={[0, 0, 0]}>
      {/* Main Luxury Wooden / Slate Floor Surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[36, 26]} />
        <meshStandardMaterial color="#0c111d" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Glowing Neon Room Perimeter Baseboards */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <ringGeometry args={[16.8, 17.0, 4]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.35} />
      </mesh>

      {/* Decorative Service Counter / Bar at North Wall */}
      <group position={[0, 0.5, -11]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[14, 1.0, 1.4]} />
          <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.52, 0]}>
          <boxGeometry args={[14.2, 0.08, 1.6]} />
          <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={0.6} />
        </mesh>
      </group>
    </group>
  );
};

// ── Main FloorPlan3D Component ───────────────────────────────
export const FloorPlan3D: React.FC<FloorPlan3DProps> = ({
  tables,
  selectedTableId,
  onSelectTable,
  onOpenOrder,
  onOpenTransfer,
}) => {
  const { updateTableStatus } = usePosStore();
  const controlsRef = useRef<any>(null);

  // Active zone filter: 'ALL' | 'zone-main' | 'zone-rooftop' | 'zone-vip'
  const [selectedZone, setSelectedZone] = useState<string>('zone-main');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Filter tables by zone to prevent spatial clutter
  const filteredTables = useMemo(() => {
    return tables.filter((t) => {
      const matchZone = selectedZone === 'ALL' || t.zoneId === selectedZone;
      const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
      return matchZone && matchStatus;
    });
  }, [tables, selectedZone, statusFilter]);

  const selectedTable = tables.find((t) => t.id === selectedTableId);

  // Camera presets
  const setCameraView = (mode: 'isometric' | 'top' | 'focus') => {
    sound.playClick();
    if (!controlsRef.current) return;

    if (mode === 'top') {
      controlsRef.current.object.position.set(0, 24, 0.5);
      controlsRef.current.target.set(0, 0, 0);
    } else if (mode === 'focus' && selectedTable) {
      const tx = ((selectedTable.x ?? 50) - 50) * 0.28;
      const tz = ((selectedTable.y ?? 50) - 50) * 0.22;
      controlsRef.current.object.position.set(tx + 4, 6, tz + 6);
      controlsRef.current.target.set(tx, 0.8, tz);
    } else {
      // Default Isometric
      controlsRef.current.object.position.set(0, 14, 16);
      controlsRef.current.target.set(0, 0, 0);
    }
    controlsRef.current.update();
  };

  return (
    <div className="relative w-full h-full min-h-[520px] bg-[#07090e] rounded-3xl overflow-hidden border border-white/10 select-none flex flex-col">
      
      {/* ─────────────────────────────────────────────────────────
          TOP 3D CONTROL BAR: Zones, Presets & Status Filters
      ───────────────────────────────────────────────────────── */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Left: Zone Selection Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#0c1017]/90 backdrop-blur-md border border-white/15 shadow-xl pointer-events-auto">
          {[
            { id: 'zone-main', label: 'Main Hall', count: 8 },
            { id: 'zone-rooftop', label: 'Skyline Terrace', count: 6 },
            { id: 'zone-vip', label: 'VIP Lounge', count: 6 },
            { id: 'ALL', label: 'All Tables', count: tables.length },
          ].map((z) => (
            <button
              key={z.id}
              onClick={() => {
                setSelectedZone(z.id);
                sound.playClick();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedZone === z.id
                  ? 'bg-cyan-500 text-black shadow-glow-cyan'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{z.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedZone === z.id ? 'bg-black/30 text-white' : 'bg-white/10 text-slate-400'
              }`}>
                {z.count}
              </span>
            </button>
          ))}
        </div>

        {/* Right: Camera Angles & Focus */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {selectedTable && (
            <button
              onClick={() => setCameraView('focus')}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Focus {selectedTable.number}</span>
            </button>
          )}

          <div className="flex items-center p-1 rounded-2xl bg-[#0c1017]/90 backdrop-blur-md border border-white/15">
            <button
              onClick={() => setCameraView('isometric')}
              className="px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all"
            >
              Isometric 45°
            </button>
            <button
              onClick={() => setCameraView('top')}
              className="px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all"
            >
              Top Blueprint
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────
          STATUS LEGEND STRIP (Bottom-Left)
      ───────────────────────────────────────────────────────── */}
      <div className="absolute bottom-4 left-4 z-20 hidden md:flex items-center gap-3 bg-[#0c1017]/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/15 text-xs font-mono shadow-xl pointer-events-auto">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-sans font-semibold mr-1">Status:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-glow-emerald" />
          <span className="text-slate-200">Free</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="text-slate-200">Seated</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-slate-200">Ordered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-400" />
          <span className="text-slate-200">Food Ready</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-glow-cyan" />
          <span className="text-slate-200">Bill Reqd</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────
          INTERACTIVE SELECTED TABLE HUD CARD (Bottom-Right)
      ───────────────────────────────────────────────────────── */}
      {selectedTable && (
        <div className="absolute bottom-4 right-4 z-20 w-80 p-4 rounded-3xl bg-[#0d121c]/95 backdrop-blur-xl border border-cyan-500/40 shadow-2xl animate-fade-in pointer-events-auto">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-base text-white">{selectedTable.number}</span>
                <span className="text-xs text-slate-400 font-medium">({selectedTable.name})</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Capacity: {selectedTable.capacity} Guests · {selectedTable.shape} Table
              </p>
            </div>

            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border ${
              STATUS_3D_COLORS[selectedTable.status]?.badgeBg || 'bg-slate-500/20 text-slate-300 border-slate-500/30'
            }`}>
              {selectedTable.status}
            </span>
          </div>

          {/* Table Details */}
          {selectedTable.waiterName && (
            <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
              <span className="text-slate-500 font-mono">Server:</span>
              <span className="font-semibold text-cyan-300">{selectedTable.waiterName}</span>
            </div>
          )}

          {/* Quick Action Buttons */}
          <div className="mt-3.5 pt-2 border-t border-white/10 flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                if (onOpenOrder) {
                  onOpenOrder(selectedTable.id);
                }
              }}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Take Order</span>
              <ChevronRight className="w-3.5 h-3.5 ml-auto" />
            </button>

            {onOpenTransfer && (
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenTransfer();
                }}
                title="Transfer Order"
                className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-cyan-400 border border-white/10 hover:border-cyan-400 transition-all"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────
          CANVAS THREE.JS 3D VIEWPORT
      ───────────────────────────────────────────────────────── */}
      <Canvas
        shadows
        camera={{ position: [0, 14, 16], fov: 44 }}
        gl={{ antialias: true, alpha: false }}
        onPointerDown={() => sound.playClick(300)}
      >
        <color attach="background" args={['#07090e']} />
        
        {/* Crisp Studio Ambient & Directional Lights */}
        <ambientLight intensity={0.85} />
        <directionalLight
          position={[10, 22, 15]}
          intensity={1.4}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[0, 12, 0]} intensity={0.9} color="#00f0ff" />
        <pointLight position={[-12, 8, -6]} intensity={0.7} color="#10b981" />
        <pointLight position={[12, 8, 6]} intensity={0.7} color="#d946ef" />

        {/* 3D Restaurant Floor Ground */}
        <RestaurantFloor />

        {/* Render Only Filtered Tables to Avoid Blobs/Overlaps */}
        {filteredTables.map((table) => (
          <TableMesh
            key={table.id}
            table={table}
            isSelected={selectedTableId === table.id}
            onSelect={onSelectTable}
          />
        ))}

        {/* Soft Contact Shadows on Floor */}
        <ContactShadows position={[0, 0.01, 0]} opacity={0.65} scale={34} blur={1.8} far={10} />

        {/* Orbit Controls with bounded angles */}
        <OrbitControls
          ref={controlsRef}
          makeDefault
          maxPolarAngle={Math.PI / 2.05}
          minDistance={4}
          maxDistance={32}
          dampingFactor={0.08}
        />
      </Canvas>
    </div>
  );
};
