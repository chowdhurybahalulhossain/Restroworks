export type RoleName = 
  | 'SUPER_ADMIN'
  | 'OWNER'
  | 'BRANCH_MANAGER'
  | 'CASHIER'
  | 'WAITER'
  | 'CHEF'
  | 'BARTENDER'
  | 'INVENTORY_MANAGER'
  | 'ACCOUNTANT'
  | 'RIDER'
  | 'CUSTOMER';

export type PermissionCode =
  | 'ORDER_VIEW'
  | 'ORDER_CREATE'
  | 'ORDER_EDIT'
  | 'ORDER_VOID'
  | 'BILL_CREATE'
  | 'BILL_DISCOUNT'
  | 'BILL_REFUND'
  | 'BILL_REOPEN'
  | 'DRAWER_KICK'
  | 'KDS_VIEW'
  | 'KDS_BUMP'
  | 'KDS_86_TOGGLE'
  | 'MENU_MANAGE'
  | 'INVENTORY_MANAGE'
  | 'REPORTS_VIEW'
  | 'SETTINGS_MANAGE'
  | 'AUDIT_VIEW';

export interface User {
  id: string;
  tenantId: string;
  branchId: string;
  name: string;
  email: string;
  phone: string;
  pin: string; // 4-digit PIN for quick terminal login
  role: RoleName;
  permissions: PermissionCode[];
  avatarUrl?: string;
  isActive: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  plan: 'STARTER' | 'GROWTH' | 'ENTERPRISE';
  currency: string;
  currencySymbol: string;
}

export interface Branch {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  taxBin: string;
  isMain: boolean;
}

export type TableStatus = 
  | 'AVAILABLE' 
  | 'OCCUPIED' 
  | 'ORDERED' 
  | 'FOOD_READY' 
  | 'BILL_REQUESTED' 
  | 'CLEANING' 
  | 'RESERVED' 
  | 'BLOCKED';

export type TableShape = 'ROUND' | 'SQUARE' | 'RECTANGLE' | 'BOOTH' | 'BAR_STOOL';

export interface Table {
  id: string;
  branchId: string;
  zoneId: string;
  number: string;
  name: string;
  capacity: number;
  shape: TableShape;
  status: TableStatus;
  x: number;
  y: number;
  activeOrderId?: string;
  guestCount?: number;
  waiterId?: string;
  waiterName?: string;
  elapsedSeconds?: number;
}

export interface Zone {
  id: string;
  branchId: string;
  name: string;
  icon: string;
}

export type KitchenStation = 'KITCHEN' | 'GRILL' | 'BAR' | 'DESSERT' | 'EXPO';

export interface MenuItemVariant {
  id: string;
  nameEn: string;
  nameBn: string;
  priceDelta: number; // In minor units
}

export interface MenuItemModifier {
  id: string;
  nameEn: string;
  nameBn: string;
  price: number; // In minor units
  isDefault?: boolean;
}

export interface ModifierGroup {
  id: string;
  nameEn: string;
  nameBn: string;
  isRequired: boolean;
  minSelections: number;
  maxSelections: number;
  modifiers: MenuItemModifier[];
}

export interface MenuItem {
  id: string;
  categoryId: string;
  sku: string;
  barcode?: string;
  nameEn: string;
  nameBn: string;
  descriptionEn: string;
  descriptionBn: string;
  basePrice: number; // In minor units (e.g. 55000 = 550.00 BDT)
  costPrice: number;
  image: string;
  station: KitchenStation;
  prepTimeMinutes: number;
  calories: number;
  allergens: string[];
  isVeg: boolean;
  isVegan: boolean;
  isHalal: boolean;
  spiceLevel: 0 | 1 | 2 | 3; // 0=mild, 3=hot
  is86: boolean; // Out of stock
  variants?: MenuItemVariant[];
  modifierGroups?: ModifierGroup[];
}

export interface MenuCategory {
  id: string;
  nameEn: string;
  nameBn: string;
  icon: string;
  displayOrder: number;
}

export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY' | 'PICKUP' | 'BAR_TAB';
export type OrderStatus = 'DRAFT' | 'PLACED' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED' | 'CANCELLED';
export type ItemCourse = 'STARTER' | 'MAIN' | 'DESSERT' | 'BEVERAGE';
export type OrderItemStatus = 'PENDING' | 'FIRED' | 'PREPARING' | 'READY' | 'SERVED' | 'VOIDED';

export interface SelectedModifier {
  modifierId: string;
  nameEn: string;
  price: number;
}

export interface CartItem {
  id: string; // client uuid
  menuItemId: string;
  nameEn: string;
  nameBn: string;
  variantId?: string;
  variantName?: string;
  unitPrice: number;
  quantity: number;
  selectedModifiers: SelectedModifier[];
  itemNotes?: string;
  course: ItemCourse;
  seatNumber?: number;
  status: OrderItemStatus;
  station: KitchenStation;
  voidReason?: string;
}

export interface Order {
  id: string; // client UUID
  orderNumber: string;
  tenantId: string;
  branchId: string;
  orderType: OrderType;
  tableId?: string;
  tableName?: string;
  guestCount: number;
  waiterId: string;
  waiterName: string;
  items: CartItem[];
  status: OrderStatus;
  createdAt: string;
  firedAt?: string;
  estimatedPrepMinutes: number;
}

export interface KitchenTicket {
  id: string;
  ticketNumber: string;
  orderId: string;
  tableName?: string;
  orderType: OrderType;
  station: KitchenStation;
  items: {
    id: string;
    cartItemId: string;
    nameEn: string;
    nameBn: string;
    quantity: number;
    course: ItemCourse;
    notes?: string;
    modifiers: string[];
    isReady: boolean;
  }[];
  createdAt: string;
  isBumped: boolean;
  bumpedAt?: string;
}

export interface TaxBreakdown {
  name: string;
  ratePercentage: number;
  amount: number;
}

export interface Bill {
  id: string;
  orderId: string;
  fiscalInvoiceNumber: string;
  subtotal: number;
  discountAmount: number;
  discountReason?: string;
  serviceChargeAmount: number;
  taxes: TaxBreakdown[];
  totalTax: number;
  roundingDifference: number;
  grandTotal: number; // In minor units
  paidAmount: number;
  isPaid: boolean;
  paymentMethod?: string;
  closedAt?: string;
}

export interface Shift {
  id: string;
  branchId: string;
  cashierId: string;
  cashierName: string;
  openedAt: string;
  closedAt?: string;
  openingFloat: number; // minor units
  totalCashSales: number;
  totalCardSales: number;
  totalMfsSales: number;
  actualCashClose?: number;
  variance?: number;
  isOpen: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
}

export type UnitOfMeasure = 'KG' | 'GRAM' | 'LITER' | 'ML' | 'PIECE' | 'PACK';

export interface Ingredient {
  id: string;
  sku: string;
  name: string;
  unit: UnitOfMeasure;
  costPerUnit: number; // In minor units (e.g. 120000 = 1,200 BDT/kg)
  currentStock: number;
  parLevel: number;
  reorderPoint: number;
}

export interface RecipeLine {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: UnitOfMeasure;
  wastagePct: number;
}

export interface Recipe {
  id: string;
  menuItemId: string;
  menuItemName: string;
  yieldServings: number;
  lines: RecipeLine[];
}

export interface WastageLog {
  id: string;
  timestamp: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: UnitOfMeasure;
  reason: 'BURNT' | 'EXPIRED' | 'SPILLED' | 'QUALITY_DEFECT';
  cost: number; // minor units
  reportedByName: string;
}

export interface PurchaseOrderItem {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: UnitOfMeasure;
  unitCost: number; // minor units
  totalCost: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  totalCost: number;
  status: 'DRAFT' | 'SUBMITTED' | 'RECEIVED';
  createdAt: string;
  receivedAt?: string;
}

export interface StaffAttendance {
  id: string;
  userId: string;
  userName: string;
  role: string;
  clockIn: string;
  clockOut?: string;
  breakMinutes: number;
  overtimeMinutes: number;
  status: 'ON_DUTY' | 'ON_BREAK' | 'CLOCKED_OUT';
}

export type ExpenseCategory = 'UTILITIES' | 'MAINTENANCE' | 'PANTRY_PURCHASE' | 'CLEANING' | 'MARKETING';

export interface ExpenseVoucher {
  id: string;
  voucherNumber: string;
  category: ExpenseCategory;
  amount: number; // minor units
  notes: string;
  approvedByName: string;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  refId: string;
  description: string;
}

export type PortalApp = 
  | 'POS_TERMINAL'
  | 'KITCHEN_DISPLAY'
  | 'ADMIN_DASHBOARD'
  | 'OPERATIONS_HUB'
  | 'CUSTOMER_QR'
  | 'WAITER_HANDHELD'
  | 'CUSTOMER_DISPLAY'
  | 'RIDER_VIEW'
  | 'DESIGN_SYSTEM';
