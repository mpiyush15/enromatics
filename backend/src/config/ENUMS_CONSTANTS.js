/**
 * ENUMS_CONSTANTS.js
 * Single Source of Truth for all enum values across the system
 * All values are LOWERCASE for consistency
 * 
 * Usage:
 * import ENUMS from '../config/ENUMS_CONSTANTS.js';
 * 
 * In model:
 * gender: { enum: ENUMS.GENDERS }
 * 
 * In code:
 * if (user.gender === ENUMS.GENDERS[0]) // Compare with constants
 */

export default {
  // ============ PEOPLE ============
  GENDERS: ["male", "female", "other"],

  // ============ ROLES (System & Tenant) ============
  SYSTEM_ROLES: ["superadmin", "tenantadmin", "student"],
  
  STAFF_ROLES: [
    "teacher",
    "staff",
    "counsellor",
    "manager",
    "accountant",
    "marketing",
    "admin",
    "ads_manager",
    "admission_incharge",
    "receptionist",
    "librarian",
    "lab_assistant",
  ],

  // ============ SUBSCRIPTION & PLANS ============
  SUBSCRIPTION_PLANS: ["trial", "basic", "pro", "enterprise"],
  SUBSCRIPTION_TIERS: ["trial", "basic", "pro", "enterprise"],
  SUBSCRIPTION_STATUS: ["trial", "active", "expired", "cancelled"],
  BILLING_CYCLES: ["monthly", "annual"],

  // ============ PAYMENTS ============
  PAYMENT_METHODS: ["cash", "upi", "bank", "card", "cheque", "online"],
  PAYMENT_STATUS: ["success", "failed", "pending"],
  PAYMENT_PURPOSE: ["admission", "tuition", "exam", "library", "transport", "other"],
  PAYMENT_RECEIPT_MODE: ["hand", "email", "whatsapp", "none"],
  REFUND_METHOD: ["cash", "bank", "upi", "cheque", "online"],
  REFUND_STATUS: ["approved", "pending", "rejected", "completed"],

  // ============ STATUS ENUMS ============
  ACTIVE_STATUS: ["active", "inactive"],
  ACTIVE_INACTIVE_SUSPENDED: ["active", "inactive", "suspended"],
  DRAFT_ACTIVE: ["draft", "active"],
  DRAFT_ACTIVE_INACTIVE: ["draft", "active", "inactive"],
  PUBLICATION_STATUS: ["draft", "published", "archived"],
  OFFER_STATUS: ["draft", "active", "expired", "paused"],
  CAMPAIGN_STATUS: ["draft", "scheduled", "running", "completed", "paused", "failed"],

  // ============ LEADS & OPPORTUNITIES ============
  LEAD_STATUS: ["new", "contacted", "interested", "follow-up", "negotiation", "converted", "lost"],
  LEAD_PRIORITY: ["low", "medium", "high", "urgent"],
  LEAD_TEMPERATURE: ["cold", "warm", "hot"],
  CALL_TYPE: ["outbound", "inbound", "missed"],
  CALL_OUTCOME: ["interested", "callback", "not-interested", "no-answer", "busy", "wrong-number", "converted"],

  // ============ WHATSAPP & MESSAGING ============
  WHATSAPP_MESSAGE_TYPE: ["text", "image", "document", "audio", "video", "location", "contact"],
  WHATSAPP_MESSAGE_DIRECTION: ["inbound", "outbound"],
  WHATSAPP_MESSAGE_STATUS: ["sent", "delivered", "read", "failed"],
  WHATSAPP_TEMPLATE_CATEGORY: ["marketing", "utility", "authentication"],
  WHATSAPP_TEMPLATE_STATUS: ["approved", "pending", "rejected"],
  WHATSAPP_CONVERSATION_STATUS: ["active", "closed", "archived"],

  // ============ NOTIFICATIONS & EVENTS ============
  WHATSAPP_EVENT_TYPE: ["absence", "payment", "result", "enrollment"],
  WHATSAPP_EVENT_STATUS: ["sent", "failed", "pending"],
  NOTIFICATION_EVENT_TYPE: [
    "welcome",
    "absent",
    "payment-due",
    "payment-received",
    "result-published",
    "enrollment",
    "admission",
    "inquiry",
  ],
  NOTIFICATION_CHANNEL: ["email", "sms", "whatsapp", "push"],
  NOTIFICATION_TRIGGER_TYPE: ["automatic", "manual", "both"],
  NOTIFICATION_PRIORITY: ["low", "medium", "high"],

  // ============ ACADEMICS & EXAMS ============
  STUDY_MATERIAL_TYPE: ["video", "pdf", "document", "notes", "presentation"],
  STUDY_MATERIAL_SUBJECT: [
    "mathematics",
    "science",
    "english",
    "hindi",
    "social-studies",
    "general",
  ],
  VIDEO_QUALITY: ["360p", "480p", "720p", "1080p"],
  MATERIAL_VISIBILITY: ["private", "class-only", "batch-wise", "public"],
  
  QUESTION_TYPE: ["mcq", "short-answer", "essay"],
  QUESTION_DIFFICULTY: ["easy", "medium", "hard"],
  QUESTION_SOURCE: ["manual", "ai-generated"],
  QUESTION_STATUS: ["draft", "published"],

  STUDENT_TEST_ANSWER_STATUS: ["auto-evaluated", "pending-review", "manually-evaluated"],
  EXAM_STATUS: ["pass", "fail", "absent", "pending"],
  EXAM_REGISTRATION_STATUS: [
    "registered",
    "approved",
    "rejected",
    "appeared",
    "resultPublished",
    "enrolled",
  ],
  EXAM_FEE_STATUS: ["pending", "paid", "waived"],
  EXAM_TYPES: ["neet", "jee", "mht-cet"],

  BATCH_STUDENT_STATUS: ["active", "inactive", "completed", "removed"],
  STUDENT_STATUS: ["active", "inactive"],
  COURSE_STATUS: ["active", "inactive"],
  CHAPTER_STATUS: ["active", "inactive"],
  VIDEO_LESSON_STATUS: ["active", "inactive", "draft"],
  MATERIAL_PROGRESS_STATUS: ["not-started", "in-progress", "completed"],

  // ============ SCHOLARSHIPS & AWARDS ============
  SCHOLARSHIP_REWARD_TYPE: ["Merit Scholarship", "Excellence Award", "Participation Certificate", "Other"],
  SCHOLARSHIP_APPROVAL_STATUS: ["pending", "approved", "rejected", "disbursed"],
  SCHOLARSHIP_DISBURSAL_METHOD: ["bank_transfer", "check", "cash", "other"],
  SCHOLARSHIP_RESULT_TYPE: ["pass", "fail"],

  // ============ AUTOMATION & WORKFLOWS ============
  AUTOMATION_WORKFLOW_TYPE: ["admission", "demo", "inquiry", "lead", "custom"],
  WORKFLOW_FIELD_TYPE: ["text", "choice", "multiselect"],
  WORKFLOW_CONVERSATION_STATUS: ["triggered", "in_progress", "completed", "abandoned"],
  AUTOMATION_WORKFLOW_STATUS: ["active", "inactive", "draft"],

  // ============ MARKETING & CAMPAIGNS ============
  MARKETING_CAMPAIGN_TYPE: ["email", "sms", "whatsapp", "push"],
  MARKETING_CAMPAIGN_AUDIENCE: ["all", "segment", "custom"],
  MARKETING_TEMPLATE_TYPE: ["email", "sms", "whatsapp"],
  MARKETING_SUBSCRIBER_STATUS: ["subscribed", "unsubscribed", "bounced", "complained"],
  MARKETING_SUBSCRIBER_SOURCE: ["import", "form", "api", "signup"],
  MARKETING_CAMPAIGN_METRIC: ["sent", "open", "click", "bounce", "complaint", "conversion"],
  MARKETING_DEVICE_TYPE: ["desktop", "mobile", "tablet", "unknown"],
  PAGE_VIEW_DEVICE: ["desktop", "mobile", "tablet", "unknown"],
  PAGE_VIEW_SOURCE: [
    "direct",
    "google",
    "facebook",
    "instagram",
    "linkedin",
    "twitter",
    "email",
    "meta",
    "fb",
    "ig",
    "paid",
    "referral",
    "organic",
    "social",
    "other",
  ],
  PAGE_VIEW_EVENT_TYPE: ["pageview", "click", "form_submit", "video_play", "download", "custom"],

  // ============ EMAIL & SMS ============
  EMAIL_LOG_STATUS: ["sent", "failed", "bounced", "opened", "clicked"],
  EMAIL_TEMPLATE_STATUS: ["draft", "published", "archived"],
  SMS_TEMPLATE_STATUS: ["draft", "published", "archived"],
  EMAIL_LOG_TYPE: [
    "welcome",
    "password-reset",
    "otp",
    "tenant-registration",
    "student-registration",
    "payment-confirmation",
    "subscription",
    "enrollment",
  ],
  MARKETING_SUBSCRIBER_ENGAGEMENT: ["sent", "opened", "clicked", "converted", "bounced"],

  // ============ ANALYTICS & TRACKING ============
  FUNNEL_STAGE_TYPE: ["page_view", "event", "form_submit", "scroll_depth"],
  GOAL_TRACKING_TYPE: ["page_view", "event", "form_submit", "scroll_depth", "time_on_page"],

  // ============ EMPLOYMENT & HR ============
  EMPLOYMENT_TYPE: ["fullTime", "partTime", "contract", "temporary"],
  EMPLOYEE_STATUS: ["active", "inactive", "onLeave", "terminated"],
  SALARY_FREQUENCY: ["monthly", "weekly", "daily", "hourly"],

  // ============ TASKS & WORKFLOWS ============
  TASK_STATUS: ["pending", "completed", "cancelled"],
  DEMO_REQUEST_STATUS: ["pending", "confirmed", "completed", "cancelled"],
  SCHOLARSHIP_EXAM_STATUS: [
    "draft",
    "active",
    "registrationClosed",
    "examCompleted",
    "resultPublished",
    "archived",
  ],

  // ============ SUBSCRIPTION SETUP ============
  PAYMENT_SESSION_CYCLE: ["monthly", "annual"],
  PAYMENT_SESSION_STATUS: ["pending", "completed", "expired", "failed"],
  TENANT_SUBSCRIPTION_STATUS: ["pending", "building", "completed", "failed"],

  // ============ PAYMENT COUNTERS ============
  COUNTER_TYPE: ["receipt", "refund", "invoice"],

  // ============ FACEBOOK & SOCIAL ============
  FACEBOOK_CONNECTION_STATUS: ["connected", "disconnected", "error"],

  // ============ OFFER TYPES ============
  OFFER_DISCOUNT_TYPE: ["percentage", "flat"],
  OFFER_PLAN_APPLICABILITY: ["all_plans", "specific_plans"],
  OFFER_BILLING_CYCLE: ["monthly", "annual"],
};
