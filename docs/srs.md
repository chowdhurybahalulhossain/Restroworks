# Software Requirements Specification (SRS)
## Project: NOVAPOS – Enterprise Multi-Tenant Restaurant POS & Operating System
**Document Version:** 1.0.0  
**Phase:** Phase 0 – Foundation  
**Classification:** Confidential & Production Reference  

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) establishes the complete functional and non-functional specifications for **NOVAPOS**, a high-performance, offline-first, multi-tenant Restaurant Point-of-Sale (POS) and Operating System. It covers all 7 target applications:
1. **POS Terminal** (Cashier / Waiter desktop & tablet)
2. **Kitchen Display System (KDS)** (Station bump screens & pass)
3. **Manager / Admin Dashboard** (Analytics, inventory, menus, configuration)
4. **Customer QR / Online Ordering Web App** (Contactless dine-in & delivery)
5. **Waiter Handheld Mode** (Mobile table ordering & table transfer)
6. **Customer-Facing Display (CFD)** (Pole & secondary display with live bill & QR pay)
7. **Rider Mobile Web View** (Delivery tracking, routing, cash settlement)

### 1.2 Scope & Business Objectives
- **Speed:** Complete a cashier billing transaction in < 10 seconds. New waiter onboarded in < 5 minutes.
- **Accuracy:** Zero duplicate kitchen orders, 100% offline transaction durability, deterministic conflict resolution.
- **Financial Compliance:** Multi-tax support (VAT/GST), audit log on all financial events, SSLCOMMERZ gateway verification with IPN and `val_id` checks, integer minor units storage.
- **Supported Formats:** Dine-in, QSR / Fast Food, Bar & Lounge, Food Court, Cloud Kitchen, Multi-Outlet Chains & Franchises.

---

## 2. Functional Requirements & Acceptance Criteria

### 2.1 Authentication & RBAC (FR-AUTH)

#### FR-AUTH-001: Multi-Mode Staff Authentication
- **Description:** Staff can authenticate via Email/Password or 4–6 digit Quick PIN. Idle auto-lock configurable (default 2 minutes).
- **Acceptance Criteria (Given / When / Then):**
  - **Given** a cashier is on the lock screen,
  - **When** they enter their registered 4-digit PIN "1234",
  - **Then** the POS terminal authenticates them within 200ms, restores their active shift, and presents the order entry view.

#### FR-AUTH-002: Role-Based Access Control (RBAC) & Custom Roles
- **Description:** Granular permissions per module/action (view, create, edit, delete, discount, void, refund, price override, report access, settings).
- **Acceptance Criteria:**
  - **Given** a user with role `WAITER`,
  - **When** they attempt to access `Settings -> Tax Rules`,
  - **Then** access is denied with a descriptive 403 Forbidden alert, and no sensitive configuration is rendered.

#### FR-AUTH-003: Manager-Override Approval Workflow
- **Description:** Sensitive actions (void fired item, discount > threshold, refund, bill reopen, no-sale drawer kick) require real-time Manager PIN override.
- **Acceptance Criteria:**
  - **Given** an order with items already fired to kitchen,
  - **When** a waiter taps "Void Item",
  - **Then** a modal prompts for "Manager Approval PIN"; upon entering a valid manager PIN and mandatory void reason, the item is marked voided and the KDS receives an instant update.

#### FR-AUTH-004: Immutable Audit Trail
- **Description:** Every sensitive mutation logs who, what, when, IP/device, entity ID, previous value, and new value.
- **Acceptance Criteria:**
  - **Given** a manager grants a 20% manual discount,
  - **Then** an `AuditLog` entry is written with timestamp, user ID, order ID, pre-discount total, post-discount total, and device identifier.

---

### 2.2 Organization & Multi-Tenancy (FR-ORG)

#### FR-ORG-001: Hierarchical Tenancy Model
- **Description:** `Tenant -> Brand -> Branch -> Outlet / Counter -> Terminal Device` hierarchy.
- **Acceptance Criteria:**
  - **Given** an enterprise with 5 branches,
  - **When** the Super Admin logs into the Admin Dashboard,
  - **Then** they can view consolidated analytics or filter specifically by Brand or Branch.

#### FR-ORG-002: Branch Menu Overrides & Local Stock
- **Description:** Central master catalog with branch-level price, tax, and availability overrides.
- **Acceptance Criteria:**
  - **Given** an item "Grilled Ribeye" priced at 2500 BDT centrally,
  - **When** Branch "Airport Express" overrides price to 2800 BDT,
  - **Then** terminals at "Airport Express" bill at 2800 BDT while Downtown branch bills at 2500 BDT.

---

### 2.3 Catalog & Menu Engineering (FR-MENU)

#### FR-MENU-001: Multi-Tier Hierarchy with Modifiers & Combos
- **Description:** Categories -> Items -> Variants (Sizes) -> Modifier Groups (Min/Max selection rules, nested modifiers) -> Combos.
- **Acceptance Criteria:**
  - **Given** a "Burger Combo" with a required choice of Drink (Min:1, Max:1) and optional Fries Upgrades (Min:0, Max:2),
  - **When** an operator clicks "Add to Order" without selecting a Drink,
  - **Then** the UI validates required modifier groups, blocks cart addition, and highlights the missing choice.

#### FR-MENU-002: Instant 86 (Out of Stock) Broadcast
- **Description:** Toggling an item 86 updates POS terminals, KDS, customer QR menus, and online ordering within 500ms via WebSocket.
- **Acceptance Criteria:**
  - **Given** an item "Salmon Sashimi" running out of stock,
  - **When** the Head Chef marks "86" on the KDS,
  - **Then** the POS terminal and Customer QR app instantly grey out the item with a "Sold Out" badge, preventing further additions.

#### FR-MENU-003: Multi-Language & Multi-Currency (English & Bangla)
- **Description:** Item names, descriptions, and categories support dual English and Bangla naming with instantaneous locale switching.

---

### 2.4 Table & Floor Management (FR-TABLE)

#### FR-TABLE-001: Visual Interactive Floor Plan (2D & 3D R3F)
- **Description:** Multi-zone layout (Main Dining, Patio, Rooftop, Bar) with dynamic table shapes, capacities, and live status.
- **Acceptance Criteria:**
  - **Given** Table T-04 in zone "Main Dining",
  - **When** a waiter opens the table and fires an order,
  - **Then** the 3D table mesh glow transitions from `AVAILABLE (Green)` to `ORDERED (Amber/Orange)`, reflecting guest count and active timer.

#### FR-TABLE-002: Table Operations (Merge, Split, Transfer, Move)
- **Description:** Ability to transfer an order from Table A to Table B, merge two tables for large parties, or split a party across tables.
- **Acceptance Criteria:**
  - **Given** Table T-01 has an active order of 3 items,
  - **When** the server selects "Transfer Table" to T-07,
  - **Then** all active order items move to T-07, T-01 returns to `AVAILABLE`, and the kitchen KOT reflects the new table designation.

---

### 2.5 Order Taking (FR-ORDER)

#### FR-ORDER-001: High-Speed Multi-Channel Order Entry
- **Description:** Rapid keyboard/touch item addition, category rails, barcode scanner input, modifiers, allergy tags, course firing (Starter, Main, Dessert).
- **Acceptance Criteria:**
  - **Given** a high-volume lunch rush,
  - **When** the cashier scans an item barcode or hits shortcut `F2` + category key,
  - **Then** the item is added to the cart in < 50ms with audio haptic feedback.

#### FR-ORDER-002: Course Firing & Hold/Fire
- **Description:** Separate course tickets. Starters can be fired immediately while Mains are held until the waiter hits "Fire Mains".
- **Acceptance Criteria:**
  - **Given** an order with 2 Starters and 2 Mains,
  - **When** the waiter taps "Send Starters, Hold Mains",
  - **Then** KDS prints/displays Starters as `ACTIVE`, while Mains show `ON HOLD` until explicitly fired.

#### FR-ORDER-003: Offline Order Durability
- **Description:** Orders taken while disconnected persist in IndexedDB (`Dexie.js`) outbox and sync automatically once online.

---

### 2.6 Kitchen Display System & Thermal Printing (FR-KDS)

#### FR-KDS-001: Real-Time Color-Coded KDS Tickets
- **Description:** Live tickets categorized by station (`KITCHEN`, `BAR`, `GRILL`), color-coded by elapsed time:
  - `< 10 mins`: `Emerald Green`
  - `10-20 mins`: `Amber Warning`
  - `> 20 mins`: `Pulsing Neon Red Alert`
- **Acceptance Criteria:**
  - **Given** an order ticket exceeds 20 minutes elapsed time,
  - **Then** the ticket border pulses red, an audible reminder sounds, and the pass screen flags it as delayed.

#### FR-KDS-002: Bump, Recall, & Item-Level Progress
- **Description:** Station chefs can tap individual items or the entire ticket to mark `PREPARING` -> `READY`. Bumped tickets can be recalled within 10 minutes.

---

### 2.7 Billing, Taxes, Discounts & Charges (FR-BILL)

#### FR-BILL-001: Configurable Multi-Tier Calculation Engine
- **Description:** Support for multiple tax categories (VAT 5%/15%, GST), service charge (10%), delivery fees, packaging fees, item/bill discounts, and tip calculation.
- **Acceptance Criteria:**
  - **Given** a subtotal of 10,000 minor units with a 10% discount, 10% service charge on net, and 15% VAT on subtotal+service,
  - **When** the bill calculates,
  - **Then** net = 9,000, service charge = 900, VAT = 1,485, grand total = 11,385 minor units.

#### FR-BILL-002: Bill Splitting
- **Description:** Split by Item, Split by Seat, Split Equally (N-ways), or Split by Custom Amount.

---

### 2.8 Payments & SSLCOMMERZ Integration (FR-PAY)

#### FR-PAY-001: Multi-Tender & Split Payments
- **Description:** Cash with denomination quick-buttons, Card, Mobile Banking (bKash/Nagad), SSLCOMMERZ online link, House Account, Loyalty Points.

#### FR-PAY-002: SSLCOMMERZ Gateway Verification Engine
- **Description:** Server-to-server checkout session initiation, hosted checkout redirect, IPN listener, and mandatory server-side Order Validation API (`val_id` verification).
- **Acceptance Criteria:**
  - **Given** an online order or QR pay-at-table of 1,500 BDT,
  - **When** the customer completes payment and SSLCOMMERZ sends the IPN,
  - **Then** the server calls `validator/api/validationserverAPI.php` with `val_id`, verifies currency (`BDT`), matches exact amount (`1500.00`), checks status `VALID` or `VALIDATED`, and only then transitions bill to `PAID`.

#### FR-PAY-003: Cashier Shift & Cash Management (X-Report & Z-Report)
- **Description:** Opening float, safe drops, petty cash in/out, blind close cash count, discrepancy variance logging, and printable Z-Report upon shift close.

---

### 2.9 CRM, Loyalty & Feedback (FR-CRM)
- **FR-CRM-001:** Customer profile lookup by phone with previous order history, tier badges (Silver, Gold, Platinum), and allergies.
- **FR-CRM-002:** Tiered point earning and redemption with OTP validation.

### 2.10 Reservations & Waitlist (FR-RES)
- **FR-RES-001:** Visual reservation timeline, table hold, party size constraints, SMS notifications, and walk-in waitlist queue.

### 2.11 Customer QR & Online Delivery (FR-ONLINE)
- **FR-ONLINE-001:** Dine-in table QR ordering with 3D dish preview, cart, waiter call, and digital payment.
- **FR-ONLINE-002:** Delivery/Pickup web portal with live order tracker and Rider dispatch view.

### 2.12 Inventory, Recipes & Depletion (FR-INV)
- **FR-INV-001:** Bill of Materials (BOM) recipe per item; automatic FIFO ingredient stock deduction upon KOT fire.
- **FR-INV-002:** Low-stock threshold notifications, wastage logging with reason codes, and Purchase Order (PO) creation.

### 2.13 Staff, Attendance & Shift Scheduling (FR-HR)
- **FR-HR-001:** Quick PIN time clock for punch-in/punch-out, break tracking, overtime calculation, and waiter tip distribution.

### 2.14 Accounting & Financial Ledgers (FR-FIN)
- **FR-FIN-001:** Automated double-entry journal postings for sales, tax payables, inventory COGS, expenses, and petty cash.

### 2.15 Reports & Executive Analytics (FR-RPT)
- **FR-RPT-001:** Real-time revenue dashboard, hourly sales heatmaps, food cost percentage, server sales scorecards, and void/discount fraud detection flags.

### 2.16 Settings & Hardware Integration (FR-SET)
- **FR-SET-001:** Network ESC/POS thermal printer routing, cash drawer kick on cash payment, barcode reader listener, and secondary display synchronization.

### 2.17 Customer-Facing Display (FR-CFD)
- **FR-CFD-001:** Dual-screen / customer tablet mode reflecting itemized live cart, promotional video/slideshow, and dynamic payment QR code.

---

## 3. Non-Functional Requirements (NFR)

| ID | Category | Metric / Specification |
| :--- | :--- | :--- |
| **NFR-PERF-01** | Latency | POS item addition, category change, cart calculation < 50ms; bill finalize < 200ms. |
| **NFR-PERF-02** | Realtime | WebSocket dispatch (POS -> KDS -> Waiter) < 300ms end-to-end. |
| **NFR-OFFLINE-01** | Resiliency | Full POS cart, order-taking, and local receipt printing works 100% offline for > 24 hours. |
| **NFR-SEC-01** | Security | Zero cardholder data stored (PCI-DSS SAQ-A); bcrypt/argon2 password & PIN hashing; JWT with automatic expiry and rotation. |
| **NFR-SEC-02** | Tenant Isolation | Strict row-level tenancy (`tenant_id`) enforced across all queries and data access objects. |
| **NFR-AVAIL-01** | Availability | 99.9% uptime target with graceful offline degradation. |
| **NFR-USAB-01** | Ergonomics | Cashier billing under 10 seconds; touch target min 48px; WCAG 2.2 AA contrast compliance. |
| **NFR-ANIM-01** | Motion / 3D | 60 FPS rendering on modern tablets; "Performance Mode / Reduce Motion" fallback switchable in 1 tap. |

---
*Signed off for Phase 0 Baseline by Product Architecture & Engineering.*
