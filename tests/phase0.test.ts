import { describe, it, expect, beforeEach } from 'vitest';
import { usePosStore } from '../src/store/posStore';
import { SEED_USERS, SEED_TABLES, SEED_BRANCHES, SEED_MENU_ITEMS } from '../src/services/seed-data';

describe('Phase 0 Baseline & Core POS Foundation Tests', () => {
  beforeEach(() => {
    // Reset store state
    usePosStore.setState({
      cart: [],
      discountPercentage: 0,
      subtotal: 0,
      discountAmount: 0,
      serviceChargeAmount: 0,
      taxAmount: 0,
      grandTotal: 0,
      isLocked: false,
      currentUser: SEED_USERS[2], // Nusrat (Cashier)
    });
  });

  it('TC-SEED-01: Verifies realistic seed restaurant structure', () => {
    expect(SEED_USERS.length).toBe(10);
    expect(SEED_BRANCHES.length).toBe(3);
    expect(SEED_TABLES.length).toBe(20);
    expect(SEED_MENU_ITEMS.length).toBeGreaterThanOrEqual(30);

    // Verify all menu items store monetary values as positive integer minor units
    for (const item of SEED_MENU_ITEMS) {
      expect(Number.isInteger(item.basePrice)).toBe(true);
      expect(item.basePrice).toBeGreaterThan(0);
      expect(item.prepTimeMinutes).toBeGreaterThan(0);
    }
  });

  it('TC-AUTH-01: Verifies 4-digit Quick PIN staff authentication', () => {
    const store = usePosStore.getState();

    // Lock terminal
    store.setIsLocked(true);
    expect(usePosStore.getState().isLocked).toBe(true);

    // Attempt invalid PIN
    const failedLogin = store.loginWithPin('0000');
    expect(failedLogin).toBe(false);
    expect(usePosStore.getState().isLocked).toBe(true);

    // Attempt valid Manager PIN
    const successLogin = store.loginWithPin('1111');
    expect(successLogin).toBe(true);
    expect(usePosStore.getState().isLocked).toBe(false);
    expect(usePosStore.getState().currentUser.role).toBe('BRANCH_MANAGER');
  });

  it('TC-AUTH-03: Verifies Manager Override approval guard', () => {
    const store = usePosStore.getState();
    let overrideExecuted = false;

    store.requestManagerOverride({
      action: 'HIGH_DISCOUNT_APPROVAL',
      entityName: '20% Discount',
      onApprove: () => {
        overrideExecuted = true;
      },
    });

    expect(usePosStore.getState().overrideModalOpen).toBe(true);

    // Attempt approval with cashier PIN (should fail)
    const failApprove = store.approveManagerOverride('2222');
    expect(failApprove).toBe(false);
    expect(overrideExecuted).toBe(false);

    // Approve with Super Admin PIN 9999
    const passApprove = store.approveManagerOverride('9999');
    expect(passApprove).toBe(true);
    expect(overrideExecuted).toBe(true);
    expect(usePosStore.getState().overrideModalOpen).toBe(false);
  });

  it('TC-BIL-01: Verifies audited minor-unit pricing engine calculations', () => {
    const store = usePosStore.getState();
    const testItem = SEED_MENU_ITEMS[0]; // Truffle Fries: 48000 (480.00 BDT)

    store.addToCart(testItem);
    expect(usePosStore.getState().cart.length).toBe(1);
    expect(usePosStore.getState().subtotal).toBe(48000);

    // Add another item
    store.addToCart(testItem);
    expect(usePosStore.getState().cart[0].quantity).toBe(2);
    expect(usePosStore.getState().subtotal).toBe(96000); // 960 BDT

    // Apply 10% discount
    store.setDiscountPercentage(10);
    const state = usePosStore.getState();

    // Subtotal: 96,000
    // Discount 10%: 9,600
    // Net: 86,400
    // Service Charge 10%: 8,640
    // VAT 15% on (Net + SC = 95,040): 14,256
    // Grand Total = 86,400 + 8,640 + 14,256 = 109,296 minor units (1,092.96 BDT)
    expect(state.discountAmount).toBe(9600);
    expect(state.serviceChargeAmount).toBe(8640);
    expect(state.taxAmount).toBe(14256);
    expect(state.grandTotal).toBe(109296);
  });

  it('TC-MENU-02: Verifies 86 Sold Out toggle blocks cart addition', () => {
    const store = usePosStore.getState();
    const targetItem = SEED_MENU_ITEMS[1];

    // Toggle to 86'd
    store.toggle86Item(targetItem.id);
    const updatedItem = usePosStore.getState().menuItems.find((i) => i.id === targetItem.id);
    expect(updatedItem?.is86).toBe(true);

    // Attempt to add to cart
    store.addToCart(updatedItem!);
    expect(usePosStore.getState().cart.length).toBe(0); // Cart addition blocked
  });

  it('TC-KDS-01: Verifies KOT order firing & bump cycle', () => {
    const store = usePosStore.getState();
    const item = SEED_MENU_ITEMS[0];
    store.addToCart(item);

    const initialTicketCount = store.kitchenTickets.length;
    store.fireCurrentOrderToKitchen();

    const ticketsAfterFire = usePosStore.getState().kitchenTickets;
    expect(ticketsAfterFire.length).toBe(initialTicketCount + 1);
    expect(ticketsAfterFire[0].isBumped).toBe(false);

    // Bump the ticket
    store.bumpTicket(ticketsAfterFire[0].id);
    const bumpedTicket = usePosStore.getState().kitchenTickets.find((t) => t.id === ticketsAfterFire[0].id);
    expect(bumpedTicket?.isBumped).toBe(true);
  });

  it('TC-PAY-01: Verifies settlement & shift update', () => {
    const store = usePosStore.getState();
    const item = SEED_MENU_ITEMS[0];
    store.addToCart(item);

    const currentShift = usePosStore.getState().currentShift;
    const initialCash = currentShift.totalCashSales;
    const totalToPay = usePosStore.getState().grandTotal;

    const res = store.settlePayment('CASH');
    expect(res.bill.isPaid).toBe(true);
    expect(res.bill.fiscalInvoiceNumber).toContain('INV-');

    // Cart cleared after settlement
    expect(usePosStore.getState().cart.length).toBe(0);

    // Shift cash sales incremented
    const updatedShift = usePosStore.getState().currentShift;
    expect(updatedShift.totalCashSales).toBe(initialCash + totalToPay);
  });
});
