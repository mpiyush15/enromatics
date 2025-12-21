# 📌 Enromatics Stabilization Update Document

**Project:** Enromatics – Institute Management SaaS
**Document Type:** Stabilization & Technical Cleanup Update
**Version:** MVP v1.1
**Date:** 21 December 2025
**Status:** 🟡 Stable with Identified Risks

---

## 1. Purpose of This Document

This document formally captures the **current stabilization state** of the Enromatics platform. It is intended to:

* Clearly separate **stable functionality** from **known technical risks**
* Act as a **single source of truth** for cleanup and refactoring work
* Prevent scattered fixes (“khichdi changes”) that cause cascading data-fetch and routing errors
* Enable structured progress tracking before feature expansion

This document must be updated **before and after every major fix cycle**.

---

## 2. Overall System Health Snapshot

| Area                   | Status              | Notes                                              |
| ---------------------- | ------------------- | -------------------------------------------------- |
| Backend APIs           | ✅ Stable            | Deployed on Railway, all core CRUD operational     |
| Frontend Core Pages    | 🟡 Mostly Stable    | Some routes break under strict Next.js 15 behavior |
| Authentication         | ✅ Stable            | Token-based auth working                           |
| Payments               | 🟡 Partially Stable | Gateway integration OK, edge cases pending         |
| Multi-Tenant Routing   | ⚠️ Risky            | Legacy param usage causing inconsistency           |
| Data Fetching          | ⚠️ Risky            | Mixed sync/async patterns                          |
| Production Deployments | ✅ Stable            | Vercel + Railway operational                       |

---

## 3. Critical Stabilization Findings

### 3.1 Next.js 15 Parameter Handling Issue (CRITICAL)

**Problem**

* 30+ API routes and pages are using **deprecated synchronous params access**
* Next.js 15 enforces **async params resolution**

**Impact**

* Random page crashes
* Silent data-fetch failures
* Inconsistent tenant resolution

**Risk Level:** 🔴 High (will break in strict mode & future updates)

**Action Required:**

* Migrate all route handlers to async-safe param access
* Enforce a single routing pattern across app

---

### 3.2 API Proxy Layer Instability

**Problem**

* Frontend proxy layer mixes:

  * direct fetch calls
  * server actions
  * client-side calls

**Impact**

* Unpredictable API failures
* Hard-to-debug 401 / 500 errors

**Risk Level:** 🟠 Medium–High

**Action Required:**

* Centralize API client logic
* Remove duplicate proxy implementations

---

### 3.3 Data Fetch “Khichdi” Effect

**Problem**

* Multiple quick fixes applied without regression validation
* Inconsistent response handling across pages

**Symptoms**

* Data loads on one page but fails on another
* Same API behaves differently depending on caller

**Root Cause**

* No standardized fetch wrapper
* No response normalization

**Action Required:**

* Introduce a unified fetch utility
* Standardize error handling and success parsing

---

## 4. Areas Confirmed as Stable ✅

The following modules are **safe and require no refactor during stabilization**:

* Student CRUD operations
* Staff management
* Attendance core logic
* Fee collection logic (non-edge cases)
* Role-based access control
* Production environment variables

These areas should **not be touched** unless directly impacted by routing fixes.

---

## 5. Stabilization Rules (MANDATORY)

Until stabilization is marked **GREEN**, the following rules apply:

1. ❌ No new features
2. ❌ No UI refactors
3. ❌ No API behavior changes
4. ✅ Only bug fixes with documented reason
5. ✅ Every fix must update this document

---

## 6. Single Source of Truth (SSOT) Resolution – **MANDATORY STABILIZATION SCOPE**

### 6.1 SSOT Decision (LOCKED)

As part of stabilization, Enromatics will adopt a **Single Source of Truth (SSOT)** architecture.

**Final Decision:**

* Backend remains the **only source of business truth**
* Frontend becomes a **pure consumer**
* All data access is routed through a **BFF (Backend for Frontend)** layer

This is a **stabilization requirement**, not a future enhancement.

---

### 6.2 Backend-for-Frontend (BFF) Rule

Effective immediately:

* ❌ Frontend must NOT call backend services directly
* ✅ All frontend data access must go through Next.js `/api/*` routes
* ✅ BFF is responsible for:

  * Auth validation
  * Tenant resolution
  * Response normalization

This removes ambiguity and enforces a single truth pipeline.

---

### 6.3 Data Fetch & State Management Policy

| Layer    | Policy                         |
| -------- | ------------------------------ |
| Backend  | Absolute data truth            |
| BFF      | Normalization + access control |
| Frontend | Read-only consumption          |

Frontend rules:

* ❌ No duplicated business logic
* ❌ No divergent response parsing
* ✅ One unified fetch client only

---

### 6.4 SWR Usage (CONDITIONAL – NOT GLOBAL)

SWR **will be introduced selectively**, not everywhere.

Allowed usage:

* Non-sensitive dashboards
* Read-heavy pages
* Idempotent GET requests

Disallowed usage:

* Authentication flows
* Payments
* Sensitive admin operations
* Write or mutation-heavy flows

SWR is a **performance layer**, not a truth layer.

---

### 6.5 Redis Usage (FUTURE-READY, NOT REQUIRED NOW)

Redis is **NOT mandatory for MVP stabilization**.

Approved future use cases only:

* Tenant configuration caching
* Dashboard aggregate caching
* High-frequency read optimization

Strict rules:

* ❌ No sensitive data in Redis
* ❌ No auth tokens or PII
* ✅ Cache must always be reconstructible from backend DB

Redis will never be a source of truth.

---

### 6.6 SSOT Enforcement Rules

Until stabilization is marked GREEN:

1. ❌ No page may bypass BFF
2. ❌ No direct backend fetch from frontend
3. ❌ No ad-hoc caching logic
4. ✅ All new fetch logic must follow SSOT rules
5. ✅ Violations require refactor, not workaround

---

## 7. Stabilization Task Buckets

### Bucket A – Routing & Params (Highest Priority)

* Refactor all Next.js 15 param usage
* Remove sync param access
* Validate tenant resolution everywhere

### Bucket B – API Consistency

* Create single API client
* Remove duplicate fetch logic
* Standardize headers and auth flow

### Bucket C – Data Fetch Validation

* Page-by-page fetch verification
* Log failures explicitly
* Normalize backend responses

---

## 7. Success Criteria for Stabilization Completion

Stabilization will be considered **COMPLETE** only when:

* ✅ No deprecated Next.js warnings
* ✅ All dashboard pages load consistently
* ✅ No random 401 / 500 errors
* ✅ Tenant routing works in all environments
* ✅ This document shows no OPEN critical risks

---

## 8. Next Phase (Post-Stabilization)

Once stabilization is complete:

* Resume pending feature development
* Restart marketing rollout
* Address secondary performance optimizations
* Begin mobile app & AI integrations

---

## 9. Change Log

| Date        | Change                                 | Owner           |
| ----------- | -------------------------------------- | --------------- |
| 21 Dec 2025 | Initial stabilization document created | Enromatics Core |

---

**⚠️ IMPORTANT:**
This document must be treated as a **living technical contract**. Any undocumented fix is considered invalid and risky.


---------------

Yes ✅ **this is exactly the right moment to start the stabilization update**.
You’ve done the hardest discipline step already by creating a new branch 👍

Now do this **in the correct order** so you don’t create more khichdi.

---

## 🔒 FIRST: Lock the stabilization state (5 minutes)

Before touching code, do **these 3 confirmations mentally**:

* ✅ New branch created → **SAFE**
* ✅ No feature work allowed → **STABILIZATION ONLY**
* ✅ SSOT + BFF is now the target architecture

Once this is locked, we move.

---

## 🟢 STABILIZATION PHASE 1 — “Foundation” (START NOW)

### Step 1️⃣ Add a stabilization marker (important)

Create a small marker so you *know* you’re in stabilization mode.

Example (README or comment in repo root):

```md
## ⚠️ STABILIZATION MODE
Branch: stabilization/ssot-bff
No feature work allowed.
```

This prevents future mistakes.

---

### Step 2️⃣ Create the **single API client** (DO THIS FIRST)

This is the **heart of SSOT**.

Create:

```ts
src/lib/apiClient.ts
```

Minimal version (don’t overthink yet):

```ts
export async function apiClient(
  url: string,
  options: RequestInit = {}
) {
  const res = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.error || "API error");
  }

  return json;
}
```

🚫 From this point:

> **No page is allowed to call `fetch()` directly**

---

### Step 3️⃣ Choose ONE page to stabilize first

Do **NOT** touch multiple pages.

Best first candidates:

* Dashboard overview
* Students list
* Tenant branding load

👉 Pick **ONE** and say which one you choose.

---

## 🟡 STABILIZATION PHASE 2 — “BFF Enforcement”

After Step 3, we will:

* Ensure that page:

  * Uses `/api/*` only
  * Uses `apiClient`
  * Has no param warnings
  * Has deterministic behavior

Only then we move to the next page.

---

## 🔴 WHAT NOT TO DO RIGHT NOW

* ❌ Do not add SWR yet
* ❌ Do not add Redis
* ❌ Do not refactor UI
* ❌ Do not optimize performance

Stability first.

---

## ✅ Success signal for today

If by end of today you have:

* 1 page fully SSOT-compliant
* No random fetch errors
* No Next.js warnings

👉 **Stabilization is officially underway.**

---

### Next move (tell me):

1️⃣ Which page you want to stabilize first
2️⃣ Or if you want me to **audit a page and tell you whether it’s safe to start with**

Say the word and we go step-by-step 🔧🔥
