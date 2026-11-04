import { create } from 'zustand';
import { 
  User, Tenant, Branch, Table, MenuItem, MenuCategory, CartItem, 
  KitchenTicket, Bill, Shift, AuditLogEntry, PortalApp, KitchenStation, ItemCourse,
  Ingredient, Recipe, WastageLog, PurchaseOrder, StaffAttendance, ExpenseVoucher,
  ExpenseCategory, JournalEntry
} from '../types';
import { 
  SEED_TENANT, SEED_BRANCHES, SEED_USERS, SEED_TABLES, 
  SEED_CATEGORIES, SEED_MENU_ITEMS, SEED_INITIAL_SHIFT, SEED_AUDIT_LOGS,
  SEED_INGREDIENTS, SEED_RECIPES, SEED_WASTAGE_LOGS, SEED_PURCHASE_ORDERS,
  SEED_STAFF_ATTENDANCE, SEED_EXPENSES, SEED_JOURNAL_ENTRIES
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

  // Language & Accessibility & Theme
  locale: 'en' | 'bn';
  toggleLocale: () => void;
  reducedMotion: boolean;
  toggleReducedMotion: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;

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

  // Phase 2: Operations, Inventory, Staff & Expenses
  ingredients: Ingredient[];
  recipes: Recipe[];
  wastageLogs: WastageLog[];
  purchaseOrders: PurchaseOrder[];
  staffAttendance: StaffAttendance[];
  expenses: ExpenseVoucher[];
  journalEntries: JournalEntry[];

  deductInventoryForCartItems: (items: CartItem[]) => void;
  logWastage: (ingredientId: string, quantity: number, reason: 'BURNT' | 'EXPIRED' | 'SPILLED' | 'QUALITY_DEFECT') => void;
  receivePurchaseOrder: (poId: string) => void;
  punchStaffTimeClock: (userId: string, action: 'IN' | 'OUT' | 'BREAK') => void;
  recordExpense: (category: ExpenseCategory, amount: number, notes: string) => void;
}

export const usePosStore = create<PosState>((set, get) => ({
  // Defaults
  activePortal: 'POS_TERMINAL',
  setActivePortal: (portal) => set({ activePortal: portal }),

  locale: 'en',
  toggleLocale: () => set((state) => ({ locale: state.locale === 'en' ? 'bn' : 'en' })),

  reducedMotion: false,
  toggleReducedMotion: () => set((state) => ({ reducedMotion: !state.reducedMotion })),

  theme: (typeof window !== 'undefined' && (localStorage.getItem('restroworks_theme') as 'dark' | 'light')) || 'dark',
  toggleTheme: () => set((state) => {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    if (typeof window !== 'undefined') {
      localStorage.setItem('restroworks_theme', nextTheme);
      if (nextTheme === 'light') {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
      }
    }
    return { theme: nextTheme };
  }),

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

    // Deduct inventory ingredients based on recipes
    get().deductInventoryForCartItems(cart);

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

  // Phase 2 Initial States
  ingredients: SEED_INGREDIENTS,
  recipes: SEED_RECIPES,
  wastageLogs: SEED_WASTAGE_LOGS,
  purchaseOrders: SEED_PURCHASE_ORDERS,
  staffAttendance: SEED_STAFF_ATTENDANCE,
  expenses: SEED_EXPENSES,
  journalEntries: SEED_JOURNAL_ENTRIES,

  deductInventoryForCartItems: (items: CartItem[]) => {
    const { recipes, ingredients } = get();
    let updatedIngredients = [...ingredients];

    items.forEach((item) => {
      const recipe = recipes.find((r) => r.menuItemId === item.menuItemId);
      if (recipe) {
        recipe.lines.forEach((line) => {
          const qtyToDeduct = line.quantity * item.quantity;
          updatedIngredients = updatedIngredients.map((ing) => {
            if (ing.id === line.ingredientId) {
              const newStock = Math.max(0, +(ing.currentStock - qtyToDeduct).toFixed(3));
              if (newStock <= ing.reorderPoint) {
                get().addAuditLog(
                  'LOW_STOCK_ALERT',
                  'INGREDIENT',
                  ing.id,
                  `Warning: ${ing.name} stock (${newStock} ${ing.unit}) has breached reorder threshold (${ing.reorderPoint} ${ing.unit})`
                );
              }
              return { ...ing, currentStock: newStock };
            }
            return ing;
          });
        });
      }
    });

    set({ ingredients: updatedIngredients });
  },

  logWastage: (ingredientId, quantity, reason) => {
    const ing = get().ingredients.find((i) => i.id === ingredientId);
    if (!ing) return;

    const cost = Math.round(quantity * ing.costPerUnit);
    const newLog: WastageLog = {
      id: `wst-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ingredientId,
      ingredientName: ing.name,
      quantity,
      unit: ing.unit,
      reason,
      cost,
      reportedByName: get().currentUser.name,
    };

    set((state) => ({
      wastageLogs: [newLog, ...state.wastageLogs],
      ingredients: state.ingredients.map((i) =>
        i.id === ingredientId ? { ...i, currentStock: Math.max(0, +(i.currentStock - quantity).toFixed(3)) } : i
      ),
      journalEntries: [
        {
          id: `je-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          accountCode: '5020-SPOILAGE',
          accountName: 'Kitchen Spoilage & Wastage Loss',
          debit: cost,
          credit: 0,
          refId: newLog.id,
          description: `Logged wastage of ${quantity} ${ing.unit} ${ing.name} (${reason})`,
        },
        {
          id: `je-${Date.now()}-c`,
          date: new Date().toISOString().split('T')[0],
          accountCode: '1210-INV-PANTRY',
          accountName: 'Raw Ingredients Inventory Asset',
          debit: 0,
          credit: cost,
          refId: newLog.id,
          description: `Inventory reduction for spoiled ${ing.name}`,
        },
        ...state.journalEntries,
      ],
    }));

    get().addAuditLog('WASTAGE_LOGGED', 'INGREDIENT', ingredientId, `Logged ${quantity} ${ing.unit} ${ing.name} as ${reason} (Cost: ৳${cost / 100})`);
  },

  receivePurchaseOrder: (poId) => {
    const po = get().purchaseOrders.find((p) => p.id === poId);
    if (!po || po.status === 'RECEIVED') return;

    set((state) => {
      let updatedIngredients = [...state.ingredients];
      po.items.forEach((item) => {
        updatedIngredients = updatedIngredients.map((ing) =>
          ing.id === item.ingredientId
            ? { ...ing, currentStock: +(ing.currentStock + item.quantity).toFixed(3) }
            : ing
        );
      });

      const updatedPOs = state.purchaseOrders.map((p) =>
        p.id === poId ? { ...p, status: 'RECEIVED' as const, receivedAt: new Date().toISOString() } : p
      );

      return {
        ingredients: updatedIngredients,
        purchaseOrders: updatedPOs,
        journalEntries: [
          {
            id: `je-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            accountCode: '1210-INV-PANTRY',
            accountName: 'Raw Ingredients Inventory Asset',
            debit: po.totalCost,
            credit: 0,
            refId: po.poNumber,
            description: `Goods Receipt Note (GRN) for ${po.poNumber} from ${po.supplierName}`,
          },
          {
            id: `je-${Date.now()}-c`,
            date: new Date().toISOString().split('T')[0],
            accountCode: '2010-ACCOUNTS-PAYABLE',
            accountName: 'Trade Accounts Payable (Suppliers)',
            debit: 0,
            credit: po.totalCost,
            refId: po.poNumber,
            description: `Trade liability recognized for ${po.poNumber}`,
          },
          ...state.journalEntries,
        ],
      };
    });

    get().addAuditLog('PO_RECEIVED_GRN', 'PURCHASE_ORDER', poId, `Received ${po.poNumber} from ${po.supplierName} (Total: ৳${po.totalCost / 100})`);
  },

  punchStaffTimeClock: (userId, action) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    set((state) => ({
      staffAttendance: state.staffAttendance.map((att) => {
        if (att.userId === userId) {
          if (action === 'IN') return { ...att, clockIn: timeStr, status: 'ON_DUTY' as const };
          if (action === 'OUT') return { ...att, clockOut: timeStr, status: 'CLOCKED_OUT' as const };
          if (action === 'BREAK') return { ...att, status: 'ON_BREAK' as const };
        }
        return att;
      }),
    }));

    const staff = get().staffAttendance.find((a) => a.userId === userId);
    get().addAuditLog('TIME_CLOCK_PUNCH', 'STAFF', userId, `${staff?.userName || userId} punched ${action} at ${timeStr}`);
  },

  recordExpense: (category, amount, notes) => {
    const voucherNumber = `VOUCH-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newVoucher: ExpenseVoucher = {
      id: `exp-${Date.now()}`,
      voucherNumber,
      category,
      amount,
      notes,
      approvedByName: get().currentUser.name,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      expenses: [newVoucher, ...state.expenses],
      journalEntries: [
        {
          id: `je-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          accountCode: '6010-OPERATING-EXPENSE',
          accountName: `Operating Expense (${category})`,
          debit: amount,
          credit: 0,
          refId: voucherNumber,
          description: notes,
        },
        {
          id: `je-${Date.now()}-c`,
          date: new Date().toISOString().split('T')[0],
          accountCode: '1010-CASH',
          accountName: 'Cash on Hand / Drawer',
          debit: 0,
          credit: amount,
          refId: voucherNumber,
          description: `Petty cash disbursement for ${voucherNumber}`,
        },
        ...state.journalEntries,
      ],
    }));

    get().addAuditLog('EXPENSE_VOUCHER_CREATED', 'EXPENSE', newVoucher.id, `Created ${voucherNumber} (${category}) for ৳${amount / 100}: ${notes}`);
  },
}));

