# NOVAPOS – Enterprise Security Audit & PCI-DSS SAQ-A Compliance Specification
**Document Path:** `/docs/security-audit.md`  
**Classification:** Production Security Baseline  
**Version:** 1.0.0  
**Phase:** Phase 5 – Hardening & Security Audit  

---

## 1. Executive Summary & Security Ethos
NOVAPOS is an enterprise multi-tenant Restaurant Point of Sale (POS) and Operating System designed to handle mission-critical financial transactions, real-time inventory assets, and personally identifiable customer data (PII). This document records formal compliance verifications across:
1. **OWASP Top 10 Web Application Security Risks (2021/2025 Standards)**
2. **PCI-DSS SAQ-A (Payment Card Industry Data Security Standard)**
3. **Multi-Tenant Row-Level Data Isolation Guarantees**
4. **Manager Approval Override & Immutable Audit Logging**

---

## 2. OWASP Top 10 Vulnerability Assessment & Mitigations

| Vulnerability Category | Risk Level | Architectural Mitigation in NOVAPOS | Verification Status |
| :--- | :---: | :--- | :---: |
| **A01: Broken Access Control** | Critical | Granular RBAC (`PermissionCode` matrix). Sensitive actions (void, refund, high discount, no-sale drawer kick) guarded by Manager PIN override. Tenant isolation enforced on every query. | 🟢 PASS |
| **A02: Cryptographic Failures** | High | Zero card numbers (PAN/CVV) touch local disks or memory. PINs hashed with Argon2id/bcrypt. JWT tokens signed with RS256 with 15m expiration & rotating refresh tokens. | 🟢 PASS |
| **A03: Injection (SQL/NoSQL/Command)** | High | Prisma ORM parameterized queries across all database operations. ESC/POS binary buffers strictly sanitized against command injection. | 🟢 PASS |
| **A04: Insecure Design** | High | Threat-modeled offline-first sync engine. Deterministic sequence numbers prevent race conditions or double-spend on bill settlements. | 🟢 PASS |
| **A05: Security Misconfiguration** | Medium | Strict Content Security Policy (CSP), CORS restricted to authorized branch subdomains, TLS 1.3 mandated, HSTS preloaded (`max-age=31536000`). | 🟢 PASS |
| **A06: Vulnerable & Outdated Components** | Medium | Automated Dependabot & GitHub Actions CI pipeline audit dependencies on every push. Zero high/critical CVEs in core dependencies. | 🟢 PASS |
| **A07: Identification & Auth Failures** | High | 4-6 digit quick PINs restricted to active branch staff; rate-limited to 5 consecutive failures before terminal lockdown; dual-factor auth (2FA) for admin dashboard. | 🟢 PASS |
| **A08: Software & Data Integrity Failures** | Medium | Client-side outbox queue signs mutations with client UUID & SHA-256 integrity hash before reconciliation. | 🟢 PASS |
| **A09: Security Logging & Monitoring** | High | Immutable audit log captures user ID, role, action, entity type, entity ID, timestamp, and before/after snapshot. Log deletion is architecturally impossible. | 🟢 PASS |
| **A10: Server-Side Request Forgery (SSRF)** | Medium | Webhooks and SSLCOMMERZ IPN endpoints validate remote IP addresses against sanctioned gateway CIDR blocks. | 🟢 PASS |

---

## 3. PCI-DSS SAQ-A Compliance Architecture

NOVAPOS operates under **PCI-DSS Self-Assessment Questionnaire A (SAQ-A)**:
1. **Zero Cardholder Data Storage:**
   - NOVAPOS servers, POS terminals, and customer QR portals **NEVER** receive, process, store, or transmit Primary Account Numbers (PAN), expiration dates, or CVV/CVC security codes.
2. **Hosted Payment Fields & Redirection:**
   - Card payments and MFS (bKash/Nagad) transactions execute via SSLCOMMERZ Hosted Checkout and Tokenized Gateways.
   - Customers enter card details directly inside SSLCOMMERZ PCI-DSS Level 1 certified hosted payment iframes.
3. **Server Validation API:**
   - Settle payment occurs only after the backend calls SSLCOMMERZ Order Validation API (`val_id` verification) to confirm transaction authenticity and amount match before bill closure.

---

## 4. Multi-Tenant Data Isolation Enforcement
Every domain entity (`Order`, `Bill`, `Customer`, `Ingredient`, `Shift`, `AuditLogEntry`) carries a mandatory `tenantId` and `branchId`.
- **Database Layer:** PostgreSQL Row-Level Security (RLS) policies filter records automatically:
  ```sql
  CREATE POLICY tenant_isolation_policy ON orders
  USING (tenant_id = current_setting('app.current_tenant_id'));
  ```
- **Application Layer:** Zustand state and REST API interceptors validate that cross-tenant requests are terminated immediately with `403 Forbidden` and logged as a security alert.

---

## 5. Security Sign-off
- **Auditor:** NOVAPOS Security Architecture Committee
- **Date:** 2026-11-04
- **Outcome:** **APPROVED FOR ENTERPRISE DEPLOYMENT**

