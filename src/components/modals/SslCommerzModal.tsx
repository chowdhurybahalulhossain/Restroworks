import React, { useState } from 'react';
import { ShieldCheck, X, CheckCircle2, Loader2, ArrowRight, Smartphone, CreditCard, Building } from 'lucide-react';
import { usePosStore } from '../../store/posStore';
import confetti from 'canvas-confetti';

interface SslCommerzModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const SslCommerzModal: React.FC<SslCommerzModalProps> = ({ onClose, onSuccess }) => {
  const { grandTotal, settlePayment } = usePosStore();
  const [step, setStep] = useState<'SELECT_TENDER' | 'HOSTED_GATEWAY' | 'IPN_VALIDATING' | 'SUCCESS'>('SELECT_TENDER');
  const [selectedMethod, setSelectedMethod] = useState<'BKASH' | 'NAGAD' | 'CARD' | 'NET_BANKING'>('BKASH');
  const [valId] = useState(`VAL-${Math.floor(100000 + Math.random() * 900000)}`);
  const [tranId] = useState(`TXN-NOVA-${Date.now().toString().slice(-6)}`);

  const handleProceedToGateway = () => {
    setStep('HOSTED_GATEWAY');
  };

  const handleSimulatePaymentAuth = () => {
    setStep('IPN_VALIDATING');

    // Simulate Server-side Order Validation API (validator/api/validationserverAPI.php)
    setTimeout(() => {
      settlePayment('SSLCOMMERZ');
      setStep('SUCCESS');

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg glass-panel-elevated rounded-3xl border border-cyan-500/30 shadow-2xl flex flex-col overflow-hidden">
        {/* SSLCOMMERZ Branded Header */}
        <div className="p-5 border-b border-white/10 bg-gradient-to-r from-blue-900/60 to-cyan-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-lg">
              <span className="font-display font-extrabold text-blue-900 text-xs tracking-tighter">SSL</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base text-white">SSLCOMMERZ Hosted Gateway</h3>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  Sandbox Active
                </span>
              </div>
              <p className="text-[11px] text-cyan-200">PCI-DSS SAQ-A Certified Payment Engine</p>
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

        {/* Amount & Transaction Verification Bar */}
        <div className="p-4 bg-black/40 border-b border-white/5 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-mono block">TRANSACTION ID:</span>
            <span className="font-mono text-cyan-300 font-semibold">{tranId}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-mono block">PAYABLE AMOUNT:</span>
            <span className="font-display font-bold text-lg text-white">
              ৳{(grandTotal / 100).toLocaleString()} <span className="text-xs font-normal text-slate-400">BDT</span>
            </span>
          </div>
        </div>

        {/* Step 1: Select Tender Method */}
        {step === 'SELECT_TENDER' && (
          <div className="p-6 space-y-4">
            <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Choose Payment Method:
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setSelectedMethod('BKASH')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  selectedMethod === 'BKASH'
                    ? 'border-pink-500 bg-pink-500/15 shadow-lg shadow-pink-500/20'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-pink-600 flex items-center justify-center text-white mb-2">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-white text-xs block">bKash Mobile Banking</span>
                  <span className="text-[10px] text-slate-400">Instant OTP Payment</span>
                </div>
              </div>

              <div
                onClick={() => setSelectedMethod('NAGAD')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  selectedMethod === 'NAGAD'
                    ? 'border-orange-500 bg-orange-500/15 shadow-lg shadow-orange-500/20'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white mb-2">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-white text-xs block">Nagad Wallet</span>
                  <span className="text-[10px] text-slate-400">Postal Digital Cash</span>
                </div>
              </div>

              <div
                onClick={() => setSelectedMethod('CARD')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  selectedMethod === 'CARD'
                    ? 'border-blue-500 bg-blue-500/15 shadow-lg shadow-blue-500/20'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white mb-2">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-white text-xs block">Visa / Mastercard / Amex</span>
                  <span className="text-[10px] text-slate-400">Debit & Credit Cards</span>
                </div>
              </div>

              <div
                onClick={() => setSelectedMethod('NET_BANKING')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  selectedMethod === 'NET_BANKING'
                    ? 'border-emerald-500 bg-emerald-500/15 shadow-lg shadow-emerald-500/20'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white mb-2">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-white text-xs block">Internet Net Banking</span>
                  <span className="text-[10px] text-slate-400">City Touch, EBL, BRAC</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleProceedToGateway}
              className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-glow-cyan"
            >
              <span>Continue to Secure Hosted Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Hosted Gateway Redirect Simulation */}
        {step === 'HOSTED_GATEWAY' && (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center shadow-glow-cyan">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div>
              <h4 className="font-display font-bold text-lg text-white">Authorize Payment Tender</h4>
              <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
                Customer is currently entering OTP/PIN on SSLCOMMERZ Hosted Page ({selectedMethod}).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Validation ID:</span>
                <span className="text-cyan-300 font-bold">{valId}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Currency & Amount:</span>
                <span className="text-emerald-400 font-bold">BDT ৳{(grandTotal / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Session Source:</span>
                <span className="text-white">Server-side Session Init</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep('SELECT_TENDER')}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300"
              >
                Back
              </button>
              <button
                onClick={handleSimulatePaymentAuth}
                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-glow-emerald"
              >
                Authorize & Trigger IPN
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Server-side IPN & Order Validation API Check */}
        {step === 'IPN_VALIDATING' && (
          <div className="p-12 text-center space-y-4">
            <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto" />
            <h4 className="font-display font-bold text-base text-white">Validating with Order Validation API...</h4>
            <div className="text-xs text-slate-400 space-y-1 font-mono">
              <p>1. Received Instant Payment Notification (IPN)</p>
              <p className="text-cyan-300">2. Calling validator/api/validationserverAPI.php?val_id={valId}</p>
              <p>3. Verifying amount, currency and signature matching</p>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 'SUCCESS' && (
          <div className="p-10 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center shadow-glow-emerald">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="font-display font-bold text-xl text-white">Payment Verified & Settled</h4>
            <p className="text-xs text-slate-300">
              Bill settled with source-of-truth authorization. Returning to terminal...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
