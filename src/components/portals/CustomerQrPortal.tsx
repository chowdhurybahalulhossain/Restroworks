import React, { useState } from 'react';
import { 
  QrCode, Sparkles, ShoppingBag, BellRing, 
  CreditCard, CheckCircle2, ChevronRight, Eye 
} from 'lucide-react';
import { usePosStore } from '../../store/posStore';
import { DishShowcaseModal } from '../modals/DishShowcaseModal';

export const CustomerQrPortal: React.FC = () => {
  const { menuItems, cart, addToCart, locale, grandTotal } = usePosStore();
  const [selectedPreviewItem, setSelectedPreviewItem] = useState<any | null>(null);
  const [waiterCalled, setWaiterCalled] = useState(false);

  const handleCallWaiter = () => {
    setWaiterCalled(true);
    setTimeout(() => setWaiterCalled(false), 4000);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-gradient-to-b from-nova-bg to-slate-950">
      {/* Mobile-First Frame */}
      <div className="w-full max-w-md mx-auto h-full flex flex-col glass-panel md:border-x border-white/10 relative">
        {/* Top Restaurant Banner */}
        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-white">Novasphere Table T-04</h3>
              <p className="text-[10px] text-purple-400 font-mono font-medium">Contactless Dine-in Portal</p>
            </div>
          </div>

          <button
            onClick={handleCallWaiter}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              waiterCalled
                ? 'bg-emerald-500 text-black font-bold'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>{waiterCalled ? 'Captain Alerted!' : 'Call Waiter'}</span>
          </button>
        </div>

        {/* Digital Menu Items */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-900/40 to-cyan-900/40 border border-purple-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold">
                CHEF SPECIAL
              </span>
              <h4 className="text-sm font-bold text-white mt-1">Interactive 3D Dish View Available</h4>
              <p className="text-[11px] text-slate-300">Tap dishes below to inspect rotatable 3D presentation.</p>
            </div>
            <Sparkles className="w-6 h-6 text-purple-400 flex-shrink-0" />
          </div>

          <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Popular Dishes</h4>

          <div className="space-y-3">
            {menuItems.slice(0, 10).map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/40 transition-all flex items-center gap-3"
              >
                <img
                  src={item.image}
                  alt={item.nameEn}
                  className="w-16 h-16 rounded-xl object-cover bg-slate-900"
                />

                <div className="flex-1 min-w-0">
                  <h5 className="text-xs font-bold text-white truncate">
                    {locale === 'en' ? item.nameEn : item.nameBn}
                  </h5>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                    {item.calories} kcal • {item.prepTimeMinutes}m prep
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-display font-bold text-cyan-400">
                      ৳{(item.basePrice / 100).toLocaleString()}
                    </span>
                    <button
                      onClick={() => setSelectedPreviewItem(item)}
                      className="text-[10px] text-purple-300 flex items-center gap-0.5 hover:underline"
                    >
                      <Eye className="w-3 h-3" />
                      <span>3D Preview</span>
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => addToCart(item)}
                  className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/20"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Sticky Mobile Cart Bar */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-white/10 bg-slate-900/95 backdrop-blur-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white">{cart.length} items in cart</span>
                <p className="text-sm font-display font-bold text-cyan-400">
                  ৳{(grandTotal / 100).toLocaleString()}
                </p>
              </div>
            </div>

            <button
              onClick={() => alert('Order dispatched directly to kitchen KOT!')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-500/20"
            >
              <span>Place Order</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Real Interactive 3D Dish Showcase Modal */}
        {selectedPreviewItem && (
          <DishShowcaseModal
            item={selectedPreviewItem}
            onClose={() => setSelectedPreviewItem(null)}
          />
        )}
      </div>
    </div>
  );
};
