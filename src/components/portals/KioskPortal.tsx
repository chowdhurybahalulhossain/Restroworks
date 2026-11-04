// ============================================================
// NOVAPOS Phase 4 — Self-Service Kiosk Portal
// Touchscreen UI with attract loop screensaver, dine-in/takeaway
// flow, touch category tiles, upsells, and kiosk token checkout.
// ============================================================

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, ShoppingBag, Utensils, Package, Plus, Minus, 
  Trash2, CreditCard, QrCode, Banknote, CheckCircle, 
  ChevronRight, ArrowLeft, RotateCcw, Eye, Flame, AlertCircle, Printer
} from 'lucide-react';
import { usePosStore } from '../../store/posStore';
import { MenuItem, MenuCategory } from '../../types';
import { DishShowcaseModal } from '../modals/DishShowcaseModal';
import { sound } from '../../services/soundFx';
import confetti from 'canvas-confetti';

export const KioskPortal: React.FC = () => {
  const { 
    menuItems, categories, cart, addToCart, removeCartItem, 
    updateCartItemQuantity, clearCart, grandTotal, subtotal, 
    taxAmount, fireCurrentOrderToKitchen, locale 
  } = usePosStore();

  // Kiosk Flow States: 'ATTRACT' | 'ORDER_TYPE' | 'MENU' | 'CHECKOUT' | 'SUCCESS'
  const [kioskState, setKioskState] = useState<'ATTRACT' | 'ORDER_TYPE' | 'MENU' | 'CHECKOUT' | 'SUCCESS'>('ATTRACT');
  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKEAWAY'>('DINE_IN');
  const [tableNumber, setTableNumber] = useState<string>('T-12');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selected3DItem, setSelected3DItem] = useState<MenuItem | null>(null);
  const [kioskToken, setKioskToken] = useState<string>('K-108');
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'QR' | 'COUNTER'>('CARD');
  const [idleTimer, setIdleTimer] = useState<number>(0);

  // Attract Loop Idle Timeout (resets to ATTRACT screen after 60s of total inactivity)
  useEffect(() => {
    if (kioskState === 'ATTRACT') return;
    const interval = setInterval(() => {
      setIdleTimer((prev) => {
        if (prev >= 60) {
          clearCart();
          setKioskState('ATTRACT');
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [kioskState, clearCart]);

  const resetIdle = () => setIdleTimer(0);

  const handleStart = () => {
    sound.playClick(900);
    clearCart();
    setKioskState('ORDER_TYPE');
    resetIdle();
  };

  const handleSelectOrderType = (type: 'DINE_IN' | 'TAKEAWAY') => {
    sound.playClick(850);
    setOrderType(type);
    setKioskState('MENU');
    resetIdle();
  };

  const handleCompletePayment = () => {
    sound.playCashSuccess();
    const tokenNum = `K-${Math.floor(100 + Math.random() * 900)}`;
    setKioskToken(tokenNum);
    fireCurrentOrderToKitchen();
    setKioskState('SUCCESS');
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });

    // Auto-return to attract loop after 8 seconds
    setTimeout(() => {
      clearCart();
      setKioskState('ATTRACT');
    }, 8000);
  };

  const filteredItems = activeCategory === 'all'
    ? menuItems
    : menuItems.filter((i) => i.categoryId === activeCategory);

  // ── 1. ATTRACT LOOP SCREENSAVER ───────────────────────────
  if (kioskState === 'ATTRACT') {
    return (
      <div
        onClick={handleStart}
        className="w-full h-full flex flex-col items-center justify-between p-12 bg-gradient-to-b from-[#07090e] via-[#0e131f] to-[#07090e] relative overflow-hidden cursor-pointer select-none"
      >
        {/* Futuristic Background Neon Rings & Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl pointer-events-none animate-pulse" />

        {/* Top Header */}
        <div className="z-10 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-cyan-400 mb-3">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin-slow" />
            <span>RESTROWORKS ENTERPRISE TOUCH KIOSK</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-extrabold text-white tracking-tight">
            Novasphere Bistro
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-mono">
            Artisanal Dining • Interactive 3D Gastronomy
          </p>
        </div>

        {/* Center Animated Attract Target */}
        <div className="z-10 flex flex-col items-center my-auto text-center">
          <div className="relative mb-8 group">
            {/* Pulsing Target Rings */}
            <div className="w-56 h-56 rounded-full border-2 border-cyan-400/40 animate-ping absolute inset-0 pointer-events-none" />
            <div className="w-56 h-56 rounded-full border-2 border-purple-500/50 animate-pulse absolute inset-0 pointer-events-none" />
            
            <div className="w-56 h-56 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 p-1 shadow-glow-cyan flex items-center justify-center transform group-hover:scale-105 transition-all duration-300">
              <div className="w-full h-full rounded-full bg-[#07090e] flex flex-col items-center justify-center p-6 text-center">
                <Utensils className="w-16 h-16 text-cyan-400 mb-2 animate-bounce" />
                <span className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider">
                  Touch Screen
                </span>
                <span className="text-base font-bold text-white mt-1">
                  Tap to Start
                </span>
              </div>
            </div>
          </div>

          <div className="inline-block px-8 py-4 rounded-2xl bg-cyan-500 text-black font-extrabold text-lg shadow-glow-cyan animate-pulse">
            START YOUR ORDER HERE
          </div>
          <p className="text-xs text-slate-500 font-mono mt-3">
            Supports Cashless NFC, Cards & Counter Settlement
          </p>
        </div>

        {/* Bottom Banner */}
        <div className="z-10 flex items-center gap-6 text-xs text-slate-400 font-mono">
          <span>ENGLISH / বাংলা</span>
          <span>•</span>
          <span>HALAL CERTIFIED</span>
          <span>•</span>
          <span>3D DISH INSPECTION</span>
        </div>
      </div>
    );
  }

  // ── 2. ORDER TYPE SELECTION (Dine In vs Takeaway) ──────────
  if (kioskState === 'ORDER_TYPE') {
    return (
      <div
        onMouseMove={resetIdle}
        className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#07090e] text-white select-none relative"
      >
        <button
          onClick={() => setKioskState('ATTRACT')}
          className="absolute top-8 left-8 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-2 text-sm text-slate-300"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Cancel</span>
        </button>

        <div className="text-center max-w-lg mb-12 animate-fade-in">
          <span className="text-xs font-mono text-cyan-400 uppercase font-bold tracking-widest">
            Step 1 of 3
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-extrabold text-white mt-2">
            Where will you be dining today?
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Choose your dining preference to customize food packaging & table service.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
          {/* Dine In Card */}
          <div
            onClick={() => handleSelectOrderType('DINE_IN')}
            className="p-8 rounded-3xl bg-gradient-to-b from-[#161d2e] to-[#0e131f] border-2 border-white/15 hover:border-cyan-400 hover:shadow-glow-cyan cursor-pointer transition-all duration-300 flex flex-col items-center text-center group"
          >
            <div className="w-24 h-24 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
              <Utensils className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Eat In (Dine-In)</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Freshly plated food served straight to your table by our hospitality crew.
            </p>
            <div className="w-full py-3 rounded-xl bg-cyan-500 text-black font-bold text-sm shadow-md group-hover:bg-cyan-400 transition-colors">
              Select Eat In
            </div>
          </div>

          {/* Takeaway Card */}
          <div
            onClick={() => handleSelectOrderType('TAKEAWAY')}
            className="p-8 rounded-3xl bg-gradient-to-b from-[#161d2e] to-[#0e131f] border-2 border-white/15 hover:border-purple-400 hover:shadow-glow-cyan cursor-pointer transition-all duration-300 flex flex-col items-center text-center group"
          >
            <div className="w-24 h-24 rounded-3xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
              <Package className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Takeaway (Pack & Go)</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Packed in eco-friendly insulated boxes, ready for pickup at our pass counter.
            </p>
            <div className="w-full py-3 rounded-xl bg-purple-600 text-white font-bold text-sm shadow-md group-hover:bg-purple-500 transition-colors">
              Select Takeaway
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── 3. MAIN TOUCH MENU & SHOPPING VIEW ────────────────────
  return (
    <div
      onMouseMove={resetIdle}
      className="w-full h-full flex flex-col lg:flex-row bg-[#07090e] text-white select-none overflow-hidden relative"
    >
      {/* Left: Category Rail & Menu Grid */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Kiosk Navigation Header */}
        <div className="p-4 bg-[#0e131f] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setKioskState('ORDER_TYPE')}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Novasphere Kiosk</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                  {orderType === 'DINE_IN' ? 'Eat In (Dine-In)' : 'Takeaway'}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sound.playClick(600);
                clearCart();
                setKioskState('ATTRACT');
              }}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-400 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Cancel Order</span>
            </button>
          </div>
        </div>

        {/* Horizontal Category Rail */}
        <div className="p-3 bg-[#0e131f]/60 border-b border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              sound.playClick(750);
              setActiveCategory('all');
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              activeCategory === 'all'
                ? 'bg-cyan-500 text-black shadow-glow-cyan'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
            }`}
          >
            All Signature Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                sound.playClick(750);
                setActiveCategory(cat.id);
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-cyan-500 text-black shadow-glow-cyan'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
              }`}
            >
              {locale === 'en' ? cat.nameEn : cat.nameBn}
            </button>
          ))}
        </div>

        {/* Menu Cards Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-3xl bg-[#0e131f] border border-white/10 hover:border-cyan-500/40 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Dish Image */}
                  <div className="w-full h-36 rounded-2xl overflow-hidden relative mb-3 bg-slate-900">
                    <img
                      src={item.image}
                      alt={item.nameEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* 3D Badge */}
                    <button
                      onClick={() => {
                        sound.playClick(900);
                        setSelected3DItem(item);
                      }}
                      className="absolute top-2 right-2 px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md text-[10px] font-mono text-cyan-300 border border-white/15 flex items-center gap-1 shadow-lg hover:border-cyan-400"
                    >
                      <Eye className="w-3 h-3 text-cyan-400" />
                      <span>3D View</span>
                    </button>
                  </div>

                  <h3 className="font-bold text-sm text-white line-clamp-1">
                    {locale === 'en' ? item.nameEn : item.nameBn}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono">
                    <span>{item.calories} kcal</span>
                    <span>•</span>
                    <span className="text-emerald-400">Halal</span>
                  </div>
                </div>

                {/* Bottom Price & Add Button */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="text-base font-extrabold text-cyan-300 font-mono">
                    ৳{(item.basePrice / 100).toLocaleString('en-BD', { minimumFractionDigits: 0 })}
                  </div>

                  <button
                    onClick={() => {
                      sound.playAddToCart();
                      addToCart(item);
                    }}
                    className="p-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center justify-center shadow-glow-cyan transition-all active:scale-95"
                  >
                    <Plus className="w-5 h-5 stroke-[3]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Kiosk Active Cart & Checkout Panel */}
      <div className="w-full lg:w-96 bg-[#0e131f] border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col justify-between h-auto lg:h-full">
        {/* Cart Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-white text-sm">Your Order</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold">
              {cart.length}
            </span>
          </div>
          {cart.length > 0 && (
            <button
              onClick={() => {
                sound.playClick(500);
                clearCart();
              }}
              className="text-xs text-rose-400 hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 p-6">
              <ShoppingBag className="w-12 h-12 mb-3 opacity-30 text-cyan-400" />
              <p className="text-sm font-semibold text-slate-400">Your tray is empty</p>
              <p className="text-xs text-slate-500 mt-1">Tap items on the left to add them to your order.</p>
            </div>
          ) : (
            cart.map((cartItem) => (
              <div
                key={cartItem.id}
                className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0 pr-3">
                  <h4 className="text-xs font-bold text-white truncate">{cartItem.nameEn}</h4>
                  <div className="text-xs font-mono font-bold text-cyan-400 mt-0.5">
                    ৳{((cartItem.unitPrice * cartItem.quantity) / 100).toLocaleString('en-BD', { minimumFractionDigits: 0 })}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      sound.playClick(500);
                      if (cartItem.quantity === 1) {
                        removeCartItem(cartItem.id);
                      } else {
                        updateCartItemQuantity(cartItem.id, -1);
                      }
                    }}
                    className="w-7 h-7 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-5 text-center font-mono font-bold text-xs text-white">
                    {cartItem.quantity}
                  </span>
                  <button
                    onClick={() => {
                      sound.playClick(700);
                      updateCartItemQuantity(cartItem.id, 1);
                    }}
                    className="w-7 h-7 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Totals & Checkout Button */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-white/10 bg-white/5 space-y-3">
            <div className="space-y-1.5 text-xs text-slate-400 font-mono">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>৳{(subtotal / 100).toLocaleString('en-BD', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT (15%)</span>
                <span>৳{(taxAmount / 100).toLocaleString('en-BD', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-white/10">
                <span>Total Amount</span>
                <span className="text-cyan-400">
                  ৳{(grandTotal / 100).toLocaleString('en-BD', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick(900);
                setKioskState('CHECKOUT');
              }}
              className="w-full py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-base shadow-glow-cyan flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <span>Proceed to Checkout</span>
              <ChevronRight className="w-5 h-5 stroke-[3]" />
            </button>
          </div>
        )}
      </div>

      {/* ── 4. CHECKOUT PAYMENT MODAL ───────────────────────── */}
      {kioskState === 'CHECKOUT' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg glass-panel-elevated rounded-3xl p-6 border border-white/20 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase font-bold">
                  Step 3 of 3
                </span>
                <h3 className="text-2xl font-bold text-white mt-0.5">Select Payment Method</h3>
              </div>
              <button
                onClick={() => setKioskState('MENU')}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>

            <div className="my-6 space-y-3">
              {[
                { id: 'CARD', label: 'Credit / Debit Card (NFC Tap & Chip)', icon: CreditCard, color: 'text-cyan-400' },
                { id: 'QR', label: 'bKash / Nagad / Upay QR Scan', icon: QrCode, color: 'text-purple-400' },
                { id: 'COUNTER', label: 'Pay Cash at Counter (Get Token)', icon: Banknote, color: 'text-emerald-400' },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = paymentMethod === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => {
                      sound.playClick(750);
                      setPaymentMethod(opt.id as any);
                    }}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-400 shadow-glow-cyan'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${opt.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-white text-sm">{opt.label}</div>
                      <div className="text-[11px] text-slate-400 font-mono">Instant automated confirmation</div>
                    </div>
                    {isSelected && <CheckCircle className="w-6 h-6 text-cyan-400" />}
                  </div>
                );
              })}
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between font-mono mb-6">
              <span className="text-xs text-slate-400">Total Charged</span>
              <span className="text-xl font-extrabold text-cyan-400">
                ৳{(grandTotal / 100).toLocaleString('en-BD', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <button
              onClick={handleCompletePayment}
              className="w-full py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-base shadow-glow-cyan flex items-center justify-center gap-2"
            >
              <span>Confirm & Print Order Slip</span>
              <ChevronRight className="w-5 h-5 stroke-[3]" />
            </button>
          </div>
        </div>
      )}

      {/* ── 5. SUCCESS TOKEN RECEIPT MODAL ──────────────────── */}
      {kioskState === 'SUCCESS' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm glass-panel-elevated rounded-3xl p-8 border border-cyan-500/50 text-center flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mb-4 shadow-glow-emerald animate-bounce">
              <CheckCircle className="w-10 h-10 stroke-[2.5]" />
            </div>

            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
              ORDER DISPATCHED TO KITCHEN
            </span>
            <h3 className="text-xl font-bold text-white mt-1">Thank You for Dining!</h3>
            <p className="text-xs text-slate-400 mt-1">
              {orderType === 'DINE_IN'
                ? 'Your meal is being prepared. Please take your seat.'
                : 'Please wait for your token to be called at the pass counter.'}
            </p>

            {/* Token Badge */}
            <div className="my-6 p-6 rounded-3xl bg-[#07090e] border-2 border-dashed border-cyan-400/60 w-full">
              <span className="text-[10px] font-mono uppercase text-slate-400">
                YOUR KIOSK PICKUP TOKEN
              </span>
              <div className="text-5xl font-mono font-black text-cyan-400 tracking-wider my-2">
                {kioskToken}
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                {orderType === 'DINE_IN' ? 'Table Order • Dine-In' : 'Takeaway Express'}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono mb-6">
              <Printer className="w-4 h-4 animate-pulse" />
              <span>Printing Thermal Receipt Slip...</span>
            </div>

            <button
              onClick={() => {
                sound.playClick(600);
                clearCart();
                setKioskState('ATTRACT');
              }}
              className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm"
            >
              Done / Return to Start
            </button>
          </div>
        </div>
      )}

      {/* 3D Dish Showcase Modal Trigger */}
      {selected3DItem && (
        <DishShowcaseModal
          item={selected3DItem}
          onClose={() => setSelected3DItem(null)}
        />
      )}
    </div>
  );
};
