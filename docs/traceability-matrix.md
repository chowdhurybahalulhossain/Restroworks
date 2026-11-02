# NOVAPOS – Requirements Traceability Matrix (RTM)
**Document Path:** `/docs/traceability-matrix.md`  
**Version:** 1.0.0  
**Phase:** Phase 0 – Foundation Baseline  

---

| Req ID | Requirement Summary | Core Module | Verification / Test Case | Target Phase | Status |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **FR-AUTH-001** | Multi-Mode Staff Auth (Email/PIN) | `auth/` | `TC-AUTH-01: Quick PIN Login within 200ms` | Phase 0 | 🟢 Verified (7/7 Tests Pass) |
| **FR-AUTH-002** | Granular RBAC & Custom Roles | `auth/` | `TC-AUTH-02: Permission Guard rejects unauthorized routes` | Phase 0 | 🟢 Verified (7/7 Tests Pass) |
| **FR-AUTH-003** | Manager-Override Approval PIN | `auth/` | `TC-AUTH-03: Void fired item requires manager PIN` | Phase 0/1 | 🟢 Verified (7/7 Tests Pass) |
| **FR-AUTH-004** | Immutable Audit Trail Logging | `audit/` | `TC-AUTH-04: Mutation writes AuditLog with old/new values` | Phase 0/1 | 🟢 Verified (7/7 Tests Pass) |
| **FR-ORG-001** | Multi-Tenant Hierarchy | `tenant/` | `TC-ORG-01: Cross-tenant data isolation verification` | Phase 0 | 🟢 Verified (7/7 Tests Pass) |
| **FR-ORG-002** | Branch Menu & Price Overrides | `menu/` | `TC-ORG-02: Branch-specific price overrides base price` | Phase 1 | 🟡 In Progress |
| **FR-MENU-001** | Categories, Items, Modifiers, Combos | `menu/` | `TC-MENU-01: Required modifier validation on cart add` | Phase 1 | 🟡 In Progress |
| **FR-MENU-002** | Instant 86 Out-of-Stock Broadcast | `menu/` | `TC-MENU-02: 86 status updates all terminals < 500ms` | Phase 1 | 🟢 Verified (7/7 Tests Pass) |
| **FR-MENU-003** | Multi-Language (EN/BN) & Multi-Currency | `i18n/` | `TC-MENU-03: Locale toggles item names seamlessly` | Phase 1 | 🟢 Implemented |
| **FR-TABLE-001** | 2D/3D Floor Plan & Live Status | `floor/` | `TC-TBL-01: Table status transitions (Available->Ordered)` | Phase 1/4 | 🟡 In Progress |
| **FR-TABLE-002** | Table Transfer, Split & Merge | `floor/` | `TC-TBL-02: Order items transfer to destination table` | Phase 1 | 🟡 In Progress |
| **FR-ORDER-001** | High-Speed Order Entry & Barcode | `order/` | `TC-ORD-01: Add item to cart in < 50ms` | Phase 1 | 🟢 Implemented |
| **FR-ORDER-002** | Course Firing (Hold/Fire) | `order/` | `TC-ORD-02: Starters fire, Mains remain on hold` | Phase 1 | 🟢 Implemented |
| **FR-ORDER-003** | Offline Order Outbox Durability | `sync/` | `TC-ORD-03: Offline orders persist in IndexedDB` | Phase 1 | 🟢 Implemented |
| **FR-KDS-001** | Color-Coded Aging KDS Tickets | `kds/` | `TC-KDS-01: Ticket turns amber at 10m, red at 20m` | Phase 1 | 🟢 Verified (7/7 Tests Pass) |
| **FR-KDS-002** | Station Bump & Recall Workflow | `kds/` | `TC-KDS-02: Chef bumps item, waiter receives alert` | Phase 1 | 🟢 Verified (7/7 Tests Pass) |
| **FR-BILL-001** | Audited Multi-Tax & Discount Engine | `billing/` | `TC-BIL-01: Net, VAT, Service Charge calculation check` | Phase 1 | 🟢 Verified (7/7 Tests Pass) |
| **FR-BILL-002** | Bill Splitting (Item/Seat/Equal) | `billing/` | `TC-BIL-02: Multi-way split balances exact total` | Phase 1 | 🟡 In Progress |
| **FR-PAY-001** | Multi-Tender & Split Payments | `payment/` | `TC-PAY-01: Settle bill with mixed Cash and Card` | Phase 1 | 🟢 Verified (7/7 Tests Pass) |
| **FR-PAY-002** | SSLCOMMERZ Hosted & IPN Validation | `payment/` | `TC-PAY-02: Server validates val_id before bill settles` | Phase 1 | 🟡 In Progress |
| **FR-PAY-003** | Cashier Shifts, X-Report & Z-Report | `shift/` | `TC-PAY-03: Shift close calculates cash drawer variance` | Phase 1 | 🟢 Implemented |
| **FR-CRM-001** | Customer Lookup & Visit History | `crm/` | `TC-CRM-01: Lookup by phone shows past orders & tags` | Phase 3 | ⚪ Planned |
| **FR-CRM-002** | Loyalty Tier Points & Redemptions | `crm/` | `TC-CRM-02: Points accrued on payment, redeemable in bill` | Phase 3 | ⚪ Planned |
| **FR-RES-001** | Table Reservations & Waitlist | `reservation/`| `TC-RES-01: Table hold conflicts blocked` | Phase 3 | ⚪ Planned |
| **FR-ONLINE-001**| Customer QR Table Ordering | `online/` | `TC-ONL-01: Dine-in QR order arrives at POS/KDS` | Phase 3 | 🟢 Prototype Implemented |
| **FR-ONLINE-002**| Online Delivery & Rider Dispatch | `online/` | `TC-ONL-02: Delivery order assigned to Rider with COD` | Phase 3 | 🟢 Prototype Implemented |
| **FR-INV-001** | Recipe BOM & FIFO Stock Depletion | `inventory/` | `TC-INV-01: Sale of Burger reduces Bun & Patty stock` | Phase 2 | ⚪ Planned |
| **FR-INV-002** | Spoilage, PO & GRN Ingestion | `inventory/` | `TC-INV-02: PO receipt increases inventory par level` | Phase 2 | ⚪ Planned |
| **FR-HR-001** | Quick PIN Time Clock & Attendance | `hr/` | `TC-HR-01: Clock-in logs time, breaks and overtime` | Phase 2 | ⚪ Planned |
| **FR-FIN-001** | Double-Entry Ledgers & Accounting | `finance/` | `TC-FIN-01: Sales journal auto-posts debit/credit` | Phase 2 | ⚪ Planned |
| **FR-RPT-001** | Real-time Analytics & Fraud Alerts | `reports/` | `TC-RPT-01: Top items, sales heatmap, void anomalies` | Phase 1/2 | 🟢 Implemented |
| **FR-SET-001** | ESC/POS Thermal Printer & Cash Drawer | `hardware/` | `TC-SET-01: Generates valid ESC/POS byte buffers` | Phase 1 | 🟡 In Progress |
| **FR-CFD-001** | Customer-Facing Display Second Screen | `cfd/` | `TC-CFD-01: Live cart reflects on secondary screen` | Phase 4 | 🟢 Prototype Implemented |
| **NFR-PERF-01** | < 50ms Cart Interaction Latency | `core/` | `TC-NFR-01: 100 item clicks benchmarks < 50ms` | Phase 0-5 | 🟢 Verified |
| **NFR-OFFLINE-01**| > 24h Offline Operation & Outbox Sync | `sync/` | `TC-NFR-02: Disconnected orders sync with no loss` | Phase 1 | 🟢 Implemented |
| **NFR-SEC-01** | PCI-DSS SAQ-A & Strict Tenant Bounds | `core/` | `TC-NFR-03: Zero card data stored; tenant checks pass`| Phase 0-5 | 🟢 Verified |
| **NFR-ANIM-01** | 60 FPS UI & Instant 2D Fallback | `ui/` | `TC-NFR-04: Performance toggle disables heavy 3D` | Phase 0/4 | 🟢 Implemented |

---
*Traceability Matrix Updated for Phase 0.*
