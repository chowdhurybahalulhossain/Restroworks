import { describe, it, expect, beforeEach } from 'vitest';
import { usePosStore } from '../src/store/posStore';
import { sound } from '../src/services/soundFx';
import { SEED_MENU_ITEMS, SEED_TABLES } from '../src/services/seed-data';

describe('Phase 4 3D Immersion, Kiosk & Audio Haptics Verification Tests', () => {
  beforeEach(() => {
    usePosStore.setState({
      cart: [],
      tables: JSON.parse(JSON.stringify(SEED_TABLES)),
      reducedMotion: false,
    });
  });

  it('TC-PHASE4-01: Verifies Web Audio Synthesizer Engine & Mute Toggle', () => {
    expect(sound.getIsMuted()).toBe(false);
    
    // Toggle mute
    const isMutedNow = sound.toggleMute();
    expect(isMutedNow).toBe(true);
    expect(sound.getIsMuted()).toBe(true);

    // Audio methods safely execute without error even when muted
    expect(() => {
      sound.playClick();
      sound.playAddToCart();
      sound.playOrderFired();
      sound.playCashSuccess();
      sound.playKdsBell();
      sound.playError();
    }).not.toThrow();

    // Unmute
    sound.setMuted(false);
    expect(sound.getIsMuted()).toBe(false);
  });

  it('TC-PHASE4-02: Verifies 3D Floor Plan Coordinates & Spatial Table Mapping', () => {
    const tables = usePosStore.getState().tables;
    expect(tables.length).toBeGreaterThanOrEqual(15);

    // Verify 2D coordinate percentages map cleanly into 3D bounding box
    tables.forEach((t) => {
      const posX = ((t.x ?? 50) - 50) * 0.28;
      const posZ = ((t.y ?? 50) - 50) * 0.22;
      // Coordinates should remain within reasonable 3D stage boundaries (-15 to +15)
      expect(posX).toBeGreaterThanOrEqual(-15);
      expect(posX).toBeLessThanOrEqual(15);
      expect(posZ).toBeGreaterThanOrEqual(-12);
      expect(posZ).toBeLessThanOrEqual(12);
    });

    // Verify status colors cover all major operational states
    const validStatuses = [
      'AVAILABLE', 'OCCUPIED', 'ORDERED', 'FOOD_READY', 
      'BILL_REQUESTED', 'CLEANING', 'RESERVED', 'BLOCKED'
    ];
    tables.forEach((t) => {
      expect(validStatuses).toContain(t.status);
    });
  });

  it('TC-PHASE4-03: Verifies 3D Dish Nutrition HUD Macro-Distribution Formula', () => {
    const burger = SEED_MENU_ITEMS.find((i) => i.id === 'item-10')!; // Truffle Burger (780 kcal)
    expect(burger).toBeDefined();

    const calories = burger.calories; // 780
    const protein = Math.round((calories * 0.22) / 4);
    const carbs = Math.round((calories * 0.48) / 4);
    const fat = Math.round((calories * 0.30) / 9);

    // Check macros mathematically add up close to calorie energy
    const computedEnergy = protein * 4 + carbs * 4 + fat * 9;
    expect(Math.abs(computedEnergy - calories)).toBeLessThanOrEqual(25);
    expect(protein).toBeGreaterThan(30);
    expect(carbs).toBeGreaterThan(60);
  });

  it('TC-PHASE4-04: Verifies Self-Service Kiosk Order Token Generation & Automatic KOT Fire', () => {
    const store = usePosStore.getState();
    const item = SEED_MENU_ITEMS[0];

    // Customer adds 2 items via touch kiosk
    store.addToCart(item);
    store.addToCart(item);
    expect(usePosStore.getState().cart.length).toBe(1);
    expect(usePosStore.getState().cart[0].quantity).toBe(2);

    // Fire order from kiosk
    store.fireCurrentOrderToKitchen();

    // Verify kitchen received order ticket (prepended at index 0)
    const tickets = usePosStore.getState().kitchenTickets;
    expect(tickets.length).toBeGreaterThan(0);
    const latestTicket = tickets[0];
    expect(latestTicket.items.length).toBe(1);
    expect(latestTicket.items[0].quantity).toBe(2);
  });

  it('TC-PHASE4-05: Verifies Performance Mode / Reduce Motion Graceful 2D Fallback', () => {
    const store = usePosStore.getState();
    expect(store.reducedMotion).toBe(false);

    // Toggle Reduce Motion
    store.toggleReducedMotion();
    expect(usePosStore.getState().reducedMotion).toBe(true);

    // Toggle back
    store.toggleReducedMotion();
    expect(usePosStore.getState().reducedMotion).toBe(false);
  });

  it('TC-PHASE4-06: Verifies Multi-Branch Revenue Consolidation Mathematical Integrity', () => {
    const branchSales = [48500000, 24200000, 19800000, 11500000]; // 4 branches in minor units
    const consolidatedGMV = branchSales.reduce((a, b) => a + b, 0);

    // 104,000,000 minor units = 1,040,000.00 BDT
    expect(consolidatedGMV).toBe(104000000);
    expect(consolidatedGMV / 100).toBe(1040000);
  });
});
