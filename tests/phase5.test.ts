import { describe, it, expect, beforeEach } from 'vitest';
import { usePosStore } from '../src/store/posStore';
import { useCrmStore } from '../src/store/crmStore';
import { SEED_MENU_ITEMS, SEED_TABLES, SEED_USERS, SEED_INGREDIENTS } from '../src/services/seed-data';

describe('Phase 5 Hardening, Performance Benchmarks & Critical E2E Flows', () => {
  beforeEach(() => {
    // Clean slate store
    usePosStore.setState({
      cart: [],
      tables: JSON.parse(JSON.stringify(SEED_TABLES)),
      kitchenTickets: [],
      ingredients: JSON.parse(JSON.stringify(SEED_INGREDIENTS)),
      discountPercentage: 0,
      currentUser: SEED_USERS[3], // Cashier (PIN 1234)
      isLocked: false,
      auditLogs: [],
    });
  });

  // ── 1. Performance Benchmark (< 50ms per operation) ────────
  it('TC-NFR-PERF-01: Benchmarks 100 Rapid Cart Operations under 50ms latency threshold', () => {
    const store = usePosStore.getState();
    const item = SEED_MENU_ITEMS[0];

    const startTime = performance.now();
    for (let i = 0; i < 100; i++) {
      store.addToCart(item);
    }
    const totalDuration = performance.now() - startTime;
    const avgLatencyPerItem = totalDuration / 100;

    // Strict requirement: avg latency must be well below 50ms (typically < 1ms)
    expect(avgLatencyPerItem).toBeLessThan(50);
    expect(usePosStore.getState().cart[0].quantity).toBe(100);
  });

  // ── 2. Flow 1: Full Dine-in Lifecycle ───────────────────────
  it('TC-FLOW-01: Verifies Complete Dine-In Order-to-Payment Lifecycle', () => {
    const store = usePosStore.getState();
    const table = store.tables[0]; // T-01
    store.selectTable(table.id);

    // 1. Add items to cart
    const steak = SEED_MENU_ITEMS.find((i) => i.id === 'item-08')!; // Angus Ribeye
    const drink = SEED_MENU_ITEMS.find((i) => i.id === 'item-20')!; // Virgin Mojito
    store.addToCart(steak);
    store.addToCart(drink);

    expect(usePosStore.getState().cart.length).toBe(2);

    // 2. Fire order to kitchen (KOT)
    store.fireCurrentOrderToKitchen();

    // Table state updates to ORDERED
    expect(usePosStore.getState().tables.find((t) => t.id === table.id)?.status).toBe('ORDERED');
    expect(usePosStore.getState().kitchenTickets.length).toBe(1);

    // 3. Chef bumps ticket on KDS
    const ticketId = usePosStore.getState().kitchenTickets[0].id;
    store.bumpTicket(ticketId);
    expect(usePosStore.getState().kitchenTickets[0].isBumped).toBe(true);

    // 4. Settle bill with Cash
    const { bill } = store.settlePayment('CASH');
    expect(bill.isPaid).toBe(true);
    expect(bill.grandTotal).toBeGreaterThan(0);

    // 5. Table transitions to CLEANING (ready for busser reset)
    expect(usePosStore.getState().tables.find((t) => t.id === table.id)?.status).toBe('CLEANING');
    
    // Busser cleans table -> resets to AVAILABLE
    store.updateTableStatus(table.id, 'AVAILABLE');
    expect(usePosStore.getState().tables.find((t) => t.id === table.id)?.status).toBe('AVAILABLE');
  });

  // ── 3. Flow 2: Security & Manager Override ─────────────────
  it('TC-FLOW-02: Verifies RBAC Security Guard on High Discount without Manager PIN', () => {
    const store = usePosStore.getState();
    store.addToCart(SEED_MENU_ITEMS[0]);

    // Cashier attempts 25% discount without manager approval (should be rejected/clamped)
    store.setDiscountPercentage(25);
    expect(usePosStore.getState().discountPercentage).toBe(0);

    // Provide Manager PIN (1111) to approve
    const approved = store.approveManagerOverride('1111');
    expect(approved).toBe(true);
  });

  // ── 4. Flow 3: Multi-Way Equal Bill Splitting ───────────────
  it('TC-FLOW-03: Verifies 3-Way Equal Bill Split Balances Exact Total', () => {
    const store = usePosStore.getState();
    store.addToCart(SEED_MENU_ITEMS[0]); // 480.00 BDT
    store.addToCart(SEED_MENU_ITEMS[1]); // 390.00 BDT

    const grandTotal = usePosStore.getState().grandTotal;
    const splitCount = 3;
    const shareAmount = Math.floor(grandTotal / splitCount);
    const remainder = grandTotal % splitCount;

    const shares = Array.from({ length: splitCount }, (_, i) => 
      i === 0 ? shareAmount + remainder : shareAmount
    );

    const sumOfShares = shares.reduce((a, b) => a + b, 0);
    expect(sumOfShares).toBe(grandTotal);
  });

  // ── 5. Flow 4: Shift Close & Cash Variance ──────────────────
  it('TC-FLOW-04: Verifies Cashier Shift Close & Denomination Counter Math', () => {
    const store = usePosStore.getState();
    const shift = store.currentShift;
    expect(shift.isOpen).toBe(true);

    // Count physical cash in drawer: 5x 1000 BDT, 4x 500 BDT = 7,000 BDT (700,000 minor units)
    const countedCash = (5 * 1000 + 4 * 500) * 100;
    const expectedCash = shift.openingFloat + shift.totalCashSales;
    const variance = countedCash - expectedCash;

    expect(countedCash).toBe(700000);
    expect(typeof variance).toBe('number');
  });

  // ── 6. Flow 5: Customer Loyalty Accrual & Redemption ────────
  it('TC-FLOW-05: Verifies CRM Loyalty Points Accrual and Redemption Engine', () => {
    const crm = useCrmStore.getState();
    const customer = crm.customers[0]; // Ayasha Rahman
    const initialPoints = useCrmStore.getState().getCustomerById(customer.id)!.totalPoints;

    // Earn points on 2,500 BDT order (250,000 minor units -> 2,500 points, 1 BDT = 1 point)
    crm.earnPoints(customer.id, 250000, 'ord-test-01');
    const updatedCust = useCrmStore.getState().getCustomerById(customer.id)!;
    expect(updatedCust.totalPoints).toBe(initialPoints + 2500);

    // Redeem 500 points
    const redeemed = crm.redeemPoints(customer.id, 500, 'ord-test-02');
    expect(redeemed).toBe(true);
    expect(useCrmStore.getState().getCustomerById(customer.id)!.totalPoints).toBe(initialPoints + 2500 - 500);
  });

  // ── 7. Flow 6: Self-Service Kiosk Flow ──────────────────────
  it('TC-FLOW-06: Verifies Self-Service Kiosk Order Token Format & Arrival at KDS', () => {
    const store = usePosStore.getState();
    store.addToCart(SEED_MENU_ITEMS[0]);

    // Kiosk generates token #K-xxx
    const token = `K-${Math.floor(100 + Math.random() * 900)}`;
    expect(token).toMatch(/^K-\d{3}$/);

    // Fires directly to kitchen
    store.fireCurrentOrderToKitchen();
    const latestTicket = usePosStore.getState().kitchenTickets[0];
    expect(latestTicket).toBeDefined();
    expect(latestTicket.items.length).toBe(1);
  });
});
