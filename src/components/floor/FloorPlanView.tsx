import React, { useState } from 'react';
import { 
  Users, Clock, ArrowRightLeft, Plus, CheckCircle2, 
  Utensils, CloudSun, Crown, Filter 
} from 'lucide-react';
import { usePosStore } from '../../store/posStore';
import { Table, TableStatus } from '../../types';

interface FloorPlanViewProps {
  onOpenOrder: (tableId: string) => void;
  onOpenTransfer: () => void;
}

export const FloorPlanView: React.FC<FloorPlanViewProps> = ({ onOpenOrder, onOpenTransfer }) => {
  const { tables, selectedTableId, selectTable, updateTableStatus } = usePosStore();
  const [selectedZone, setSelectedZone] = useState<string>('zone-main');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const zoneTables = tables.filter((t) => {
    const matchesZone = t.zoneId === selectedZone;
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesZone && matchesStatus;
  });

  const getStatusStyles = (status: TableStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return {
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          glow: 'border-emerald-500/40 hover:border-emerald-400 hover:shadow-glow-emerald',
          shapeFill: 'bg-emerald-500/10',
        };
      case 'OCCUPIED':
        return {
          badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          glow: 'border-blue-500/50 hover:border-blue-400',
          shapeFill: 'bg-blue-500/10',
        };
      case 'ORDERED':
        return {
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          glow: 'border-amber-500/60 hover:border-amber-400 shadow-lg shadow-amber-500/10',
          shapeFill: 'bg-amber-500/10',
        };
      case 'FOOD_READY':
        return {
          badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          glow: 'border-purple-500/80 hover:border-purple-400 animate-pulse shadow-lg shadow-purple-500/20',
          shapeFill: 'bg-purple-500/20',
        };
      case 'BILL_REQUESTED':
        return {
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          glow: 'border-cyan-500/80 hover:border-cyan-400 shadow-glow-cyan',
          shapeFill: 'bg-cyan-500/15',
        };
      case 'CLEANING':
        return {
          badge: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
          glow: 'border-slate-500/40',
          shapeFill: 'bg-slate-800/40',
        };
      case 'RESERVED':
        return {
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          glow: 'border-rose-500/50',
          shapeFill: 'bg-rose-500/10',
        };
      default:
        return {
          badge: 'bg-white/10 text-slate-400 border-white/20',
          glow: 'border-white/10',
          shapeFill: 'bg-white/5',
        };
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-nova-bg">
      {/* Zone Switcher Bar */}
      <div className="p-4 border-b border-white/10 glass-panel flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {[
            { id: 'zone-main', name: 'Main Dining Hall', icon: Utensils },
            { id: 'zone-rooftop', name: 'Skyline Rooftop Terrace', icon: CloudSun },
            { id: 'zone-vip', name: 'Imperial VIP Lounge', icon: Crown },
          ].map((z) => {
            const Icon = z.icon;
            const isSelected = selectedZone === z.id;
            return (
              <button
                key={z.id}
                onClick={() => setSelectedZone(z.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  isSelected
                    ? 'bg-cyan-500 text-black font-bold shadow-glow-cyan'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{z.name}</span>
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenTransfer}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-all hover:border-cyan-500/40"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span>Transfer / Merge Table</span>
          </button>
        </div>
      </div>

      {/* Visual Tables Canvas Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {zoneTables.map((table) => {
            const styles = getStatusStyles(table.status);
            const isSelected = selectedTableId === table.id;

            return (
              <div
                key={table.id}
                onClick={() => {
                  selectTable(table.id);
                  onOpenOrder(table.id);
                }}
                className={`p-4 rounded-3xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between min-h-[170px] relative ${
                  styles.glow
                } ${styles.shapeFill} ${
                  isSelected ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-black scale-102' : 'hover:scale-102'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-display font-extrabold text-xl text-white">
                      {table.number}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ({table.shape.toLowerCase()})
                    </span>
                  </div>

                  <span className={`text-[9px] px-2 py-0.5 rounded-full border font-mono font-bold ${styles.badge}`}>
                    {table.status}
                  </span>
                </div>

                {/* Center / Body Info */}
                <div className="my-2">
                  <div className="text-xs font-semibold text-slate-200">{table.name}</div>
                  {table.waiterName && (
                    <div className="text-[10px] text-cyan-300 font-mono mt-0.5">
                      Server: {table.waiterName}
                    </div>
                  )}
                </div>

                {/* Footer Metrics */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-300" />
                    <span>{table.capacity} covers</span>
                  </span>

                  {table.elapsedSeconds ? (
                    <span className="flex items-center gap-1 font-mono text-[11px] text-amber-300">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{Math.floor(table.elapsedSeconds / 60)}m</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-400 font-mono">Free</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
