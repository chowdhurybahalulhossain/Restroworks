import React, { useState } from 'react';
import { 
  Smartphone, Users, Clock, Send, Plus, 
  CheckCircle2, ArrowRightLeft, Layers 
} from 'lucide-react';
import { usePosStore } from '../../store/posStore';

export const WaiterHandheldPortal: React.FC = () => {
  const { tables, selectedTableId, selectTable, updateTableStatus, setActivePortal } = usePosStore();
  const [activeZone, setActiveZone] = useState('zone-main');

  const zoneTables = tables.filter((t) => t.zoneId === activeZone);
  const currentTable = tables.find((t) => t.id === selectedTableId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'OCCUPIED': return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'ORDERED': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'FOOD_READY': return 'bg-purple-500/20 text-purple-400 border-purple-500/40 animate-pulse';
      case 'BILL_REQUESTED': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
      default: return 'bg-white/10 text-slate-400 border-white/20';
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-nova-bg">
      {/* Mobile Waiter Terminal Frame */}
      <div className="w-full max-w-md mx-auto h-full flex flex-col glass-panel md:border-x border-white/10">
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-rose-400" />
            <div>
              <h3 className="font-display font-bold text-sm text-white">Waiter Mobile Terminal</h3>
              <p className="text-[10px] text-slate-400">Fast Table Service & Course Control</p>
            </div>
          </div>

          <span className="text-[11px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold">
            Captain View
          </span>
        </div>

        {/* Zone Selector */}
        <div className="p-2 border-b border-white/10 flex gap-1 bg-black/20">
          {[
            { id: 'zone-main', name: 'Main Hall' },
            { id: 'zone-rooftop', name: 'Rooftop' },
            { id: 'zone-vip', name: 'VIP Lounge' },
          ].map((z) => (
            <button
              key={z.id}
              onClick={() => setActiveZone(z.id)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeZone === z.id
                  ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {z.name}
            </button>
          ))}
        </div>

        {/* Tables Grid */}
        <div className="flex-1 p-4 overflow-y-auto grid grid-cols-2 gap-3">
          {zoneTables.map((t) => {
            const isSelected = t.id === selectedTableId;
            return (
              <div
                key={t.id}
                onClick={() => selectTable(t.id)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-rose-500 bg-rose-500/10 shadow-lg shadow-rose-500/20'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-base text-white">{t.number}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono font-bold ${getStatusColor(t.status)}`}>
                    {t.status}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{t.capacity} seats</span>
                  </span>
                  {t.elapsedSeconds && (
                    <span className="flex items-center gap-1 font-mono text-[11px] text-amber-300">
                      <Clock className="w-3 h-3" />
                      <span>{Math.floor(t.elapsedSeconds / 60)}m</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Table Footer Action */}
        {currentTable && (
          <div className="p-4 border-t border-white/10 bg-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white">Selected: {currentTable.name}</span>
                <p className="text-[10px] text-slate-400">Status: {currentTable.status}</p>
              </div>
              <button
                onClick={() => updateTableStatus(currentTable.id, 'AVAILABLE')}
                className="text-[10px] px-2 py-1 rounded bg-white/10 text-slate-300 hover:text-white"
              >
                Reset to Free
              </button>
            </div>

            <button
              onClick={() => setActivePortal('POS_TERMINAL')}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-500/30"
            >
              <Plus className="w-4 h-4" />
              <span>Open POS Order Entry for {currentTable.number}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
