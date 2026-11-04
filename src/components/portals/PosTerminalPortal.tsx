import React, { useState } from 'react';
import { 
  Search, Flame, Plus, Minus, Trash2, Send, 
  CreditCard, Banknote, QrCode, Tag, Sparkles, AlertCircle, 
  CheckCircle2, LayoutGrid, Scissors, Printer, Calculator, 
  ArrowRightLeft, Percent, Layers 
} from 'lucide-react';
import { usePosStore } from '../../store/posStore';
import { MenuItem, Bill } from '../../types';
import { FloorPlanView } from '../floor/FloorPlanView';
import { ModifierSelectorModal } from '../modals/ModifierSelectorModal';
import { TableTransferModal } from '../modals/TableTransferModal';
import { SplitBillModal } from '../modals/SplitBillModal';
import { ReceiptPreviewModal } from '../modals/ReceiptPreviewModal';
import { SslCommerzModal } from '../modals/SslCommerzModal';
import { ShiftCloseModal } from '../modals/ShiftCloseModal';
import confetti from 'canvas-confetti';

export const PosTerminalPortal: React.FC = () => {
  const { 
    categories, menuItems, selectedCategoryId, setSelectedCategoryId,
    searchQuery, setSearchQuery, cart, addToCart, updateCartItemQuantity,
    removeCartItem, subtotal, discountPercentage, setDiscountPercentage,
    discountAmount, serviceChargeAmount, taxAmount, grandTotal,
    tables, selectedTableId, selectTable, fireCurrentOrderToKitchen,
    settlePayment, locale, toggle86Item, currentUser, addAuditLog
  } = usePosStore();

  // View state: 'MENU' or 'FLOOR'
  const [activeTab, setActiveTab] = useState<'MENU' | 'FLOOR'>('MENU');

  // Modals state
  const [activeModifierItem, setActiveModifierItem] = useState<MenuItem | null>(null);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [splitModalOpen, setSplitModalOpen] = useState(false);
  const [sslModalOpen, setSslModalOpen] = useState(false);
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [receiptBill, setReceiptBill] = useState<Bill | null>(null);

  // Promo code & cash tendered calculation
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoMsg, setPromoMsg] = useState<{ text: string; success: boolean } | null>(null);
  const [tenderedCash, setTenderedCash] = useState<number | null>(null);

  const selectedTable = tables.find((t) => t.id === selectedTableId);

  // Filter menu items by category and search
  const filteredItems = menuItems.filter((item) => {
    const matchesCat = selectedCategoryId === 'ALL' || item.categoryId === selectedCategoryId;
    const matchesQuery = !searchQuery || 
      item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameBn.includes(searchQuery) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleItemClick = (item: MenuItem) => {
    if (item.is86) return;
    // If item has modifier groups or variants, open customization modal
    if ((item.modifierGroups && item.modifierGroups.length > 0) || (item.variants && item.variants.length > 0)) {
      setActiveModifierItem(item);
    } else {
      addToCart(item);
    }
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCodeInput.trim().toUpperCase();
    if (code === 'VIP20') {
      setDiscountPercentage(20);
      setPromoMsg({ text: 'Promo VIP20 Applied (20% Off)', success: true });
    } else if (code === 'WELCOME10') {
      setDiscountPercentage(10);
      setPromoMsg({ text: 'Promo WELCOME10 Applied (10% Off)', success: true });
    } else if (code === 'RESTROWORKS' || code === 'NOVAPOS') {
      setDiscountPercentage(15);
      setPromoMsg({ text: 'Promo RESTROWORKS Applied (15% Off)', success: true });
    } else {
      setPromoMsg({ text: 'Invalid promo code', success: false });
    }
  };

  const handleCashTender = (cashMinor: number) => {
    setTenderedCash(cashMinor);
  };

  const handlePay = (method: string) => {
    if (cart.length === 0) return;
    if (method === 'SSLCOMMERZ') {
      setSslModalOpen(true);
      return;
    }

    const res = settlePayment(method);
    setReceiptBill(res.bill);
    setTenderedCash(null);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* 1. Left: Navigation Rail with Floor/Menu Tabs & Categories */}
      <div className="w-64 border-r border-white/10 glass-panel flex flex-col overflow-y-auto">
        {/* Floor vs Menu View Switcher */}
        <div className="p-3 border-b border-white/10 flex gap-1.5 bg-black/30">
          <button
            onClick={() => setActiveTab('MENU')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'MENU'
                ? 'bg-cyan-500 text-black font-bold shadow-glow-cyan'
                : 'text-slate-400 hover:text-white bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Menu Catalog</span>
          </button>

          <button
            onClick={() => setActiveTab('FLOOR')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'FLOOR'
                ? 'bg-cyan-500 text-black font-bold shadow-glow-cyan'
                : 'text-slate-400 hover:text-white bg-white/5'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Floor Plan</span>
          </button>
        </div>

        {/* Active Dine-In Table Pill & Transfer Trigger */}
        <div className="p-3 border-b border-white/10 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
              Active Table
            </label>
            <button
              onClick={() => setTransferModalOpen(true)}
              className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-mono"
            >
              <ArrowRightLeft className="w-3 h-3" />
              <span>Transfer</span>
            </button>
          </div>

          <select
            value={selectedTableId || ''}
            onChange={(e) => selectTable(e.target.value)}
            aria-label="Active Table Selection"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            {tables.map((t) => (
              <option key={t.id} value={t.id} className="bg-slate-900 text-slate-200">
                {t.number} - {t.name} ({t.status})
              </option>
            ))}
          </select>
        </div>

        {/* Categories Rail (When on Menu tab) */}
        {activeTab === 'MENU' && (
          <div className="p-2 space-y-1 flex-1">
            <button
              onClick={() => setSelectedCategoryId('ALL')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${
                selectedCategoryId === 'ALL'
                  ? 'bg-cyan-500 text-black shadow-glow-cyan font-bold'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>All Menu Items</span>
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${
                  selectedCategoryId === cat.id
                    ? 'bg-cyan-500 text-black shadow-glow-cyan font-bold'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <Flame className="w-4 h-4 opacity-75" />
                <div className="flex-1 truncate">
                  <div>{locale === 'en' ? cat.nameEn : cat.nameBn}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Shift Close Action at Rail Bottom */}
        <div className="p-3 border-t border-white/10 mt-auto bg-black/20">
          <button
            onClick={() => setShiftModalOpen(true)}
            className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 flex items-center justify-center gap-2 transition-all hover:border-cyan-500/40"
          >
            <Calculator className="w-3.5 h-3.5 text-cyan-400" />
            <span>Shift Z-Report Close</span>
          </button>
        </div>
      </div>

      {/* 2. Center: Either Menu Catalog or Visual Floor Plan */}
      {activeTab === 'FLOOR' ? (
        <FloorPlanView
          onOpenOrder={(tableId) => {
            selectTable(tableId);
            setActiveTab('MENU');
          }}
          onOpenTransfer={() => setTransferModalOpen(true)}
        />
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden bg-nova-bg/60">
          {/* Search Bar */}
          <div className="p-4 border-b border-white/10 flex items-center gap-3 glass-panel">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dishes by name, SKU, or Bengali..."
                className="w-full h-10 rounded-xl glass-input pl-9 pr-4 text-xs font-medium placeholder-slate-500"
              />
            </div>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              {filteredItems.length} items
            </span>
          </div>

          {/* Items Grid */}
          <div className="flex-1 p-4 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`group glass-panel rounded-2xl overflow-hidden border transition-all duration-200 flex flex-col relative ${
                  item.is86
                    ? 'opacity-50 cursor-not-allowed border-red-500/30'
                    : 'hover:border-cyan-500/60 hover:shadow-glow-cyan cursor-pointer active:scale-95'
                }`}
              >
                {/* Image with gradient scrim */}
                <div className="h-28 w-full relative overflow-hidden bg-slate-900">
                  <img
                    src={item.image}
                    alt={item.nameEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-nova-surface via-transparent to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md text-cyan-300 font-mono font-bold">
                      {item.station}
                    </span>
                    {item.modifierGroups && item.modifierGroups.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/80 text-white font-bold">
                        MODS
                      </span>
                    )}
                  </div>

                  {item.is86 && (
                    <div className="absolute inset-0 bg-red-950/80 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-xs font-bold text-red-200 uppercase tracking-widest px-2 py-1 border border-red-500 rounded">
                        SOLD OUT (86)
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 line-clamp-1 transition-colors">
                      {locale === 'en' ? item.nameEn : item.nameBn}
                    </h4>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {locale === 'en' ? item.descriptionEn : item.descriptionBn}
                    </p>
                  </div>

                  <div className="mt-2 flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-xs font-display font-bold text-cyan-400">
                      ৳{(item.basePrice / 100).toLocaleString()}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle86Item(item.id);
                      }}
                      title="Toggle 86 Sold Out status"
                      className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-mono"
                    >
                      {item.is86 ? 'Unhide' : '86'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Right: Live Cart, Split Bill, Discounts, Taxes, & Tender */}
      <div className="w-96 border-l border-white/10 glass-panel flex flex-col">
        {/* Cart Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm text-white">Active Order</span>
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-semibold">
                {selectedTable?.number || 'Counter'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">{cart.length} line items added</p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSplitModalOpen(true)}
              disabled={cart.length === 0}
              title="Split Bill N-Ways or by Item"
              className="p-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 disabled:opacity-30 disabled:pointer-events-none transition-all"
            >
              <Scissors className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={fireCurrentOrderToKitchen}
              disabled={cart.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all disabled:opacity-40 disabled:pointer-events-none shadow-lg shadow-amber-500/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send KOT</span>
            </button>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 p-3 overflow-y-auto space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <Sparkles className="w-8 h-8 text-slate-600 mb-2 animate-pulse" />
              <p className="text-xs font-medium">Cart is empty</p>
              <p className="text-[11px] text-slate-600 mt-1">Tap dishes on the catalog grid to build customer order.</p>
            </div>
          ) : (
            cart.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-white">
                        {locale === 'en' ? c.nameEn : c.nameBn}
                      </span>
                      {c.status === 'FIRED' && (
                        <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 font-mono">
                          FIRED
                        </span>
                      )}
                    </div>
                    {c.selectedModifiers.map((m, idx) => (
                      <span key={idx} className="text-[10px] text-amber-300 block">
                        + {m.nameEn}
                      </span>
                    ))}
                    <span className="text-xs font-display font-semibold text-cyan-400 mt-0.5 block">
                      ৳{(c.unitPrice / 100).toLocaleString()}
                    </span>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1.5 bg-black/40 rounded-lg p-1 border border-white/10">
                    <button
                      onClick={() => updateCartItemQuantity(c.id, -1)}
                      className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-mono font-bold text-white">
                      {c.quantity}
                    </span>
                    <button
                      onClick={() => updateCartItemQuantity(c.id, 1)}
                      className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pricing Summary & Tender Section */}
        <div className="p-4 border-t border-white/10 glass-panel space-y-2">
          {/* Coupon Code Input */}
          <form onSubmit={handleApplyPromo} className="flex gap-1.5">
            <input
              type="text"
              value={promoCodeInput}
              onChange={(e) => setPromoCodeInput(e.target.value)}
              placeholder="Promo Code (VIP20, WELCOME10)"
              className="flex-1 h-8 rounded-lg glass-input px-2.5 text-[11px] font-mono uppercase"
            />
            <button
              type="submit"
              className="px-3 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-bold text-white font-mono"
            >
              Apply
            </button>
          </form>

          {promoMsg && (
            <p className={`text-[10px] font-mono ${promoMsg.success ? 'text-emerald-400' : 'text-red-400'}`}>
              {promoMsg.text}
            </p>
          )}

          {/* Quick Discount Buttons */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-mono">DISCOUNT:</span>
            {[0, 5, 10, 15, 20].map((pct) => (
              <button
                key={pct}
                onClick={() => setDiscountPercentage(pct)}
                className={`flex-1 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                  discountPercentage === pct
                    ? 'bg-cyan-500 text-black'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>

          <div className="flex justify-between text-xs text-slate-400 pt-1">
            <span>Subtotal:</span>
            <span className="font-mono text-slate-200">৳{(subtotal / 100).toLocaleString()}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-xs text-emerald-400">
              <span>Discount ({discountPercentage}%):</span>
              <span className="font-mono">-৳{(discountAmount / 100).toLocaleString()}</span>
            </div>
          )}

          <div className="flex justify-between text-xs text-slate-400">
            <span>Service Charge (10%):</span>
            <span className="font-mono text-slate-200">৳{(serviceChargeAmount / 100).toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-xs text-slate-400">
            <span>VAT (15%):</span>
            <span className="font-mono text-slate-200">৳{(taxAmount / 100).toLocaleString()}</span>
          </div>

          <div className="pt-2 border-t border-white/10 flex justify-between items-baseline">
            <span className="text-sm font-bold text-white">Grand Total:</span>
            <span className="text-xl font-display font-bold text-cyan-400">
              ৳{(grandTotal / 100).toLocaleString()}
            </span>
          </div>

          {/* Quick Denominations for Cash Tender */}
          {cart.length > 0 && (
            <div className="pt-1">
              <span className="text-[10px] text-slate-400 font-mono block mb-1">CASH TENDER SHORTCUT:</span>
              <div className="flex gap-1">
                {[500, 1000, 2000, 5000].map((d) => (
                  <button
                    key={d}
                    onClick={() => handleCashTender(d * 100)}
                    className="flex-1 py-1 rounded bg-white/5 hover:bg-white/15 text-[10px] font-mono font-bold text-slate-300"
                  >
                    ৳{d}
                  </button>
                ))}
              </div>
              {tenderedCash && (
                <div className="mt-1 flex justify-between text-[11px] font-mono text-emerald-300 bg-emerald-500/10 p-1.5 rounded">
                  <span>Tendered: ৳{(tenderedCash / 100).toLocaleString()}</span>
                  <span>Change: ৳{Math.max(0, (tenderedCash - grandTotal) / 100).toFixed(2)}</span>
                </div>
              )}
            </div>
          )}

          {/* Payment Tender Actions */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <button
              onClick={() => handlePay('CASH')}
              disabled={cart.length === 0}
              className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-40 shadow-lg shadow-emerald-600/20"
            >
              <Banknote className="w-4 h-4" />
              <span>Cash</span>
            </button>
            <button
              onClick={() => handlePay('CARD')}
              disabled={cart.length === 0}
              className="py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-40 shadow-lg shadow-blue-600/20"
            >
              <CreditCard className="w-4 h-4" />
              <span>Card</span>
            </button>
            <button
              onClick={() => handlePay('SSLCOMMERZ')}
              disabled={cart.length === 0}
              className="py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-40 shadow-lg shadow-cyan-500/20"
            >
              <QrCode className="w-4 h-4" />
              <span>SSLCOMMERZ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeModifierItem && (
        <ModifierSelectorModal
          item={activeModifierItem}
          onClose={() => setActiveModifierItem(null)}
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
            // Receipt modal triggers
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
