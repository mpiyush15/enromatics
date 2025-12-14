/**
 * StudentDTO - Single Source of Truth for Student Data
 * 
 * This interface defines the exact shape of student data across:
 * - Backend API responses
 * - Frontend BFF responses
 * - Frontend component state
 * - Form data handling
 * 
 * FIELD MAPPING:
 * - id, _id → MongoDB _id (student unique identifier)
 * - tenantId → Tenant ownership (multi-tenant safety)
 * - name → Full name
 * - email, phone → Contact info
 * - course → Course name (e.g., "BCA", "B.Tech")
 * - batchId → Batch ObjectId (for updates/relations)
 * - batchName → Batch name (e.g., "2025MA001", for display)
 * - fees → Total fees amount
 * - balance → Fees paid amount
 * - status → "active" or "inactive"
 */

export interface StudentDTO {
  // 🔑 Identifiers
  id?: string;            // Alias for MongoDB _id
  _id?: string;           // MongoDB _id
  tenantId: string;       // Tenant ownership

  // 👤 Personal Info
  name: string;
  email: string;
  phone?: string;
  gender?: "male" | "female" | "other";

  // 📚 Academic Info
  course?: string;

  // 📍 Batch (normalized - always use both for consistency)
  batchId?: string | null;    // Use for updates/relations
  batchName?: string | null;  // Use for display

  // 🎓 Student Identifiers
  rollNumber?: string;
  enrollmentNumber?: string;

  // 💰 Finance
  fees?: number;          // Total fees
  balance?: number;       // Fees paid

  // 📊 Status
  status: "active" | "inactive";

  // 🏠 Address
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;

  // 📅 Timestamps
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Student Form State
 * Used in edit forms - mirrors StudentDTO but with optional fields for partial updates
 */
export interface StudentFormData {
  name?: string;
  email?: string;
  phone?: string;
  gender?: "male" | "female" | "other";
  course?: string;
  batchId?: string;       // Use batchId in forms for updates
  fees?: number;
  status?: "active" | "inactive";
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

/**
 * API Response Shapes
 */
export interface StudentListResponse {
  success: boolean;
  students: StudentDTO[];
  pages?: number;
  quota?: any;
  message?: string;
}

export interface StudentDetailResponse {
  success: boolean;
  student: StudentDTO | null;
  payments?: any[];
  message?: string;
}

export interface StudentMutationResponse {
  success: boolean;
  student?: StudentDTO | null;
  message?: string;
  newPassword?: string;  // For reset-password endpoint
}
