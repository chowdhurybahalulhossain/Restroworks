import React, { useState } from 'react';
import { 
  ChefHat, Clock, Check, RotateCcw, AlertTriangle, 
  Flame, Utensils, GlassWater, Sparkles, Filter 
} from 'lucide-react';
import { usePosStore } from '../../store/posStore';
import { KitchenStation } from '../../types';

export const KdsPortal: React.FC = () => {
  const { kitchenTickets, bumpTicket, toggleTicketItemReady, locale } = usePosStore();
  const [stationFilter, setStationFilter] = useState<KitchenStation | 'ALL'>('ALL');
  const [showBumped, setShowBumped] = useState(false);

  // Filter tickets by station and bump status
  const filteredTickets = kitchenTickets.filter((ticket) => {
    const matchesStation = stationFilter === 'ALL' || ticket.station === stationFilter;
    const matchesBump = showBumped ? ticket.isBumped : !ticket.isBumped;
    return matchesStation && matchesBump;
  });

  const getAgingBadge = (createdAtStr: string) => {
    const created = new Date(createdAtStr).getTime();
    const now = Date.now();
    const elapsedMinutes = Math.floor((now - created) / 60000);

    if (elapsedMinutes >= 20) {
      return {
        text: `${elapsedMinutes}m (CRITICAL)`,
        borderClass: 'border-red-500 animate-ticket-urgent',
        badgeClass: 'bg-red-500/20 text-red-300 border-red-500/50',
      };
    } else if (elapsedMinutes >= 10) {
      return {
        text: `${elapsedMinutes}m (DELAYED)`,
        borderClass: 'border-amber-500/80 shadow-glow-amber',
        badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
      };
    }
    return {
      text: `${elapsedMinutes}m (NEW)`,
      borderClass: 'border-emerald-500/60 shadow-glow-emerald',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
    };
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-nova-bg">
      {/* KDS Header & Station Filter Rail */}
      <div className="h-14 border-b border-white/10 glass-panel px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-amber-400" />
            <span className="font-display font-bold text-white text-sm">Live Kitchen Pass (KDS)</span>
          </div>

          <div className="h-5 w-[1px] bg-white/10 mx-2" />

          {/* Station Filters */}
          <div className="flex items-center gap-1.5">
            {(['ALL', 'KITCHEN', 'GRILL', 'BAR', 'DESSERT'] as const).map((station) => (
              <button
                key={station}
                onClick={() => setStationFilter(station)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                  stationFilter === station
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                {station}
              </button>
            ))}
          </div>
        </div>

        {/* Bumped / Completed Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBumped(!showBumped)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
              showBumped
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{showBumped ? 'Viewing Bumped Archive' : 'Show History'}</span>
          </button>
        </div>
      </div>

      {/* Ticket Cards Grid */}
      <div className="flex-1 p-6 overflow-x-auto overflow-y-hidden flex items-start gap-5">
        {filteredTickets.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center text-slate-500">
            <ChefHat className="w-12 h-12 text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-white">All Kitchen Stations Clear</h3>
            <p className="text-xs text-slate-400 mt-1">No pending food or drink preparation tickets right now.</p>
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const aging = getAgingBadge(ticket.createdAt);
            const allItemsReady = ticket.items.every((i) => i.isReady);

            return (
              <div
                key={ticket.id}
                className={`w-80 flex-shrink-0 glass-panel-elevated rounded-2xl flex flex-col border transition-all duration-300 ${aging.borderClass}`}
              >
                {/* Ticket Header */}
                <div className="p-3.5 border-b border-white/10 bg-white/5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-sm text-white">{ticket.ticketNumber}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-cyan-300 font-mono font-bold">
                        {ticket.station}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-amber-300">{ticket.tableName}</span>
                  </div>

                  <div className={`px-2 py-1 rounded-lg border text-[11px] font-mono font-bold flex items-center gap-1.5 ${aging.badgeClass}`}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{aging.text}</span>
                  </div>
                </div>

                {/* Items List */}
                <div className="p-3.5 flex-1 overflow-y-auto space-y-2.5 max-h-96">
                  {ticket.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleTicketItemReady(ticket.id, item.id)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                        item.isReady
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 flex-shrink-0 ${
                        item.isReady ? 'bg-emerald-500 text-black' : 'border border-white/30 text-transparent'
                      }`}>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${item.isReady ? 'line-through text-slate-400' : 'text-white'}`}>
                            {item.quantity}x {locale === 'en' ? item.nameEn : item.nameBn}
                          </span>
                          <span className="text-[10px] px-1 rounded bg-white/10 text-slate-300 font-mono">
                            {item.course}
                          </span>
                        </div>

                        {item.modifiers.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.modifiers.map((m, idx) => (
                              <span key={idx} className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 font-medium">
                                + {m}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bump / Complete Action */}
                <div className="p-3 border-t border-white/10 bg-white/5">
                  <button
                    onClick={() => bumpTicket(ticket.id)}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
                      allItemsReady
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/30 font-display'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>{ticket.isBumped ? 'Recalled' : allItemsReady ? 'Bump All (Ready)' : 'Bump Ticket'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
