import React from 'react';
import { 
  TrendingUp, Users, DollarSign, AlertOctagon, 
  Store, Award, Clock, ArrowUpRight, ShieldCheck 
} from 'lucide-react';
import { usePosStore } from '../../store/posStore';
import { ExecutiveGlobe3D } from '../3d/ExecutiveGlobe3D';

export const DashboardPortal: React.FC = () => {
  const { currentShift, auditLogs, branches, menuItems } = usePosStore();

  const totalSalesFormatted = ((currentShift.totalCashSales + currentShift.totalCardSales + currentShift.totalMfsSales) / 100).toLocaleString();

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-nova-bg">
      {/* KPI Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 flex items-start justify-between shadow-glow-cyan">
          <div>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Today's Gross Sales</span>
            <h3 className="text-2xl font-display font-bold text-white mt-1">৳{totalSalesFormatted}</h3>
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium mt-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% vs last Tuesday</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-start justify-between">
          <div>
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Total Orders Billed</span>
            <h3 className="text-2xl font-display font-bold text-white mt-1">142 orders</h3>
            <p className="text-xs text-slate-400 mt-2">Avg. ticket: ৳1,052</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-start justify-between">
          <div>
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Active Dine-in Covers</span>
            <h3 className="text-2xl font-display font-bold text-white mt-1">38 guests</h3>
            <p className="text-xs text-emerald-400 mt-2">75% table utilization</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 flex items-start justify-between">
          <div>
            <span className="text-xs font-mono text-amber-400 uppercase tracking-wider">Audited Voids / Disc.</span>
            <h3 className="text-2xl font-display font-bold text-amber-300 mt-1">3 events</h3>
            <div className="flex items-center gap-1 text-xs text-amber-400 font-medium mt-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>All 100% Manager Verified</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3D Multi-Branch Revenue Globe Visualizer */}
      <ExecutiveGlobe3D />

      {/* Main Grid: Multi-Branch & Top Dishes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Multi-Branch Performance */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-display font-bold text-white">Cross-Branch Realtime Matrix</h4>
              <p className="text-xs text-slate-400">Live consolidated figures across all restaurant locations</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono">
              3 Branches Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-slate-400 font-mono">
                <tr>
                  <th className="pb-3 font-semibold">BRANCH</th>
                  <th className="pb-3 font-semibold">TODAY SALES</th>
                  <th className="pb-3 font-semibold">ORDERS</th>
                  <th className="pb-3 font-semibold">AVG PREP TIME</th>
                  <th className="pb-3 font-semibold">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {branches.map((b, idx) => (
                  <tr key={b.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 font-semibold text-white flex items-center gap-2">
                      <Store className="w-4 h-4 text-cyan-400" />
                      <span>{b.name}</span>
                    </td>
                    <td className="py-3 font-mono font-bold text-cyan-300">
                      ৳{idx === 0 ? totalSalesFormatted : (450000 + idx * 80000).toLocaleString()}
                    </td>
                    <td className="py-3 font-mono">{idx === 0 ? 142 : 94 + idx * 12}</td>
                    <td className="py-3 font-mono text-slate-300">11m 40s</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px]">
                        OPTIMAL
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top 5 Revenue Dishes */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <h4 className="text-base font-display font-bold text-white mb-1">Top Performing Dishes</h4>
          <p className="text-xs text-slate-400 mb-4">Ranked by revenue generation</p>

          <div className="space-y-3">
            {menuItems.slice(7, 12).map((item, idx) => (
              <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center">
                  #{idx + 1}
                </span>
                <div className="flex-1 truncate">
                  <div className="text-xs font-semibold text-white truncate">{item.nameEn}</div>
                  <div className="text-[10px] text-slate-400 font-mono">৳{(item.basePrice / 100).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-400">{(42 - idx * 6)} sold</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security & Audit Trail */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-base font-display font-bold text-white">Immutable Security & Audit Trail</h4>
            <p className="text-xs text-slate-400">Real-time ledger of sensitive mutations and supervisor approvals</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">{auditLogs.length} logged entries</span>
        </div>

        <div className="divide-y divide-white/5">
          {auditLogs.map((log) => (
            <div key={log.id} className="py-3 flex items-start justify-between text-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{log.action}</span>
                    <span className="text-[10px] px-1.5 rounded bg-white/10 text-slate-300 font-mono">
                      {log.entityType}
                    </span>
                  </div>
                  <p className="text-slate-300 mt-0.5">{log.details}</p>
                </div>
              </div>

              <div className="text-right font-mono text-[11px] text-slate-400">
                <div>{log.userName}</div>
                <div>{new Date(log.timestamp).toLocaleTimeString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
