import React, { useState } from 'react';
import { Calculator, X, AlertTriangle, CheckCircle2, FileText, Printer } from 'lucide-react';
import { usePosStore } from '../../store/posStore';

interface ShiftCloseModalProps {
  onClose: () => void;
}

export const ShiftCloseModal: React.FC<ShiftCloseModalProps> = ({ onClose }) => {
  const { currentShift, addAuditLog } = usePosStore();

  const [denominations, setDenominations] = useState<Record<number, number>>({
    1000: 40, // 40,000 BDT
    500: 10,  // 5,000 BDT
    200: 4,   // 800 BDT
    100: 0,
    50: 0,
    20: 0,
    10: 0,
  });

  const [shiftClosedResult, setShiftClosedResult] = useState<any | null>(null);

  const handleDenomChange = (val: number, count: number) => {
    setDenominations((prev) => ({
      ...prev,
      [val]: Math.max(0, count || 0),
    }));
  };

  // Calculate actual counted cash in minor units
  const actualCashMinor = Object.entries(denominations).reduce(
    (sum, [denom, count]) => sum + Number(denom) * count * 100,
    0
  );

  const expectedCashMinor = currentShift.openingFloat + currentShift.totalCashSales;
  const varianceMinor = actualCashMinor - expectedCashMinor;

  const handleExecuteCloseShift = () => {
    const closedShift = {
      ...currentShift,
      closedAt: new Date().toISOString(),
      actualCashClose: actualCashMinor,
      variance: varianceMinor,
      isOpen: false,
    };

    setShiftClosedResult(closedShift);

    addAuditLog(
      'SHIFT_CLOSED_Z_REPORT',
      'SHIFT',
      currentShift.id,
      `Shift closed by ${currentShift.cashierName}. Variance: ${varianceMinor >= 0 ? '+' : ''}${varianceMinor / 100} BDT`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg glass-panel-elevated rounded-3xl border border-white/20 shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-glow-cyan">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">Cashier Shift Close (Z-Report)</h3>
              <p className="text-xs text-slate-400">
                Cashier: <strong className="text-white">{currentShift.cashierName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close shift modal"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!shiftClosedResult ? (
          <>
            {/* Denomination Counter Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Count Physical Cash Drawer:
                </span>
                <span className="text-[11px] text-cyan-300 font-mono">Blind Close Enforced</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[1000, 500, 200, 100, 50, 20, 10].map((denom) => (
                  <div key={denom} className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-white">৳{denom}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-mono">×</span>
                      <input
                        type="number"
                        min="0"
                        value={denominations[denom] || 0}
                        onChange={(e) => handleDenomChange(denom, parseInt(e.target.value) || 0)}
                        className="w-16 h-8 rounded-lg glass-input text-center text-xs font-mono font-bold text-cyan-300"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Real-time Count & Variance Calculation */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 mt-4 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Counted Physical Cash:</span>
                  <span className="font-bold text-white text-sm">৳{(actualCashMinor / 100).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Opening Float:</span>
                  <span>৳{(currentShift.openingFloat / 100).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>System Expected Total:</span>
                  <span>৳{(expectedCashMinor / 100).toLocaleString()}</span>
                </div>

                <div className={`pt-2 border-t border-white/10 flex justify-between font-bold text-sm ${
                  varianceMinor === 0
                    ? 'text-emerald-400'
                    : varianceMinor > 0
                    ? 'text-cyan-400'
                    : 'text-amber-400'
                }`}>
                  <span>Variance (Over/Short):</span>
                  <span>
                    {varianceMinor >= 0 ? '+' : ''}৳{(varianceMinor / 100).toLocaleString()}
                    {varianceMinor === 0 ? ' (Perfect Match)' : varianceMinor < 0 ? ' (Shortage)' : ' (Overage)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteCloseShift}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all shadow-glow-cyan"
              >
                Close Shift & Print Z-Report
              </button>
            </div>
          </>
        ) : (
          /* Z-Report Summary View */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center shadow-glow-emerald">
              <FileText className="w-8 h-8" />
            </div>

            <div>
              <h4 className="font-display font-bold text-xl text-white">Official Fiscal Z-Report Issued</h4>
              <p className="text-xs text-slate-400 font-mono mt-1">SHIFT ID: {shiftClosedResult.id}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span>Opened At:</span>
                <span>{new Date(shiftClosedResult.openedAt).toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Closed At:</span>
                <span>{new Date(shiftClosedResult.closedAt).toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Cash Sales:</span>
                <span className="font-bold text-white">৳{(shiftClosedResult.totalCashSales / 100).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Card / MFS Sales:</span>
                <span className="font-bold text-cyan-300">
                  ৳{((shiftClosedResult.totalCardSales + shiftClosedResult.totalMfsSales) / 100).toLocaleString()}
                </span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-emerald-400">
                <span>Closing Balance:</span>
                <span>৳{(shiftClosedResult.actualCashClose / 100).toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all"
            >
              Done & Exit Shift
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
