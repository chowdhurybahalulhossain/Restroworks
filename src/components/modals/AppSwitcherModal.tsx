import React from 'react';
import { 
  X, Monitor, ChefHat, BarChart3, QrCode, 
  Smartphone, Tv, Bike, Palette, Check 
} from 'lucide-react';
import { usePosStore } from '../../store/posStore';
import { PortalApp } from '../../types';

interface AppSwitcherModalProps {
  onClose: () => void;
}

export const AppSwitcherModal: React.FC<AppSwitcherModalProps> = ({ onClose }) => {
  const { activePortal, setActivePortal } = usePosStore();

  const apps: { id: PortalApp; name: string; desc: string; icon: any; color: string; tag: string }[] = [
    {
      id: 'POS_TERMINAL',
      name: 'POS Terminal',
      desc: 'High-speed order taking, modifier combos, and fast billing',
      icon: Monitor,
      color: 'from-cyan-500 to-blue-600',
      tag: 'Core Cashier',
    },
    {
      id: 'KITCHEN_DISPLAY',
      name: 'Kitchen Display System (KDS)',
      desc: 'Real-time color-coded tickets, station routing & bump actions',
      icon: ChefHat,
      color: 'from-amber-500 to-orange-600',
      tag: 'Chef & Bar',
    },
    {
      id: 'ADMIN_DASHBOARD',
      name: 'Manager & Admin Dashboard',
      desc: 'Real-time sales, staff audits, hourly heatmaps & fraud alerts',
      icon: BarChart3,
      color: 'from-emerald-500 to-teal-600',
      tag: 'Management',
    },
    {
      id: 'CUSTOMER_QR',
      name: 'Customer QR Ordering',
      desc: 'Interactive table menu, 3D dish preview & phone payment',
      icon: QrCode,
      color: 'from-purple-500 to-indigo-600',
      tag: 'Contactless Dine-in',
    },
    {
      id: 'WAITER_HANDHELD',
      name: 'Waiter Handheld Mode',
      desc: 'Mobile table-side order entry, seat assignments & course firing',
      icon: Smartphone,
      color: 'from-rose-500 to-pink-600',
      tag: 'Mobile Waiter',
    },
    {
      id: 'CUSTOMER_DISPLAY',
      name: 'Customer-Facing Display (CFD)',
      desc: 'Second screen live itemized receipt, promotions & payment QR',
      icon: Tv,
      color: 'from-blue-500 to-cyan-600',
      tag: 'Counter Display',
    },
    {
      id: 'RIDER_VIEW',
      name: 'Rider Mobile Dispatch',
      desc: 'Active delivery routes, GPS coordinates & COD settlement',
      icon: Bike,
      color: 'from-yellow-500 to-amber-600',
      tag: 'Delivery Fleet',
    },
    {
      id: 'DESIGN_SYSTEM',
      name: 'Design System & Storybook',
      desc: 'Visual tokens, color ramps, typography scale & glassmorphism',
      icon: Palette,
      color: 'from-fuchsia-500 to-purple-600',
      tag: 'UI/UX Specs',
    },
  ];

  const handleSelect = (appId: PortalApp) => {
    setActivePortal(appId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl glass-panel-elevated rounded-2xl overflow-hidden border border-white/15 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <span>NOVAPOS Multi-Application Suite</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                8 Apps Included
              </span>
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Switch instantaneously between dedicated role views and hardware portal endpoints.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Modal"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Apps Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
          {apps.map((app) => {
            const Icon = app.icon;
            const isSelected = activePortal === app.id;

            return (
              <div
                key={app.id}
                onClick={() => handleSelect(app.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all border flex items-start gap-4 relative group ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500/60 shadow-glow-cyan'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${app.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1 pr-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      {app.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-slate-300 font-mono">
                      {app.tag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {app.desc}
                  </p>
                </div>

                {isSelected && (
                  <div className="absolute right-4 top-4 w-6 h-6 rounded-full bg-cyan-500 text-black flex items-center justify-center">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
