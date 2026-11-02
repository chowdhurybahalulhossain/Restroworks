import React, { useState } from 'react';
import { 
  Zap, Lock, Globe, Layers, ShieldCheck, Wifi, 
  ChevronDown, Cpu, Sparkles 
} from 'lucide-react';
import { usePosStore } from '../../store/posStore';
import { AppSwitcherModal } from '../modals/AppSwitcherModal';

export const Navbar: React.FC = () => {
  const { 
    currentUser, tenant, branches, activeBranchId, setActiveBranchId,
    locale, toggleLocale, reducedMotion, toggleReducedMotion,
    setIsLocked, activePortal
  } = usePosStore();

  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  const portalLabels: Record<string, string> = {
    POS_TERMINAL: 'POS Terminal',
    KITCHEN_DISPLAY: 'Kitchen Display (KDS)',
    ADMIN_DASHBOARD: 'Executive Dashboard',
    OPERATIONS_HUB: 'Operations & Inventory Hub',
    CUSTOMER_QR: 'Customer QR Ordering',
    WAITER_HANDHELD: 'Waiter Handheld',
    CUSTOMER_DISPLAY: 'Customer-Facing Display',
    RIDER_VIEW: 'Rider Mobile Dispatch',
    DESIGN_SYSTEM: 'Design System & Tokens',
  };

  return (
    <>
      <header className="h-16 border-b border-white/10 glass-panel sticky top-0 z-40 px-4 flex items-center justify-between">
        {/* Left: Brand & Portal Badge */}
        <div className="flex items-center gap-4">
          <div 
            onClick={() => setIsSwitcherOpen(true)}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-glow-cyan">
              <Zap className="w-6 h-6 text-black fill-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold tracking-wider text-lg text-white">NOVAPOS</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono font-semibold">
                  v1.0-PROD
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Enterprise Restaurant OS</p>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-white/10 mx-1 hidden md:block" />

          {/* Current Portal Switcher Pill */}
          <button
            onClick={() => setIsSwitcherOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-all hover:border-cyan-500/40"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>{portalLabels[activePortal]}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Branch Switcher */}
          <div className="relative hidden lg:block">
            <select
              value={activeBranchId}
              onChange={(e) => setActiveBranchId(e.target.value)}
              aria-label="Select Branch"
              className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 appearance-none pr-7 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id} className="bg-slate-900 text-slate-200">
                  {b.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Center / Right: Status Indicators & Staff Info */}
        <div className="flex items-center gap-3">
          {/* Cloud Sync Status */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Wifi className="w-3 h-3" />
            <span>Online</span>
          </div>

          {/* Performance / 2D Mode Toggle */}
          <button
            onClick={toggleReducedMotion}
            title={reducedMotion ? "Performance Mode Active (2D Fallback)" : "60 FPS 3D Mode Active"}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all border ${
              reducedMotion
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">{reducedMotion ? '2D Fast' : '3D Fluid'}</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={toggleLocale}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-all"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>{locale === 'en' ? 'EN' : 'বাং'}</span>
          </button>

          {/* Staff Badge & Lock Terminal */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-white leading-tight">{currentUser.name}</div>
              <div className="text-[10px] text-cyan-400 font-mono tracking-wide">{currentUser.role}</div>
            </div>

            <button
              onClick={() => setIsLocked(true)}
              title="Lock Terminal (Quick PIN required)"
              className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 text-slate-300 hover:text-red-400 transition-all flex items-center justify-center"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* App Switcher Modal */}
      {isSwitcherOpen && (
        <AppSwitcherModal onClose={() => setIsSwitcherOpen(false)} />
      )}
    </>
  );
};
