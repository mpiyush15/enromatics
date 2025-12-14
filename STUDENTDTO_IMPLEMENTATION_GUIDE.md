/**
 * StudentDTO IMPLEMENTATION GUIDE
 * 
 * This document maps exactly where StudentDTO should be used to avoid field mismatches
 */

// ============================================================================
// 1️⃣ BFF ROUTE: frontend/app/api/students/route.ts
// ============================================================================

/*
IMPORT AT TOP:
```typescript
import type { StudentDTO, StudentListResponse, StudentDetailResponse, StudentMutationResponse } from '@/types/student';
```

LOCATION 1A: GET endpoint - List response
```typescript
export async function GET(request: NextRequest, { params }: { params: { id?: string } }) {
  // ... code ...
  
  const cleanData: StudentListResponse = {  // ← TYPE THIS
    success: true,
    students: Array.isArray(data.students)
      ? data.students.map((student: any) => cleanStudent(student))
      : undefined,
    pages: data.pages,
    quota: data.quota,
  };
}
```

LOCATION 1B: POST endpoint - Create response
```typescript
export async function POST(request: NextRequest) {
  // ... code ...
  
  const cleanData: StudentMutationResponse = {  // ← TYPE THIS
    success: true,
    student: data.student ? cleanStudent(data.student) : data,
    message: data.message,
  };
}
```

LOCATION 1C: PUT endpoint - Update response
```typescript
export async function PUT(request: NextRequest, { params }: { params: { id?: string } }) {
  // ... code ...
  
  const cleanData: StudentMutationResponse = {  // ← TYPE THIS
    success: true,
    student: data.student ? cleanStudent(data.student) : data,
    message: data.message,
  };
}
```

LOCATION 1D: DELETE endpoint
```typescript
export async function DELETE(request: NextRequest, { params }: { params: { id?: string } }) {
  // ... code ...
  
  return NextResponse.json({
    success: true,
    message: data.message || 'Student deleted',
  });
}
```

LOCATION 1E: cleanStudent() function - CRITICAL FOR FIELD MAPPING
```typescript
function cleanStudent(student: any): StudentDTO {  // ← CHANGE TYPE FROM 'any'
  if (!student) return null;

  return {
    // ✅ ALWAYS include both id and _id
    _id: student._id,
    id: student.id || student._id,
    
    tenantId: student.tenantId,
    name: student.name,
    email: student.email,
    phone: student.phone,
    gender: student.gender,
    course: student.course,
    
    // 🔑 BATCH HANDLING - Use BOTH fields
    batchId: student.batchId,
    batchName: student.batch || student.batchName,  // ← Handle both 'batch' and 'batchName'
    
    rollNumber: student.rollNumber,
    enrollmentNumber: student.enrollmentNumber,
    fees: student.fees,
    balance: student.balance,
    status: student.status,
    address: student.address,
    city: student.city,
    state: student.state,
    pincode: student.pincode,
    createdAt: student.createdAt,
    updatedAt: student.updatedAt,
  };
}
```

// ============================================================================
// 2️⃣ BFF ROUTE: frontend/app/api/students/[id]/route.ts
// ============================================================================

/*
IMPORT AT TOP:
```typescript
import type { StudentDTO, StudentDetailResponse, StudentMutationResponse } from '@/types/student';
```

LOCATION 2A: GET /:id endpoint
```typescript
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // ... code ...
  
  const cleanData: StudentDetailResponse = {  // ← TYPE THIS
    success: true,
    student: data.student ? cleanStudent(data.student) : null,
    payments: data.payments,
  };
}
```

LOCATION 2B: PUT /:id endpoint
```typescript
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  // ... code ...
  
  const cleanData: StudentMutationResponse = {  // ← TYPE THIS
    success: true,
    student: data.student ? cleanStudent(data.student) : data,
    message: data.message,
  };
}
```

LOCATION 2C: DELETE /:id endpoint
```typescript
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  // ... code ...
  
  return NextResponse.json({
    success: true,
    message: data.message || 'Student deleted',
  });
}
```

// ============================================================================
// 3️⃣ FRONTEND PAGE: frontend/app/dashboard/client/[tenantId]/students/page.tsx
// ============================================================================

/*
IMPORT AT TOP:
```typescript
import type { StudentDTO, StudentListResponse } from '@/types/student';

interface StudentFilters {
  batch?: string;
  course?: string;
  rollNumber?: string;
  feesStatus?: string;
}
```

LOCATION 3A: State initialization
```typescript
const [students, setStudents] = useState<StudentDTO[]>([]);  // ← TYPE THIS
const [filters, setFilters] = useState<StudentFilters>({});

// fetchStudents response handling
const fetchStudents = async (page = 1, forceRefresh = false) => {
  const res = await fetch(...);
  const data: StudentListResponse = await res.json();  // ← TYPE THIS
  
  if (res.ok && data.success) {
    setStudents(data.students);  // ← Now type-safe
  }
};
```

LOCATION 3B: Display student fields
```typescript
{students.map((student: StudentDTO) => (  // ← USE TYPE
  <tr key={student._id}>
    <td>{student.name}</td>
    <td>{student.rollNumber}</td>
    <td>{student.batchName}</td>  // ← Use batchName for display
    <td>{student.course}</td>
    <td>₹{student.balance?.toLocaleString()}</td>
  </tr>
))}
```

// ============================================================================
// 4️⃣ FRONTEND PAGE: frontend/app/dashboard/client/[tenantId]/students/add/page.tsx
// ============================================================================

/*
IMPORT AT TOP:
```typescript
import type { StudentDTO, StudentFormData, StudentMutationResponse } from '@/types/student';
```

LOCATION 4A: Form state
```typescript
const [form, setForm] = useState<StudentFormData>({
  name: '',
  email: '',
  phone: '',
  gender: undefined,
  course: '',
  batchId: '',  // ← Use batchId in form (not batchName)
  fees: 0,
  status: 'active',
});
```

LOCATION 4B: Submit handler
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  const res = await fetch('/api/students', {
    method: 'POST',
    body: JSON.stringify(form),  // ← form is StudentFormData
  });
  
  const data: StudentMutationResponse = await res.json();  // ← TYPE THIS
  
  if (data.success && data.student) {
    // Redirect with refresh flag
    router.push(`/dashboard/client/${tenantId}/students?refresh=1`);
  }
};
```

// ============================================================================
// 5️⃣ FRONTEND PAGE: frontend/app/dashboard/client/[tenantId]/students/[studentId]/page.tsx
// ============================================================================

/*
IMPORT AT TOP:
```typescript
import type { StudentDTO, StudentFormData, StudentDetailResponse, StudentMutationResponse } from '@/types/student';
```

LOCATION 5A: State initialization - CRITICAL SECTION
```typescript
const [student, setStudent] = useState<StudentDTO | null>(null);  // ← TYPE THIS
const [form, setForm] = useState<StudentFormData>({});  // ← TYPE THIS

// fetchStudent response handling
const fetchStudent = async () => {
  const res = await fetch(`/api/students/${studentId}`, ...);
  const data: StudentDetailResponse = await res.json();  // ← TYPE THIS
  
  if (res.ok && data.success) {
    setStudent(data.student);  // ← Type-safe
    
    // ✅ FORM INITIALIZATION - MAP FIELDS CORRECTLY
    setForm({
      name: data.student.name || '',
      email: data.student.email || '',
      phone: data.student.phone || '',
      gender: data.student.gender,
      course: data.student.course || '',
      batchId: data.student.batchId || '',  // ← Use batchId for editing
      fees: data.student.fees ?? 0,
      status: data.student.status || 'active',
      address: data.student.address || '',
    });
  }
};
```

LOCATION 5B: Display field mapping
```typescript
// Display student info (non-editing mode)
<p>{student?.name}</p>           // ← Direct field access
<p>{student?.batchName}</p>      // ← Display batchName
<p>{student?.rollNumber}</p>
<p>{student?.course}</p>

// Show batch in dropdown (editing mode)
<select name="batchId" value={form.batchId || ''}>  // ← Use batchId
  {batches.map(batch => (
    <option key={batch._id} value={batch._id}>
      {batch.name}
    </option>
  ))}
</select>
```

LOCATION 5C: Save handler - FIELD MAPPING
```typescript
const handleSave = async () => {
  // ✅ Convert form (StudentFormData) to StudentDTO for backend
  const saveData: Partial<StudentDTO> = {
    name: form.name,
    email: form.email,
    phone: form.phone,
    gender: form.gender,
    course: form.course,
    batchId: form.batchId,  // ← Backend expects batchId
    fees: form.fees,
    status: form.status,
    address: form.address,
  };
  
  const res = await fetch(`/api/students/${studentId}`, {
    method: 'PUT',
    body: JSON.stringify(saveData),
  });
  
  const data: StudentMutationResponse = await res.json();  // ← TYPE THIS
  
  if (data.success && data.student) {
    setStudent(data.student);  // ← Update with typed response
  }
};
```

LOCATION 5D: Password reset handler
```typescript
const handleResetPassword = async () => {
  const res = await fetch(`/api/students/${studentId}/reset-password`, {
    method: 'PUT',
  });
  
  const data: StudentMutationResponse = await res.json();  // ← TYPE THIS
  
  if (data.success && data.newPassword) {
    alert(`New password: ${data.newPassword}`);
  }
};
```

// ============================================================================
// 🎯 KEY FIELD MAPPINGS TO AVOID MISMATCHES
// ============================================================================

/*
CRITICAL FIELD MAPPINGS:

1. BATCH HANDLING (most error-prone)
   ❌ WRONG: form.batch (this is inconsistent)
   ✅ RIGHT: form.batchId (for updates)
   ✅ RIGHT: student.batchName (for display)
   
2. ID HANDLING
   ❌ WRONG: student.id (might be undefined)
   ✅ RIGHT: student._id (MongoDB primary key)
   ✅ RIGHT: student.id || student._id (fallback)
   
3. DISPLAY VS FORM
   Display: use batchName, course, name directly
   Form: use batchId, not batchName
   
4. RESPONSE MAPPING
   Backend returns: batch (name string) OR batchName
   cleanStudent() normalizes to: batchName (for consistency)
   Form stores: batchId (for updates)

*/
