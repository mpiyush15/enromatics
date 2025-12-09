Acknowledged—let’s get clear on what’s done vs planned, then map them to subscription tiers so we can enforce locks cleanly.

## Features already built (current tenants)
# EnroMatics – Plan & Feature Matrix

This document captures the current state of features (built vs planned) and the subscription tier locks and quotas.

## Confirmed billing & trials
- Payment gateway: Cashfree (tenant accounts)
- Trial duration: 14 days
- Currency/tax: Configure per-tenant (GST/VAT as applicable)

## Tier definitions
- Basic: Entry tier for small institutes
- Pro: Core + AI starter
- Enterprise: Full suite, advanced features, high quotas

## Quotas
- Students: Basic 50, Pro 100, Enterprise Unlimited
- Staff: Basic 10, Pro 50, Enterprise Unlimited
- Concurrent tests: Basic 1, Pro 3, Enterprise 10
- Storage/Bandwidth: Basic 10 GB, Pro 50 GB, Enterprise Unlimited (bandwidth fair-use; to tune with infra)

## Feature locks (per tier)
- Core modules (Basic+):
  - Subdomain provisioning (institute.enromatics.com)
  - Branding basics (logo, theme color, institute name)
  - RBAC (owner/admin/teacher/student) with limited scopes
  - Online Test V1 (manual paper, MCQs/subjective/numerical, basic timer & submission)
  - Study Materials (upload notes/videos/PDFs, share to batches, categorize)
  - Attendance
  - Fees tracking (basic invoices/receipts)
  - Notifications (announcements, basic emails via ZeptoMail)
  - Secure video delivery (S3 + encrypted HLS, signed URLs/tokens, basic watermark)

- Pro (adds):
  - AI Question Generator (topic → MCQs/short/long/numericals)
  - Notes → Question Generator (PDF/image → content → questions)
  - PYQ basic import
  - Online Test Engine V2 (sections, advanced scoring)
  - Enhanced notifications & email templates
  - Higher quotas across students/staff/tests/storage

- Enterprise (adds):
  - One-click YouTube Live (teacher OAuth, start live, students watch in app)
  - White-label APK generator (branding/app name)
  - AI Exam Generator (end-to-end paper creation)
  - Marketing funnel automation (campaigns, leads, landing pages; superadmin monitoring)
  - Teacher analytics, fee prediction
  - Video → Notes (advanced)
  - Multi-branch support (central admin + branch admins)
  - Priority support & SLA

## Built vs planned
- Built/partial:
  - Multi-tenant groundwork (subdomain strategy, tenant scripts)
  - Communication basics (email setup/docs; templates drafted)
  - Students/Academics modules (scholarship exams BFF; staff/students flows partial)
  - Backend utilities (tenant management; WhatsApp BFF; social integrations groundwork)
  - Deployment/performance docs (Railway setup, summaries, optimization guides)

- Planned (Phase 1):
  - Subscription plans + Cashfree billing, trials, status enforcement
  - Auto subdomain provisioning & branding storage
  - RBAC enforcement across modules
  - Online Test V1 + AI-assisted result sheet formatting
  - Study Materials module
  - Attendance & Fees tracking
  - Notifications (announcements, emails)
  - Secure video delivery + Web player (Shaka) integration

- Planned (Phase 2):
  - AI question generator; Notes → questions
  - One-click YouTube Live; PYQ; Test Engine V2
  - Student app panel

- Planned (Phase 3):
  - AI student tutor; White-label APK; AI exam generator; Marketing funnel automation

- Planned (Phase 4):
  - Teacher analytics; Fee prediction; Video → notes; Multi-branch support

## Enforcement notes
- Backend guards: reject over-cap actions with standardized "upgrade required" responses
- Frontend gating: hide/disable features with upsell modals; link to pricing/checkout
- Trials: lock features post-expiry; provide reactivation flow
- Usage tracking: counters for students/staff/campaigns/storage; nightly integrity job
- Video access control service: mint short-lived signed URLs + one-time tokens; optional device binding; audit logs

## Open items to finalize
- Exact storage/bandwidth caps per tier
- Whether YouTube Live is Pro or Enterprise only (currently Enterprise)
- Watermark format and device restriction policy for videos
- GST/VAT configuration defaults per region

## Implementation roadmap (steps to complete features)

Phase 1 – Productization Foundations (Weeks 1–3)
- Plans & billing
  - Create plans/subscriptions tables; integrate Cashfree checkout
  - Implement webhooks for subscription lifecycle (created/paid/failed/canceled)
  - Map tenant→subscription; set trial (14 days); lock on expiry
- Subdomain provisioning & branding
  - Wildcard DNS + SSL; auto provision `institute.enromatics.com`
  - Store branding fields (logo, color, institute name); apply theme in UI
- RBAC & gating
  - Define roles/scopes; add backend guards (students/storage caps)
  - Frontend gating (disable UI, upsell modal, pricing links)
- Core modules
  - Online Test V1 (manual paper, MCQ/subjective/numeric, timer, submission)
  - Study Materials (upload videos/notes/PDFs; share to batches; categorize)
  - Attendance tracking; Fees (invoices/receipts)
- Communication
  - Announcements, notifications, emails via ZeptoMail
- Secure video delivery
  - S3 private storage; HLS packaging; signed URLs/tokens; Shaka web player

Phase 2 – Core + AI Starter (Weeks 4–6)
- AI question generator
  - Topic→questions (MCQ/short/long/numerical); export to test paper
- Notes→questions
  - PDF/image extraction→content→questions; tie into test builder
- Test Engine V2
  - Sections, advanced scoring, analytics
- YouTube Live (decision: Enterprise)
  - OAuth connect; create live; student watch experience in app
- Student app panel
  - Basic student portal for tests/materials/notifications

Phase 3 – High Value (Weeks 7–9)
- AI student tutor (contextual help on materials/tests)
- White-label APK generator (branding, app name; build pipeline)
- AI exam generator (end-to-end from syllabus/notes)
- Marketing funnel automation (campaign builder, leads, landing pages)

Phase 4 – Enterprise & Scale (Weeks 10–12)
- Teacher analytics (engagement, performance)
- Fee prediction (collections forecasting)
- Video→notes (transcription/summarization)
- Multi-branch support (central admin + branch admins)

Cross-cutting tasks
- Usage tracking counters (students/staff/campaigns/storage) + nightly integrity job
- Observability: error monitoring, slow-query logging, performance baselines
- Security: audit logs for video access, one-time tokens, optional device binding
- Docs: Admin runbooks, onboarding help, pricing page content

Acceptance criteria per module
- Gating: Over-cap actions blocked with standardized “upgrade required” response; frontend upsell shown
- Trials: 14-day trial locks features; upgrade resumes access instantly
- Subdomain: Tenant accessible via `institute.enromatics.com` with branding applied
- Tests V1: Create, assign, submit, view results; timer enforced
- Study Materials: Upload, categorize, batch-share; video secure playback
- Billing: Successful payment activates subscription; failed payment notifies; cancellation downgrades

- Includes everything in Pro, plus:
  - One-click YouTube Live (full)
  - White-label APK generator (branding/app name)
  - AI exam generator (end-to-end paper creation)
  - Marketing funnel automation (campaigns, leads, tenant-wide landing pages)
  - Teacher analytics, fee prediction
  - Video → notes (advanced)
  - Multi-branch support (central admin + branch admins)
  - Priority support, SLA
- Quotas (example):
  - Students: 10,000+
  - Staff: 500+
  - Concurrent tests/live sessions: 20+
  - Generous storage/bandwidth

## Next steps
- Confirm tier assignments and quotas (we’ll tune numbers to match pricing).
- I’ll draft the plan-feature lock matrix and start gating:
  - Backend: route guards return “upgrade required”
  - Frontend: UI gating with upsell modals and trial/limit enforcement
- Wire payments → provisioning → onboarding so new tenants flow is smooth.

If you want, I can prepare a one-pager matrix (modules vs tiers vs quotas) for quick review, then implement gating stubs in both backend and frontend.

------------------------------------------

