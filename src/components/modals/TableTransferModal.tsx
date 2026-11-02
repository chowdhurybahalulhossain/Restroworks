import React, { useState } from 'react';
import { ArrowRightLeft, Merge, X, Check, Users, AlertCircle } from 'lucide-react';
import { usePosStore } from '../../store/posStore';

interface TableTransferModalProps {
  onClose: () => void;
}

export const TableTransferModal: React.FC<TableTransferModalProps> = ({ onClose }) => {
  const { tables, selectedTableId, selectTable, updateTableStatus, addAuditLog } = usePosStore();
  const [mode, setMode] = useState<'TRANSFER' | 'MERGE'>('TRANSFER');
  const [targetTableId, setTargetTableId] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const currentTable = tables.find((t) => t.id === selectedTableId);
  const eligibleTables = tables.filter((t) => t.id !== selectedTableId);

  const handleExecute = () => {
    if (!currentTable || !targetTableId) {
      setErrorMsg('Please select a destination table');
      return;
    }

    const targetTable = tables.find((t) => t.id === targetTableId);
    if (!targetTable) return;

    if (mode === 'TRANSFER') {
      // Transfer table: currentTable becomes AVAILABLE, targetTable inherits currentTable status & order
      updateTableStatus(currentTable.id, 'AVAILABLE');
      updateTableStatus(targetTable.id, currentTable.status);
      selectTable(targetTable.id);

      addAuditLog(
        'TABLE_TRANSFERRED',
        'TABLE',
        currentTable.id,
        `Transferred active order from ${currentTable.number} to ${targetTable.number}`
      );
    } else {
      // Merge tables: targetTable stays primary, currentTable is merged
      updateTableStatus(currentTable.id, 'OCCUPIED');
      updateTableStatus(targetTable.id, 'ORDERED');
      selectTable(targetTable.id);

      addAuditLog(
        'TABLES_MERGED',
        'TABLE',
        currentTable.id,
        `Merged ${currentTable.number} with ${targetTable.number} for large party`
      );
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg glass-panel-elevated rounded-3xl border border-white/20 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-glow-cyan">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">
                {mode === 'TRANSFER' ? 'Transfer Table Order' : 'Merge Tables for Party'}
              </h3>
              <p className="text-xs text-slate-400">
                Source: <strong className="text-white">{currentTable?.name || 'Counter'}</strong> ({currentTable?.number})
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

        {/* Mode Selector Tabs */}
        <div className="p-4 border-b border-white/10 bg-black/30 flex gap-2">
          <button
            onClick={() => setMode('TRANSFER')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              mode === 'TRANSFER'
                ? 'bg-cyan-500 text-black font-bold shadow-glow-cyan'
                : 'text-slate-400 hover:text-white bg-white/5'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Transfer to Free Table</span>
          </button>

          <button
            onClick={() => setMode('MERGE')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              mode === 'MERGE'
                ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-white bg-white/5'
            }`}
          >
            <Merge className="w-4 h-4" />
            <span>Merge with Active Table</span>
          </button>
        </div>

        {/* Destination Table Selector Grid */}
        <div className="p-6 overflow-y-auto max-h-72 space-y-2">
          <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Select Destination Table:
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {eligibleTables.map((t) => {
              const isSelected = targetTableId === t.id;
              const isAvailable = t.status === 'AVAILABLE';

              return (
                <div
                  key={t.id}
                  onClick={() => {
                    setTargetTableId(t.id);
                    setErrorMsg('');
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-glow-cyan'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-sm text-white">{t.number}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                      isAvailable ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{t.capacity} covers</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-white/5 flex flex-col gap-3">
          {errorMsg && (
            <div className="flex items-center gap-1.5 text-xs text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300"
            >
              Cancel
            </button>
            <button
              onClick={handleExecute}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all shadow-glow-cyan"
            >
              Confirm {mode === 'TRANSFER' ? 'Transfer' : 'Merge'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
