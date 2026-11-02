# NOVAPOS – Phased Implementation Tasks & Work Breakdown
**Document Path:** `/docs/phased-tasks.md`  
**Version:** 1.0.0  
**Phase Plan:** Phases 0 through 5  

---

## Phase 0: Foundation & Core Scaffolding (Current Phase)
- [x] **TASK-0.1:** Generate Software Requirements Specification (`docs/srs.md`) with Given/When/Then acceptance criteria.
- [x] **TASK-0.2:** Generate System Architecture & Sequence Diagrams (`docs/architecture.md`).
- [x] **TASK-0.3:** Generate Entity-Relationship Data Model & Schema (`docs/er-diagram.md`).
- [x] **TASK-0.4:** Generate Design System & Motion Specification (`docs/design-system.md`).
- [x] **TASK-0.5:** Document Assumptions & Industry Standard Behaviors (`docs/assumptions.md`).
- [x] **TASK-0.6:** Establish Requirements Traceability Matrix (`docs/traceability-matrix.md`).
- [x] **TASK-0.7:** Project Workspace Scaffolding:
  - Setup multi-portal frontend workspace (Vite + React 18 + TypeScript + Tailwind CSS + Lucide Icons + Framer Motion).
  - Setup modular backend foundation (REST API routes, WebSocket hub, offline storage).
  - Establish offline storage layer (Dexie.js IndexedDB schema + outbox sync engine).
  - Configure multi-tenant context and RBAC permission guards.
  - Implement 7 target application routing modules:
    1. POS Terminal
    2. Kitchen Display System (KDS)
    3. Manager / Admin Dashboard
    4. Customer QR / Online Ordering Web App
    5. Waiter Handheld Mode
    6. Customer-Facing Display (CFD)
    7. Rider Mobile Web View
    + Interactive Portal Switcher & Design Showcase.
- [x] **TASK-0.8:** Seed realistic demo data:
  - Demo restaurant "Novasphere Bistro & Lounge".
  - 34+ menu items across 8 categories with Bengali and English names, modifiers, allergens, and photos.
  - 20 interactive tables across 3 zones (Main Hall, Skyline Rooftop, VIP Lounge).
  - 10 staff members with preset PINs and roles.
  - Initial shifts and audit log entries.
- [x] **TASK-0.9:** Automated tests, build verification, browser testing, and Phase 0 sign-off.

---

## Phase 1: Core POS MVP (Completed)
- [x] **TASK-1.1:** Menu catalog browsing, search, barcode scan, category rail, fast item selector.
- [x] **TASK-1.2:** Floor & Table management with visual interactive floor plan and live status indicators.
- [x] **TASK-1.3:** Order taking engine: modifiers modal with validation, combos, course assignment, allergy flags.
- [x] **TASK-1.4:** Kitchen Order Ticket (KOT) generation, station routing (Kitchen, Bar, Grill), and real-time KDS bump screen.
- [x] **TASK-1.5:** Audited Billing Engine: VAT 15%, Service Charge 10%, item/bill discounts, promo codes (VIP20, WELCOME10), bill splitting (N-ways and itemized).
- [x] **TASK-1.6:** Payment settlement: Cash with denomination hints & change calculation, Card, and SSLCOMMERZ integration simulator (hosted checkout, IPN, Order Validation API `val_id` check).
- [x] **TASK-1.7:** Shift management: Opening float, physical cash denomination counter, variance calculation, and printable Z-Report.
- [x] **TASK-1.8:** Thermal printer simulation: ESC/POS raw byte generator (`\x1B@`, `\x1Ba`, paper cut, drawer kick pulse `\x1Bp\x00\x19\xFA`), and 80mm printable tax invoice preview.
- [x] **TASK-1.9:** Offline mode: IndexedDB storage via Dexie.js, outbox queue, background sync with deterministic sequence reconciliation.

---

## Phase 2: Operations, Inventory & Staff (Completed)
- [x] **TASK-2.1:** Recipe / BOM management with automatic FIFO ingredient stock deduction on sale.
- [x] **TASK-2.2:** Spoilage, wastage logs, low-stock threshold notifications, Purchase Orders (PO) & GRN.
- [x] **TASK-2.3:** Staff scheduling, Quick PIN time-clock (attendance, breaks, overtime).
- [x] **TASK-2.4:** Petty cash, expense tracking, and double-entry general ledger journal entries.
- [x] **TASK-2.5:** Manager approval workflow for voids, refunds, and high discounts with PIN override.

---

## Phase 3: Growth, Customer CRM & Online Channels
- [ ] **TASK-3.1:** Customer CRM profiles, visit history, loyalty tier points earning & redemption.
- [ ] **TASK-3.2:** Table reservations calendar, walk-in waitlist queue, SMS alert triggers.
- [ ] **TASK-3.3:** Customer QR Table Ordering with live order status & waiter call signal.
- [ ] **TASK-3.4:** Online delivery/takeaway web portal with delivery zones and dispatch engine.
- [ ] **TASK-3.5:** Rider mobile view with live GPS mockup, proof of delivery, and COD cash settlement.

---

## Phase 4: Futuristic Experience & 3D Immersion
- [ ] **TASK-4.1:** Interactive 3D Floor Plan (React Three Fiber) with real-time status lighting and orbit controls.
- [ ] **TASK-4.2:** 3D Dish Previews with interactive rotation and nutrition overlays.
- [ ] **TASK-4.3:** Live animated 3D executive charts, revenue globes, and sound haptics.
- [ ] **TASK-4.4:** Self-Service Kiosk mode with attract loop screensaver.
- [ ] **TASK-4.5:** Secondary Customer-Facing Display (CFD) with synchronized cart and payment QR.
- [ ] **TASK-4.6:** "Performance Mode / Reduce Motion" instant fallback toggle.

---

## Phase 5: Hardening, Security & Release
- [ ] **TASK-5.1:** Automated End-to-End test suite covering all 7 Section 10 critical user flows.
- [ ] **TASK-5.2:** Security audit (OWASP Top 10, tenant data isolation validation, PCI-DSS SAQ-A compliance).
- [ ] **TASK-5.3:** Stress testing and performance benchmarks (< 50ms cart operations).
- [ ] **TASK-5.4:** Complete User Manual, Deployment Guide, and in-app 5-minute interactive onboarding tour.
