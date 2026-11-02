import React, { useState } from 'react';
import { Lock, Delete, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { usePosStore } from '../../store/posStore';

export const LockScreenModal: React.FC = () => {
  const { isLocked, loginWithPin, users, currentUser, switchUser } = usePosStore();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isLocked) return null;

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);

      if (nextPin.length === 4) {
        const success = loginWithPin(nextPin);
        if (!success) {
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 800);
        } else {
          setPin('');
        }
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-md glass-panel-elevated rounded-3xl p-8 border border-white/20 shadow-2xl flex flex-col items-center">
        {/* Terminal Locked Header */}
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center mb-4 shadow-glow-cyan">
          <Lock className="w-8 h-8 text-cyan-400" />
        </div>

        <h2 className="text-2xl font-display font-bold text-white text-center">
          Terminal Locked
        </h2>
        <p className="text-xs text-slate-400 mt-1 mb-6 text-center">
          Enter 4-digit staff PIN to unlock. (Demo PINs: 9999, 1111, 2222, 3333)
        </p>

        {/* Current Selected User Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs text-slate-300 font-medium">Active: {currentUser.name} ({currentUser.role})</span>
        </div>

        {/* PIN Indicators */}
        <div className="flex items-center gap-4 mb-6">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  error
                    ? 'bg-red-500 shadow-glow-crimson animate-bounce'
                    : isFilled
                    ? 'bg-cyan-400 shadow-glow-cyan scale-110'
                    : 'bg-white/10 border border-white/20'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-red-400 text-xs mb-4">
            <AlertCircle className="w-4 h-4" />
            <span>Invalid PIN. Please try again.</span>
          </div>
        )}

        {/* Tactile Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-xs mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              className="h-16 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 active:scale-95 text-xl font-display font-bold text-white transition-all hover:border-cyan-500/50 flex items-center justify-center"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="h-16 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 text-xs font-semibold text-slate-400 transition-all flex items-center justify-center"
          >
            CLEAR
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="h-16 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 active:scale-95 text-xl font-display font-bold text-white transition-all hover:border-cyan-500/50 flex items-center justify-center"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            aria-label="Delete digit"
            className="h-16 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 text-slate-300 transition-all flex items-center justify-center"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        {/* Quick Demo PIN Chips */}
        <div className="w-full border-t border-white/10 pt-4">
          <p className="text-[11px] text-slate-400 mb-2 text-center font-medium">Quick Switch Staff (Click to Fill PIN):</p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {users.slice(0, 5).map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  setPin(u.pin);
                  loginWithPin(u.pin);
                }}
                className="px-2 py-1 rounded bg-white/5 hover:bg-cyan-500/20 border border-white/10 text-[10px] text-slate-300 hover:text-cyan-300 transition-all"
              >
                {u.name.split(' ')[0]} ({u.pin})
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
