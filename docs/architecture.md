# NOVAPOS – System Architecture & Technical Design Document
**Document Path:** `/docs/architecture.md`  
**Version:** 1.0.0  
**Phase:** Phase 0 – Foundation  

---

## 1. Architectural Philosophy & Overview
NOVAPOS is designed as a **Modular Monolith** with clear domain separation, event-driven internal bus, and offline-first edge durability. It empowers single-location cafes to multi-brand enterprise franchises with 200+ concurrent terminals per branch.

### Core Architectural Pillars
1. **Speed & Ergonomics:** Client-side optimistic updates with < 50ms interaction latency.
2. **Offline Durability:** IndexedDB (`Dexie.js`) local datastore with monotonic outbox queue and automatic background synchronization.
3. **Multi-Tenant Strict Isolation:** Row-level tenant partitioning (`tenant_id`, `branch_id`) enforced across all queries and events.
4. **Realtime Pub/Sub:** WebSocket/Socket.io event mesh orchestrating cross-terminal state (POS, KDS, CFD, Handheld, QR).
5. **Fiscal & Payment Integrity:** Strict integer minor units for currency, double-entry ledgers, and zero-trust gateway settlement (SSLCOMMERZ server-side validation).

---

## 2. C4 Architecture Models

### 2.1 System Context Diagram (C4 Level 1)
```mermaid
graph TD
    subgraph Users
        Cashier[Cashier / Waiter]
        Chef[Kitchen Staff / Chef]
        Manager[Branch Manager / Owner]
        Customer[Dine-in / Online Customer]
        Rider[Delivery Rider]
    end

    subgraph NOVAPOS Platform
        POSApp[NOVAPOS PWA & Web Suite]
        CoreAPI[NOVAPOS Core Backend Service]
    end

    subgraph External Systems
        SSL[SSLCOMMERZ Payment Gateway]
        Printers[ESC/POS Thermal Network Printers]
        SMS[SMS & WhatsApp Gateway]
        Aggregators[Delivery Aggregators API]
    end

    Cashier -->|Order Entry & Billing| POSApp
    Chef -->|Bump Tickets & 86 Items| POSApp
    Manager -->|Analytics & Configuration| POSApp
    Customer -->|QR Scan & Online Order| POSApp
    Rider -->|Dispatch & COD Settlement| POSApp

    POSApp -->|REST API & WebSockets| CoreAPI
    CoreAPI -->|Host Checkout & Validation API| SSL
    CoreAPI -->|Print Jobs & ESC/POS Raw Data| Printers
    CoreAPI -->|Transactional Alerts| SMS
    CoreAPI -->|Order Ingestion| Aggregators
```

### 2.2 Container Diagram (C4 Level 2)
```mermaid
graph TD
    subgraph Client Tier [React 18 + Vite + TypeScript PWA]
        UI[Tailwind CSS + shadcn/ui + Framer Motion]
        R3F[React Three Fiber - 3D Floor Plan & 3D Dishes]
        State[Zustand Global State + TanStack Query]
        LocalDB[(IndexedDB - Dexie.js Offline Cache & Outbox)]
        SyncEngine[Sync & Conflict Resolution Worker]
    end

    subgraph Server Tier [Node.js / NestJS Modular Architecture]
        API_GW[API Gateway / Router /api/v1]
        AuthModule[Auth & RBAC Module - JWT/PIN]
        OrderModule[Order & Table Lifecycle Engine]
        BillingModule[Audited Pricing & Billing Engine]
        KdsGateway[Real-Time WebSocket Gateway]
        PayGateway[Payment Provider Interface - SSLCOMMERZ Adapter]
        InventoryModule[Recipe BOM & Stock Depletion Service]
        SyncController[Sync Ingestion & Master Sequence Generator]
    end

    subgraph Data Tier
        Postgres[(PostgreSQL with Prisma ORM)]
        Redis[(Redis Cache, Pub/Sub & BullMQ)]
    end

    UI --> State
    R3F --> State
    State --> LocalDB
    State --> SyncEngine
    SyncEngine <-->|Bi-directional Sync| SyncController
    UI <-->|REST + WebSocket| API_GW
    API_GW --> AuthModule
    API_GW --> OrderModule
    API_GW --> BillingModule
    API_GW --> PayGateway
    API_GW --> InventoryModule
    OrderModule <--> KdsGateway
    KdsGateway <--> Redis
    OrderModule --> Postgres
    BillingModule --> Postgres
    InventoryModule --> Postgres
```

---

## 3. High-Priority Sequence Diagrams

### 3.1 Order Taking -> Course Firing -> KDS Bump -> Notification Flow
```mermaid
sequenceDiagram
    autonumber
    actor Waiter as Waiter (POS / Tablet)
    participant POS as POS Client Engine (Local Dexie)
    participant WS as WebSocket Realtime Gateway
    participant Server as Order Management Service
    actor Chef as Kitchen Station (KDS)

    Waiter->>POS: Select Table T-04, add Ribeye & Caesar Salad
    Waiter->>POS: Set Ribeye to "Medium Rare", Assign Course 1 to Salad, Course 2 to Ribeye
    Waiter->>POS: Tap "Fire Starters, Hold Mains"
    POS->>POS: Write Order & OrderItems to Local Outbox
    POS->>Server: POST /api/v1/orders (with Client UUIDs)
    Server->>Server: Save Order, generate KitchenTicket (KOT-104)
    Server->>Server: Trigger Inventory Depletion (BOM deduction)
    Server->>WS: Broadcast event: `KOT_CREATED` (Station: Grill, Kitchen)
    WS-->>Chef: Render New Ticket on KDS (Audio Chime + Green Timer)
    Note over Chef: Kitchen prepares Course 1
    Chef->>WS: Tap Bump on KDS (Item: Caesar Salad -> READY)
    WS-->>Server: POST /api/v1/kds/tickets/KOT-104/items/1/ready
    WS-->>Waiter: Push Notification to Waiter: "Table T-04 Salad Ready"
    Waiter->>POS: Marks Salad "SERVED"
    Waiter->>POS: Tap "Fire Mains" -> Ribeye ticket activates on Grill KDS
```

### 3.2 Secure Payment via SSLCOMMERZ (Hosted Checkout, IPN & Server Validation)
```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer / Cashier
    participant Client as POS / QR Web App
    participant Backend as Core Backend (PayService)
    participant SSL as SSLCOMMERZ Gateway
    participant Bank as Issuing Bank / MFS (bKash/Nagad/Cards)

    Customer->>Client: Tap "Pay with SSLCOMMERZ" (1,500.00 BDT)
    Client->>Backend: POST /api/v1/payments/sslcommerz/init { billId: "BILL-2026-001" }
    Backend->>Backend: Generate unique tran_id: "TXN-9988-1234"
    Backend->>SSL: POST /gwprocess/v4/api.php (store_id, store_passwd, tran_id, amount, success_url, ipn_url)
    SSL-->>Backend: Return { status: "SUCCESS", GatewayPageURL: "https://sandbox.sslcommerz.com/..." }
    Backend-->>Client: Return { checkoutUrl: GatewayPageURL }
    Client->>Customer: Redirect browser to SSLCOMMERZ hosted page
    Customer->>SSL: Select Payment Tender (e.g. bKash / Card) and authorize payment
    Bank-->>SSL: Payment Authorized (status: VALID, val_id: "VAL-556677")
    
    par Browser Return URL (Informational Only)
        SSL->>Client: Redirect to success_url?tran_id=TXN-9988-1234
        Client->>Customer: Show "Processing payment verification..."
    and Instant Payment Notification (IPN - Server to Server)
        SSL->>Backend: POST /api/v1/payments/sslcommerz/ipn (tran_id, val_id, amount, currency)
        Note over Backend: CRITICAL: Verify with Order Validation API
        Backend->>SSL: GET /validator/api/validationserverAPI.php?val_id=VAL-556677&store_id=...&v=1
        SSL-->>Backend: Return { status: "VALID", amount: "1500.00", currency: "BDT", tran_id: "TXN-9988-1234" }
        Backend->>Backend: Verify amount == bill.total && currency == "BDT" && status == "VALID"
        Backend->>Backend: Transition Bill to PAID, record Payment entity, update Cashier Shift ledger
        Backend->>Client: WebSocket broadcast `BILL_PAID` event
    end

    Client->>Customer: Show animated Payment Success Confetti & Issue Receipt
```

### 3.3 Offline Outbox & Conflict Resolution Flow
```mermaid
sequenceDiagram
    autonumber
    actor Cashier as Cashier
    participant Terminal as Offline POS Terminal (IndexedDB)
    participant Master as Master Server API

    Note over Terminal: Internet Connection Severed (Offline Mode Active)
    Cashier->>Terminal: Add items, complete Cash settlement (1,200 BDT)
    Terminal->>Terminal: Generate client UUID: order_123, bill_123
    Terminal->>Terminal: Assign temporary offline sequence: TEMP-OFFLINE-004
    Terminal->>Terminal: Print physical receipt with offline watermark
    Terminal->>Terminal: Store mutations in `outbox_queue`
    
    Note over Terminal: Internet Connection Restored!
    Terminal->>Master: POST /api/v1/sync/outbox (Batch of outbox mutations)
    Master->>Master: Verify client UUIDs against idempotency table
    Master->>Master: Assign official immutable Fiscal Sequence: INV-2026-0891
    Master->>Master: Execute double-entry accounting & stock deductions
    Master-->>Terminal: Return ACK { client_id: "order_123", server_id: "ord_master_123", invoice_no: "INV-2026-0891", status: "COMMITTED" }
    Terminal->>Terminal: Mark outbox items as SYNCED
```

---

## 4. Multi-Tenant Isolation & Security Model
- **Row-Level Tenancy:** All Prisma queries automatically filter with:
  ```typescript
  where: {
    tenantId: ctx.user.tenantId,
    ...(ctx.user.branchId ? { branchId: ctx.user.branchId } : {}),
  }
  ```
- **Password & PIN Hashing:** Passwords hashed with `Argon2id` / `Bcrypt` (cost factor 12). 4-digit PINs hashed with tenant-specific cryptographic salt.
- **Role Permissions Guard:** Decorator-driven RBAC `@RequirePermissions(Permission.BILL_VOID)` evaluated before controller entry.
- **Zero Card Data:** Complete compliance with PCI-DSS SAQ-A via hosted redirect architecture.

---

## 5. Hardware Integration Architecture
- **ESC/POS Network & USB Printers:** Native raw byte generator supporting Epson, Star, and Xprinter commands (line feeds, cut, drawer kick `\x1B\x70\x00\x19\xFA`).
- **Local Print Bridge:** Light WebSocket daemon installed on POS machine (`ws://localhost:9100`) capable of sending raw ESC/POS binary buffers directly to serial/USB ports without browser print prompt delays.
- **Customer Facing Display (CFD):** Secondary monitor synchronized via broadcast channel API (locally) or WebSocket channel (networked tablet).

---
*Architectural Baseline Established for Phase 0.*
