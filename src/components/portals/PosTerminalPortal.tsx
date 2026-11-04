// ============================================================
// Restroworks — POS Terminal Portal
// Reimagined for effortless clarity, tactile speed, and
// beginner-friendly 1-2-3 visual flow.
// ============================================================

import React, { useState } from 'react';
import { 
  Search, Flame, Plus, Minus, Trash2, Send, 
  CreditCard, Banknote, QrCode, Tag, Sparkles, AlertCircle, 
  CheckCircle2, LayoutGrid, Scissors, Printer, Calculator, 
  ArrowRightLeft, Percent, Layers, Box, Info, X, ChevronDown, 
  ChevronUp, Utensils, HelpCircle, Eye, RefreshCw
} from 'lucide-react';
import { usePosStore } from '../../store/posStore';
import { MenuItem, Bill } from '../../types';
import { FloorPlanView } from '../floor/FloorPlanView';
import { FloorPlan3D } from '../3d/FloorPlan3D';
import { ModifierSelectorModal } from '../modals/ModifierSelectorModal';
import { TableTransferModal } from '../modals/TableTransferModal';
import { SplitBillModal } from '../modals/SplitBillModal';
import { ReceiptPreviewModal } from '../modals/ReceiptPreviewModal';
import { SslCommerzModal } from '../modals/SslCommerzModal';
import { ShiftCloseModal } from '../modals/ShiftCloseModal';
import { DishShowcaseModal } from '../modals/DishShowcaseModal';
import { sound } from '../../services/soundFx';
import confetti from 'canvas-confetti';

export const PosTerminalPortal: React.FC = () => {
  const { 
    categories, menuItems, selectedCategoryId, setSelectedCategoryId,
    searchQuery, setSearchQuery, cart, addToCart, updateCartItemQuantity,
    removeCartItem, subtotal, discountPercentage, setDiscountPercentage,
    discountAmount, serviceChargeAmount, taxAmount, grandTotal,
    tables, selectedTableId, selectTable, fireCurrentOrderToKitchen,
    settlePayment, locale, toggle86Item
  } = usePosStore();

  // Primary view switcher: Menu Ordering, 2D Floor Plan, or 3D Immersive Floor
  const [activeTab, setActiveTab] = useState<'MENU' | 'FLOOR_2D' | 'FLOOR_3D'>('MENU');

  // Interactive Modals
  const [activeModifierItem, setActiveModifierItem] = useState<MenuItem | null>(null);
  const [activeShowcaseItem, setActiveShowcaseItem] = useState<MenuItem | null>(null);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [splitModalOpen, setSplitModalOpen] = useState(false);
  const [sslModalOpen, setSslModalOpen] = useState(false);
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [receiptBill, setReceiptBill] = useState<Bill | null>(null);

  // Quick 1-2-3 guide visibility
  const [showGuide, setShowGuide] = useState(true);

  // Accordion drawer states
  const [showDiscountAccordion, setShowDiscountAccordion] = useState(false);
  const [showCashCalc, setShowCashCalc] = useState(false);
  const [tenderedCash, setTenderedCash] = useState<number | null>(null);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoMsg, setPromoMsg] = useState<{ text: string; success: boolean } | null>(null);

  // 86 Out-of-Stock manager mode toggle
  const [is86ManagerOpen, setIs86ManagerOpen] = useState(false);

  const selectedTable = tables.find((t) => t.id === selectedTableId);

  // Filtered menu items based on category and query
  const filteredItems = menuItems.filter((item) => {
    const matchesCat = selectedCategoryId === 'ALL' || item.categoryId === selectedCategoryId;
    const matchesQuery = !searchQuery || 
      item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameBn.includes(searchQuery) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleItemClick = (item: MenuItem) => {
    if (item.is86) {
      sound.playError();
      return;
    }
    // If item has modifiers or variants, open customization modal
    if ((item.modifierGroups && item.modifierGroups.length > 0) || (item.variants && item.variants.length > 0)) {
      sound.playClick();
      setActiveModifierItem(item);
    } else {
      sound.playAddToCart();
      addToCart(item);
    }
  };

  const handleApplyPromo = () => {
    const code = promoCodeInput.trim().toUpperCase();
    if (code === 'SAVE10' || code === 'WELCOME10') {
      setDiscountPercentage(10);
      setPromoMsg({ text: '10% Discount Applied!', success: true });
      sound.playCashSuccess();
    } else if (code === 'VIP20') {
      setDiscountPercentage(20);
      setPromoMsg({ text: '20% VIP Privilege Applied!', success: true });
      sound.playCashSuccess();
    } else if (code === 'HALF50') {
      setDiscountPercentage(50);
      setPromoMsg({ text: '50% Promo Applied!', success: true });
      sound.playCashSuccess();
    } else {
      setPromoMsg({ text: 'Invalid promo code. Try SAVE10 or VIP20', success: false });
      sound.playError();
    }
  };

  const handleFireKOT = () => {
    if (cart.length === 0) return;
    sound.playOrderFired();
    fireCurrentOrderToKitchen();
  };

  const handlePay = (method: 'CASH' | 'CARD' | 'SSLCOMMERZ') => {
    if (cart.length === 0) return;

    if (method === 'SSLCOMMERZ') {
      sound.playClick();
      setSslModalOpen(true);
      return;
    }

    sound.playCashSuccess();
    const res = settlePayment(method);
    if (res && res.bill) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#00f0ff', '#10b981', '#f59e0b', '#ec4899']
      });
      setReceiptBill(res.bill);
    }
  };

  const outOfStockCount = menuItems.filter((i) => i.is86).length;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full overflow-hidden bg-[#0a0d14] text-slate-100 select-none">
      
      {/* ─────────────────────────────────────────────────────────────
          TOP CONTROL STRIP: Context, Table Pill, Views & Shift
      ───────────────────────────────────────────────────────────── */}
      <header className="h-16 px-5 border-b border-white/10 bg-[#0d121c]/90 backdrop-blur-md flex items-center justify-between gap-4 z-20 shrink-0">
        
        {/* Left: Active Dining Table Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/40 transition-colors shadow-inner">
            <div className={`w-2.5 h-2.5 rounded-full ${
              selectedTable?.status === 'AVAILABLE' ? 'bg-emerald-400 shadow-glow-emerald' :
              selectedTable?.status === 'OCCUPIED' ? 'bg-blue-400' :
              selectedTable?.status === 'ORDERED' ? 'bg-amber-400 animate-pulse' : 'bg-purple-400'
            }`} />
            
            <select
              value={selectedTableId || ''}
              onChange={(e) => {
                selectTable(e.target.value);
                sound.playClick();
              }}
              aria-label="Active Table Selection"
              className="bg-transparent text-sm font-bold text-white focus:outline-none cursor-pointer pr-2"
            >
              {tables.map((t) => (
                <option key={t.id} value={t.id} className="bg-slate-900 text-slate-200">
                  {t.number} — {t.name} ({t.status})
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                sound.playClick();
                setTransferModalOpen(true);
              }}
              title="Transfer Order to Another Table"
              className="px-2 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold flex items-center gap-1 transition-all"
            >
              <ArrowRightLeft className="w-3 h-3" />
              <span>Transfer</span>
            </button>
          </div>

          {/* Quick Help Guide Toggle Button */}
          {!showGuide && (
            <button
              onClick={() => setShowGuide(true)}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-cyan-400 text-xs transition-all border border-white/5"
              title="Show 1-2-3 Beginner Guide"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>How to Use</span>
            </button>
          )}
        </div>

        {/* Center: View Switcher (Menu vs 2D Floor vs 3D Spatial Floor) */}
        <div className="flex items-center p-1 rounded-2xl bg-black/40 border border-white/10 shadow-inner">
          <button
            onClick={() => {
              setActiveTab('MENU');
              sound.playClick();
            }}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'MENU'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-glow-cyan'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Menu Catalog</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('FLOOR_2D');
              sound.playClick();
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'FLOOR_2D'
                ? 'bg-cyan-500 text-black font-bold shadow-glow-cyan'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>2D Floor</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('FLOOR_3D');
              sound.playClick();
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'FLOOR_3D'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-glow-purple'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-pink-300" />
            <span>3D Floor</span>
          </button>
        </div>

        {/* Right: Search, 86 Manager Pill & Shift Close */}
        <div className="flex items-center gap-3">
          {activeTab === 'MENU' && (
            <div className="relative w-56 hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search food, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* 86 Stock Manager Toggle */}
          <button
            onClick={() => {
              setIs86ManagerOpen(!is86ManagerOpen);
              sound.playClick();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              is86ManagerOpen 
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-glow-rose'
                : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
            }`}
            title="Toggle 86 / Out-of-Stock Manager Mode"
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>86 List</span>
            {outOfStockCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-black text-[10px] font-bold flex items-center justify-center">
                {outOfStockCount}
              </span>
            )}
          </button>

          {/* Shift Close / Register Balance */}
          <button
            onClick={() => {
              sound.playClick();
              setShiftModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition-all"
          >
            <Calculator className="w-3.5 h-3.5 text-amber-400" />
            <span>Shift Z-Report</span>
          </button>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          MAIN DUAL-PANE WORKSPACE: Left Catalog + Right Live Ticket
      ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* =========================================================
            ZONE 1: MENU CATALOG OR FLOOR PLAN VIEWS
        ========================================================= */}
        <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-[#0a0d14] to-[#07090e]">
          
          {/* View: 2D Floor Plan */}
          {activeTab === 'FLOOR_2D' && (
            <div className="flex-1 overflow-auto p-4">
              <FloorPlanView
                onOpenOrder={(tableId) => {
                  selectTable(tableId);
                  setActiveTab('MENU');
                }}
                onOpenTransfer={() => setTransferModalOpen(true)}
              />
            </div>
          )}

          {/* View: 3D Interactive Floor Plan */}
          {activeTab === 'FLOOR_3D' && (
            <div className="flex-1 w-full h-full relative">
              <FloorPlan3D
                tables={tables}
                selectedTableId={selectedTableId}
                onSelectTable={(tableId) => selectTable(tableId)}
                onOpenOrder={(tableId) => {
                  selectTable(tableId);
                  setActiveTab('MENU');
                }}
                onOpenTransfer={() => setTransferModalOpen(true)}
              />
            </div>
          )}

          {/* View: Menu Catalog (Default & Redesigned) */}
          {activeTab === 'MENU' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              
              {/* Beginner-Friendly 1-2-3 Step Flow Banner (Dismissible) */}
              {showGuide && (
                <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-purple-950/40 border border-cyan-500/25 flex items-center justify-between gap-4 shadow-lg animate-fade-in shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                        <span>How To Take An Order In 3 Easy Steps</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-200 font-mono">QUICK GUIDE</span>
                      </h4>
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-300 mt-1">
                        <span className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-cyan-500 text-black text-[10px] font-bold flex items-center justify-center">1</span>
                          <span>Select Dining Table</span>
                        </span>
                        <span className="text-slate-600 font-bold">&rarr;</span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-blue-500 text-black text-[10px] font-bold flex items-center justify-center">2</span>
                          <span>Tap any Dish to Add</span>
                        </span>
                        <span className="text-slate-600 font-bold">&rarr;</span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-emerald-500 text-black text-[10px] font-bold flex items-center justify-center">3</span>
                          <span>Send KOT & Settle Bill</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowGuide(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    title="Dismiss Guide"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Horizontal Category Pill Strip */}
              <div className="px-6 pt-4 pb-2 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
                <button
                  onClick={() => {
                    setSelectedCategoryId('ALL');
                    sound.playClick();
                  }}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                    selectedCategoryId === 'ALL'
                      ? 'bg-cyan-500 text-black shadow-glow-cyan font-bold scale-[1.02]'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>All Dishes</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    selectedCategoryId === 'ALL' ? 'bg-black/30 text-white' : 'bg-white/10 text-slate-400'
                  }`}>
                    {menuItems.length}
                  </span>
                </button>

                {categories.map((cat) => {
                  const itemCount = menuItems.filter((i) => i.categoryId === cat.id).length;
                  const isSelected = selectedCategoryId === cat.id;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategoryId(cat.id);
                        sound.playClick();
                      }}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'bg-cyan-500 text-black shadow-glow-cyan scale-[1.02]'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
                      }`}
                    >
                      <Flame className={`w-3.5 h-3.5 ${isSelected ? 'text-black' : 'text-amber-400'}`} />
                      <span>{locale === 'en' ? cat.nameEn : cat.nameBn}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        isSelected ? 'bg-black/30 text-white' : 'bg-white/10 text-slate-400'
                      }`}>
                        {itemCount}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* 86 Manager Mode Notice (When Activated) */}
              {is86ManagerOpen && (
                <div className="mx-6 my-2 p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-center justify-between text-xs text-rose-200">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span className="font-semibold">86 / Out-of-Stock Mode Active:</span>
                    <span className="text-rose-300">Tap on any dish card to toggle it available or sold out.</span>
                  </div>
                  <button
                    onClick={() => setIs86ManagerOpen(false)}
                    className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-[11px] font-bold"
                  >
                    Done
                  </button>
                </div>
              )}

              {/* Dish Cards Grid */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {filteredItems.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <Utensils className="w-12 h-12 text-slate-600 mb-3" />
                    <h3 className="text-base font-semibold text-slate-300">No dishes match your filter</h3>
                    <p className="text-xs text-slate-500 mt-1">Try another category or clear your search query.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredItems.map((item) => {
                      const is86 = item.is86;
                      const hasModifiers = (item.modifierGroups && item.modifierGroups.length > 0) || (item.variants && item.variants.length > 0);

                      return (
                        <div
                          key={item.id}
                          className={`group relative rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                            is86
                              ? 'bg-slate-900/40 border-rose-900/40 opacity-60'
                              : 'glass-card hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/5'
                          }`}
                        >
                          {/* Dish Image Banner with 3D Preview pill & Dietary Badges */}
                          <div 
                            onClick={() => {
                              sound.playClick();
                              setActiveShowcaseItem(item);
                            }}
                            className="relative h-32 w-full overflow-hidden bg-slate-950/80 cursor-pointer"
                          >
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.nameEn}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                onError={(e) => {
                                  // Fallback gradient if external image fails
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : null}

                            {/* Fallback decorative gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0d121c] via-transparent to-black/30 pointer-events-none" />

                            {/* Top Badges */}
                            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 pointer-events-none">
                              <span className="px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-mono font-semibold text-slate-300 border border-white/10">
                                {item.sku}
                              </span>

                              {/* 3D Inspect Trigger */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  sound.playClick();
                                  setActiveShowcaseItem(item);
                                }}
                                className="pointer-events-auto px-2.5 py-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-[11px] font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/40 transition-all hover:scale-105 active:scale-95"
                                title="Inspect in 3D Gastronomy & Nutrition"
                              >
                                <Box className="w-3.5 h-3.5" />
                                <span>3D View</span>
                              </button>
                            </div>

                            {/* 86 Overlay if sold out */}
                            {is86 && (
                              <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-2 text-center">
                                <span className="px-2.5 py-1 rounded-full bg-rose-500 text-black font-black text-xs tracking-wider uppercase shadow-lg">
                                  86 • SOLD OUT
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Card Content Body */}
                          <div className="p-3.5 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                                  {locale === 'en' ? item.nameEn : item.nameBn}
                                </h3>
                              </div>

                              <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                                {item.descriptionEn || 'Chef crafted fresh daily with premium ingredients.'}
                              </p>
                            </div>

                            {/* Bottom Row: Price + Add Button */}
                            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                              <div>
                                <span className="text-[10px] text-slate-500 uppercase font-mono block">Price</span>
                                <span className="font-mono font-bold text-sm text-cyan-400">
                                  ৳{(item.basePrice / 100).toFixed(0)}
                                </span>
                              </div>

                              {is86ManagerOpen ? (
                                <button
                                  onClick={() => {
                                    toggle86Item(item.id);
                                    sound.playClick();
                                  }}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    is86 
                                      ? 'bg-emerald-500 hover:bg-emerald-400 text-black' 
                                      : 'bg-rose-500 hover:bg-rose-400 text-black'
                                  }`}
                                >
                                  {is86 ? 'Restock' : 'Mark 86'}
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleItemClick(item)}
                                  disabled={is86}
                                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                                    is86
                                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                      : hasModifiers
                                      ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20'
                                      : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/20'
                                  }`}
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>{hasModifiers ? 'Customize' : 'Add'}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* =========================================================
            ZONE 2: LIVE ORDER TICKET & SETTLEMENT DRAWER
        ========================================================= */}
        <aside className="w-96 border-l border-white/10 bg-[#0c1017] flex flex-col shrink-0 shadow-2xl z-10">
          
          {/* Ticket Header */}
          <div className="p-4 border-b border-white/10 bg-[#0f141f] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm text-white">Live Order Ticket</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-mono font-bold border border-cyan-500/30">
                  {selectedTable?.number || 'Counter'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {cart.length === 0 ? 'Ready for new order' : `${cart.length} item${cart.length > 1 ? 's' : ''} in ticket`}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSplitModalOpen(true)}
                disabled={cart.length === 0}
                title="Split Bill N-Ways"
                className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <Scissors className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleFireKOT}
                disabled={cart.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all disabled:opacity-30 disabled:pointer-events-none shadow-md shadow-amber-500/20"
                title="Send Order to Kitchen Display System"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send KOT</span>
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mb-3">
                  <Utensils className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-semibold text-slate-300">Ticket is empty</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
                  Tap any delicious dish on the left catalog to start building your order.
                </p>
              </div>
            ) : (
              cart.map((cartItem) => (
                <div
                  key={cartItem.id}
                  className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/15 transition-all flex flex-col gap-2 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-white">
                          {locale === 'en' ? cartItem.nameEn : cartItem.nameBn}
                        </span>
                        {cartItem.variantName && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">
                            {cartItem.variantName}
                          </span>
                        )}
                      </div>

                      {/* Modifiers List */}
                      {cartItem.selectedModifiers && cartItem.selectedModifiers.length > 0 && (
                        <div className="text-[10px] text-cyan-400/80 font-mono mt-0.5">
                          + {cartItem.selectedModifiers.map((m) => m.nameEn).join(', ')}
                        </div>
                      )}
                    </div>

                    {/* Line Total */}
                    <span className="font-mono font-bold text-xs text-cyan-400 shrink-0">
                      ৳{((cartItem.unitPrice * cartItem.quantity) / 100).toFixed(0)}
                    </span>
                  </div>

                  {/* Quantity Stepper & Delete */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    <button
                      onClick={() => {
                        sound.playClick();
                        removeCartItem(cartItem.id);
                      }}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-2 bg-black/40 px-2 py-0.5 rounded-xl border border-white/5">
                      <button
                        onClick={() => {
                          sound.playClick();
                          updateCartItemQuantity(cartItem.id, -1);
                        }}
                        className="w-5 h-5 rounded-md flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <span className="font-mono text-xs font-bold text-white w-5 text-center">
                        {cartItem.quantity}
                      </span>

                      <button
                        onClick={() => {
                          sound.playAddToCart();
                          updateCartItemQuantity(cartItem.id, 1);
                        }}
                        className="w-5 h-5 rounded-md flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ─────────────────────────────────────────────────────────
              CART FOOTER: Discounts, Tax Breakdown & Tender Actions
          ───────────────────────────────────────────────────────── */}
          <div className="p-4 border-t border-white/10 bg-[#0f141f] space-y-3 shrink-0">
            
            {/* Promo & Discount Accordion Trigger */}
            <div className="border border-white/10 rounded-2xl p-2.5 bg-black/30">
              <button
                onClick={() => setShowDiscountAccordion(!showDiscountAccordion)}
                className="w-full flex items-center justify-between text-xs text-slate-300 hover:text-white font-semibold"
              >
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Promo Code & Manager Discount</span>
                  {discountPercentage > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold font-mono">
                      {discountPercentage}% OFF
                    </span>
                  )}
                </div>
                {showDiscountAccordion ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showDiscountAccordion && (
                <div className="mt-2.5 pt-2.5 border-t border-white/10 space-y-2 animate-fade-in">
                  <div className="flex gap-1.5">
                    {[0, 5, 10, 15, 20].map((pct) => (
                      <button
                        key={pct}
                        onClick={() => {
                          setDiscountPercentage(pct);
                          sound.playClick();
                        }}
                        className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          discountPercentage === pct
                            ? 'bg-cyan-500 text-black shadow-glow-cyan'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {pct === 0 ? 'None' : `${pct}%`}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. SAVE10 or VIP20"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      onClick={handleApplyPromo}
                      className="px-3 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold transition-all border border-cyan-500/30"
                    >
                      Apply
                    </button>
                  </div>

                  {promoMsg && (
                    <p className={`text-[10px] ${promoMsg.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {promoMsg.text}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Financial Summary */}
            <div className="space-y-1 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>৳{(subtotal / 100).toFixed(0)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount ({discountPercentage}%)</span>
                  <span>-৳{(discountAmount / 100).toFixed(0)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-400">
                <span>VAT (5% Audited)</span>
                <span>৳{(taxAmount / 100).toFixed(0)}</span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Service Charge (10%)</span>
                <span>৳{(serviceChargeAmount / 100).toFixed(0)}</span>
              </div>

              <div className="pt-2 border-t border-white/10 flex justify-between items-baseline font-sans">
                <span className="font-bold text-sm text-white">Grand Total</span>
                <span className="font-mono font-black text-xl text-cyan-400 drop-shadow-sm">
                  ৳{(grandTotal / 100).toFixed(0)}
                </span>
              </div>
            </div>

            {/* Fast Cash Calculator Accordion Trigger */}
            <button
              onClick={() => setShowCashCalc(!showCashCalc)}
              className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-mono"
            >
              <Calculator className="w-3 h-3" />
              <span>{showCashCalc ? 'Hide Cash Change Calculator' : 'Quick Cash Tender & Change Calculator'}</span>
            </button>

            {showCashCalc && (
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 space-y-2 animate-fade-in font-mono text-xs">
                <div className="flex gap-1.5">
                  {[500, 1000, 2000, 5000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setTenderedCash(amt * 100)}
                      className="flex-1 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-[11px]"
                    >
                      ৳{amt}
                    </button>
                  ))}
                </div>

                {tenderedCash !== null && (
                  <div className="flex justify-between text-xs pt-1 border-t border-white/10 font-bold">
                    <span className="text-slate-400">Change Due:</span>
                    <span className={tenderedCash >= grandTotal ? 'text-emerald-400' : 'text-rose-400'}>
                      {tenderedCash >= grandTotal
                        ? `৳${((tenderedCash - grandTotal) / 100).toFixed(0)}`
                        : `Short ৳${((grandTotal - tenderedCash) / 100).toFixed(0)}`}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Payment Settlement Action Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                onClick={() => handlePay('CASH')}
                disabled={cart.length === 0}
                className="py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-30 shadow-lg shadow-emerald-600/20 active:scale-95"
              >
                <Banknote className="w-4 h-4" />
                <span>Cash</span>
              </button>

              <button
                onClick={() => handlePay('CARD')}
                disabled={cart.length === 0}
                className="py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-30 shadow-lg shadow-blue-600/20 active:scale-95"
              >
                <CreditCard className="w-4 h-4" />
                <span>Card</span>
              </button>

              <button
                onClick={() => handlePay('SSLCOMMERZ')}
                disabled={cart.length === 0}
                className="py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-30 shadow-lg shadow-cyan-500/20 active:scale-95"
              >
                <QrCode className="w-4 h-4" />
                <span>SSLCOMMERZ</span>
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODALS & OVERLAYS
      ───────────────────────────────────────────────────────────── */}
      {activeModifierItem && (
        <ModifierSelectorModal
          item={activeModifierItem}
          onClose={() => setActiveModifierItem(null)}
        />
      )}

      {activeShowcaseItem && (
        <DishShowcaseModal
          item={activeShowcaseItem}
          onClose={() => setActiveShowcaseItem(null)}
        />
      )}

      {transferModalOpen && (
        <TableTransferModal onClose={() => setTransferModalOpen(false)} />
      )}

      {splitModalOpen && (
        <SplitBillModal
          onClose={() => setSplitModalOpen(false)}
          onConfirmSplit={(splits) => {
            alert(`Generated ${splits.length} split invoices!`);
          }}
        />
      )}

      {sslModalOpen && (
        <SslCommerzModal
          onClose={() => setSslModalOpen(false)}
          onSuccess={() => {
            // Receipt modal handled in modal flow
          }}
        />
      )}

      {shiftModalOpen && (
        <ShiftCloseModal onClose={() => setShiftModalOpen(false)} />
      )}

      {receiptBill && (
        <ReceiptPreviewModal
          bill={receiptBill}
          onClose={() => setReceiptBill(null)}
        />
      )}
    </div>
  );
};
