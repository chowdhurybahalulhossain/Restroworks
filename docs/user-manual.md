# NOVAPOS – Enterprise Staff Operations Manual & Hardware Guide
**Document Path:** `/docs/user-manual.md`  
**Classification:** Standard Operating Procedure (SOP)  
**Version:** 1.0.0  
**Phase:** Phase 5 – Documentation Baseline  

---

## 1. Quick Staff Onboarding (5-Minute Training)

### 1.1 Quick PIN Login & Terminal Lock
1. Enter your 4-digit PIN on the terminal lock screen.
2. Demo PINs:
   - **Super Admin / Owner:** `9999`
   - **Branch Manager:** `1111`
   - **Cashier (Main Counter):** `1234`
   - **Waiter (Floor Captain):** `2222`
   - **Head Chef (KDS Station):** `3333`
3. Tap the **Padlock icon** in the top navbar anytime you step away from the counter to lock the terminal.

---

## 2. Table & Order Management SOP

### 2.1 Opening a Table Order
1. From the **POS Terminal** portal, tap **"View Floor Plan"**.
2. Select dining area: **Main Dining Hall**, **Skyline Rooftop**, or **VIP Lounge**.
3. Toggle between **2D Grid** or **3D Spatial View**.
4. Tap any green (Available) table to open order taking.

### 2.2 Adding Items & Customizing Modifiers
1. Browse categories or use the fast search bar (`/` shortcut).
2. For dishes with options (e.g. Steak, Burger):
   - Tap dish to open the **Modifier Selector**.
   - Choose required meat doneness (Rare / Medium / Well Done).
   - Select optional add-ons, sauces, or sides.
3. Tap **"Fire to Kitchen (KOT)"** to transmit tickets immediately to kitchen displays and thermal printers.

### 2.3 Table Transfer & Merge
1. On the Floor Plan, tap **"Transfer / Merge Table"**.
2. Select source table (e.g. T-04) and destination table (e.g. T-08).
3. Tap **"Transfer Table"** to move the order, or **"Merge Tables"** to combine parties.

---

## 3. Cashier Billing, Discounts & Shift Close

### 3.1 Applying Discounts & Voids
- **Standard Cashier Discount:** Up to 15% can be applied directly.
- **VIP Promos (e.g. VIP20 - 20% off):** Prompts for **Manager PIN Override** (`1111` or `9999`).
- **Voiding Fired Items:** Requires selection of mandatory reason code (`GUEST_CHANGED_MIND`, `KITCHEN_MISTAKE`, `QUALITY_COMPLAINT`) + Manager PIN approval.

### 3.2 Splitting Bills
1. On the cart sidebar, tap **"Split Bill"**.
2. Select split mode:
   - **Equal Split:** Divide total into 2, 3, 4, or N equal shares.
   - **Itemized Split:** Drag and allocate specific dishes to Bill A, B, or C.
3. Settle each split bill independently via Cash or Card.

### 3.3 Shift Close & Z-Report
1. Tap **"Close Shift"** in the cashier action panel.
2. Enter physical cash counts in the denomination calculator (1000, 500, 100, 50, 20, 10 BDT notes).
3. The system computes cash variance against registered sales.
4. Tap **"Print Z-Report & End Shift"** to trigger thermal printer report and lock cashier register.

---

## 4. Hardware Integration & Setup Guide

### 4.1 ESC/POS Thermal Receipt Printers (80mm & 58mm)
- **Supported Connection Types:** Network Ethernet (TCP port 9100), USB (Virtual COM / Raw USB), Bluetooth.
- **Driverless Web Printing:** NOVAPOS uses raw binary ESC/POS generator (`escpos-service.ts`) producing standardized command bytes:
  - Initialize Printer: `\x1B@`
  - Bold On/Off: `\x1BE\x01` / `\x1BE\x00`
  - Paper Cut: `\x1DVA\x00`
  - Cash Drawer Kick Pulse (RJ11): `\x1Bp\x00\x19\xFA`

### 4.2 Barcode & 2D QR Scanners
- Connect any standard USB HID or Bluetooth barcode reader.
- Scanned SKU barcodes automatically trigger instant item cart addition without manual keyboard input.

### 4.3 Secondary Customer-Facing Display (CFD)
- Open `Customer-Facing Display` portal on any secondary pole monitor or tablet.
- Automatically mirrors real-time cart items, promo savings, subtotal, and dynamic bKash/Card payment QR code.

