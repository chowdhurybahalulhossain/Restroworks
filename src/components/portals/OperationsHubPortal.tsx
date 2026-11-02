import React, { useState } from 'react';
import { 
  Boxes, BookOpen, Truck, Clock, Receipt, Plus, 
  AlertTriangle, CheckCircle2, TrendingUp, DollarSign, 
  ChevronRight, ArrowDownRight, ArrowUpRight, ShieldCheck, Flame 
} from 'lucide-react';
import { usePosStore } from '../../store/posStore';
import { ExpenseCategory } from '../../types';

export const OperationsHubPortal: React.FC = () => {
  const { 
    ingredients, recipes, wastageLogs, purchaseOrders, 
    staffAttendance, expenses, journalEntries, logWastage, 
    receivePurchaseOrder, punchStaffTimeClock, recordExpense 
  } = usePosStore();

  const [activeTab, setActiveTab] = useState<'INVENTORY' | 'RECIPES' | 'PURCHASING' | 'ATTENDANCE' | 'EXPENSES'>('INVENTORY');

  // Wastage Modal State
  const [wasteModalOpen, setWasteModalOpen] = useState(false);
  const [selectedIngId, setSelectedIngId] = useState(ingredients[0]?.id || '');
  const [wasteQty, setWasteQty] = useState(1);
  const [wasteReason, setWasteReason] = useState<'BURNT' | 'EXPIRED' | 'SPILLED' | 'QUALITY_DEFECT'>('EXPIRED');

  // Expense Modal State
  const [expModalOpen, setExpModalOpen] = useState(false);
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('PANTRY_PURCHASE');
  const [expAmount, setExpAmount] = useState(1500);
  const [expNotes, setExpNotes] = useState('');

  const handleConfirmWastage = (e: React.FormEvent) => {
    e.preventDefault();
    logWastage(selectedIngId, wasteQty, wasteReason);
    setWasteModalOpen(false);
  };

  const handleConfirmExpense = (e: React.FormEvent) => {
    e.preventDefault();
    recordExpense(expCategory, expAmount * 100, expNotes || `Operating expense for ${expCategory}`);
    setExpModalOpen(false);
    setExpNotes('');
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-nova-bg">
      {/* Top Operations Header & Tabs */}
      <div className="p-4 border-b border-white/10 glass-panel flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-black font-bold shadow-lg shadow-amber-500/20">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-base text-white">Operations & Back-of-House Hub</h2>
            <p className="text-xs text-slate-400">Inventory, Recipe BOM, Procurement, Staff Time Clock & Ledgers</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
          {[
            { id: 'INVENTORY', label: 'Inventory & Stock', icon: Boxes },
            { id: 'RECIPES', label: 'Recipe BOM', icon: BookOpen },
            { id: 'PURCHASING', label: 'Purchase Orders', icon: Truck },
            { id: 'ATTENDANCE', label: 'Staff Time Clock', icon: Clock },
            { id: 'EXPENSES', label: 'Expense Ledgers', icon: Receipt },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* TAB 1: INVENTORY & STOCK */}
        {activeTab === 'INVENTORY' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-display font-bold text-white">Raw Ingredients Master & Live Stock</h3>
                <p className="text-xs text-slate-400">Real-time par levels, automated sales depletion, and reorder alerts</p>
              </div>

              <button
                onClick={() => setWasteModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-2 transition-all"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Log Spoilage / Wastage</span>
              </button>
            </div>

            {/* Ingredients Table */}
            <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-mono">
                  <tr>
                    <th className="p-3.5 font-semibold">SKU & INGREDIENT</th>
                    <th className="p-3.5 font-semibold">UNIT COST</th>
                    <th className="p-3.5 font-semibold">CURRENT ON-HAND</th>
                    <th className="p-3.5 font-semibold">PAR LEVEL</th>
                    <th className="p-3.5 font-semibold">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {ingredients.map((ing) => {
                    const isLow = ing.currentStock <= ing.reorderPoint;
                    const stockPct = Math.min(100, Math.round((ing.currentStock / ing.parLevel) * 100));

                    return (
                      <tr key={ing.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-white text-xs">{ing.name}</div>
                          <span className="text-[10px] text-slate-400 font-mono">{ing.sku}</span>
                        </td>
                        <td className="p-3.5 font-mono text-cyan-300">
                          ৳{(ing.costPerUnit / 100).toLocaleString()} / {ing.unit}
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white text-sm">
                              {ing.currentStock} {ing.unit}
                            </span>
                          </div>
                          <div className="w-32 h-1.5 rounded-full bg-white/10 mt-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isLow ? 'bg-red-500' : 'bg-emerald-400'}`}
                              style={{ width: `${stockPct}%` }}
                            />
                          </div>
                        </td>
                        <td className="p-3.5 font-mono text-slate-400">
                          {ing.parLevel} {ing.unit} (Reorder at: {ing.reorderPoint})
                        </td>
                        <td className="p-3.5">
                          {isLow ? (
                            <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-mono font-bold flex items-center gap-1 w-max">
                              <AlertTriangle className="w-3 h-3" />
                              <span>LOW STOCK</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold w-max block">
                              HEALTHY
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Wastage Logs Table */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10">
              <h4 className="text-sm font-display font-bold text-white mb-1">Recent Spoilage & Wastage Disclosures</h4>
              <p className="text-xs text-slate-400 mb-3">Kitchen losses posted directly to COGS general ledger</p>

              <div className="space-y-2">
                {wastageLogs.map((w) => (
                  <div key={w.id} className="p-3 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-white">{w.quantity} {w.unit} of {w.ingredientName}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        Reason: <strong className="text-red-400">{w.reason}</strong> • Reported by: {w.reportedByName}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-red-400">
                      -৳{(w.cost / 100).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RECIPES & BOM */}
        {activeTab === 'RECIPES' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-display font-bold text-white">Bill of Materials (BOM) & Recipe Engineering</h3>
              <p className="text-xs text-slate-400">Ingredient breakdown and yield costing per menu item</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recipes.map((rec) => {
                // Calculate recipe total ingredient cost
                const recipeCost = rec.lines.reduce((sum, line) => {
                  const ing = ingredients.find((i) => i.id === line.ingredientId);
                  return sum + (ing ? Math.round(line.quantity * ing.costPerUnit * (1 + line.wastagePct / 100)) : 0);
                }, 0);

                return (
                  <div key={rec.id} className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
                    <div className="flex items-start justify-between border-b border-white/10 pb-3">
                      <div>
                        <h4 className="font-display font-bold text-sm text-white">{rec.menuItemName}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">Yield: {rec.yieldServings} Serving</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-mono block">THEORETICAL COGS:</span>
                        <span className="font-display font-bold text-cyan-400 text-sm">
                          ৳{(recipeCost / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                        INGREDIENTS BREAKDOWN:
                      </span>
                      {rec.lines.map((line, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-white/5 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-semibold text-slate-200">{line.ingredientName}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              Wastage Allowance: {line.wastagePct}%
                            </span>
                          </div>
                          <span className="font-mono text-cyan-300 font-bold">
                            {line.quantity} {line.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: PURCHASING & GRN */}
        {activeTab === 'PURCHASING' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-display font-bold text-white">Purchase Orders & Goods Receipt (GRN)</h3>
                <p className="text-xs text-slate-400">Supplier deliveries and automated pantry restock intake</p>
              </div>
            </div>

            <div className="space-y-4">
              {purchaseOrders.map((po) => (
                <div key={po.id} className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-base text-white">{po.poNumber}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                          po.status === 'RECEIVED'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {po.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">Supplier: <strong>{po.supplierName}</strong></p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-mono block">TOTAL INVOICE:</span>
                        <span className="font-display font-bold text-cyan-400 text-base">
                          ৳{(po.totalCost / 100).toLocaleString()}
                        </span>
                      </div>

                      {po.status === 'SUBMITTED' && (
                        <button
                          onClick={() => receivePurchaseOrder(po.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-glow-emerald"
                        >
                          Receive Goods (GRN)
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {po.items.map((it, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex justify-between">
                        <span>{it.quantity} {it.unit} of {it.ingredientName}</span>
                        <span className="font-mono text-slate-300">৳{(it.totalCost / 100).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: STAFF ATTENDANCE */}
        {activeTab === 'ATTENDANCE' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-display font-bold text-white">Staff Time Clock & Attendance Roster</h3>
              <p className="text-xs text-slate-400">Daily punch-in, break tracking, and duty status</p>
            </div>

            <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-mono">
                  <tr>
                    <th className="p-3.5 font-semibold">STAFF MEMBER</th>
                    <th className="p-3.5 font-semibold">DESIGNATION</th>
                    <th className="p-3.5 font-semibold">CLOCK IN</th>
                    <th className="p-3.5 font-semibold">BREAK TIME</th>
                    <th className="p-3.5 font-semibold">STATUS</th>
                    <th className="p-3.5 font-semibold text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {staffAttendance.map((att) => (
                    <tr key={att.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3.5 font-bold text-white">{att.userName}</td>
                      <td className="p-3.5 text-slate-300">{att.role}</td>
                      <td className="p-3.5 font-mono text-cyan-300">{att.clockIn}</td>
                      <td className="p-3.5 font-mono text-slate-400">{att.breakMinutes} mins</td>
                      <td className="p-3.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                          att.status === 'ON_DUTY'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : att.status === 'ON_BREAK'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-white/10 text-slate-400'
                        }`}>
                          {att.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1.5">
                        {att.status === 'ON_DUTY' ? (
                          <>
                            <button
                              onClick={() => punchStaffTimeClock(att.userId, 'BREAK')}
                              className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-[10px] text-amber-300 font-mono"
                            >
                              Break
                            </button>
                            <button
                              onClick={() => punchStaffTimeClock(att.userId, 'OUT')}
                              className="px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-[10px] text-red-300 font-mono"
                            >
                              Clock Out
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => punchStaffTimeClock(att.userId, 'IN')}
                            className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-[10px] text-emerald-300 font-mono"
                          >
                            Clock In
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: EXPENSE LEDGERS & GENERAL JOURNAL */}
        {activeTab === 'EXPENSES' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-display font-bold text-white">Petty Cash Vouchers & General Journal</h3>
                <p className="text-xs text-slate-400">Automated double-entry accounting entries for financial compliance</p>
              </div>

              <button
                onClick={() => setExpModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold flex items-center gap-2 transition-all shadow-glow-cyan"
              >
                <Plus className="w-4 h-4" />
                <span>Create Expense Voucher</span>
              </button>
            </div>

            {/* Expenses List */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
              <h4 className="text-sm font-display font-bold text-white">Disbursed Expense Vouchers</h4>
              <div className="space-y-2">
                {expenses.map((e) => (
                  <div key={e.id} className="p-3 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white font-mono">{e.voucherNumber}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-cyan-300 font-mono">
                          {e.category}
                        </span>
                      </div>
                      <p className="text-slate-300 mt-0.5">{e.notes}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-display font-bold text-white text-sm">৳{(e.amount / 100).toLocaleString()}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">Approved: {e.approvedByName}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Double-Entry Journal Entries */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10">
              <h4 className="text-sm font-display font-bold text-white mb-1">Double-Entry Accounting Journal</h4>
              <p className="text-xs text-slate-400 mb-3">Auto-posted debits and credits from operational transactions</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-white/5 border-b border-white/10 text-slate-400">
                    <tr>
                      <th className="p-2.5 font-semibold">DATE & REF</th>
                      <th className="p-2.5 font-semibold">ACCOUNT</th>
                      <th className="p-2.5 font-semibold text-right">DEBIT (BDT)</th>
                      <th className="p-2.5 font-semibold text-right">CREDIT (BDT)</th>
                      <th className="p-2.5 font-semibold">NARRATION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {journalEntries.slice(0, 8).map((je) => (
                      <tr key={je.id} className="hover:bg-white/5">
                        <td className="p-2.5 text-slate-400">{je.date} • {je.refId}</td>
                        <td className="p-2.5 font-semibold text-white">{je.accountName}</td>
                        <td className="p-2.5 text-right font-bold text-cyan-300">
                          {je.debit > 0 ? `৳${(je.debit / 100).toLocaleString()}` : '-'}
                        </td>
                        <td className="p-2.5 text-right font-bold text-emerald-300">
                          {je.credit > 0 ? `৳${(je.credit / 100).toLocaleString()}` : '-'}
                        </td>
                        <td className="p-2.5 text-slate-400 truncate max-w-xs">{je.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Wastage Logger Modal */}
      {wasteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md glass-panel-elevated rounded-3xl p-6 border border-red-500/40 shadow-2xl flex flex-col">
            <h3 className="font-display font-bold text-base text-white mb-1">Log Kitchen Spoilage / Wastage</h3>
            <p className="text-xs text-slate-400 mb-4">Stock will be deducted and cost recognized as operational loss</p>

            <form onSubmit={handleConfirmWastage} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-mono mb-1">Select Ingredient:</label>
                <select
                  value={selectedIngId}
                  onChange={(e) => setSelectedIngId(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-white"
                >
                  {ingredients.map((i) => (
                    <option key={i.id} value={i.id} className="bg-slate-900 text-white">
                      {i.name} ({i.currentStock} {i.unit} in stock)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Quantity Spoiled / Wasted:</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={wasteQty}
                  onChange={(e) => setWasteQty(parseFloat(e.target.value) || 0)}
                  className="w-full glass-input rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Reason Code:</label>
                <select
                  value={wasteReason}
                  onChange={(e) => setWasteReason(e.target.value as any)}
                  className="w-full glass-input rounded-xl p-2.5 text-white"
                >
                  <option value="BURNT" className="bg-slate-900">BURNT (Kitchen Prep Overcooked)</option>
                  <option value="EXPIRED" className="bg-slate-900">EXPIRED (Shelf Life Reached)</option>
                  <option value="SPILLED" className="bg-slate-900">SPILLED (Accidental Drop)</option>
                  <option value="QUALITY_DEFECT" className="bg-slate-900">QUALITY DEFECT (Vendor Returned)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWasteModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold"
                >
                  Confirm & Deduct Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Voucher Modal */}
      {expModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md glass-panel-elevated rounded-3xl p-6 border border-cyan-500/40 shadow-2xl flex flex-col">
            <h3 className="font-display font-bold text-base text-white mb-1">Record Petty Cash Expense</h3>
            <p className="text-xs text-slate-400 mb-4">Post expense voucher with instant double-entry accounting</p>

            <form onSubmit={handleConfirmExpense} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-mono mb-1">Expense Category:</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as any)}
                  className="w-full glass-input rounded-xl p-2.5 text-white"
                >
                  <option value="PANTRY_PURCHASE" className="bg-slate-900">PANTRY PURCHASE (Daily Market)</option>
                  <option value="UTILITIES" className="bg-slate-900">UTILITIES (Power, Gas, Internet)</option>
                  <option value="MAINTENANCE" className="bg-slate-900">MAINTENANCE (Kitchen Equipment)</option>
                  <option value="CLEANING" className="bg-slate-900">CLEANING (Chemicals & Supplies)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Amount (BDT):</label>
                <input
                  type="number"
                  min="1"
                  value={expAmount}
                  onChange={(e) => setExpAmount(parseInt(e.target.value) || 0)}
                  className="w-full glass-input rounded-xl p-2.5 text-white font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Notes / Description:</label>
                <input
                  type="text"
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  placeholder="e.g. Purchased fresh mint and ginger from bazaar"
                  className="w-full glass-input rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setExpModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold shadow-glow-cyan"
                >
                  Authorize Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
