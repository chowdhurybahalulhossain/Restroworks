# NOVAPOS – Futuristic Design System & Motion Specification
**Document Path:** `/docs/design-system.md`  
**Version:** 1.0.0  
**Phase:** Phase 0 – Foundation  

---

## 1. Design Ethos: "Cyber-Luxe Restaurant OS"
NOVAPOS blends hyper-efficient tactile restaurant workflows with a futuristic luxury aesthetic.
- **Glassmorphism & Depth:** Soft backdrop-blur (`12px` to `20px`), subtle `rgba(255, 255, 255, 0.08)` borders, and dark ambient occlusion.
- **Neon Accent Hierarchy:** Precise, meaningful neon accents for instant operational awareness:
  - `Neon Emerald (#10B981)`: Available, Ready, Paid, Healthy Status.
  - `Electric Cyan (#06B6D4)`: Selected items, Active table, Primary action.
  - `Amber Radiant (#F59E0B)`: Preparing, Ticket aging 10–20 mins, Attention required.
  - `Hyper Crimson (#EF4444)`: Voided, Delayed > 20 mins, Urgent Alert, 86 Sold Out.
  - `Deep Void (#0B0F19)`: Ultra-deep canvas background to reduce glare during long 12-hour shifts.
- **Touch-First Ergonomics:** 48px minimum hit target, generous paddings, thumb-friendly bottom action rails.
- **High-Performance Motion:** Micro-interactions under 250ms, spring physics, and an instantaneous **"Reduce Motion / 2D Mode"** switch for lower-spec Android POS hardware.

---

## 2. Color Palette & Token System

### 2.1 Core Surface Tokens (CSS Variables)
```css
:root {
  /* Backgrounds & Canvas */
  --nova-bg-canvas: #07090E;
  --nova-bg-surface: #0E131F;
  --nova-bg-surface-elevated: #161D2E;
  --nova-bg-surface-overlay: rgba(18, 24, 38, 0.75);

  /* Glassmorphic Borders */
  --nova-border-subtle: rgba(255, 255, 255, 0.07);
  --nova-border-focus: rgba(6, 182, 212, 0.6);
  --nova-border-glow: 0 0 15px rgba(6, 182, 212, 0.25);

  /* Brand Accents */
  --nova-cyan: #00F0FF;
  --nova-cyan-glow: rgba(0, 240, 255, 0.4);
  --nova-emerald: #10B981;
  --nova-amber: #F59E0B;
  --nova-crimson: #FF3366;
  --nova-violet: #8B5CF6;

  /* Typography Colors */
  --nova-text-primary: #F8FAFC;
  --nova-text-secondary: #94A3B8;
  --nova-text-muted: #64748B;
  --nova-text-inverse: #020617;
}
```

---

## 3. Typography Scale & Hierarchy
- **Primary Interface Font:** `Inter`, system-ui, -apple-system.
- **Display & Monospace Digits:** `Space Grotesk` & `JetBrains Mono` for currency and order numbers.
- **Scale:**
  - `Display / KPI`: `32px` to `48px`, font-weight `700`, tracking tight.
  - `H1 Table / Section`: `24px`, font-weight `600`.
  - `H2 Category / Card`: `18px`, font-weight `600`.
  - `Body / Cart Item`: `14px`–`15px`, font-weight `400`–`500`.
  - `Badge / Modifier`: `11px`–`12px`, font-weight `600`, uppercase tracking wide.

---

## 4. Component Library Standards

### 4.1 POS Category Rail & Item Tiles
- **Tile Dimensions:** Minimum `140px` x `160px` with rounded 16px corners (`rounded-2xl`).
- **Visuals:** High-resolution optimized food imagery with dark bottom gradient scrim for legible text overlay.
- **Stock Badge:** Glowing indicator for stock par levels; glowing strike-through red badge when 86'd.
- **Tap Animation:** Scale down to `0.96` on touch with spring rebound (`Framer Motion: { type: "spring", stiffness: 400, damping: 25 }`).

### 4.2 Interactive 3D Floor Plan (React Three Fiber)
- **Camera:** Isometric tilted perspective (`OrbitControls` with restricted vertical angle 20°-75°).
- **Table Meshes:** Cylinder (Round), Rounded Extruded Box (Square/Rectangle), Curved Booth.
- **Status Lighting:** Tables emit a dynamic floor glow corresponding to their live status (`available`, `occupied`, `food_ready`, `bill_requested`).
- **Interactive Hover:** Tables float upwards by `0.3` units on hover with smooth damped interpolation.

### 4.3 Kitchen Display System (KDS) Cards
- **High-Contrast Readability:** Dark high-contrast card with oversized course markers and timer header.
- **Elapsed Timer:** Real-time ticking badge with color escalation:
  - `00:00 - 09:59`: Calm emerald glow.
  - `10:00 - 19:59`: Radiant amber warning.
  - `20:00+`: Pulsing neon crimson banner with audio ping.
- **Bump Tap:** Tapping an item marks it with an electric green checkmark and strike-through. Tapping "Bump All" smoothly slides the card out to the right with spring physics.

---

## 5. Motion Tokens & Accessibility Modes
- **Quick Tap Feedback:** `150ms` ease-out.
- **Modal / Flyout Drawer:** `250ms` cubic-bezier(0.16, 1, 0.3, 1).
- **Reduced Motion Fallback:**
  When user toggles "Performance / 2D Mode":
  - Three.js 3D canvas is replaced by a high-contrast 2D SVG canvas.
  - Parallax and blur filters are replaced with solid dark borders (`#1E293B`).
  - FPS locks cleanly to standard 60fps on low-end MTK/Snapdragon POS tablets.

---
*Design System Baseline Established for Phase 0.*
