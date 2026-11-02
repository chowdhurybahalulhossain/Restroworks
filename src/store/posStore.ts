import { create } from 'zustand';
import { 
  User, Tenant, Branch, Table, MenuItem, MenuCategory, CartItem, 
  KitchenTicket, Bill, Shift, AuditLogEntry, PortalApp, KitchenStation, ItemCourse
} from '../types';
import { 
  SEED_TENANT, SEED_BRANCHES, SEED_USERS, SEED_TABLES, 
  SEED_CATEGORIES, SEED_MENU_ITEMS, SEED_INITIAL_SHIFT, SEED_AUDIT_LOGS 
} from '../services/seed-data';

interface ManagerOverrideRequest {
  action: string;
  entityName: string;
  onApprove: () => void;
}

interface PosState {
  // Navigation & Multi-Portal
  activePortal: PortalApp;
  setActivePortal: (portal: PortalApp) => void;

  // Language & Accessibility
  locale: 'en' | 'bn';
  toggleLocale: () => void;
  reducedMotion: boolean;
  toggleReducedMotion: () => void;

  // Multi-Tenancy
  tenant: Tenant;
  branches: Branch[];
  activeBranchId: string;
  setActiveBranchId: (branchId: string) => void;

  // Auth & RBAC
  users: User[];
  currentUser: User;
  isLocked: boolean;
  setIsLocked: (locked: boolean) => void;
  loginWithPin: (pin: string) => boolean;
  switchUser: (userId: string) => void;

  // Manager Override
  overrideModalOpen: boolean;
  currentOverrideRequest: ManagerOverrideRequest | null;
  requestManagerOverride: (req: ManagerOverrideRequest) => void;
  approveManagerOverride: (pin: string) => boolean;
  closeManagerOverride: () => void;

  // Floor & Tables
  tables: Table[];
  selectedTableId: string | null;
  selectTable: (tableId: string | null) => void;
  updateTableStatus: (tableId: string, status: Table['status']) => void;

  // Menu Catalog & 86 Item Toggle
  categories: MenuCategory[];
  menuItems: MenuItem[];
  selectedCategoryId: string;
  setSelectedCategoryId: (catId: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  toggle86Item: (itemId: string) => void;

  // Order & Cart Engine
  cart: CartItem[];
  addToCart: (item: MenuItem, variantId?: string, modifiers?: { modifierId: string; nameEn: string; price: number }[]) => void;
  updateCartItemQuantity: (cartItemId: string, delta: number) => void;
  removeCartItem: (cartItemId: string) => void;
  updateCartItemCourse: (cartItemId: string, course: ItemCourse) => void;
  clearCart: () => void;

  // Calculations & Pricing Engine
  discountPercentage: number;
  setDiscountPercentage: (pct: number) => void;
  subtotal: number;
  discountAmount: number;
  serviceChargeAmount: number;
  taxAmount: number;
  grandTotal: number;

  // Kitchen Tickets (KDS)
  kitchenTickets: KitchenTicket[];
  fireCurrentOrderToKitchen: () => void;
  bumpTicket: (ticketId: string) => void;
  toggleTicketItemReady: (ticketId: string, itemId: string) => void;

  // Payment & Billing
  settlePayment: (paymentMethod: string) => { bill: Bill };
  recentBills: Bill[];

  // Shifts & Audits
  currentShift: Shift;
  auditLogs: AuditLogEntry[];
  addAuditLog: (action: string, entityType: string, entityId: string, details: string) => void;
}

export const usePosStore = create<PosState>((set, get) => ({
  // Defaults
  activePortal: 'POS_TERMINAL',
  setActivePortal: (portal) => set({ activePortal: portal }),

  locale: 'en',
  toggleLocale: () => set((state) => ({ locale: state.locale === 'en' ? 'bn' : 'en' })),

  reducedMotion: false,
  toggleReducedMotion: () => set((state) => ({ reducedMotion: !state.reducedMotion })),

  tenant: SEED_TENANT,
  branches: SEED_BRANCHES,
  activeBranchId: 'branch-gulshan',
  setActiveBranchId: (branchId) => set({ activeBranchId: branchId }),

  users: SEED_USERS,
  currentUser: SEED_USERS[2], // Nusrat Jahan (Lead Cashier)
  isLocked: false,
  setIsLocked: (locked) => set({ isLocked: locked }),

  loginWithPin: (pin: string) => {
    const matched = get().users.find((u) => u.pin === pin && u.isActive);
    if (matched) {
      set({ currentUser: matched, isLocked: false });
      get().addAuditLog('PIN_LOGIN_SUCCESS', 'USER', matched.id, `User ${matched.name} (${matched.role}) unlocked terminal`);
      return true;
    }
    return false;
  },

  switchUser: (userId: string) => {
    const user = get().users.find((u) => u.id === userId);
    if (user) {
      set({ currentUser: user });
      get().addAuditLog('USER_SWITCHED', 'USER', user.id, `Switched to active user ${user.name}`);
    }
  },

  overrideModalOpen: false,
  currentOverrideRequest: null,
  requestManagerOverride: (req) => {
    set({ overrideModalOpen: true, currentOverrideRequest: req });
  },
  approveManagerOverride: (pin: string) => {
    // Manager PIN is '1111' or Super Admin PIN '9999'
    const manager = get().users.find((u) => (u.role === 'BRANCH_MANAGER' || u.role === 'SUPER_ADMIN') && u.pin === pin);
    if (manager) {
      const req = get().currentOverrideRequest;
      if (req) {
        req.onApprove();
        get().addAuditLog(
          'MANAGER_OVERRIDE_APPROVED',
          'OVERRIDE',
          manager.id,
          `Manager ${manager.name} approved override for: ${req.action} on ${req.entityName}`
        );
      }
      set({ overrideModalOpen: false, currentOverrideRequest: null });
      return true;
    }
    return false;
  },
  closeManagerOverride: () => set({ overrideModalOpen: false, currentOverrideRequest: null }),

  tables: SEED_TABLES,
  selectedTableId: 'tbl-01',
  selectTable: (tableId) => set({ selectedTableId: tableId }),
  updateTableStatus: (tableId, status) => {
    set((state) => ({
      tables: state.tables.map((t) => (t.id === tableId ? { ...t, status } : t)),
    }));
  },

  categories: SEED_CATEGORIES,
  menuItems: SEED_MENU_ITEMS,
  selectedCategoryId: 'cat-starters',
  setSelectedCategoryId: (catId) => set({ selectedCategoryId: catId }),
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),

  toggle86Item: (itemId) => {
    set((state) => {
      const updated = state.menuItems.map((item) =>
        item.id === itemId ? { ...item, is86: !item.is86 } : item
      );
      const target = state.menuItems.find((i) => i.id === itemId);
      get().addAuditLog(
        'ITEM_86_TOGGLED',
        'MENU_ITEM',
        itemId,
        `${target?.nameEn} marked ${!target?.is86 ? 'SOLD OUT (86)' : 'AVAILABLE'}`
      );
      return { menuItems: updated };
    });
  },

  cart: [],
  addToCart: (item, variantId, selectedModifiers = []) => {
    if (item.is86) return; // Prevent adding 86'd items

    const modifierPriceSum = selectedModifiers.reduce((sum, m) => sum + m.price, 0);
    const lineUnitPrice = item.basePrice + modifierPriceSum;

    set((state) => {
      const existingIndex = state.cart.findIndex(
        (ci) => ci.menuItemId === item.id && ci.variantId === variantId && ci.status === 'PENDING'
      );

      let newCart = [...state.cart];
      if (existingIndex > -1) {
        newCart[existingIndex].quantity += 1;
      } else {
        const newCartItem: CartItem = {
          id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          menuItemId: item.id,
          nameEn: item.nameEn,
          nameBn: item.nameBn,
          variantId,
          unitPrice: lineUnitPrice,
          quantity: 1,
          selectedModifiers,
          course: item.categoryId === 'cat-starters' ? 'STARTER' : item.categoryId === 'cat-desserts' ? 'DESSERT' : 'MAIN',
          status: 'PENDING',
          station: item.station,
        };
        newCart.push(newCartItem);
      }

      // Recompute totals
      const sub = newCart.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);
      const disc = Math.round((sub * state.discountPercentage) / 100);
      const net = sub - disc;
      const sc = Math.round((net * 10) / 100); // 10% Service Charge
      const vat = Math.round(((net + sc) * 15) / 100); // 15% VAT
      const grand = net + sc + vat;

      return {
        cart: newCart,
        subtotal: sub,
        discountAmount: disc,
        serviceChargeAmount: sc,
        taxAmount: vat,
        grandTotal: grand,
      };
    });
  },

  updateCartItemQuantity: (cartItemId, delta) => {
    set((state) => {
      const target = state.cart.find((c) => c.id === cartItemId);
      if (!target) return state;

      // If item was already fired to kitchen, reducing/voiding requires manager override
      if (target.status !== 'PENDING' && delta < 0) {
        get().requestManagerOverride({
          action: 'VOID_FIRED_ITEM',
          entityName: target.nameEn,
          onApprove: () => {
            get().removeCartItem(cartItemId);
          },
        });
        return state;
      }

      const newQty = target.quantity + delta;
      let newCart = state.cart;
      if (newQty <= 0) {
        newCart = state.cart.filter((c) => c.id !== cartItemId);
      } else {
        newCart = state.cart.map((c) => (c.id === cartItemId ? { ...c, quantity: newQty } : c));
      }

      const sub = newCart.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);
      const disc = Math.round((sub * state.discountPercentage) / 100);
      const net = sub - disc;
      const sc = Math.round((net * 10) / 100);
      const vat = Math.round(((net + sc) * 15) / 100);

      return {
        cart: newCart,
        subtotal: sub,
        discountAmount: disc,
        serviceChargeAmount: sc,
        taxAmount: vat,
        grandTotal: net + sc + vat,
      };
    });
  },

  removeCartItem: (cartItemId) => {
    set((state) => {
      const newCart = state.cart.filter((c) => c.id !== cartItemId);
      const sub = newCart.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);
      const disc = Math.round((sub * state.discountPercentage) / 100);
      const net = sub - disc;
      const sc = Math.round((net * 10) / 100);
      const vat = Math.round(((net + sc) * 15) / 100);

      return {
        cart: newCart,
        subtotal: sub,
        discountAmount: disc,
        serviceChargeAmount: sc,
        taxAmount: vat,
        grandTotal: net + sc + vat,
      };
    });
  },

  updateCartItemCourse: (cartItemId, course) => {
    set((state) => ({
      cart: state.cart.map((c) => (c.id === cartItemId ? { ...c, course } : c)),
    }));
  },

  clearCart: () => {
    set({
      cart: [],
      discountPercentage: 0,
      subtotal: 0,
      discountAmount: 0,
      serviceChargeAmount: 0,
      taxAmount: 0,
      grandTotal: 0,
    });
  },

  discountPercentage: 0,
  setDiscountPercentage: (pct) => {
    // If discount > 15%, check if user is manager or request override
    const user = get().currentUser;
    const applyDiscount = () => {
      set((state) => {
        const sub = state.subtotal;
        const disc = Math.round((sub * pct) / 100);
        const net = sub - disc;
        const sc = Math.round((net * 10) / 100);
        const vat = Math.round(((net + sc) * 15) / 100);
        return {
          discountPercentage: pct,
          discountAmount: disc,
          serviceChargeAmount: sc,
          taxAmount: vat,
          grandTotal: net + sc + vat,
        };
      });
      get().addAuditLog('DISCOUNT_APPLIED', 'BILL', 'active_cart', `Applied ${pct}% discount`);
    };

    if (pct > 15 && user.role !== 'BRANCH_MANAGER' && user.role !== 'SUPER_ADMIN') {
      get().requestManagerOverride({
        action: 'HIGH_DISCOUNT_APPROVAL',
        entityName: `${pct}% Discount`,
        onApprove: applyDiscount,
      });
    } else {
      applyDiscount();
    }
  },

  subtotal: 0,
  discountAmount: 0,
  serviceChargeAmount: 0,
  taxAmount: 0,
  grandTotal: 0,

  kitchenTickets: [
    {
      id: 'kot-seed-101',
      ticketNumber: 'KOT #101',
      orderId: 'ord-seed-02',
      tableName: 'Table 2',
      orderType: 'DINE_IN',
      station: 'GRILL',
      items: [
        {
          id: 'ti-1',
          cartItemId: 'ci-1',
          nameEn: 'Prime Angus Ribeye (300g)',
          nameBn: 'প্রাইম অ্যাঙ্গাস রিবআই স্টেক',
          quantity: 2,
          course: 'MAIN',
          modifiers: ['Medium Rare', 'Truffle Mash'],
          isReady: false,
        },
        {
          id: 'ti-2',
          cartItemId: 'ci-2',
          nameEn: 'Truffle Truffle Fries',
          nameBn: 'ট্রাফেল পারমেসান ফ্রাইজ',
          quantity: 1,
          course: 'STARTER',
          modifiers: [],
          isReady: true,
        },
      ],
      createdAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(), // 14 mins ago (Amber)
      isBumped: false,
    },
    {
      id: 'kot-seed-102',
      ticketNumber: 'KOT #102',
      orderId: 'ord-seed-03',
      tableName: 'Table 3',
      orderType: 'DINE_IN',
      station: 'KITCHEN',
      items: [
        {
          id: 'ti-3',
          cartItemId: 'ci-3',
          nameEn: 'Dhaka Grand Kacchi Biryani',
          nameBn: 'ঢাকাই শাহী খাসির কাচ্চি বিরিয়ানি',
          quantity: 3,
          course: 'MAIN',
          modifiers: ['Extra Borhani'],
          isReady: false,
        },
      ],
      createdAt: new Date(Date.now() - 23 * 60 * 1000).toISOString(), // 23 mins ago (Urgent Red)
      isBumped: false,
    },
    {
      id: 'kot-seed-103',
      ticketNumber: 'KOT #103',
      orderId: 'ord-seed-04',
      tableName: 'Sky Table 2',
      orderType: 'DINE_IN',
      station: 'BAR',
      items: [
        {
          id: 'ti-4',
          cartItemId: 'ci-4',
          nameEn: 'Electric Cyan Neon Lagoon',
          nameBn: 'ইলেকট্রিক সায়ান নিয়ন লেগুন',
          quantity: 2,
          course: 'BEVERAGE',
          modifiers: [],
          isReady: false,
        },
        {
          id: 'ti-5',
          cartItemId: 'ci-5',
          nameEn: 'Nitro Cold Brew with Vanilla Cream',
          nameBn: 'নাইট্রো কোল্ড ব্রু',
          quantity: 1,
          course: 'BEVERAGE',
          modifiers: [],
          isReady: true,
        },
      ],
      createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(), // 4 mins ago (Green)
      isBumped: false,
    },
  ],

  fireCurrentOrderToKitchen: () => {
    const { cart, selectedTableId, tables } = get();
    if (cart.length === 0) return;

    const currentTable = tables.find((t) => t.id === selectedTableId);
    const ticketId = `kot-${Date.now()}`;
    const ticketNum = `KOT #${Math.floor(100 + Math.random() * 900)}`;

    const newTicket: KitchenTicket = {
      id: ticketId,
      ticketNumber: ticketNum,
      orderId: `ord-${Date.now()}`,
      tableName: currentTable?.name || 'Quick Counter',
      orderType: 'DINE_IN',
      station: cart[0]?.station || 'KITCHEN',
      items: cart.map((c) => ({
        id: `ti-${Math.random().toString(36).substr(2, 6)}`,
        cartItemId: c.id,
        nameEn: c.nameEn,
        nameBn: c.nameBn,
        quantity: c.quantity,
        course: c.course,
        modifiers: c.selectedModifiers.map((m) => m.nameEn),
        isReady: false,
      })),
      createdAt: new Date().toISOString(),
      isBumped: false,
    };

    // Update cart items to FIRED
    set((state) => ({
      kitchenTickets: [newTicket, ...state.kitchenTickets],
      cart: state.cart.map((c) => ({ ...c, status: 'FIRED' })),
    }));

    if (selectedTableId) {
      get().updateTableStatus(selectedTableId, 'ORDERED');
    }

    get().addAuditLog('KOT_FIRED', 'KITCHEN_TICKET', ticketId, `Fired ${ticketNum} with ${cart.length} items to Kitchen`);
  },

  bumpTicket: (ticketId) => {
    set((state) => ({
      kitchenTickets: state.kitchenTickets.map((t) =>
        t.id === ticketId ? { ...t, isBumped: true, bumpedAt: new Date().toISOString() } : t
      ),
    }));
    get().addAuditLog('KDS_TICKET_BUMPED', 'KITCHEN_TICKET', ticketId, `Ticket ${ticketId} marked completed & bumped`);
  },

  toggleTicketItemReady: (ticketId, itemId) => {
    set((state) => ({
      kitchenTickets: state.kitchenTickets.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            items: t.items.map((i) => (i.id === itemId ? { ...i, isReady: !i.isReady } : i)),
          };
        }
        return t;
      }),
    }));
  },

  recentBills: [],

  settlePayment: (paymentMethod: string) => {
    const { grandTotal, subtotal, discountAmount, serviceChargeAmount, taxAmount, selectedTableId } = get();
    const invoiceNum = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const newBill: Bill = {
      id: `bill-${Date.now()}`,
      orderId: `ord-${Date.now()}`,
      fiscalInvoiceNumber: invoiceNum,
      subtotal,
      discountAmount,
      serviceChargeAmount,
      taxes: [{ name: 'VAT (15%)', ratePercentage: 15, amount: taxAmount }],
      totalTax: taxAmount,
      roundingDifference: 0,
      grandTotal,
      paidAmount: grandTotal,
      isPaid: true,
      paymentMethod,
      closedAt: new Date().toISOString(),
    };

    set((state) => {
      // Update shift totals
      const shift = { ...state.currentShift };
      if (paymentMethod === 'CASH') {
        shift.totalCashSales += grandTotal;
      } else if (paymentMethod === 'CARD') {
        shift.totalCardSales += grandTotal;
      } else {
        shift.totalMfsSales += grandTotal;
      }

      return {
        recentBills: [newBill, ...state.recentBills],
        currentShift: shift,
      };
    });

    if (selectedTableId) {
      get().updateTableStatus(selectedTableId, 'CLEANING');
      setTimeout(() => {
        get().updateTableStatus(selectedTableId, 'AVAILABLE');
      }, 5000);
    }

    get().addAuditLog(
      'BILL_SETTLED',
      'BILL',
      newBill.id,
      `Invoice ${invoiceNum} settled via ${paymentMethod} for ${grandTotal / 100} BDT`
    );

    get().clearCart();
    return { bill: newBill };
  },

  currentShift: SEED_INITIAL_SHIFT,
  auditLogs: SEED_AUDIT_LOGS,
  addAuditLog: (action, entityType, entityId, details) => {
    const user = get().currentUser;
    const newEntry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action,
      entityType,
      entityId,
      details,
    };
    set((state) => ({
      auditLogs: [newEntry, ...state.auditLogs],
    }));
  },
}));
