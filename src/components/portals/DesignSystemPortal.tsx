import React from 'react';
import { Palette, Sparkles, Check, Zap, Layers, Shield, Flame } from 'lucide-react';

export const DesignSystemPortal: React.FC = () => {
  const colorTokens = [
    { name: 'Canvas Void', var: '--nova-bg-canvas', hex: '#07090E', role: 'Main dark workspace background' },
    { name: 'Surface Core', var: '--nova-bg-surface', hex: '#0E131F', role: 'Card, drawer & modal container base' },
    { name: 'Elevated Glass', var: '--nova-bg-elevated', hex: '#161D2E', role: 'Hover, active & popup elevation' },
    { name: 'Electric Cyan', var: '--nova-cyan', hex: '#00F0FF', role: 'Primary action, selections, active tables' },
    { name: 'Neon Emerald', var: '--nova-emerald', hex: '#10B981', role: 'Cash payments, healthy KOT, available tables' },
    { name: 'Amber Radiant', var: '--nova-amber', hex: '#F59E0B', role: 'KOT delayed 10-20m, kitchen bump, warnings' },
    { name: 'Hyper Crimson', var: '--nova-crimson', hex: '#FF3366', role: 'Critical delay >20m, voided items, 86 out-of-stock' },
    { name: 'Cyber Violet', var: '--nova-violet', hex: '#8B5CF6', role: 'VIP suite tables, customer QR special dishes' },
  ];

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-8 bg-nova-bg">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Palette className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl font-display font-bold text-white">Restroworks Design System & Component Library</h2>
        </div>
        <p className="text-xs text-slate-400">
          Cyber-Luxe restaurant operating system tokens, micro-interactions, and accessibility specifications.
        </p>
      </div>

      {/* 1. Color Palette Tokens */}
      <div className="space-y-3">
        <h3 className="text-sm font-mono font-bold text-cyan-400 uppercase tracking-wider">
          1. Chromatic Color Palette Tokens
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {colorTokens.map((c) => (
            <div key={c.name} className="glass-panel p-4 rounded-2xl border border-white/10 space-y-2">
              <div
                className="w-full h-14 rounded-xl border border-white/10 shadow-inner"
                style={{ backgroundColor: c.hex }}
              />
              <div>
                <div className="font-bold text-xs text-white">{c.name}</div>
                <div className="font-mono text-[10px] text-cyan-400">{c.hex}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{c.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Glassmorphic Surface Elevations */}
      <div className="space-y-3">
        <h3 className="text-sm font-mono font-bold text-cyan-400 uppercase tracking-wider">
          2. Glassmorphism Elevation System
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-panel p-5 rounded-2xl">
            <h4 className="font-bold text-xs text-white mb-1">Level 1: Base Glass Panel</h4>
            <p className="text-xs text-slate-400 mb-2">Backdrop blur 16px, 8% white border scrim.</p>
            <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 font-mono text-cyan-300">.glass-panel</span>
          </div>

          <div className="glass-panel-elevated p-5 rounded-2xl border border-cyan-500/30 shadow-glow-cyan">
            <h4 className="font-bold text-xs text-cyan-300 mb-1">Level 2: Elevated Glow Panel</h4>
            <p className="text-xs text-slate-300 mb-2">Backdrop blur 20px, cyan ambient occlusion glow.</p>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 font-mono text-cyan-200">.glass-panel-elevated</span>
          </div>

          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
            <h4 className="font-bold text-xs text-amber-300 mb-1">Level 3: Urgent Alert Panel</h4>
            <p className="text-xs text-slate-300 mb-2">Backdrop blur 16px, amber/crimson pulse animation.</p>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 font-mono text-amber-200">.animate-ticket-urgent</span>
          </div>
        </div>
      </div>

      {/* 3. Button & Micro-Interaction Tokens */}
      <div className="space-y-3">
        <h3 className="text-sm font-mono font-bold text-cyan-400 uppercase tracking-wider">
          3. Tactile Button Tokens (Minimum 48px Touch Targets)
        </h3>
        <div className="flex flex-wrap gap-4 items-center">
          <button className="h-12 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all shadow-glow-cyan">
            Primary Action (Cyan Glow)
          </button>
          <button className="h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-glow-emerald">
            Payment Settle (Emerald)
          </button>
          <button className="h-12 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-lg shadow-amber-500/20">
            Send KOT (Amber Flame)
          </button>
          <button className="h-12 px-6 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold">
            Secondary Glass Button
          </button>
          <button className="h-12 px-6 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold">
            Void / Destructive Action
          </button>
        </div>
      </div>
    </div>
  );
};
