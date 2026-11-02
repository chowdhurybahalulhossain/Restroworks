import React, { useState } from 'react';
import { ShieldAlert, X, CheckCircle, AlertTriangle, KeyRound } from 'lucide-react';
import { usePosStore } from '../../store/posStore';

export const ManagerOverrideModal: React.FC = () => {
  const { overrideModalOpen, currentOverrideRequest, approveManagerOverride, closeManagerOverride } = usePosStore();
  const [managerPin, setManagerPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!overrideModalOpen || !currentOverrideRequest) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (managerPin.length !== 4) {
      setErrorMsg('Please enter a 4-digit Manager PIN');
      return;
    }

    const success = approveManagerOverride(managerPin);
    if (!success) {
      setErrorMsg('Invalid Manager PIN. (Try 1111 or 9999)');
      setManagerPin('');
    } else {
      setManagerPin('');
      setErrorMsg('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md glass-panel-elevated rounded-3xl p-6 border border-amber-500/40 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-white">Manager Override Required</h3>
              <p className="text-xs text-amber-300/80 font-medium">Security Approval Guard</p>
            </div>
          </div>
          <button
            onClick={closeManagerOverride}
            aria-label="Close Override Modal"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Details */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 mb-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Action: {currentOverrideRequest.action}</span>
          </div>
          <p className="text-xs text-slate-300">
            Target: <strong className="text-white">{currentOverrideRequest.entityName}</strong>
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            This action modifies fiscal records or active kitchen orders and requires supervisor authorization.
          </p>
        </div>

        {/* PIN Entry Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Enter 4-Digit Manager PIN:</span>
              <span className="text-[11px] text-cyan-400 font-mono">Demo: 1111</span>
            </label>
            <div className="relative">
              <input
                type="password"
                maxLength={4}
                value={managerPin}
                onChange={(e) => {
                  setManagerPin(e.target.value.replace(/\D/g, ''));
                  setErrorMsg('');
                }}
                placeholder="••••"
                autoFocus
                className="w-full h-14 rounded-xl glass-input px-4 text-center text-2xl tracking-[0.5em] font-mono text-white placeholder-slate-600 focus:border-amber-400"
              />
              <KeyRound className="w-5 h-5 text-slate-500 absolute left-4 top-4.5 pointer-events-none" />
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-red-400 font-medium text-center">{errorMsg}</p>
          )}

          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              onClick={closeManagerOverride}
              className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black text-xs font-bold transition-all shadow-lg shadow-amber-500/20"
            >
              Authorize & Proceed
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
