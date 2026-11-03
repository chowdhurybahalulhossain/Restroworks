// ============================================================
// NOVAPOS Phase 3 — CRM, Reservation & Delivery Domain Types
// ============================================================

// ─── Customer & Loyalty ───────────────────────────────────

export type LoyaltyTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  type: 'EARN' | 'REDEEM' | 'EXPIRE' | 'BONUS';
  points: number;
  description: string;
  orderId?: string;
  createdAt: string;
}

export interface CustomerAddress {
  id: string;
  label: string; // e.g. "Home", "Office"
  line1: string;
  line2?: string;
  area: string;
  city: string;
  isDefault: boolean;
}

export interface CustomerNote {
  id: string;
  note: string;
  addedByName: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  tenantId: string;
  code: string;            // e.g. "CUST-00123"
  name: string;
  email?: string;
  phone: string;
  avatarInitials: string;  // e.g. "AR" from "Ayasha Rahman"
  tier: LoyaltyTier;
  totalPoints: number;
  lifetimeSpend: number;   // minor units
  totalVisits: number;
  averageOrderValue: number; // minor units
  lastVisitDate?: string;
  joinDate: string;
  birthday?: string;       // "MM-DD" format
  addresses: CustomerAddress[];
  allergenFlags: string[];
  dietaryPrefs: string[];  // e.g. ["VEGAN", "GLUTEN_FREE"]
  notes: CustomerNote[];
  isBlacklisted: boolean;
  preferredPaymentMethod?: string;
  referralCode: string;
  referredByCode?: string;
}

export interface CustomerVisit {
  id: string;
  customerId: string;
  branchId: string;
  branchName: string;
  orderId: string;
  orderTotal: number;       // minor units
  pointsEarned: number;
  pointsRedeemed: number;
  visitDate: string;
  tableId?: string;
  tableName?: string;
  feedbackRating?: 1 | 2 | 3 | 4 | 5;
  feedbackComment?: string;
}

// ─── Reservations ─────────────────────────────────────────

export type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SEATED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export type ReservationSource = 'WALK_IN' | 'PHONE' | 'ONLINE' | 'QR' | 'STAFF';

export interface Reservation {
  id: string;
  reservationNumber: string;  // e.g. "RES-20261104-001"
  branchId: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  guestCount: number;
  date: string;               // "YYYY-MM-DD"
  timeSlot: string;           // "HH:MM" e.g. "19:30"
  durationMinutes: number;
  tableId?: string;
  tableName?: string;
  status: ReservationStatus;
  source: ReservationSource;
  specialRequests?: string;
  depositPaid: number;        // minor units
  reminderSent: boolean;
  createdAt: string;
  confirmedAt?: string;
  seatedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  assignedWaiterName?: string;
}

// ─── Waitlist ──────────────────────────────────────────────

export type WaitlistStatus = 'WAITING' | 'NOTIFIED' | 'SEATED' | 'LEFT';

export interface WaitlistEntry {
  id: string;
  branchId: string;
  customerName: string;
  customerPhone: string;
  guestCount: number;
  partyType: 'INDOOR' | 'OUTDOOR' | 'ANY';
  estimatedWaitMinutes: number;
  actualWaitMinutes?: number;
  status: WaitlistStatus;
  addedAt: string;
  notifiedAt?: string;
  seatedAt?: string;
  notes?: string;
}

// ─── Online Ordering & Delivery ───────────────────────────

export type DeliveryStatus =
  | 'ORDER_PLACED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'RIDER_ASSIGNED'
  | 'PICKED_UP'
  | 'ON_THE_WAY'
  | 'DELIVERED'
  | 'FAILED'
  | 'CANCELLED';

export type DeliveryOrderType = 'DELIVERY' | 'PICKUP';

export interface DeliveryZone {
  id: string;
  branchId: string;
  name: string;              // e.g. "Gulshan Zone"
  areas: string[];           // e.g. ["Gulshan-1", "Gulshan-2", "Banani"]
  deliveryFee: number;       // minor units
  estimatedMinutes: number;
  minimumOrder: number;      // minor units
  isActive: boolean;
}

export interface DeliveryOrder {
  id: string;
  orderNumber: string;       // e.g. "DEL-20261104-0042"
  branchId: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: CustomerAddress;
  orderType: DeliveryOrderType;
  items: DeliveryOrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  grandTotal: number;
  status: DeliveryStatus;
  paymentMethod: 'COD' | 'CARD' | 'MFS';
  isPaid: boolean;
  riderId?: string;
  riderName?: string;
  riderPhone?: string;
  estimatedDeliveryTime: string; // ISO string
  placedAt: string;
  confirmedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  proofOfDeliveryUrl?: string;
  cancelReason?: string;
  specialInstructions?: string;
  loyaltyPointsEarned: number;
}

export interface DeliveryOrderItem {
  id: string;
  menuItemId: string;
  nameEn: string;
  nameBn: string;
  quantity: number;
  unitPrice: number;
  modifiers: string[];
  notes?: string;
}

// ─── Rider ────────────────────────────────────────────────

export type RiderStatus = 'AVAILABLE' | 'ON_DELIVERY' | 'OFF_DUTY' | 'BREAK';

export interface Rider {
  id: string;
  name: string;
  phone: string;
  vehicleType: 'BICYCLE' | 'MOTORCYCLE' | 'CAR';
  vehicleNumber: string;
  status: RiderStatus;
  currentLat?: number;
  currentLng?: number;
  activeDeliveryId?: string;
  totalDeliveriesToday: number;
  earnings: number;           // minor units, today
  rating: number;             // 1.0 – 5.0
}

// ─── SMS / Notification ───────────────────────────────────

export type NotificationChannel = 'SMS' | 'EMAIL' | 'PUSH' | 'WHATSAPP';

export interface NotificationLog {
  id: string;
  customerId?: string;
  channel: NotificationChannel;
  template: string;
  message: string;
  sentAt: string;
  status: 'SENT' | 'FAILED' | 'PENDING';
}

// ─── Promo & Loyalty Rules ────────────────────────────────

export type PromoType =
  | 'FIXED_DISCOUNT'
  | 'PERCENT_DISCOUNT'
  | 'BUY_X_GET_Y'
  | 'BIRTHDAY'
  | 'LOYALTY_REDEEM'
  | 'FREE_DELIVERY'
  | 'FIRST_ORDER';

export interface PromoRule {
  id: string;
  code: string;              // e.g. "BIRTHDAY20"
  type: PromoType;
  value: number;             // % or minor units depending on type
  minimumOrder: number;      // minor units
  maxUsesPerCustomer: number;
  totalUsesRemaining: number;
  validFrom: string;
  validUntil: string;
  applicableTierMin: LoyaltyTier; // e.g. SILVER and above
  isActive: boolean;
}

// ─── Feedback ─────────────────────────────────────────────

export interface CustomerFeedback {
  id: string;
  customerId?: string;
  customerName: string;
  branchId: string;
  orderId?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  foodRating: 1 | 2 | 3 | 4 | 5;
  serviceRating: 1 | 2 | 3 | 4 | 5;
  ambienceRating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  tags: string[];            // e.g. ["SLOW_SERVICE", "GREAT_FOOD"]
  isPublished: boolean;
  repliedAt?: string;
  replyText?: string;
  createdAt: string;
}
