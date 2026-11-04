import React, { useState } from 'react';
import {
  Calendar, Clock, Users, Phone, CheckCircle, XCircle,
  AlertCircle, ChevronRight, Plus, Search, Filter,
  Utensils, Bell, ArrowRight, ClipboardList, Coffee
} from 'lucide-react';
import { useCrmStore } from '../../store/crmStore';
import { Reservation, ReservationStatus, WaitlistEntry } from '../../types/crm';

// ─── Status config ────────────────────────────────────────
const RES_STATUS_CONFIG: Record<ReservationStatus, { color: string; bg: string; label: string }> = {
  PENDING:    { color: 'text-yellow-400',  bg: 'bg-yellow-900/30 border-yellow-600/40',  label: 'Pending'    },
  CONFIRMED:  { color: 'text-cyan-400',    bg: 'bg-cyan-900/30 border-cyan-500/40',      label: 'Confirmed'  },
  SEATED:     { color: 'text-emerald-400', bg: 'bg-emerald-900/30 border-emerald-600/40',label: 'Seated'     },
  COMPLETED:  { color: 'text-gray-400',    bg: 'bg-gray-800/40 border-gray-600/40',      label: 'Completed'  },
  CANCELLED:  { color: 'text-red-400',     bg: 'bg-red-900/30 border-red-600/40',        label: 'Cancelled'  },
  NO_SHOW:    { color: 'text-orange-400',  bg: 'bg-orange-900/30 border-orange-600/40',  label: 'No Show'    },
};

// ─── New Reservation Form ─────────────────────────────────
const NewReservationModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { createReservation } = useCrmStore();
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    guestCount: 2,
    date: new Date().toISOString().slice(0, 10),
    timeSlot: '19:00',
    specialRequests: '',
    source: 'PHONE' as Reservation['source'],
  });

  const handleCreate = () => {
    if (!form.customerName || !form.customerPhone) return;
    createReservation({
      branchId: 'branch-01',
      ...form,
      durationMinutes: 90,
      depositPaid: 0,
      status: 'CONFIRMED',
      reminderSent: false,
      confirmedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0E131F] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Plus className="w-5 h-5 text-cyan-400" /> New Reservation
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-xs text-gray-400 mb-1 block">Customer Name *</label>
            <input className="w-full bg-[#161D2E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
              placeholder="Full name" value={form.customerName}
              onChange={(e) => setForm(f => ({ ...f, customerName: e.target.value }))} />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-gray-400 mb-1 block">Phone *</label>
            <input className="w-full bg-[#161D2E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
              placeholder="01711-xxxxxx" value={form.customerPhone}
              onChange={(e) => setForm(f => ({ ...f, customerPhone: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Date</label>
            <input type="date" className="w-full bg-[#161D2E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
              value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Time</label>
            <select className="w-full bg-[#161D2E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
              value={form.timeSlot} onChange={(e) => setForm(f => ({ ...f, timeSlot: e.target.value }))}>
              {['12:00','12:30','13:00','13:30','14:00','18:00','18:30','19:00','19:30','20:00','20:30','21:00','21:30'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Guests</label>
            <input type="number" min={1} max={20} className="w-full bg-[#161D2E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
              value={form.guestCount} onChange={(e) => setForm(f => ({ ...f, guestCount: +e.target.value }))} />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Source</label>
            <select className="w-full bg-[#161D2E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
              value={form.source} onChange={(e) => setForm(f => ({ ...f, source: e.target.value as Reservation['source'] }))}>
              <option value="PHONE">Phone</option>
              <option value="ONLINE">Online</option>
              <option value="WALK_IN">Walk-in</option>
              <option value="QR">QR Code</option>
              <option value="STAFF">Staff</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-xs text-gray-400 mb-1 block">Special Requests</label>
            <textarea className="w-full bg-[#161D2E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none"
              rows={2} placeholder="Allergies, celebrations, seat preferences..."
              value={form.specialRequests} onChange={(e) => setForm(f => ({ ...f, specialRequests: e.target.value }))} />
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-white/10 text-gray-400 text-sm hover:bg-white/5">Cancel</button>
          <button onClick={handleCreate} className="flex-1 py-2 rounded-xl bg-cyan-500 text-black font-bold text-sm hover:bg-cyan-400">
            Confirm Reservation
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Reservation Card ─────────────────────────────────────
const ReservationCard: React.FC<{ res: Reservation }> = ({ res }) => {
  const { updateReservationStatus } = useCrmStore();
  const cfg = RES_STATUS_CONFIG[res.status];

  const actionButtons: { label: string; status: ReservationStatus; color: string }[] = [];
  if (res.status === 'PENDING')   actionButtons.push({ label: 'Confirm', status: 'CONFIRMED', color: 'bg-cyan-500 text-black' });
  if (res.status === 'CONFIRMED') actionButtons.push({ label: '✓ Seat', status: 'SEATED', color: 'bg-emerald-500 text-black' });
  if (res.status === 'SEATED')    actionButtons.push({ label: 'Complete', status: 'COMPLETED', color: 'bg-gray-600 text-white' });
  if (['PENDING','CONFIRMED'].includes(res.status)) actionButtons.push({ label: 'Cancel', status: 'CANCELLED', color: 'bg-red-900/60 text-red-300' });

  return (
    <div className="bg-[#0E131F] border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">{res.customerName}</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.color} ${cfg.bg}`}>
              {cfg.label}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{res.reservationNumber}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-white">{res.timeSlot}</div>
          <div className="text-xs text-gray-500">{res.date}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-3">
        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{res.guestCount} guests</span>
        <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{res.customerPhone}</span>
        {res.tableName && <span className="flex items-center gap-1"><Utensils className="w-3 h-3" />{res.tableName}</span>}
        {res.assignedWaiterName && <span className="text-gray-500">👤 {res.assignedWaiterName}</span>}
      </div>

      {res.specialRequests && (
        <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg px-3 py-2 text-xs text-yellow-200 mb-3">
          📝 {res.specialRequests}
        </div>
      )}

      {res.depositPaid > 0 && (
        <div className="text-xs text-emerald-400 mb-2">✓ Deposit: ৳{(res.depositPaid / 100).toFixed(0)} paid</div>
      )}

      {actionButtons.length > 0 && (
        <div className="flex gap-2">
          {actionButtons.map((btn) => (
            <button key={btn.status}
              onClick={() => updateReservationStatus(res.id, btn.status)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80 ${btn.color}`}>
              {btn.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Waitlist Panel ───────────────────────────────────────
const WaitlistPanel: React.FC = () => {
  const { getActiveWaitlist, notifyWaitlistEntry, seatWaitlistEntry, removeFromWaitlist, addToWaitlist } = useCrmStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ customerName: '', customerPhone: '', guestCount: 2, estimatedWaitMinutes: 20 });
  const waitlist = getActiveWaitlist();

  const handleAdd = () => {
    if (!form.customerName || !form.customerPhone) return;
    addToWaitlist({ branchId: 'branch-01', ...form, partyType: 'ANY' });
    setForm({ customerName: '', customerPhone: '', guestCount: 2, estimatedWaitMinutes: 20 });
    setShowAdd(false);
  };

  const getWaitMinutes = (entry: WaitlistEntry) =>
    Math.round((Date.now() - new Date(entry.addedAt).getTime()) / 60000);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-orange-400" /> Live Waitlist ({waitlist.length})
        </h3>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1 text-xs bg-orange-900/40 border border-orange-600/30 text-orange-300 px-3 py-1.5 rounded-lg hover:bg-orange-900/60">
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>

      {showAdd && (
        <div className="bg-[#0E131F] border border-orange-500/20 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <input className="w-full bg-[#161D2E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none" placeholder="Customer name *"
                value={form.customerName} onChange={(e) => setForm(f => ({ ...f, customerName: e.target.value }))} />
            </div>
            <input className="bg-[#161D2E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none" placeholder="Phone *"
              value={form.customerPhone} onChange={(e) => setForm(f => ({ ...f, customerPhone: e.target.value }))} />
            <input type="number" min={1} max={20} className="bg-[#161D2E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" placeholder="Guests"
              value={form.guestCount} onChange={(e) => setForm(f => ({ ...f, guestCount: +e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAdd(false)} className="flex-1 py-1.5 rounded-lg border border-white/10 text-gray-400 text-xs">Cancel</button>
            <button onClick={handleAdd} className="flex-1 py-1.5 rounded-lg bg-orange-500 text-black font-bold text-xs">Add to Waitlist</button>
          </div>
        </div>
      )}

      {waitlist.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">
          <Coffee className="w-8 h-8 mx-auto mb-2 opacity-30" />
          No customers waiting
        </div>
      ) : waitlist.map((entry, idx) => {
        const waited = getWaitMinutes(entry);
        const isLong = waited > (entry.estimatedWaitMinutes || 20);

        return (
          <div key={entry.id} className={`bg-[#0E131F] border rounded-xl p-4 ${isLong ? 'border-red-500/30' : 'border-white/5'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold text-white">
                  {idx + 1}
                </span>
                <span className="text-sm font-semibold text-white">{entry.customerName}</span>
                {entry.status === 'NOTIFIED' && (
                  <span className="text-[10px] bg-blue-900/40 border border-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full">Notified</span>
                )}
              </div>
              <div className={`text-sm font-bold ${isLong ? 'text-red-400' : 'text-orange-400'}`}>
                {waited}m
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
              <span><Users className="w-3 h-3 inline mr-1" />{entry.guestCount} guests</span>
              <span><Phone className="w-3 h-3 inline mr-1" />{entry.customerPhone}</span>
              <span>Est. {entry.estimatedWaitMinutes}m</span>
            </div>
            {entry.notes && (
              <p className="text-xs text-gray-500 mb-3 italic">{entry.notes}</p>
            )}
            <div className="flex gap-2">
              {entry.status === 'WAITING' && (
                <button onClick={() => notifyWaitlistEntry(entry.id)}
                  className="flex-1 py-1.5 rounded-lg bg-blue-900/40 border border-blue-500/30 text-blue-300 text-xs font-semibold hover:bg-blue-900/60">
                  <Bell className="w-3 h-3 inline mr-1" />Notify
                </button>
              )}
              <button onClick={() => seatWaitlistEntry(entry.id)}
                className="flex-1 py-1.5 rounded-lg bg-emerald-900/40 border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-900/60">
                <CheckCircle className="w-3 h-3 inline mr-1" />Seat
              </button>
              <button onClick={() => removeFromWaitlist(entry.id)}
                className="py-1.5 px-3 rounded-lg bg-red-900/30 border border-red-600/30 text-red-400 text-xs hover:bg-red-900/50">
                <XCircle className="w-3 h-3" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Main Reservation Portal ──────────────────────────────
export const ReservationPortal: React.FC = () => {
  const {
    getReservationsForDate, setReservationDateFilter, reservationDateFilter,
    getCrmDashboardMetrics,
  } = useCrmStore();

  const [showNewModal, setShowNewModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'reservations' | 'waitlist'>('reservations');
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'ALL'>('ALL');

  const metrics = getCrmDashboardMetrics();
  const allForDate = getReservationsForDate(reservationDateFilter);
  const filtered = statusFilter === 'ALL'
    ? allForDate
    : allForDate.filter((r) => r.status === statusFilter);

  const sorted = [...filtered].sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-[#07090E]">
      {/* Header */}
      <div className="bg-[#0E131F] border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" /> Reservations & Waitlist
          </h1>
          <button onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-xl text-sm transition-colors">
            <Plus className="w-4 h-4" /> New Reservation
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: 'Today\'s Bookings', value: metrics.todayReservations, color: 'text-purple-400' },
            { label: 'Pending Confirm', value: metrics.pendingReservations, color: 'text-yellow-400' },
            { label: 'On Waitlist', value: useCrmStore.getState().getActiveWaitlist().length, color: 'text-orange-400' },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-[#161D2E] rounded-xl p-3 border border-white/5 text-center">
              <div className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs + Date */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 bg-[#161D2E] rounded-xl p-1">
            {(['reservations', 'waitlist'] as const).map((t) => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${activeTab === t ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-gray-200'}`}>
                {t}
              </button>
            ))}
          </div>
          {activeTab === 'reservations' && (
            <input type="date"
              className="bg-[#161D2E] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
              value={reservationDateFilter}
              onChange={(e) => setReservationDateFilter(e.target.value)} />
          )}
        </div>

        {/* Status filter pills */}
        {activeTab === 'reservations' && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {(['ALL', 'PENDING', 'CONFIRMED', 'SEATED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] as const).map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  statusFilter === s
                    ? 'bg-purple-500 text-white'
                    : 'bg-[#161D2E] text-gray-400 border border-white/10 hover:border-purple-500/30'
                }`}>
                {s === 'ALL' ? `All (${allForDate.length})` : `${RES_STATUS_CONFIG[s].label} (${allForDate.filter(r => r.status === s).length})`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {activeTab === 'waitlist' ? (
          <WaitlistPanel />
        ) : sorted.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No reservations for this date</p>
            <button onClick={() => setShowNewModal(true)}
              className="mt-4 px-4 py-2 bg-purple-900/40 border border-purple-500/30 text-purple-300 rounded-xl text-sm hover:bg-purple-900/60">
              + Create First Reservation
            </button>
          </div>
        ) : sorted.map((res) => (
          <ReservationCard key={res.id} res={res} />
        ))}
      </div>

      {showNewModal && <NewReservationModal onClose={() => setShowNewModal(false)} />}
    </div>
  );
};

