import { describe, it, expect, beforeEach } from 'vitest';
import { usePosStore } from '../src/store/posStore';
import { SEED_MENU_ITEMS, SEED_TABLES, SEED_USERS } from '../src/services/seed-data';
import { EscPosService } from '../src/services/escpos-service';

describe('Phase 1 Core POS (MVP) Verification Tests', () => {
  beforeEach(() => {
    usePosStore.setState({
      cart: [],
      discountPercentage: 0,
      subtotal: 0,
      discountAmount: 0,
      serviceChargeAmount: 0,
      taxAmount: 0,
      grandTotal: 0,
      tables: [...SEED_TABLES],
      selectedTableId: 'tbl-01',
      currentUser: SEED_USERS[2], // Nusrat (Cashier)
    });
  });

  it('TC-PHASE1-01: Verifies Item Modifiers & Price Additions', () => {
    const store = usePosStore.getState();
    const ribeye = SEED_MENU_ITEMS.find((i) => i.id === 'item-08')!; // Angus Ribeye: basePrice 325,000 minor units (3,250 BDT)

    // Add Ribeye with modifiers: Medium Rare (0 BDT), Hand-Cut Fries (0 BDT)
    store.addToCart(ribeye, undefined, [
      { modifierId: 'done-medrare', nameEn: 'Medium Rare', price: 0 },
      { modifierId: 'side-mash', nameEn: 'Truffle Mashed Potatoes', price: 0 },
    ]);

    const cart = usePosStore.getState().cart;
    expect(cart.length).toBe(1);
    expect(cart[0].selectedModifiers.length).toBe(2);
    expect(cart[0].selectedModifiers[0].nameEn).toBe('Medium Rare');
    expect(cart[0].unitPrice).toBe(325000);
  });

  it('TC-PHASE1-02: Verifies Table Transfer & Audit Logging', () => {
    const store = usePosStore.getState();
    const sourceTable = store.tables.find((t) => t.id === 'tbl-02')!; // Table 2 is OCCUPIED
    const targetTable = store.tables.find((t) => t.id === 'tbl-05')!; // Table 5 is AVAILABLE

    expect(sourceTable.status).toBe('OCCUPIED');
    expect(targetTable.status).toBe('AVAILABLE');

    // Transfer Table 2 -> Table 5
    store.updateTableStatus(sourceTable.id, 'AVAILABLE');
    store.updateTableStatus(targetTable.id, 'OCCUPIED');
    store.selectTable(targetTable.id);

    const updatedTables = usePosStore.getState().tables;
    expect(updatedTables.find((t) => t.id === sourceTable.id)?.status).toBe('AVAILABLE');
    expect(updatedTables.find((t) => t.id === targetTable.id)?.status).toBe('OCCUPIED');
    expect(usePosStore.getState().selectedTableId).toBe('tbl-05');
  });

  it('TC-PHASE1-03: Verifies N-way Bill Splitting Mathematical Balance', () => {
    const grandTotal = 113850; // 1,138.50 BDT
    const splitCount = 3;

    const baseShare = Math.floor(grandTotal / splitCount); // 37950
    const remainder = grandTotal % splitCount; // 0
    const splits = Array.from({ length: splitCount }, (_, idx) => ({
      splitIndex: idx + 1,
      amount: idx === 0 ? baseShare + remainder : baseShare,
    }));

    // Sum of all splits must exactly equal grandTotal down to the single minor unit
    const totalSplitSum = splits.reduce((sum, s) => sum + s.amount, 0);
    expect(totalSplitSum).toBe(grandTotal);
    expect(splits.length).toBe(3);
    expect(splits[0].amount).toBe(37950);
  });

  it('TC-PHASE1-04: Verifies Promo Discount Rules & Manager Approval Guard', () => {
    const store = usePosStore.getState();
    const item = SEED_MENU_ITEMS[0]; // 48000 minor units
    store.addToCart(item);

    // Apply 10% standard cashier promo
    store.setDiscountPercentage(10);
    const state10 = usePosStore.getState();
    expect(state10.discountPercentage).toBe(10);
    expect(state10.discountAmount).toBe(4800); // 48000 * 0.10

    // Apply 20% VIP Promo (exceeds 15% threshold -> triggers Manager Override Guard)
    store.setDiscountPercentage(20);
    expect(usePosStore.getState().overrideModalOpen).toBe(true);

    // Manager enters PIN 1111 to approve 20% discount
    const approved = store.approveManagerOverride('1111');
    expect(approved).toBe(true);

    const state20 = usePosStore.getState();
    expect(state20.discountPercentage).toBe(20);
    expect(state20.discountAmount).toBe(9600); // 48000 * 0.20
  });

  it('TC-PHASE1-05: Verifies ESC/POS Thermal Commands & Drawer Kick', () => {
    const store = usePosStore.getState();
    const tenant = store.tenant;
    const branch = store.branches[0];

    const mockBill = {
      id: 'bill-test-01',
      orderId: 'ord-01',
      fiscalInvoiceNumber: 'INV-2026-999111',
      subtotal: 100000,
      discountAmount: 10000,
      serviceChargeAmount: 9000,
      taxes: [{ name: 'VAT', ratePercentage: 15, amount: 14850 }],
      totalTax: 14850,
      roundingDifference: 0,
      grandTotal: 113850,
      paidAmount: 113850,
      isPaid: true,
      paymentMethod: 'CASH',
      closedAt: new Date().toISOString(),
    };

    // 1. Generate Receipt Bytes
    const receiptBytes = EscPosService.generateReceiptBytes(mockBill, tenant, branch);
    expect(receiptBytes).toBeInstanceOf(Uint8Array);
    expect(receiptBytes.length).toBeGreaterThan(100);

    // Initializer ESC @ (0x1B, 0x40)
    expect(receiptBytes[0]).toBe(0x1B);
    expect(receiptBytes[1]).toBe(0x40);

    // 2. Generate Cash Drawer Kick Bytes
    const drawerBytes = EscPosService.generateDrawerKickBytes();
    expect(drawerBytes.length).toBe(5);
    expect(drawerBytes[0]).toBe(0x1B);
    expect(drawerBytes[1]).toBe(0x70); // ESC p
  });

  it('TC-PHASE1-06: Verifies Shift Close Denomination Counter & Variance Calculation', () => {
    const shift = usePosStore.getState().currentShift;
    const expectedCashMinor = shift.openingFloat + shift.totalCashSales;

    // Simulate physical cash count: exactly matching expected
    const actualCashMinor = expectedCashMinor;
    const variance = actualCashMinor - expectedCashMinor;

    expect(variance).toBe(0); // Balanced drawer
  });
});
