import React, { useState } from 'react';
import { 
  Search, Flame, Plus, Minus, Trash2, Send, 
  CreditCard, Banknote, QrCode, Tag, Sparkles, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { usePosStore } from '../../store/posStore';
import confetti from 'canvas-confetti';

export const PosTerminalPortal: React.FC = () => {
  const { 
    categories, menuItems, selectedCategoryId, setSelectedCategoryId,
    searchQuery, setSearchQuery, cart, addToCart, updateCartItemQuantity,
    removeCartItem, subtotal, discountPercentage, setDiscountPercentage,
    discountAmount, serviceChargeAmount, taxAmount, grandTotal,
    tables, selectedTableId, selectTable, fireCurrentOrderToKitchen,
    settlePayment, locale, toggle86Item, currentUser
  } = usePosStore();

  const [paymentSuccessModal, setPaymentSuccessModal] = useState<any | null>(null);

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

  const handlePay = (method: string) => {
    if (cart.length === 0) return;
    const res = settlePayment(method);
    setPaymentSuccessModal(res.bill);

    // Fire celebratory confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* 1. Left: Categories Rail & Floor Quick Table Bar */}
      <div className="w-64 border-r border-white/10 glass-panel flex flex-col overflow-y-auto">
        {/* Table Selector Header */}
        <div className="p-3 border-b border-white/10">
          <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
            Active Dine-In Table
          </label>
          <select
            value={selectedTableId || ''}
            onChange={(e) => selectTable(e.target.value)}
            aria-label="Active Dine-In Table Selector"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            {tables.map((t) => (
              <option key={t.id} value={t.id} className="bg-slate-900 text-slate-200">
                {t.number} - {t.name} ({t.status})
              </option>
            ))}
          </select>
        </div>

        {/* Categories Rail */}
        <div className="p-2 space-y-1">
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
      </div>

      {/* 2. Center: Search & Fast Item Catalog Grid */}
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
              onClick={() => !item.is86 && addToCart(item)}
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
                  {item.spiceLevel > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/80 text-white font-bold">
                      {'🌶️'.repeat(item.spiceLevel)}
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

      {/* 3. Right: Live Cart, Discount Rules, Tax Breakdown, & Settle */}
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
          <button
            onClick={fireCurrentOrderToKitchen}
            disabled={cart.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all disabled:opacity-40 disabled:pointer-events-none shadow-lg shadow-amber-500/20"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send KOT</span>
          </button>
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
                    <span className="text-xs font-display font-semibold text-cyan-400">
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

        {/* Pricing Summary & Discount Shortcuts */}
        <div className="p-4 border-t border-white/10 glass-panel space-y-2">
          {/* Quick Discount Buttons */}
          <div className="flex items-center gap-1 mb-2">
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

          <div className="flex justify-between text-xs text-slate-400">
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

      {/* Payment Success Invoice Modal */}
      {paymentSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm glass-panel-elevated rounded-3xl p-6 border border-emerald-500/40 shadow-2xl flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mb-4 shadow-glow-emerald">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-xl font-display font-bold text-white">Payment Settled</h3>
            <p className="text-xs text-slate-400 mt-1 font-mono">{paymentSuccessModal.fiscalInvoiceNumber}</p>

            <div className="w-full my-4 p-4 rounded-xl bg-white/5 border border-white/10 text-left space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Method:</span>
                <span className="font-bold text-white">{paymentSuccessModal.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Subtotal:</span>
                <span className="font-mono">৳{(paymentSuccessModal.subtotal / 100).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Tax & Service:</span>
                <span className="font-mono">৳{((paymentSuccessModal.totalTax + paymentSuccessModal.serviceChargeAmount) / 100).toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-emerald-400 text-sm">
                <span>Paid Total:</span>
                <span className="font-display">৳{(paymentSuccessModal.grandTotal / 100).toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => setPaymentSuccessModal(null)}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-lg shadow-emerald-500/20"
            >
              Done & New Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
