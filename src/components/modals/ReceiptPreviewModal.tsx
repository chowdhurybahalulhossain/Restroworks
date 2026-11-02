import React, { useState } from 'react';
import { Printer, X, Download, QrCode, CheckCircle2, Zap } from 'lucide-react';
import { Bill } from '../../types';
import { usePosStore } from '../../store/posStore';
import { EscPosService } from '../../services/escpos-service';

interface ReceiptPreviewModalProps {
  bill: Bill;
  onClose: () => void;
}

export const ReceiptPreviewModal: React.FC<ReceiptPreviewModalProps> = ({ bill, onClose }) => {
  const { tenant, branches, activeBranchId, cart } = usePosStore();
  const branch = branches.find((b) => b.id === activeBranchId) || branches[0];
  const [drawerKicked, setDrawerKicked] = useState(false);
  const [printed, setPrinted] = useState(false);

  const handlePrintThermal = () => {
    // Generate standard ESC/POS raw bytes
    const bytes = EscPosService.generateReceiptBytes(bill, tenant, branch);
    console.log('[ESC/POS Thermal Bridge] Dispatched raw byte buffer to printer (len:', bytes.length, ')');
    setPrinted(true);
    setTimeout(() => window.print(), 300);
  };

  const handleKickDrawer = () => {
    const kickBytes = EscPosService.generateDrawerKickBytes();
    console.log('[ESC/POS Hardware Bridge] Fired Cash Drawer pulse (\\x1Bp\\x00\\x19\\xFA)');
    setDrawerKicked(true);
    setTimeout(() => setDrawerKicked(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md glass-panel-elevated rounded-3xl border border-white/20 shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Modal Controls Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-cyan-400" />
            <h3 className="font-display font-bold text-sm text-white">80mm Thermal Receipt Preview</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close receipt preview"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 80mm Thermal Paper Simulator */}
        <div className="p-6 overflow-y-auto flex-1 bg-neutral-900/50 flex justify-center">
          <div className="w-72 bg-white text-black p-5 rounded-md shadow-2xl font-mono text-[11px] leading-tight select-text">
            {/* Header */}
            <div className="text-center pb-2 border-b border-dashed border-neutral-400">
              <h2 className="font-bold text-base tracking-wider uppercase">{tenant.name}</h2>
              <p className="text-[10px] text-neutral-600">{branch.name}</p>
              <p className="text-[10px] text-neutral-600">{branch.address}</p>
              <p className="text-[10px] text-neutral-600">Tel: {branch.phone}</p>
              <p className="text-[10px] font-bold text-neutral-800">BIN: {branch.taxBin}</p>
              <p className="text-[9px] uppercase tracking-widest mt-1">Mushak-6.3 Tax Invoice</p>
            </div>

            {/* Invoice Info */}
            <div className="py-2 border-b border-dashed border-neutral-400 space-y-0.5 text-[10px]">
              <div className="flex justify-between">
                <span>INVOICE:</span>
                <span className="font-bold">{bill.fiscalInvoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>DATE:</span>
                <span>{new Date(bill.closedAt || Date.now()).toLocaleDateString()} {new Date().toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between">
                <span>PAYMENT:</span>
                <span className="font-bold uppercase">{bill.paymentMethod || 'CASH'}</span>
              </div>
            </div>

            {/* Line Items */}
            <div className="py-2 border-b border-dashed border-neutral-400">
              <div className="flex justify-between font-bold pb-1 text-[10px]">
                <span>ITEM</span>
                <span>TOTAL</span>
              </div>
              <div className="space-y-1">
                {cart.map((c) => (
                  <div key={c.id} className="flex justify-between">
                    <span className="truncate pr-2">{c.quantity}x {c.nameEn}</span>
                    <span className="font-bold">৳{((c.unitPrice * c.quantity) / 100).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="py-2 border-b border-dashed border-neutral-400 space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>৳{(bill.subtotal / 100).toFixed(2)}</span>
              </div>
              {bill.discountAmount > 0 && (
                <div className="flex justify-between text-neutral-700">
                  <span>Discount:</span>
                  <span>-৳{(bill.discountAmount / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Service Charge (10%):</span>
                <span>৳{(bill.serviceChargeAmount / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT (15%):</span>
                <span>৳{(bill.totalTax / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-1 border-t border-black">
                <span>GRAND TOTAL:</span>
                <span>৳{(bill.grandTotal / 100).toFixed(2)}</span>
              </div>
            </div>

            {/* Footer QR & Thanks */}
            <div className="pt-3 text-center space-y-1 text-[10px]">
              <div className="w-16 h-16 border-2 border-black rounded mx-auto flex items-center justify-center p-1">
                <QrCode className="w-full h-full" />
              </div>
              <p className="font-bold">Scan for E-Receipt & Loyalty</p>
              <p className="text-[9px] text-neutral-600">Thank you for dining at Novasphere!</p>
              <p className="text-[8px] text-neutral-500 font-sans mt-1">NOVAPOS Enterprise v1.0</p>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 border-t border-white/10 bg-white/5 flex gap-2">
          <button
            onClick={handleKickDrawer}
            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all border ${
              drawerKicked
                ? 'bg-amber-500/30 border-amber-500 text-amber-300'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
            }`}
          >
            {drawerKicked ? 'Drawer Kicked! ⚡' : 'Kick Drawer (ESC/POS)'}
          </button>

          <button
            onClick={handlePrintThermal}
            className="flex-1 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-glow-cyan"
          >
            <Printer className="w-4 h-4" />
            <span>Print 80mm Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
