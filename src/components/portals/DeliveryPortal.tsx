import React, { useState } from 'react';
import {
  Bike, MapPin, Clock, CheckCircle, XCircle, Package,
  Phone, ChevronRight, Filter, Truck, Navigation,
  AlertCircle, Star, DollarSign, Plus, RefreshCw, User
} from 'lucide-react';
import { useCrmStore } from '../../store/crmStore';
import { DeliveryOrder, DeliveryStatus, Rider } from '../../types/crm';

// ─── Status config ─────────────────────────────────────────
type StatusCfg = { label: string; color: string; bg: string; dot: string };
const STATUS_CONFIG: Record<DeliveryStatus, StatusCfg> = {
  ORDER_PLACED:     { label: 'Placed',       color: 'text-gray-300',    bg: 'bg-gray-700/40 border-gray-600/40',      dot: 'bg-gray-400'    },
  CONFIRMED:        { label: 'Confirmed',    color: 'text-cyan-400',    bg: 'bg-cyan-900/30 border-cyan-500/40',      dot: 'bg-cyan-400'    },
  PREPARING:        { label: 'Preparing',    color: 'text-yellow-400',  bg: 'bg-yellow-900/30 border-yellow-600/40',  dot: 'bg-yellow-400'  },
  READY_FOR_PICKUP: { label: 'Ready',        color: 'text-orange-400',  bg: 'bg-orange-900/30 border-orange-600/40', dot: 'bg-orange-400'  },
  RIDER_ASSIGNED:   { label: 'Rider Picked', color: 'text-blue-400',    bg: 'bg-blue-900/30 border-blue-500/40',     dot: 'bg-blue-400'    },
  PICKED_UP:        { label: 'Picked Up',    color: 'text-indigo-400',  bg: 'bg-indigo-900/30 border-indigo-500/40', dot: 'bg-indigo-400'  },
  ON_THE_WAY:       { label: 'On the Way',   color: 'text-purple-400',  bg: 'bg-purple-900/30 border-purple-500/40', dot: 'bg-purple-400 animate-pulse'  },
  DELIVERED:        { label: 'Delivered',    color: 'text-emerald-400', bg: 'bg-emerald-900/30 border-emerald-600/40', dot: 'bg-emerald-400' },
  FAILED:           { label: 'Failed',       color: 'text-red-400',     bg: 'bg-red-900/30 border-red-600/40',       dot: 'bg-red-400'     },
  CANCELLED:        { label: 'Cancelled',    color: 'text-red-500',     bg: 'bg-red-900/20 border-red-700/30',       dot: 'bg-red-500'     },
};

// ─── Progress Steps ────────────────────────────────────────
const DELIVERY_STEPS: DeliveryStatus[] = [
  'ORDER_PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP',
  'RIDER_ASSIGNED', 'ON_THE_WAY', 'DELIVERED',
];

const DeliveryProgress: React.FC<{ status: DeliveryStatus }> = ({ status }) => {
  const currentIdx = DELIVERY_STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {DELIVERY_STEPS.map((step, idx) => {
        const cfg = STATUS_CONFIG[step];
        const done = idx <= currentIdx;
        return (
          <React.Fragment key={step}>
            <div className={`shrink-0 w-2 h-2 rounded-full ${done ? cfg.dot : 'bg-gray-700'}`} title={cfg.label} />
            {idx < DELIVERY_STEPS.length - 1 && (
              <div className={`flex-1 h-px min-w-[8px] ${done && idx < currentIdx ? 'bg-emerald-600' : 'bg-gray-700'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── Assign Rider Modal ────────────────────────────────────
const AssignRiderModal: React.FC<{ order: DeliveryOrder; onClose: () => void }> = ({ order, onClose }) => {
  const { riders, assignRider } = useCrmStore();
  const available = riders.filter((r) => r.status === 'AVAILABLE');

  const handleAssign = (riderId: string) => {
    assignRider(order.id, riderId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0E131F] border border-white/10 rounded-2xl w-full max-w-sm p-6 space-y-4">
        <h3 className="text-base font-bold text-white">Assign Rider — {order.orderNumber}</h3>
        {available.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-sm">
            <Bike className="w-8 h-8 mx-auto mb-2 opacity-30" />
            No riders available right now
          </div>
        ) : available.map((rider) => (
          <button key={rider.id} onClick={() => handleAssign(rider.id)}
            className="w-full flex items-center gap-3 p-3 bg-[#161D2E] hover:bg-[#1D2535] border border-white/5 rounded-xl transition-colors">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shrink-0">
              <Bike className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-semibold text-white">{rider.name}</div>
              <div className="text-xs text-gray-400">{rider.vehicleType} · {rider.vehicleNumber}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-yellow-400">★ {rider.rating}</div>
              <div className="text-[10px] text-gray-500">{rider.totalDeliveriesToday} today</div>
            </div>
          </button>
        ))}
        <button onClick={onClose} className="w-full py-2 rounded-xl border border-white/10 text-gray-400 text-sm hover:bg-white/5">Cancel</button>
      </div>
    </div>
  );
};

// ─── Delivery Order Card ────────────────────────────────────
const DeliveryCard: React.FC<{ order: DeliveryOrder }> = ({ order }) => {
  const { updateDeliveryStatus, completeDelivery } = useCrmStore();
  const [showAssign, setShowAssign] = useState(false);
  const cfg = STATUS_CONFIG[order.status];
  const isActive = !['DELIVERED', 'FAILED', 'CANCELLED'].includes(order.status);

  const handleNextStatus = () => {
    const idx = DELIVERY_STEPS.indexOf(order.status);
    if (idx >= 0 && idx < DELIVERY_STEPS.length - 1) {
      const next = DELIVERY_STEPS[idx + 1];
      if (next === 'DELIVERED') {
        completeDelivery(order.id);
      } else if (next === 'RIDER_ASSIGNED') {
        setShowAssign(true);
      } else {
        updateDeliveryStatus(order.id, next);
      }
    }
  };

  return (
    <>
      <div className={`bg-[#0E131F] border rounded-2xl p-4 transition-all ${isActive ? 'border-white/10 hover:border-white/20' : 'border-white/5 opacity-70'}`}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">{order.orderNumber}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.color} ${cfg.bg}`}>
                {cfg.label}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${order.orderType === 'PICKUP' ? 'bg-blue-900/40 text-blue-300 border border-blue-500/30' : 'bg-purple-900/40 text-purple-300 border border-purple-500/30'}`}>
                {order.orderType}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{order.customerName} · {order.customerPhone}</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-white">৳{(order.grandTotal / 100).toFixed(0)}</div>
            <div className={`text-xs ${order.isPaid ? 'text-emerald-400' : 'text-orange-400'}`}>
              {order.isPaid ? '✓ Paid' : 'COD'}
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-1 mb-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-xs text-gray-400">
              <span>{item.quantity}× {item.nameEn}{item.modifiers.length > 0 && ` (${item.modifiers.join(', ')})`}</span>
              <span>৳{(item.unitPrice * item.quantity / 100).toFixed(0)}</span>
            </div>
          ))}
        </div>

        {/* Delivery Address */}
        {order.orderType === 'DELIVERY' && (
          <div className="flex items-start gap-2 text-xs text-gray-400 mb-3">
            <MapPin className="w-3 h-3 shrink-0 mt-0.5 text-gray-500" />
            <span>{order.deliveryAddress.line1}, {order.deliveryAddress.area}, {order.deliveryAddress.city}</span>
          </div>
        )}

        {/* Progress bar */}
        {order.orderType === 'DELIVERY' && isActive && (
          <div className="mb-3">
            <DeliveryProgress status={order.status} />
          </div>
        )}

        {/* Rider info */}
        {order.riderName && (
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-3 bg-[#161D2E] rounded-lg px-3 py-2">
            <Bike className="w-3.5 h-3.5 text-orange-400" />
            <span className="font-medium text-gray-300">{order.riderName}</span>
            <span>{order.riderPhone}</span>
          </div>
        )}

        {/* Special instructions */}
        {order.specialInstructions && (
          <div className="text-xs text-gray-500 italic mb-3">📝 {order.specialInstructions}</div>
        )}

        {/* Actions */}
        {isActive && (
          <div className="flex gap-2">
            {order.status !== 'DELIVERED' && (
              <button onClick={handleNextStatus}
                className="flex-1 py-2 rounded-xl bg-emerald-900/40 border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-900/60 transition-colors">
                → {STATUS_CONFIG[DELIVERY_STEPS[Math.min(DELIVERY_STEPS.indexOf(order.status) + 1, DELIVERY_STEPS.length - 1)]]?.label}
              </button>
            )}
            {['ORDER_PLACED', 'CONFIRMED', 'PREPARING'].includes(order.status) && (
              <button onClick={() => updateDeliveryStatus(order.id, 'CANCELLED')}
                className="py-2 px-3 rounded-xl bg-red-900/30 border border-red-600/30 text-red-400 text-xs hover:bg-red-900/50">
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {order.status === 'DELIVERED' && (
          <div className="text-xs text-emerald-400 flex items-center gap-1.5 mt-1">
            <CheckCircle className="w-3.5 h-3.5" />
            Delivered · +{order.loyaltyPointsEarned} pts earned
          </div>
        )}
      </div>

      {showAssign && <AssignRiderModal order={order} onClose={() => setShowAssign(false)} />}
    </>
  );
};

// ─── Rider Status Panel ─────────────────────────────────────
const RiderPanel: React.FC = () => {
  const { riders } = useCrmStore();
  const STATUS_COLORS: Record<Rider['status'], string> = {
    AVAILABLE: 'text-emerald-400 bg-emerald-900/30 border-emerald-600/30',
    ON_DELIVERY: 'text-purple-400 bg-purple-900/30 border-purple-500/30',
    OFF_DUTY: 'text-gray-400 bg-gray-700/30 border-gray-600/30',
    BREAK: 'text-yellow-400 bg-yellow-900/30 border-yellow-600/30',
  };

  return (
    <div className="space-y-2">
      {riders.map((rider) => (
        <div key={rider.id} className="bg-[#0E131F] border border-white/5 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shrink-0">
            <Bike className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white text-sm">{rider.name}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLORS[rider.status]}`}>
                {rider.status.replace('_', ' ')}
              </span>
            </div>
            <div className="text-xs text-gray-500">{rider.vehicleType} · {rider.vehicleNumber}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs text-yellow-400">★ {rider.rating}</div>
            <div className="text-xs text-gray-500">{rider.totalDeliveriesToday} delivered</div>
            <div className="text-xs text-emerald-400">৳{(rider.earnings / 100).toFixed(0)}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Main Delivery Portal ────────────────────────────────────
export const DeliveryPortal: React.FC = () => {
  const {
    getFilteredDeliveryOrders, setDeliveryStatusFilter, deliveryStatusFilter,
    getActiveDeliveryOrders, deliveryZones, getCrmDashboardMetrics,
  } = useCrmStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'riders' | 'zones'>('orders');
  const metrics = getCrmDashboardMetrics();
  const orders = getFilteredDeliveryOrders();
  const active = getActiveDeliveryOrders();

  const STATUS_FILTERS: Array<{ value: DeliveryStatus | 'ALL'; label: string }> = [
    { value: 'ALL',             label: `All (${orders.length})` },
    { value: 'ORDER_PLACED',    label: 'New' },
    { value: 'PREPARING',      label: 'Preparing' },
    { value: 'READY_FOR_PICKUP',label: 'Ready' },
    { value: 'ON_THE_WAY',     label: 'En Route' },
    { value: 'DELIVERED',      label: 'Done' },
  ];

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-[#07090E]">
      {/* Header */}
      <div className="bg-[#0E131F] border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-orange-400" /> Delivery & Dispatch
          </h1>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
            <span className="text-orange-400 font-semibold">{metrics.activeDeliveries} Active</span>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Active Orders', value: metrics.activeDeliveries, color: 'text-orange-400' },
            { label: 'Total Orders', value: useCrmStore.getState().deliveryOrders.length, color: 'text-white' },
            { label: 'Available Riders', value: useCrmStore.getState().riders.filter(r => r.status === 'AVAILABLE').length, color: 'text-emerald-400' },
            { label: 'Active Zones', value: deliveryZones.filter(z => z.isActive).length, color: 'text-cyan-400' },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-[#161D2E] rounded-xl p-3 border border-white/5 text-center">
              <div className={`text-xl font-black ${kpi.color}`}>{kpi.value}</div>
              <div className="text-[10px] text-gray-500">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#161D2E] rounded-xl p-1">
          {(['orders', 'riders', 'zones'] as const).map((t) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${activeTab === t ? 'bg-orange-500 text-black' : 'text-gray-400 hover:text-gray-200'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Status filter for orders */}
        {activeTab === 'orders' && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {STATUS_FILTERS.map(({ value, label }) => (
              <button key={value} onClick={() => setDeliveryStatusFilter(value)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  deliveryStatusFilter === value
                    ? 'bg-orange-500 text-black'
                    : 'bg-[#161D2E] text-gray-400 border border-white/10 hover:border-orange-500/30'
                }`}>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {activeTab === 'orders' && (
          orders.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Truck className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No delivery orders</p>
            </div>
          ) : orders.map((order) => <DeliveryCard key={order.id} order={order} />)
        )}

        {activeTab === 'riders' && <RiderPanel />}

        {activeTab === 'zones' && (
          <div className="space-y-3">
            {deliveryZones.map((zone) => (
              <div key={zone.id} className={`bg-[#0E131F] border rounded-2xl p-4 ${zone.isActive ? 'border-white/10' : 'border-white/5 opacity-60'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className={`w-4 h-4 ${zone.isActive ? 'text-emerald-400' : 'text-gray-500'}`} />
                    <span className="font-semibold text-white text-sm">{zone.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${zone.isActive ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-600/30' : 'bg-gray-700/40 text-gray-400 border border-gray-600/30'}`}>
                      {zone.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <button onClick={() => useCrmStore.getState().toggleZoneActive(zone.id)}
                    className="text-xs text-gray-400 hover:text-white border border-white/10 px-2 py-1 rounded-lg hover:bg-white/5">
                    Toggle
                  </button>
                </div>
                <div className="flex gap-4 text-xs text-gray-400 mb-2">
                  <span>🚚 ৳{(zone.deliveryFee / 100).toFixed(0)} delivery</span>
                  <span>⏱ ~{zone.estimatedMinutes}min</span>
                  <span>📦 Min ৳{(zone.minimumOrder / 100).toFixed(0)}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {zone.areas.map((area) => (
                    <span key={area} className="px-2 py-0.5 bg-[#161D2E] text-gray-400 rounded-full text-[10px] border border-white/5">{area}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

