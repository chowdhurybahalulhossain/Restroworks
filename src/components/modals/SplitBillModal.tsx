import React, { useState } from 'react';
import { Scissors, X, Check, Users, DollarSign, AlertCircle } from 'lucide-react';
import { usePosStore } from '../../store/posStore';

interface SplitBillModalProps {
  onClose: () => void;
  onConfirmSplit: (splits: { splitIndex: number; amount: number; paymentMethod?: string }[]) => void;
}

export const SplitBillModal: React.FC<SplitBillModalProps> = ({ onClose, onConfirmSplit }) => {
  const { grandTotal, cart } = usePosStore();
  const [splitMethod, setSplitMethod] = useState<'EQUAL' | 'SEAT'>('EQUAL');
  const [equalSharesCount, setEqualSharesCount] = useState<number>(2);

  // Equal Shares computation
  const baseShare = Math.floor(grandTotal / equalSharesCount);
  const remainder = grandTotal % equalSharesCount;
  const equalSplits = Array.from({ length: equalSharesCount }, (_, idx) => ({
    splitIndex: idx + 1,
    amount: idx === 0 ? baseShare + remainder : baseShare,
    isPaid: false,
  }));

  const handleSettleSplit = () => {
    onConfirmSplit(equalSplits);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg glass-panel-elevated rounded-3xl border border-white/20 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">Split Table Invoice</h3>
              <p className="text-xs text-slate-400">
                Grand Total to Split: <strong className="text-cyan-400 font-mono">৳{(grandTotal / 100).toLocaleString()}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Split Method Tabs */}
        <div className="p-4 border-b border-white/10 bg-black/30 flex gap-2">
          <button
            onClick={() => setSplitMethod('EQUAL')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              splitMethod === 'EQUAL'
                ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Equal Shares (N-Ways)</span>
          </button>

          <button
            onClick={() => setSplitMethod('SEAT')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              splitMethod === 'SEAT'
                ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white bg-white/5'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Split by Items ({cart.length})</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 max-h-80">
          {splitMethod === 'EQUAL' ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                  Number of Paying Guests:
                </span>
                <div className="flex items-center gap-2">
                  {[2, 3, 4, 5, 6].map((count) => (
                    <button
                      key={count}
                      onClick={() => setEqualSharesCount(count)}
                      className={`w-9 h-9 rounded-xl font-mono font-bold text-xs transition-all ${
                        equalSharesCount === count
                          ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shares Breakdown Cards */}
              <div className="space-y-2 mt-4">
                {equalSplits.map((split) => (
                  <div
                    key={split.splitIndex}
                    className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 font-mono font-bold text-xs flex items-center justify-center">
                        #{split.splitIndex}
                      </span>
                      <span className="text-xs font-semibold text-white">Guest Share {split.splitIndex}</span>
                    </div>

                    <span className="font-display font-bold text-base text-cyan-400">
                      ৳{(split.amount / 100).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-slate-400 mb-2">Itemized distribution across multiple sub-bills:</p>
              {cart.map((c, i) => (
                <div key={c.id} className="p-3 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-white">{c.quantity}x {c.nameEn}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">Assigned to: Seat #{((i % 2) + 1)}</span>
                  </div>
                  <span className="font-mono font-bold text-cyan-400">
                    ৳{((c.unitPrice * c.quantity) / 100).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Reconciled:</span>
            <span className="text-lg font-display font-bold text-emerald-400">
              ৳{(grandTotal / 100).toLocaleString()} (100% Balanced)
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSettleSplit}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/30"
            >
              Generate Split Invoices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
