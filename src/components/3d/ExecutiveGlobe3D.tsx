// ============================================================
// NOVAPOS Phase 4 — Live 3D Executive Revenue Globe (R3F)
// Multi-branch revenue telemetry beacons, rotating cyber globe,
// and real-time enterprise performance metrics.
// ============================================================

import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Float } from '@react-three/drei';
import * as THREE from 'three';
import { sound } from '../../services/soundFx';

interface BranchTelemetry {
  id: string;
  name: string;
  lat: number;
  lng: number;
  todaySales: number; // minor units
  activeOrders: number;
  occupancyRate: number;
  color: string;
}

const BRANCHES: BranchTelemetry[] = [
  {
    id: 'b-01',
    name: 'Gulshan-2 Flagship',
    lat: 23.7925,
    lng: 90.4078,
    todaySales: 48500000, // 485,000 BDT
    activeOrders: 18,
    occupancyRate: 85,
    color: '#00f0ff',
  },
  {
    id: 'b-02',
    name: 'Banani Cyber Counter',
    lat: 23.7937,
    lng: 90.4040,
    todaySales: 24200000, // 242,000 BDT
    activeOrders: 9,
    occupancyRate: 70,
    color: '#10b981',
  },
  {
    id: 'b-03',
    name: 'Dhanmondi Heritage Lounge',
    lat: 23.7461,
    lng: 90.3742,
    todaySales: 19800000, // 198,000 BDT
    activeOrders: 12,
    occupancyRate: 60,
    color: '#a855f7',
  },
  {
    id: 'b-04',
    name: 'Chittagong Bay Expansion',
    lat: 22.3569,
    lng: 91.7832,
    todaySales: 11500000, // 115,000 BDT
    activeOrders: 5,
    occupancyRate: 45,
    color: '#f59e0b',
  },
];

// Helper: Convert Lat/Lng to 3D Cartesian Coordinate on a sphere of radius R
function latLngToVector3(lat: number, lng: number, radius: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return [x, y, z];
}

// ── Multi-Branch Telemetry Beacon ────────────────────────────
const BranchBeacon: React.FC<{
  branch: BranchTelemetry;
  selected: boolean;
  onSelect: (b: BranchTelemetry) => void;
}> = ({ branch, selected, onSelect }) => {
  const [hovered, setHovered] = useState(false);
  const pos = useMemo(() => latLngToVector3(branch.lat, branch.lng, 2.05), [branch]);

  return (
    <group position={pos}>
      {/* Outer Pulse Ring */}
      <mesh>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial color={branch.color} />
      </mesh>

      {/* Floating Beacon Light Beam */}
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.015, 0.04, 0.35, 12]} />
        <meshBasicMaterial color={branch.color} transparent opacity={0.7} />
      </mesh>

      {/* Interactive HTML Tooltip on Hover/Selection */}
      <Html distanceFactor={7} position={[0, 0.35, 0]} center>
        <div
          onClick={(e) => {
            e.stopPropagation();
            sound.playClick(850);
            onSelect(branch);
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={`cursor-pointer px-2.5 py-1.5 rounded-xl border backdrop-blur-md transition-all whitespace-nowrap select-none font-mono ${
            selected || hovered
              ? 'bg-black/90 border-cyan-400 text-white shadow-glow-cyan scale-110 z-20'
              : 'bg-black/60 border-white/20 text-slate-300 hover:border-cyan-400/60'
          }`}
        >
          <div className="flex items-center gap-1.5 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: branch.color }} />
            <span>{branch.name}</span>
          </div>
          {(selected || hovered) && (
            <div className="text-[9px] text-cyan-300 font-bold mt-0.5">
              ৳{(branch.todaySales / 100).toLocaleString('en-BD', { maximumFractionDigits: 0 })} • {branch.occupancyRate}% Occ
            </div>
          )}
        </div>
      </Html>
    </group>
  );
};

// ── Rotating Globe Body ──────────────────────────────────────
const GlobeBody: React.FC<{
  onSelectBranch: (b: BranchTelemetry) => void;
  selectedBranchId: string;
}> = ({ onSelectBranch, selectedBranchId }) => {
  const globeRef = useRef<THREE.Group>(null);

  // Slow smooth auto-rotation
  useFrame((_, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.12;
    }
  });

  return (
    <group ref={globeRef}>
      {/* Central Solid Sphere */}
      <mesh>
        <sphereGeometry args={[2.0, 48, 48]} />
        <meshStandardMaterial
          color="#07090e"
          roughness={0.7}
          metalness={0.8}
        />
      </mesh>

      {/* Wireframe Longitude & Latitude Neon Shell */}
      <mesh>
        <sphereGeometry args={[2.02, 28, 28]} />
        <meshBasicMaterial
          color="#00f0ff"
          wireframe
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Glowing Equator Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.03, 2.06, 64]} />
        <meshBasicMaterial color="#00f0ff" side={THREE.DoubleSide} transparent opacity={0.4} />
      </mesh>

      {/* Orbital Telemetry Satellite Ring */}
      <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
        <ringGeometry args={[2.6, 2.62, 64]} />
        <meshBasicMaterial color="#a855f7" side={THREE.DoubleSide} transparent opacity={0.3} />
      </mesh>

      {/* Multi-Branch Telemetry Beacons */}
      {BRANCHES.map((b) => (
        <BranchBeacon
          key={b.id}
          branch={b}
          selected={selectedBranchId === b.id}
          onSelect={onSelectBranch}
        />
      ))}
    </group>
  );
};

// ── Executive Globe Component ────────────────────────────────
export const ExecutiveGlobe3D: React.FC = () => {
  const [selectedBranch, setSelectedBranch] = useState<BranchTelemetry>(BRANCHES[0]);

  const totalSales = BRANCHES.reduce((acc, b) => acc + b.todaySales, 0);
  const totalOrders = BRANCHES.reduce((acc, b) => acc + b.activeOrders, 0);

  return (
    <div className="w-full h-80 relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#0a0f1d] to-[#07090e] border border-white/10 select-none">
      {/* Top Left Header HUD */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-[#0e131f]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span className="text-cyan-300 font-bold">MULTI-BRANCH REVENUE GLOBE</span>
      </div>

      {/* Top Right Live Telemetry Card */}
      <div className="absolute top-3 right-3 z-10 bg-[#0e131f]/90 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-right font-mono">
        <div className="text-[10px] text-slate-400">Total Consolidated GMV</div>
        <div className="text-base font-extrabold text-cyan-400">
          ৳{(totalSales / 100).toLocaleString('en-BD', { maximumFractionDigits: 0 })}
        </div>
        <div className="text-[10px] text-emerald-400 mt-0.5">
          {totalOrders} Live Orders Across 4 Outlets
        </div>
      </div>

      {/* Bottom Selected Branch Card */}
      {selectedBranch && (
        <div className="absolute bottom-3 left-3 right-3 z-10 bg-[#0e131f]/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-cyan-500/30 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedBranch.color }} />
            <span className="font-bold text-white">{selectedBranch.name}</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <span>
              GMV: <strong className="text-cyan-400">৳{(selectedBranch.todaySales / 100).toLocaleString('en-BD')}</strong>
            </span>
            <span>
              Occupancy: <strong className="text-emerald-400">{selectedBranch.occupancyRate}%</strong>
            </span>
            <span>
              Active: <strong className="text-purple-400">{selectedBranch.activeOrders} tables</strong>
            </span>
          </div>
        </div>
      )}

      {/* Canvas */}
      <Canvas
        camera={{ position: [0, 1.8, 5.2], fov: 45 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} />
        <pointLight position={[-4, 3, -3]} intensity={0.8} color="#00f0ff" />
        <pointLight position={[4, 2, 3]} intensity={0.6} color="#a855f7" />

        <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.1}>
          <GlobeBody
            onSelectBranch={setSelectedBranch}
            selectedBranchId={selectedBranch.id}
          />
        </Float>

        <OrbitControls
          enableZoom={false}
          autoRotate={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.6}
        />
      </Canvas>
    </div>
  );
};
