// ============================================================
// NOVAPOS Phase 3 — CRM Store (Zustand slice)
// Manages: Customers, Visits, Loyalty, Reservations,
//          Waitlist, Delivery Orders, Riders, Promo Rules,
//          Feedback
// ============================================================
import { create } from 'zustand';
import {
  Customer, CustomerVisit, LoyaltyTransaction,
  Reservation, ReservationStatus,
  WaitlistEntry, WaitlistStatus,
  DeliveryZone, DeliveryOrder, DeliveryStatus,
  Rider, PromoRule, CustomerFeedback,
  LoyaltyTier,
} from '../types/crm';
import {
  SEED_CUSTOMERS,
  SEED_CUSTOMER_VISITS,
  SEED_LOYALTY_TRANSACTIONS,
  SEED_RESERVATIONS,
  SEED_WAITLIST,
  SEED_DELIVERY_ZONES,
  SEED_DELIVERY_ORDERS,
  SEED_RIDERS,
  SEED_PROMO_RULES,
  SEED_FEEDBACK,
} from '../services/crm-seed-data';

// ─── Tier thresholds (lifetime spend in minor units) ──────
const TIER_THRESHOLDS: Record<LoyaltyTier, number> = {
  BRONZE:   0,
  SILVER:   500000,   // 5,000 BDT
  GOLD:     2000000,  // 20,000 BDT
  PLATINUM: 8000000,  // 80,000 BDT
};

function calcTier(lifetimeSpend: number): LoyaltyTier {
  if (lifetimeSpend >= TIER_THRESHOLDS.PLATINUM) return 'PLATINUM';
  if (lifetimeSpend >= TIER_THRESHOLDS.GOLD)     return 'GOLD';
  if (lifetimeSpend >= TIER_THRESHOLDS.SILVER)   return 'SILVER';
  return 'BRONZE';
}

// Points: 1 BDT = 1 point (minor units / 100)
function calcEarnPoints(orderTotalMinor: number): number {
  return Math.floor(orderTotalMinor / 100);
}

// Redemption: 100 points = 10 BDT = 1000 minor units discount
function calcRedemptionValue(points: number): number {
  return points * 10; // minor units
}

function nowISO() { return new Date().toISOString(); }
function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ─── State Interface ──────────────────────────────────────

interface CrmState {
  // ── Customers ──
  customers: Customer[];
  selectedCustomerId: string | null;
  customerSearch: string;

  setCustomerSearch: (q: string) => void;
  selectCustomer: (id: string | null) => void;
  addCustomer: (c: Omit<Customer, 'id' | 'code' | 'joinDate' | 'totalPoints' | 'lifetimeSpend' | 'totalVisits' | 'averageOrderValue' | 'tier' | 'referralCode'>) => Customer;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;
  blacklistCustomer: (id: string, reason: string) => void;
  getFilteredCustomers: () => Customer[];
  getCustomerById: (id: string) => Customer | undefined;

  // ── Visits & Loyalty ──
  customerVisits: CustomerVisit[];
  loyaltyTransactions: LoyaltyTransaction[];

  recordVisit: (visit: Omit<CustomerVisit, 'id'>) => void;
  earnPoints: (customerId: string, orderTotal: number, orderId: string) => void;
  redeemPoints: (customerId: string, points: number, orderId: string) => boolean;
  getCustomerVisits: (customerId: string) => CustomerVisit[];
  getLoyaltyHistory: (customerId: string) => LoyaltyTransaction[];

  // ── Reservations ──
  reservations: Reservation[];
  reservationSearch: string;
  reservationDateFilter: string; // "YYYY-MM-DD"

  setReservationSearch: (q: string) => void;
  setReservationDateFilter: (d: string) => void;
  createReservation: (res: Omit<Reservation, 'id' | 'reservationNumber' | 'createdAt'>) => Reservation;
  updateReservationStatus: (id: string, status: ReservationStatus, note?: string) => void;
  assignReservationTable: (resId: string, tableId: string, tableName: string) => void;
  getReservationsForDate: (date: string) => Reservation[];
  getTodayReservations: () => Reservation[];

  // ── Waitlist ──
  waitlist: WaitlistEntry[];

  addToWaitlist: (entry: Omit<WaitlistEntry, 'id' | 'addedAt' | 'status'>) => WaitlistEntry;
  notifyWaitlistEntry: (id: string) => void;
  seatWaitlistEntry: (id: string) => void;
  removeFromWaitlist: (id: string) => void;
  getActiveWaitlist: () => WaitlistEntry[];

  // ── Delivery Zones ──
  deliveryZones: DeliveryZone[];

  toggleZoneActive: (id: string) => void;
  getZoneForArea: (area: string) => DeliveryZone | undefined;

  // ── Delivery Orders ──
  deliveryOrders: DeliveryOrder[];
  deliveryStatusFilter: DeliveryStatus | 'ALL';

  setDeliveryStatusFilter: (s: DeliveryStatus | 'ALL') => void;
  createDeliveryOrder: (order: Omit<DeliveryOrder, 'id' | 'orderNumber' | 'placedAt'>) => DeliveryOrder;
  updateDeliveryStatus: (id: string, status: DeliveryStatus) => void;
  assignRider: (deliveryId: string, riderId: string) => void;
  completeDelivery: (deliveryId: string, proofUrl?: string) => void;
  getFilteredDeliveryOrders: () => DeliveryOrder[];
  getActiveDeliveryOrders: () => DeliveryOrder[];

  // ── Riders ──
  riders: Rider[];

  updateRiderLocation: (riderId: string, lat: number, lng: number) => void;
  setRiderStatus: (riderId: string, status: Rider['status']) => void;
  getAvailableRiders: () => Rider[];

  // ── Promo Rules ──
  promoRules: PromoRule[];

  validatePromoCode: (code: string, orderTotal: number, customerId?: string) => PromoRule | null;
  applyPromoCode: (code: string, customerId?: string) => { discountMinor: number; label: string } | null;

  // ── Feedback ──
  feedbackList: CustomerFeedback[];

  submitFeedback: (fb: Omit<CustomerFeedback, 'id' | 'createdAt' | 'isPublished'>) => void;
  replyToFeedback: (id: string, replyText: string) => void;
  getPublishedFeedback: () => CustomerFeedback[];
  getAverageRating: () => number;

  // ── Dashboard Metrics ──
  getCrmDashboardMetrics: () => {
    totalCustomers: number;
    newThisMonth: number;
    activeToday: number;
    loyaltyPointsInCirculation: number;
    pendingReservations: number;
    todayReservations: number;
    activeDeliveries: number;
    avgRating: number;
    birthdaysToday: Customer[];
  };
}

// ─── Store Implementation ─────────────────────────────────

export const useCrmStore = create<CrmState>((set, get) => ({
  // ── Customers ──
  customers: SEED_CUSTOMERS,
  selectedCustomerId: null,
  customerSearch: '',

  setCustomerSearch: (q) => set({ customerSearch: q }),
  selectCustomer: (id) => set({ selectedCustomerId: id }),

  addCustomer: (data) => {
    const customers = get().customers;
    const seq = (customers.length + 1).toString().padStart(5, '0');
    const newCustomer: Customer = {
      ...data,
      id: `cust-${uuid()}`,
      code: `CUST-${seq}`,
      joinDate: nowISO().slice(0, 10),
      totalPoints: 0,
      lifetimeSpend: 0,
      totalVisits: 0,
      averageOrderValue: 0,
      tier: 'BRONZE',
      referralCode: `${data.name.split(' ')[0].toUpperCase()}${new Date().getFullYear()}`,
    };
    set({ customers: [...customers, newCustomer] });
    return newCustomer;
  },

  updateCustomer: (id, patch) => {
    set((s) => ({
      customers: s.customers.map((c) => c.id === id ? { ...c, ...patch } : c),
    }));
  },

  blacklistCustomer: (id, _reason) => {
    set((s) => ({
      customers: s.customers.map((c) =>
        c.id === id ? { ...c, isBlacklisted: true } : c
      ),
    }));
  },

  getFilteredCustomers: () => {
    const { customers, customerSearch } = get();
    if (!customerSearch.trim()) return customers;
    const q = customerSearch.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email?.toLowerCase().includes(q)) ||
        c.code.toLowerCase().includes(q)
    );
  },

  getCustomerById: (id) => get().customers.find((c) => c.id === id),

  // ── Visits & Loyalty ──
  customerVisits: SEED_CUSTOMER_VISITS,
  loyaltyTransactions: SEED_LOYALTY_TRANSACTIONS,

  recordVisit: (visit) => {
    const newVisit: CustomerVisit = { ...visit, id: `visit-${uuid()}` };
    set((s) => ({ customerVisits: [newVisit, ...s.customerVisits] }));
  },

  earnPoints: (customerId, orderTotal, orderId) => {
    const points = calcEarnPoints(orderTotal);
    const tx: LoyaltyTransaction = {
      id: `lp-${uuid()}`,
      customerId,
      type: 'EARN',
      points,
      description: `Earned from order #${orderId.slice(-6).toUpperCase()}`,
      orderId,
      createdAt: nowISO(),
    };
    set((s) => {
      const customers = s.customers.map((c) => {
        if (c.id !== customerId) return c;
        const newLifetime = c.lifetimeSpend + orderTotal;
        return {
          ...c,
          totalPoints: c.totalPoints + points,
          lifetimeSpend: newLifetime,
          totalVisits: c.totalVisits + 1,
          averageOrderValue: Math.round(newLifetime / (c.totalVisits + 1)),
          tier: calcTier(newLifetime),
          lastVisitDate: nowISO().slice(0, 10),
        };
      });
      return { customers, loyaltyTransactions: [tx, ...s.loyaltyTransactions] };
    });
  },

  redeemPoints: (customerId, points, orderId) => {
    const cust = get().customers.find((c) => c.id === customerId);
    if (!cust || cust.totalPoints < points) return false;
    const tx: LoyaltyTransaction = {
      id: `lp-${uuid()}`,
      customerId,
      type: 'REDEEM',
      points: -points,
      description: `Redeemed ${points}pts for ৳${(calcRedemptionValue(points) / 100).toFixed(0)} discount`,
      orderId,
      createdAt: nowISO(),
    };
    set((s) => ({
      customers: s.customers.map((c) =>
        c.id === customerId ? { ...c, totalPoints: c.totalPoints - points } : c
      ),
      loyaltyTransactions: [tx, ...s.loyaltyTransactions],
    }));
    return true;
  },

  getCustomerVisits: (customerId) =>
    get().customerVisits.filter((v) => v.customerId === customerId),

  getLoyaltyHistory: (customerId) =>
    get().loyaltyTransactions.filter((t) => t.customerId === customerId),

  // ── Reservations ──
  reservations: SEED_RESERVATIONS,
  reservationSearch: '',
  reservationDateFilter: new Date().toISOString().slice(0, 10), // today

  setReservationSearch: (q) => set({ reservationSearch: q }),
  setReservationDateFilter: (d) => set({ reservationDateFilter: d }),

  createReservation: (data) => {
    const existing = get().reservations;
    const seq = (existing.length + 1).toString().padStart(3, '0');
    const dateStr = data.date.replace(/-/g, '');
    const res: Reservation = {
      ...data,
      id: `res-${uuid()}`,
      reservationNumber: `RES-${dateStr}-${seq}`,
      status: 'PENDING',
      reminderSent: false,
      createdAt: nowISO(),
    };
    set({ reservations: [res, ...existing] });
    return res;
  },

  updateReservationStatus: (id, status, _note) => {
    set((s) => ({
      reservations: s.reservations.map((r) => {
        if (r.id !== id) return r;
        const updates: Partial<Reservation> = { status };
        if (status === 'CONFIRMED') updates.confirmedAt = nowISO();
        if (status === 'SEATED') updates.seatedAt = nowISO();
        if (status === 'CANCELLED') updates.cancelledAt = nowISO();
        return { ...r, ...updates };
      }),
    }));
  },

  assignReservationTable: (resId, tableId, tableName) => {
    set((s) => ({
      reservations: s.reservations.map((r) =>
        r.id === resId ? { ...r, tableId, tableName } : r
      ),
    }));
  },

  getReservationsForDate: (date) =>
    get().reservations.filter((r) => r.date === date),

  getTodayReservations: () => {
    const today = new Date().toISOString().slice(0, 10);
    return get().reservations.filter((r) => r.date === today);
  },

  // ── Waitlist ──
  waitlist: SEED_WAITLIST,

  addToWaitlist: (entry) => {
    const newEntry: WaitlistEntry = {
      ...entry,
      id: `wait-${uuid()}`,
      status: 'WAITING',
      addedAt: nowISO(),
    };
    set((s) => ({ waitlist: [...s.waitlist, newEntry] }));
    return newEntry;
  },

  notifyWaitlistEntry: (id) => {
    set((s) => ({
      waitlist: s.waitlist.map((w) =>
        w.id === id ? { ...w, status: 'NOTIFIED' as WaitlistStatus, notifiedAt: nowISO() } : w
      ),
    }));
  },

  seatWaitlistEntry: (id) => {
    set((s) => ({
      waitlist: s.waitlist.map((w) => {
        if (w.id !== id) return w;
        const addedMs = new Date(w.addedAt).getTime();
        const actualWait = Math.round((Date.now() - addedMs) / 60000);
        return { ...w, status: 'SEATED' as WaitlistStatus, seatedAt: nowISO(), actualWaitMinutes: actualWait };
      }),
    }));
  },

  removeFromWaitlist: (id) => {
    set((s) => ({
      waitlist: s.waitlist.map((w) =>
        w.id === id ? { ...w, status: 'LEFT' as WaitlistStatus } : w
      ),
    }));
  },

  getActiveWaitlist: () =>
    get().waitlist.filter((w) => w.status === 'WAITING' || w.status === 'NOTIFIED'),

  // ── Delivery Zones ──
  deliveryZones: SEED_DELIVERY_ZONES,

  toggleZoneActive: (id) => {
    set((s) => ({
      deliveryZones: s.deliveryZones.map((z) =>
        z.id === id ? { ...z, isActive: !z.isActive } : z
      ),
    }));
  },

  getZoneForArea: (area) =>
    get().deliveryZones.find(
      (z) => z.isActive && z.areas.some((a) => a.toLowerCase() === area.toLowerCase())
    ),

  // ── Delivery Orders ──
  deliveryOrders: SEED_DELIVERY_ORDERS,
  deliveryStatusFilter: 'ALL',

  setDeliveryStatusFilter: (s) => set({ deliveryStatusFilter: s }),

  createDeliveryOrder: (data) => {
    const existing = get().deliveryOrders;
    const seq = (existing.length + 1).toString().padStart(4, '0');
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const order: DeliveryOrder = {
      ...data,
      id: `del-${uuid()}`,
      orderNumber: `DEL-${dateStr}-${seq}`,
      status: 'ORDER_PLACED',
      placedAt: nowISO(),
    };
    set({ deliveryOrders: [order, ...existing] });
    return order;
  },

  updateDeliveryStatus: (id, status) => {
    set((s) => ({
      deliveryOrders: s.deliveryOrders.map((o) =>
        o.id === id ? { ...o, status } : o
      ),
    }));
  },

  assignRider: (deliveryId, riderId) => {
    const rider = get().riders.find((r) => r.id === riderId);
    if (!rider) return;
    set((s) => ({
      deliveryOrders: s.deliveryOrders.map((o) =>
        o.id === deliveryId
          ? { ...o, riderId, riderName: rider.name, riderPhone: rider.phone, status: 'RIDER_ASSIGNED' as DeliveryStatus }
          : o
      ),
      riders: s.riders.map((r) =>
        r.id === riderId ? { ...r, status: 'ON_DELIVERY' as Rider['status'], activeDeliveryId: deliveryId } : r
      ),
    }));
  },

  completeDelivery: (deliveryId, proofUrl) => {
    const order = get().deliveryOrders.find((o) => o.id === deliveryId);
    set((s) => ({
      deliveryOrders: s.deliveryOrders.map((o) =>
        o.id === deliveryId
          ? { ...o, status: 'DELIVERED' as DeliveryStatus, deliveredAt: nowISO(), proofOfDeliveryUrl: proofUrl }
          : o
      ),
      riders: order?.riderId
        ? s.riders.map((r) =>
            r.id === order.riderId
              ? {
                  ...r,
                  status: 'AVAILABLE' as Rider['status'],
                  activeDeliveryId: undefined,
                  totalDeliveriesToday: r.totalDeliveriesToday + 1,
                  earnings: r.earnings + 6000, // flat 60 BDT per delivery
                }
              : r
          )
        : s.riders,
    }));
    // Earn loyalty points on delivery
    if (order?.customerId) {
      get().earnPoints(order.customerId, order.subtotal, order.id);
    }
  },

  getFilteredDeliveryOrders: () => {
    const { deliveryOrders, deliveryStatusFilter } = get();
    if (deliveryStatusFilter === 'ALL') return deliveryOrders;
    return deliveryOrders.filter((o) => o.status === deliveryStatusFilter);
  },

  getActiveDeliveryOrders: () =>
    get().deliveryOrders.filter(
      (o) => !['DELIVERED', 'FAILED', 'CANCELLED'].includes(o.status)
    ),

  // ── Riders ──
  riders: SEED_RIDERS,

  updateRiderLocation: (riderId, lat, lng) => {
    set((s) => ({
      riders: s.riders.map((r) =>
        r.id === riderId ? { ...r, currentLat: lat, currentLng: lng } : r
      ),
    }));
  },

  setRiderStatus: (riderId, status) => {
    set((s) => ({
      riders: s.riders.map((r) =>
        r.id === riderId ? { ...r, status } : r
      ),
    }));
  },

  getAvailableRiders: () =>
    get().riders.filter((r) => r.status === 'AVAILABLE'),

  // ── Promo Rules ──
  promoRules: SEED_PROMO_RULES,

  validatePromoCode: (code, orderTotal, _customerId) => {
    const rule = get().promoRules.find(
      (p) => p.code.toUpperCase() === code.toUpperCase() && p.isActive
    );
    if (!rule) return null;
    const now = new Date().toISOString().slice(0, 10);
    if (now < rule.validFrom || now > rule.validUntil) return null;
    if (orderTotal < rule.minimumOrder) return null;
    if (rule.totalUsesRemaining <= 0) return null;
    return rule;
  },

  applyPromoCode: (code, customerId) => {
    const rule = get().validatePromoCode(code, 0, customerId);
    if (!rule) return null;
    let discountMinor = 0;
    let label = '';
    if (rule.type === 'PERCENT_DISCOUNT' || rule.type === 'BIRTHDAY') {
      // will be calculated at cart level — return the rule value
      label = `${rule.value}% off (${rule.code})`;
      discountMinor = rule.value; // percentage — caller applies to subtotal
    } else if (rule.type === 'FIXED_DISCOUNT') {
      discountMinor = rule.value;
      label = `৳${(rule.value / 100).toFixed(0)} off (${rule.code})`;
    } else if (rule.type === 'FREE_DELIVERY') {
      label = `Free Delivery (${rule.code})`;
      discountMinor = 0; // handled at delivery fee level
    }
    set((s) => ({
      promoRules: s.promoRules.map((p) =>
        p.code === rule.code
          ? { ...p, totalUsesRemaining: p.totalUsesRemaining - 1 }
          : p
      ),
    }));
    return { discountMinor, label };
  },

  // ── Feedback ──
  feedbackList: SEED_FEEDBACK,

  submitFeedback: (data) => {
    const fb: CustomerFeedback = {
      ...data,
      id: `fb-${uuid()}`,
      isPublished: false,
      createdAt: nowISO(),
    };
    set((s) => ({ feedbackList: [fb, ...s.feedbackList] }));
  },

  replyToFeedback: (id, replyText) => {
    set((s) => ({
      feedbackList: s.feedbackList.map((f) =>
        f.id === id ? { ...f, repliedAt: nowISO(), replyText, isPublished: true } : f
      ),
    }));
  },

  getPublishedFeedback: () =>
    get().feedbackList.filter((f) => f.isPublished),

  getAverageRating: () => {
    const list = get().feedbackList;
    if (!list.length) return 0;
    return +(list.reduce((acc, f) => acc + f.rating, 0) / list.length).toFixed(1);
  },

  // ── CRM Dashboard Metrics ──
  getCrmDashboardMetrics: () => {
    const { customers, reservations, deliveryOrders, feedbackList } = get();
    const today = new Date().toISOString().slice(0, 10);
    const thisMonth = today.slice(0, 7);
    const todayMMDD = today.slice(5); // "MM-DD"

    const birthdaysToday = customers.filter(
      (c) => c.birthday === todayMMDD && !c.isBlacklisted
    );

    return {
      totalCustomers: customers.filter((c) => !c.isBlacklisted).length,
      newThisMonth: customers.filter(
        (c) => c.joinDate.startsWith(thisMonth)
      ).length,
      activeToday: customers.filter(
        (c) => c.lastVisitDate === today
      ).length,
      loyaltyPointsInCirculation: customers.reduce(
        (acc, c) => acc + c.totalPoints, 0
      ),
      pendingReservations: reservations.filter(
        (r) => r.status === 'PENDING'
      ).length,
      todayReservations: reservations.filter(
        (r) => r.date === today
      ).length,
      activeDeliveries: deliveryOrders.filter(
        (o) => !['DELIVERED', 'FAILED', 'CANCELLED'].includes(o.status)
      ).length,
      avgRating: +(feedbackList.reduce((a, f) => a + f.rating, 0) / (feedbackList.length || 1)).toFixed(1),
      birthdaysToday,
    };
  },
}));
