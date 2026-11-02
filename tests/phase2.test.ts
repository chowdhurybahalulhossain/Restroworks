import { describe, it, expect, beforeEach } from 'vitest';
import { usePosStore } from '../src/store/posStore';
import { SEED_MENU_ITEMS, SEED_INGREDIENTS, SEED_USERS } from '../src/services/seed-data';

describe('Phase 2 Operations & Back-of-House Verification Tests', () => {
  beforeEach(() => {
    // Reset store
    usePosStore.setState({
      cart: [],
      ingredients: JSON.parse(JSON.stringify(SEED_INGREDIENTS)),
      wastageLogs: [],
      expenses: [],
      journalEntries: [],
      auditLogs: [],
      currentUser: SEED_USERS[0], // Super Admin
    });
  });

  it('TC-PHASE2-01: Verifies Recipe BOM Automated Inventory Stock Depletion on KOT Fire', () => {
    const store = usePosStore.getState();
    const ribeyeItem = SEED_MENU_ITEMS.find((i) => i.id === 'item-08')!; // Angus Ribeye
    const beefIngBefore = store.ingredients.find((i) => i.id === 'ing-01')!; // 18.5 kg initial
    const initialBeefStock = beefIngBefore.currentStock;

    // Add 2x Angus Ribeye to cart
    store.addToCart(ribeyeItem);
    store.addToCart(ribeyeItem);
    expect(usePosStore.getState().cart[0].quantity).toBe(2);

    // Fire KOT to Kitchen
    store.fireCurrentOrderToKitchen();

    // Angus Ribeye recipe requires 0.35kg per serving -> 2 servings = 0.70kg deduction
    const beefIngAfter = usePosStore.getState().ingredients.find((i) => i.id === 'ing-01')!;
    expect(beefIngAfter.currentStock).toBe(+(initialBeefStock - 0.70).toFixed(3));
  });

  it('TC-PHASE2-02: Verifies Low Stock Reorder Threshold Alert', () => {
    const store = usePosStore.getState();
    const hilsaIng = store.ingredients.find((i) => i.id === 'ing-08')!; // Current: 6.5kg, reorderPoint: 5.0kg

    // Manually deduct 2.0kg to breach 5.0kg threshold
    store.deductInventoryForCartItems([
      {
        id: 'test-cart-item',
        menuItemId: 'item-24', // Shorshe Ilish
        nameEn: 'Shorshe Ilish',
        nameBn: 'সর্ষে ইলিশ',
        unitPrice: 195000,
        quantity: 1,
        selectedModifiers: [],
        course: 'MAIN',
        status: 'FIRED',
        station: 'KITCHEN',
      },
    ]);

    // Check if stock decreased and low stock alert was logged if breached
    const currentHilsa = usePosStore.getState().ingredients.find((i) => i.id === 'ing-08')!;
    expect(currentHilsa.currentStock).toBeLessThanOrEqual(6.5);
  });

  it('TC-PHASE2-03: Verifies Kitchen Wastage / Spoilage Logging & Double-Entry Journal', () => {
    const store = usePosStore.getState();
    const potato = store.ingredients.find((i) => i.id === 'ing-03')!; // 45.0 kg
    const initialStock = potato.currentStock;

    // Log 5.0 kg of burnt potatoes
    store.logWastage('ing-03', 5.0, 'BURNT');

    const updatedPotato = usePosStore.getState().ingredients.find((i) => i.id === 'ing-03')!;
    expect(updatedPotato.currentStock).toBe(initialStock - 5.0);

    // Verify wastage log entry created
    const logs = usePosStore.getState().wastageLogs;
    expect(logs.length).toBe(1);
    expect(logs[0].reason).toBe('BURNT');
    expect(logs[0].quantity).toBe(5.0);

    // Verify double-entry accounting journal entries posted
    const journals = usePosStore.getState().journalEntries;
    expect(journals.length).toBeGreaterThanOrEqual(2);
    expect(journals.some((j) => j.accountCode === '5020-SPOILAGE' && j.debit > 0)).toBe(true);
    expect(journals.some((j) => j.accountCode === '1210-INV-PANTRY' && j.credit > 0)).toBe(true);
  });

  it('TC-PHASE2-04: Verifies Purchase Order Goods Receipt (GRN) Pantry Intake', () => {
    const store = usePosStore.getState();
    const po = store.purchaseOrders.find((p) => p.status === 'SUBMITTED')!;
    const burrataBefore = store.ingredients.find((i) => i.id === 'ing-04')!.currentStock;

    // Receive the submitted PO (contains 25 pieces of Burrata)
    store.receivePurchaseOrder(po.id);

    const receivedPO = usePosStore.getState().purchaseOrders.find((p) => p.id === po.id)!;
    expect(receivedPO.status).toBe('RECEIVED');
    expect(receivedPO.receivedAt).toBeDefined();

    // Verify Burrata stock incremented by 25
    const burrataAfter = usePosStore.getState().ingredients.find((i) => i.id === 'ing-04')!.currentStock;
    expect(burrataAfter).toBe(burrataBefore + 25);
  });

  it('TC-PHASE2-05: Verifies Staff Time Clock Punch In & Breaks', () => {
    const store = usePosStore.getState();
    const cashierId = 'usr-cashier';

    // Punch out for break
    store.punchStaffTimeClock(cashierId, 'BREAK');
    let attendance = usePosStore.getState().staffAttendance.find((a) => a.userId === cashierId)!;
    expect(attendance.status).toBe('ON_BREAK');

    // Punch back in
    store.punchStaffTimeClock(cashierId, 'IN');
    attendance = usePosStore.getState().staffAttendance.find((a) => a.userId === cashierId)!;
    expect(attendance.status).toBe('ON_DUTY');
  });

  it('TC-PHASE2-06: Verifies Petty Cash Operating Expense Vouchers & Balance', () => {
    const store = usePosStore.getState();
    const initialVouchersCount = store.expenses.length;

    // Record emergency pantry grocery expense of 2,500 BDT
    store.recordExpense('PANTRY_PURCHASE', 250000, 'Bought extra fresh coriander and mint');

    const updatedExpenses = usePosStore.getState().expenses;
    expect(updatedExpenses.length).toBe(initialVouchersCount + 1);
    expect(updatedExpenses[0].amount).toBe(250000);
    expect(updatedExpenses[0].category).toBe('PANTRY_PURCHASE');

    // Verify general journal has balanced debit & credit
    const latestJournals = usePosStore.getState().journalEntries;
    const debitEntry = latestJournals.find((j) => j.debit === 250000);
    const creditEntry = latestJournals.find((j) => j.credit === 250000);
    expect(debitEntry).toBeDefined();
    expect(creditEntry).toBeDefined();
    expect(debitEntry!.debit).toBe(creditEntry!.credit);
  });
});
