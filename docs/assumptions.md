# NOVAPOS - System Assumptions & Standard Industry Behaviors
Document Path: `/docs/assumptions.md`
Project: **NOVAPOS - Enterprise Multi-Tenant Restaurant POS & Operating System**
Status: **Active / Baseline (Phase 0)**

---

## 1. Scope & Objective
This document formalizes all architectural, domain, business-rule, and technical assumptions adopted to eliminate ambiguity while strictly complying with industry standards (NRA, GS1, ISO 8583, PCI-DSS SAQ-A, VAT/GST compliance rules).

---

## 2. Domain & Business Assumptions

### 2.1 Currency, Precision & Pricing Engine
- **Minor Unit Storage:** All monetary values (prices, subtotal, tax amounts, discounts, tips, payments) are stored as 64-bit integer minor units (e.g., 100.50 BDT / USD = `10050` cents/poisha).
- **Rounding Strategy:** Half-up rounding (`ROUND_HALF_UP`) applied per line item or at bill level according to the tenant's configured fiscal policy.
- **Order of Calculations:**
  1. Base Line Item Price + Selected Modifier Additions.
  2. Item-level discounts applied to get Net Item Amount.
  3. Bill-level discounts applied proportionally or sequentially based on stackability rules.
  4. Service charges calculated on post-discount subtotal.
  5. Taxes (VAT / GST) computed per item tax category (inclusive or exclusive).
  6. Packaging / Delivery charges added.
  7. Final Rounding to integer or nearest standard currency denomination.

### 2.2 Multi-Tenancy & Data Isolation
- **Tenant Hierarchy:** `Platform -> Tenant (Organization) -> Brand -> Branch -> Outlet / Counter -> Terminal Device`.
- **Data Isolation:** All database tables include a mandatory `tenant_id` and `branch_id` where applicable. Foreign key cascade deletion is strictly prohibited on financial, inventory, and audit entities; soft-deletion (`deleted_at`) is enforced.
- **Tenant Context:** Injected per request via authenticated JWT payload (`tenantId`, `branchId`, `roles`).

### 2.3 Offline Engine & Conflict Resolution
- **Client ID Generation:** All transactions (Orders, OrderItems, Bills, Payments, Shift Logs) created while offline use cryptographically random UUIDv4 (`id`) and monotonic client timestamp (`client_created_at`).
- **Sequential Invoice Numbers:** Offline terminals generate sequential temporary reference numbers (`TEMP-BRANCH-TERMINAL-SEQ`). Upon synchronization with the server, the master fiscal sequence engine issues an immutable official Fiscal Invoice Number while preserving the offline reference for audit traceability.
- **Conflict Resolution Rule (LWW vs Merge):**
  - **Orders / Cart:** Merged additively (items added on terminal A and terminal B to the same table are unioned).
  - **Table Status:** Server state prevails if table was closed or transferred; otherwise client state updates last-active timestamp.
  - **Void / Discount:** Requires manager PIN verification cached locally with hashed PIN salt for offline approval.

### 2.4 Kitchen Workflow (KOT & KDS)
- **Item States:** `PENDING` -> `ACCEPTED` -> `PREPARING` -> `READY` -> `SERVED` -> `VOIDED`.
- **Void After Fire:** Once a KOT ticket is fired to the kitchen, items cannot be deleted silently. A void request must specify a mandatory reason code (e.g., "Customer Changed Mind", "Late Prep", "Allergy Alert") and an alert is broadcast to the respective KDS station with audible chime.
- **Station Routing:** Configured at category/item level (`KITCHEN`, `BAR`, `GRILL`, `DESSERT`, `COLD_PREP`). Items on a single order split into station-specific sub-tickets.

### 2.5 Payments & SSLCOMMERZ Integration
- **Zero Cardholder Data:** The POS and web apps never touch or store raw card numbers, CVVs, or expiration dates (PCI-DSS SAQ-A compliance).
- **SSLCOMMERZ Source of Truth:**
  - Session creation happens exclusively via secure server-to-server API (`POST /gwprocess/v4/api.php`) using credentials stored in secure environment secrets.
  - Success return URL redirects the user, but the bill is **not marked paid** until the backend receives and validates the Instant Payment Notification (IPN) and completes the server-side Order Validation API (`validator/api/validationserverAPI.php` checking `val_id`, matching amount, currency, and `status == VALID` or `VALIDATED`).
  - Duplicate IPNs are handled idempotently via unique transaction ID (`tran_id`).

### 2.6 Inventory & Recipe Depletion
- **Depletion Trigger:** Configurable per tenant:
  - *Standard Default:* Depleted on KOT Fire (`ORDER_CONFIRMED`) to accurately reflect physical pantry usage in real time.
  - *Alternative:* Depleted on bill settlement (`PAID`).
- **Modifiers & Add-ons:** Deduct ingredients defined in the modifier's sub-recipe.
- **Wastage & Spoilage:** Logged separately from sales deductions with user ID, reason, and cost calculation.

---

## 3. Technical & Operational Assumptions

| Component | Standard Assumption | Fallback / Alternative |
| :--- | :--- | :--- |
| **Node.js Runtime** | Node.js v18+ LTS (v24 compatible) | Standard ECMAScript 2022+ |
| **Monorepo / Workspace** | Structured modular project (`client`, `server`, `docs`) | Unified dev server & test runner |
| **Local Storage (Offline)** | IndexedDB via Dexie.js with transactional outbox queue | LocalStorage for auth tokens |
| **Realtime Transport** | WebSocket / Socket.io with heartbeat & room tenancy | Long-polling fallback |
| **Hardware Bridge** | Web Serial / Web Bluetooth / Local WebSocket ESC/POS Bridge | Browser Print Dialog |
| **Theme & 3D** | Dark Cyber-Luxe default with Glassmorphism, 2D fallback toggle | Accessible Light theme |

This document serves as the formal foundation for the NOVAPOS specifications and implementation.
