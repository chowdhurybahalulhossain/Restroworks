import React from 'react';
import { Tv, QrCode, Sparkles, ShieldCheck, Heart } from 'lucide-react';
import { usePosStore } from '../../store/posStore';

export const CustomerFacingDisplayPortal: React.FC = () => {
  const { cart, subtotal, discountAmount, serviceChargeAmount, taxAmount, grandTotal, locale } = usePosStore();

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-nova-bg">
      {/* Left: Promotional Banner & Dynamic Payment QR */}
      <div className="flex-1 p-8 flex flex-col justify-between border-r border-white/10 relative overflow-hidden bg-gradient-to-br from-blue-950/40 via-nova-bg to-purple-950/40">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Tv className="w-5 h-5 text-cyan-400" />
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              Novasphere Customer Display
            </span>
          </div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">
            Welcome to Novasphere Bistro
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-md">
            Scan and pay instantly with bKash, Nagad, Visa, Mastercard via SSLCOMMERZ secure checkout.
          </p>
        </div>

        {/* Big Payment QR Card */}
        <div className="relative z-10 my-8 p-6 glass-panel-elevated rounded-3xl border border-cyan-500/40 max-w-sm flex flex-col items-center shadow-glow-cyan">
          <div className="w-48 h-48 bg-white rounded-2xl p-3 flex items-center justify-center mb-4">
            {/* Mock QR graphic */}
            <div className="w-full h-full border-4 border-black rounded-lg flex flex-col items-center justify-center p-2 text-black">
              <QrCode className="w-24 h-24 stroke-[1.5]" />
              <span className="text-[10px] font-mono font-bold mt-1">SCAN WITH ANY MFS / BANK</span>
            </div>
          </div>

          <span className="text-xs font-mono text-cyan-300 font-bold">POWERED BY SSLCOMMERZ</span>
          <p className="text-[11px] text-slate-400 mt-1">Instant Bank & Wallet Checkout</p>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-xs text-slate-400">
          <Heart className="w-4 h-4 text-red-400 fill-red-400" />
          <span>Thank you for dining with us! Earn 5% loyalty points on every visit.</span>
        </div>
      </div>

      {/* Right: Itemized Live Bill Receipt */}
      <div className="w-full md:w-96 p-6 glass-panel flex flex-col justify-between overflow-y-auto">
        <div>
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
            <h3 className="font-display font-bold text-lg text-white">Your Order</h3>
            <span className="text-xs font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/20">
              {cart.length} items
            </span>
          </div>

          {cart.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p className="text-xs font-medium">Waiting for cashier to add items...</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-start text-xs border-b border-white/5 pb-2">
                  <div>
                    <div className="font-semibold text-white">
                      {item.quantity}x {locale === 'en' ? item.nameEn : item.nameBn}
                    </div>
                    {item.selectedModifiers.map((m, idx) => (
                      <span key={idx} className="text-[10px] text-amber-300 block">
                        + {m.nameEn}
                      </span>
                    ))}
                  </div>
                  <span className="font-mono font-bold text-cyan-300">
                    ৳{((item.unitPrice * item.quantity) / 100).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bill Breakdown */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Subtotal:</span>
            <span className="font-mono text-white">৳{(subtotal / 100).toLocaleString()}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-xs text-emerald-400">
              <span>Discount:</span>
              <span className="font-mono">-৳{(discountAmount / 100).toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-xs text-slate-400">
            <span>VAT & Service:</span>
            <span className="font-mono text-white">
              ৳{((taxAmount + serviceChargeAmount) / 100).toLocaleString()}
            </span>
          </div>

          <div className="pt-3 border-t border-white/10 flex justify-between items-baseline">
            <span className="text-base font-bold text-white">Total Due:</span>
            <span className="text-2xl font-display font-bold text-cyan-400">
              ৳{(grandTotal / 100).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
