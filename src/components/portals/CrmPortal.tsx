import React, { useState } from 'react';
import {
  Users, Search, Star, Phone, Mail, MapPin, Award, TrendingUp,
  Clock, Gift, ChevronRight, Plus, Edit3, AlertCircle, CheckCircle,
  ShoppingBag, Heart, MessageSquare, Cake, Crown, Shield
} from 'lucide-react';
import { useCrmStore } from '../../store/crmStore';
import { Customer, LoyaltyTier } from '../../types/crm';

// ─── Tier Config ──────────────────────────────────────────
const TIER_CONFIG: Record<LoyaltyTier, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  BRONZE: {
    color: 'text-amber-600',
    bg: 'bg-amber-900/30 border-amber-700/40',
    icon: <Award className="w-3.5 h-3.5" />,
    label: 'Bronze',
  },
  SILVER: {
    color: 'text-slate-300',
    bg: 'bg-slate-700/40 border-slate-500/40',
    icon: <Award className="w-3.5 h-3.5" />,
    label: 'Silver',
  },
  GOLD: {
    color: 'text-yellow-400',
    bg: 'bg-yellow-900/30 border-yellow-600/40',
    icon: <Star className="w-3.5 h-3.5" />,
    label: 'Gold',
  },
  PLATINUM: {
    color: 'text-cyan-400',
    bg: 'bg-cyan-900/30 border-cyan-500/40',
    icon: <Crown className="w-3.5 h-3.5" />,
    label: 'Platinum',
  },
};

// ─── Rating Stars ─────────────────────────────────────────
const RatingStars: React.FC<{ rating: number; size?: number }> = ({ rating, size = 12 }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        style={{ width: size, height: size }}
        className={s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}
      />
    ))}
  </div>
);

// ─── Add Customer Modal ───────────────────────────────────
const AddCustomerModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addCustomer } = useCrmStore();
  const [form, setForm] = useState({
    name: '', phone: '', email: '', birthday: '',
    dietaryPrefs: '', allergenFlags: '',
  });

  const handleSubmit = () => {
    if (!form.name.trim() || !form.phone.trim()) return;
    addCustomer({
      tenantId: 'tenant-nova-01',
      name: form.name,
      phone: form.phone,
      email: form.email || undefined,
      birthday: form.birthday || undefined,
      avatarInitials: form.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      addresses: [],
      allergenFlags: form.allergenFlags ? form.allergenFlags.split(',').map(s => s.trim()) : [],
      dietaryPrefs: form.dietaryPrefs ? form.dietaryPrefs.split(',').map(s => s.trim()) : [],
      notes: [],
      isBlacklisted: false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0E131F] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Plus className="w-5 h-5 text-cyan-400" /> New Customer
        </h3>
        {[
          { key: 'name', label: 'Full Name *', placeholder: 'e.g. Ayasha Rahman' },
          { key: 'phone', label: 'Phone *', placeholder: '01711-xxxxxx' },
          { key: 'email', label: 'Email', placeholder: 'customer@email.com' },
          { key: 'birthday', label: 'Birthday (MM-DD)', placeholder: '03-15' },
          { key: 'allergenFlags', label: 'Allergens (comma-separated)', placeholder: 'NUTS, GLUTEN' },
          { key: 'dietaryPrefs', label: 'Dietary Preferences', placeholder: 'HALAL, VEGAN' },
        ].map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="text-xs text-gray-400 mb-1 block">{label}</label>
            <input
              className="w-full bg-[#161D2E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
              placeholder={placeholder}
              value={(form as Record<string, string>)[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            />
          </div>
        ))}
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-white/10 text-gray-400 text-sm hover:bg-white/5">Cancel</button>
          <button onClick={handleSubmit} className="flex-1 py-2 rounded-xl bg-cyan-500 text-black font-bold text-sm hover:bg-cyan-400">
            Create Customer
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Customer Detail Panel ────────────────────────────────
const CustomerDetailPanel: React.FC<{ customer: Customer; onClose: () => void }> = ({ customer, onClose }) => {
  const { getCustomerVisits, getLoyaltyHistory, getCrmDashboardMetrics, feedbackList } = useCrmStore();
  const visits = getCustomerVisits(customer.id);
  const loyaltyTxns = getLoyaltyHistory(customer.id);
  const feedback = feedbackList.filter((f) => f.customerId === customer.id);
  const tier = TIER_CONFIG[customer.tier];
  const metrics = getCrmDashboardMetrics();
  const isBirthday = metrics.birthdaysToday.some((c) => c.id === customer.id);
  const [tab, setTab] = useState<'overview' | 'visits' | 'loyalty' | 'feedback'>('overview');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-end z-50">
      <div className="w-full max-w-lg h-full bg-[#0D1321] border-l border-white/10 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0E131F] to-[#161D2E] p-5 border-b border-white/10">
          <div className="flex items-start justify-between mb-4">
            <button onClick={onClose} className="text-gray-500 hover:text-white text-xs">✕ Close</button>
            {isBirthday && (
              <span className="flex items-center gap-1 text-xs bg-pink-900/40 border border-pink-500/30 text-pink-300 px-2 py-1 rounded-full">
                <Cake className="w-3 h-3" /> Birthday Today!
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-cyan-900/40">
              {customer.avatarInitials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white truncate">{customer.name}</h2>
                {customer.isBlacklisted && <Shield className="w-4 h-4 text-red-400" />}
              </div>
              <p className="text-xs text-gray-400">{customer.code}</p>
              <div className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${tier.color} ${tier.bg}`}>
                {tier.icon} {tier.label} Member
              </div>
            </div>
          </div>
          {/* KPIs */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: 'Points', value: customer.totalPoints.toLocaleString(), icon: <Star className="w-3.5 h-3.5 text-yellow-400" /> },
              { label: 'Visits', value: customer.totalVisits, icon: <Clock className="w-3.5 h-3.5 text-cyan-400" /> },
              { label: 'Lifetime', value: `৳${(customer.lifetimeSpend / 100).toLocaleString('en-BD', { maximumFractionDigits: 0 })}`, icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-[#161D2E] rounded-xl p-3 text-center border border-white/5">
                <div className="flex justify-center mb-1">{kpi.icon}</div>
                <div className="text-base font-bold text-white">{kpi.value}</div>
                <div className="text-[10px] text-gray-500">{kpi.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 bg-[#0E131F]">
          {(['overview', 'visits', 'loyalty', 'feedback'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-xs font-semibold capitalize transition-colors ${tab === t ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {tab === 'overview' && (
            <>
              {/* Contact */}
              <div className="bg-[#0E131F] border border-white/5 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Contact</h4>
                <div className="flex items-center gap-2 text-sm text-gray-300"><Phone className="w-4 h-4 text-gray-500" />{customer.phone}</div>
                {customer.email && <div className="flex items-center gap-2 text-sm text-gray-300"><Mail className="w-4 h-4 text-gray-500" />{customer.email}</div>}
                {customer.birthday && <div className="flex items-center gap-2 text-sm text-gray-300"><Cake className="w-4 h-4 text-gray-500" />Birthday: {customer.birthday}</div>}
                {customer.addresses[0] && (
                  <div className="flex items-start gap-2 text-sm text-gray-300">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                    <span>{customer.addresses[0].line1}, {customer.addresses[0].area}, {customer.addresses[0].city}</span>
                  </div>
                )}
              </div>
              {/* Preferences */}
              {(customer.allergenFlags.length > 0 || customer.dietaryPrefs.length > 0) && (
                <div className="bg-[#0E131F] border border-white/5 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Preferences & Alerts</h4>
                  {customer.allergenFlags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {customer.allergenFlags.map((a) => (
                        <span key={a} className="px-2 py-0.5 bg-red-900/40 border border-red-500/30 text-red-300 rounded-full text-xs flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {a}
                        </span>
                      ))}
                    </div>
                  )}
                  {customer.dietaryPrefs.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {customer.dietaryPrefs.map((d) => (
                        <span key={d} className="px-2 py-0.5 bg-emerald-900/30 border border-emerald-600/30 text-emerald-300 rounded-full text-xs">
                          {d}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {/* Notes */}
              {customer.notes.length > 0 && (
                <div className="bg-[#0E131F] border border-white/5 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Staff Notes</h4>
                  {customer.notes.map((n) => (
                    <div key={n.id} className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3">
                      <p className="text-sm text-yellow-100">{n.note}</p>
                      <p className="text-[10px] text-yellow-600 mt-1">— {n.addedByName}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'visits' && (
            <div className="space-y-2">
              {visits.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-sm">No visit history yet</div>
              ) : visits.map((v) => (
                <div key={v.id} className="bg-[#0E131F] border border-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white font-medium">{v.branchName}</span>
                    <span className="text-xs text-gray-500">{new Date(v.visitDate).toLocaleDateString('en-GB')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-400">
                      ৳{(v.orderTotal / 100).toLocaleString('en-BD', { maximumFractionDigits: 0 })}
                      {v.tableName && ` · ${v.tableName}`}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-yellow-400">+{v.pointsEarned}pts</span>
                      {v.feedbackRating && <RatingStars rating={v.feedbackRating} />}
                    </div>
                  </div>
                  {v.feedbackComment && (
                    <p className="text-xs text-gray-500 mt-2 italic">"{v.feedbackComment}"</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === 'loyalty' && (
            <div className="space-y-2">
              {/* Redeem hint */}
              <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/20 border border-yellow-600/30 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-yellow-300">{customer.totalPoints.toLocaleString()} Points Available</p>
                  <p className="text-xs text-yellow-600">= ৳{(customer.totalPoints / 10).toFixed(0)} discount value</p>
                </div>
                <Gift className="w-6 h-6 text-yellow-400" />
              </div>
              {loyaltyTxns.map((t) => (
                <div key={t.id} className="bg-[#0E131F] border border-white/5 rounded-xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-300">{t.description}</p>
                    <p className="text-[10px] text-gray-600">{new Date(t.createdAt).toLocaleDateString('en-GB')}</p>
                  </div>
                  <span className={`text-sm font-bold ${t.points > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {t.points > 0 ? '+' : ''}{t.points}
                  </span>
                </div>
              ))}
            </div>
          )}

          {tab === 'feedback' && (
            <div className="space-y-3">
              {feedback.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-sm">No feedback submitted yet</div>
              ) : feedback.map((f) => (
                <div key={f.id} className="bg-[#0E131F] border border-white/5 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <RatingStars rating={f.rating} size={14} />
                    <span className="text-[10px] text-gray-500">{new Date(f.createdAt).toLocaleDateString('en-GB')}</span>
                  </div>
                  <div className="flex gap-3 text-xs text-gray-400">
                    <span>🍽 Food: {f.foodRating}/5</span>
                    <span>🤝 Service: {f.serviceRating}/5</span>
                    <span>✨ Ambience: {f.ambienceRating}/5</span>
                  </div>
                  <p className="text-sm text-gray-300">"{f.comment}"</p>
                  <div className="flex flex-wrap gap-1">
                    {f.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-[#161D2E] text-gray-400 rounded-full text-[10px]">{tag.replace(/_/g, ' ')}</span>
                    ))}
                  </div>
                  {f.replyText && (
                    <div className="bg-cyan-900/20 border border-cyan-700/30 rounded-lg p-2 text-xs text-cyan-200">
                      <span className="text-cyan-400 font-semibold">Restaurant replied: </span>
                      {f.replyText}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main CRM Portal ──────────────────────────────────────
export const CrmPortal: React.FC = () => {
  const {
    getFilteredCustomers, setCustomerSearch, customerSearch,
    getCrmDashboardMetrics, selectCustomer, selectedCustomerId,
    getCustomerById,
  } = useCrmStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const metrics = getCrmDashboardMetrics();
  const customers = getFilteredCustomers();
  const selectedCustomer = selectedCustomerId ? getCustomerById(selectedCustomerId) : null;

  const TIER_ORDER: Record<string, number> = { PLATINUM: 0, GOLD: 1, SILVER: 2, BRONZE: 3 };
  const sorted = [...customers].sort(
    (a, b) => (TIER_ORDER[a.tier] ?? 9) - (TIER_ORDER[b.tier] ?? 9) || b.lifetimeSpend - a.lifetimeSpend
  );

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-[#07090E]">
      {/* Header */}
      <div className="bg-[#0E131F] border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" /> Customer CRM
          </h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> New Customer
          </button>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Total Customers', value: metrics.totalCustomers, icon: <Users className="w-4 h-4" />, color: 'text-cyan-400' },
            { label: 'New This Month', value: metrics.newThisMonth, icon: <Plus className="w-4 h-4" />, color: 'text-emerald-400' },
            { label: 'Loyalty Points', value: metrics.loyaltyPointsInCirculation.toLocaleString(), icon: <Star className="w-4 h-4" />, color: 'text-yellow-400' },
            { label: 'Avg Rating', value: `${metrics.avgRating} ★`, icon: <Heart className="w-4 h-4" />, color: 'text-pink-400' },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-[#161D2E] rounded-xl p-3 border border-white/5">
              <div className={`flex items-center gap-1.5 ${kpi.color} mb-1`}>{kpi.icon}<span className="text-xs font-medium">{kpi.label}</span></div>
              <div className="text-xl font-black text-white">{kpi.value}</div>
            </div>
          ))}
        </div>

        {/* Birthday alert */}
        {metrics.birthdaysToday.length > 0 && (
          <div className="bg-pink-900/30 border border-pink-500/30 rounded-xl p-3 flex items-center gap-3 mb-3">
            <Cake className="w-5 h-5 text-pink-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-pink-200">🎂 Birthday Customers Today!</p>
              <p className="text-xs text-pink-400">{metrics.birthdaysToday.map((c) => c.name).join(', ')} — consider a complimentary dessert or birthday promo!</p>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            className="w-full bg-[#161D2E] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
            placeholder="Search by name, phone, email or customer code..."
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Customer List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {sorted.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No customers found</p>
          </div>
        ) : sorted.map((customer) => {
          const tier = TIER_CONFIG[customer.tier];
          const isBirthday = metrics.birthdaysToday.some((c) => c.id === customer.id);

          return (
            <button
              key={customer.id}
              onClick={() => selectCustomer(customer.id)}
              className="w-full bg-[#0E131F] hover:bg-[#161D2E] border border-white/5 hover:border-cyan-500/20 rounded-2xl p-4 text-left transition-all group"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-base font-black text-white">
                    {customer.avatarInitials}
                  </div>
                  {isBirthday && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center text-[8px]">🎂</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm truncate">{customer.name}</span>
                    <span className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${tier.color} ${tier.bg}`}>
                      {tier.icon}{tier.label}
                    </span>
                    {customer.isBlacklisted && <Shield className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" />{customer.phone}
                    </span>
                    <span className="text-xs text-gray-600">{customer.code}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="hidden md:flex items-center gap-6 text-right shrink-0">
                  <div>
                    <div className="text-sm font-bold text-yellow-400">{customer.totalPoints.toLocaleString()}</div>
                    <div className="text-[10px] text-gray-500">points</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{customer.totalVisits}</div>
                    <div className="text-[10px] text-gray-500">visits</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-emerald-400">৳{(customer.lifetimeSpend / 100).toLocaleString('en-BD', { maximumFractionDigits: 0 })}</div>
                    <div className="text-[10px] text-gray-500">lifetime</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail Panel */}
      {selectedCustomer && (
        <CustomerDetailPanel
          customer={selectedCustomer}
          onClose={() => selectCustomer(null)}
        />
      )}

      {/* Add Modal */}
      {showAddModal && <AddCustomerModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
};
