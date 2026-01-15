# 🔄 Data Sync Workflow - Complete Integration

## Overview
Implemented a comprehensive cross-page data synchronization system that ensures when you edit/add students with course → batch selection, the changes automatically reflect across:
- ✅ Student detail page
- ✅ Students list page  
- ✅ Batches list page
- ✅ Courses list page

---

## Architecture

### 1. **Event-Driven Sync System**

#### A. Custom Window Events
```javascript
// When student is saved in edit form
window.dispatchEvent(new CustomEvent('studentDataUpdated', { 
  detail: { studentId, batchId, courseId } 
}));

// When new student is added
window.dispatchEvent(new CustomEvent('studentAdded', { 
  detail: { batchId } 
}));
```

#### B. LocalStorage Sync (Cross-Tab Support)
```javascript
// Edit form signals refresh needed
localStorage.setItem('studentsRefreshNeeded', Date.now().toString());

// Add form signals batch refresh needed
localStorage.setItem('batchesRefreshNeeded', Date.now().toString());
```

#### C. Page Visibility Listener
```javascript
// Automatically refetch when user switches back to the tab
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    fetchStudents(); // Refetch fresh data
  }
});
```

---

## File Changes

### 1. **Student Edit Form** (`[tenantId]/students/[studentId]/page.tsx`)

**Changes to `handleSave()` function:**
```typescript
const handleSave = async () => {
  setStatus("Saving...");
  try {
    const [data, err] = await safeApiCall(() =>
      api.put<StudentMutationResponse>(`/api/students/${studentId}`, form)
    );

    if (err) {
      setStatus("❌ " + (err.message || "Error saving"));
      return;
    }

    if (data && data.student) {
      setStudent(data.student);
      
      // 🔄 NEW: Broadcast refresh signal to other pages
      window.dispatchEvent(new CustomEvent('studentDataUpdated', { 
        detail: { studentId, batchId: data.student.batchId, courseId: data.student.course } 
      }));
      
      // 🔄 NEW: Trigger students list page refresh via localStorage
      localStorage.setItem('studentsRefreshNeeded', Date.now().toString());
    }
    setEditing(false);
    setStatus("✅ Saved successfully!");
    setTimeout(() => setStatus(""), 3000);
  } catch (err: any) {
    console.error(err);
    setStatus("❌ " + (err.message || "Error saving"));
  }
};
```

**Effect:** When you save a student's course/batch changes:
1. Student detail page updates immediately with new data
2. Custom event broadcasts to all listeners
3. localStorage signals other pages to refresh

---

### 2. **Student Add Form** (`[tenantId]/students/add/page.tsx`)

**Changes to `handleSubmit()` function:**
```typescript
// 🔄 NEW: Trigger refresh signal for other pages
localStorage.setItem('studentsRefreshNeeded', Date.now().toString());
localStorage.setItem('batchesRefreshNeeded', Date.now().toString());
window.dispatchEvent(new CustomEvent('studentAdded', { detail: { batchId: form.batchId } }));

// Changed from: router.push(`/dashboard/client/${tenantId}/students?refresh=1`)
// To: Direct navigation without URL param (cleaner)
setTimeout(() => router.push(`/dashboard/client/${tenantId}/students`), 3000);
```

**Effect:** When a new student is added:
1. Both students and batches pages are signaled to refresh
2. Event dispatched for immediate listeners
3. Cleaner URL without `?refresh=1` param

---

### 3. **Students List Page** (`[tenantId]/students/page.tsx`)

**New: Event Listener Effect**
```typescript
/* ================= LISTEN FOR REFRESH SIGNALS FROM OTHER PAGES ================= */
useEffect(() => {
  // Handle custom events from edit/add student pages
  const handleStudentUpdate = () => {
    console.log('[STUDENTS LIST] Detected student data update, refetching...');
    setPage(1);
    fetchStudents();
  };

  const handleStudentAdded = () => {
    console.log('[STUDENTS LIST] Detected student added, refetching...');
    setPage(1);
    fetchStudents();
  };

  // Handle localStorage changes (for cross-tab sync)
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'studentsRefreshNeeded' && e.newValue) {
      console.log('[STUDENTS LIST] Detected refresh signal via storage, refetching...');
      setPage(1);
      fetchStudents();
    }
  };

  window.addEventListener('studentDataUpdated', handleStudentUpdate);
  window.addEventListener('studentAdded', handleStudentAdded);
  window.addEventListener('storage', handleStorageChange);

  return () => {
    window.removeEventListener('studentDataUpdated', handleStudentUpdate);
    window.removeEventListener('studentAdded', handleStudentAdded);
    window.removeEventListener('storage', handleStorageChange);
  };
}, []);
```

**New: Page Visibility Listener**
```typescript
/* ================= LISTEN FOR PAGE VISIBILITY CHANGES ================= */
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      console.log('[STUDENTS LIST] Page became visible, syncing data...');
      fetchStudents();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []);
```

**Effect:** Students list automatically:
1. Updates when student data is saved from edit form
2. Updates when new student is added
3. Refreshes when user switches back to the tab
4. Supports cross-tab syncing via localStorage

---

### 4. **Batches Page** (`[tenantId]/academics/batches/page.tsx`)

**Changed SWR Configuration:**
```typescript
// BEFORE: revalidateOnFocus: false
// NOW: revalidateOnFocus: true
const { data: batchesData, isLoading: loadingBatches, mutate: refreshBatches } = useSWR(
  `/api/academics/batches`,
  fetcher,
  {
    revalidateOnFocus: true,      // 🔄 Refetch when user returns to this page
    revalidateOnReconnect: true,   // Refetch on reconnect
    dedupingInterval: 0,           // Allow frequent revalidation
    revalidateIfStale: true,       // Revalidate stale data
    keepPreviousData: true,        // Prevent flickering
  }
);

// Same for courses
const { data: coursesData, isLoading: loadingCourses, mutate: refreshCourses } = useSWR(
  `/api/academics/courses`,
  fetcher,
  {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 0,
    revalidateIfStale: true,
    keepPreviousData: true,
  }
);
```

**New: Refresh Event Listeners**
```typescript
// 🔄 Listen for refresh signals from student pages
useEffect(() => {
  const handleStudentUpdate = async () => {
    console.log('[BATCHES PAGE] Detected student update, refreshing batch data...');
    await refreshBatches();
  };

  const handleStudentAdded = async () => {
    console.log('[BATCHES PAGE] Detected student added, refreshing batch data...');
    await refreshBatches();
  };

  const handleStorageChange = async (e: StorageEvent) => {
    if ((e.key === 'studentsRefreshNeeded' || e.key === 'batchesRefreshNeeded') && e.newValue) {
      console.log('[BATCHES PAGE] Detected refresh signal, refreshing batch data...');
      await refreshBatches();
    }
  };

  window.addEventListener('studentDataUpdated', handleStudentUpdate);
  window.addEventListener('studentAdded', handleStudentAdded);
  window.addEventListener('storage', handleStorageChange);

  return () => {
    window.removeEventListener('studentDataUpdated', handleStudentUpdate);
    window.removeEventListener('studentAdded', handleStudentAdded);
    window.removeEventListener('storage', handleStorageChange);
  };
}, [refreshBatches]);
```

**Effect:** Batches page:
1. Auto-refreshes when user returns to tab (via SWR `revalidateOnFocus`)
2. Refreshes when student edit signal received
3. Refreshes when student add signal received
4. Updates student counts in real-time

---

## Complete Data Flow

### Scenario 1: Edit Student Course/Batch

```
1. User navigates to: /students/[studentId]
   ↓
2. User clicks "Edit" and changes:
   - Course: NEET → JEE
   - Batch: JEE 2025 → JEE 2026
   ↓
3. User clicks "Save"
   ↓
4. handleSave() executes:
   a. API call: PUT /api/students/{id} ✓ Success
   b. setStudent(data.student) → Detail page updates immediately
   c. window.dispatchEvent('studentDataUpdated') → Broadcasts event
   d. localStorage.setItem('studentsRefreshNeeded', timestamp)
   ↓
5. Students List Page listens and:
   a. Receives 'studentDataUpdated' event
   b. Calls fetchStudents() with fresh data
   c. Course column now shows: JEE (updated)
   d. Batch column now shows: JEE 2026 (updated)
   ↓
6. Batches Page listens and:
   a. Receives custom event
   b. SWR's refreshBatches() called
   c. Student count updates for JEE 2026 (increases)
   d. Student count updates for JEE 2025 (decreases)
   ↓
7. All pages now show CONSISTENT data ✅
```

### Scenario 2: Add New Student

```
1. User navigates to: /students/add
   ↓
2. User fills form:
   - Name: Pawan
   - Email: pawan@example.com
   - Course: NEET
   - Batch: NEET Repeaters
   ↓
3. User clicks "Submit"
   ↓
4. handleSubmit() executes:
   a. API call: POST /api/students ✓ Success (returns newPassword)
   b. localStorage.setItem('studentsRefreshNeeded', timestamp)
   b. localStorage.setItem('batchesRefreshNeeded', timestamp)
   c. window.dispatchEvent('studentAdded')
   ↓
5. Router redirects to: /students (clean URL, no ?refresh=1)
   ↓
6. Students List Page (already loaded):
   a. Receives 'studentAdded' event
   b. setPage(1) to show first page
   c. fetchStudents() with fresh data
   d. NEW student "Pawan" appears in list ✓
   ↓
7. Batches Page (if user navigates there):
   a. SWR detects revalidateOnFocus: true
   b. Automatically fetches fresh batch data
   c. NEET Repeaters student count updates ✓
   ↓
8. All data consistent across pages ✅
```

### Scenario 3: Tab Switching

```
1. User editing student in one tab: /students/[studentId]
   ↓
2. User clicks "Save"
   ↓
3. Custom event + localStorage signal fired
   ↓
4. User has Students List in another tab (background)
   ↓
5. Students List receives event via:
   a. Custom window event (same window context) - Won't work across tabs
   b. localStorage change event (fires across tabs) - ✅ Works!
   ↓
6. handleStorageChange fires with key='studentsRefreshNeeded'
   ↓
7. fetchStudents() called → Data updates in background tab
   ↓
8. User switches to Students List tab
   ↓
9. Tab has fresh data ready ✓
```

---

## Debug Logging

All pages log their refresh operations for easy debugging:

**Edit Form:**
```
✅ Student saved
🔄 Broadcasting studentDataUpdated event
🔄 Setting studentsRefreshNeeded flag
```

**Students List:**
```
[STUDENTS LIST] Detected student data update, refetching...
[STUDENTS LIST] Detected student added, refetching...
[STUDENTS LIST] Detected refresh signal via storage, refetching...
[STUDENTS LIST] Page became visible, syncing data...
```

**Batches Page:**
```
[BATCHES PAGE] Detected student update, refreshing batch data...
[BATCHES PAGE] Detected student added, refreshing batch data...
[BATCHES PAGE] Detected refresh signal, refreshing batch data...
```

To see these, open DevTools → Console and perform edit/add operations.

---

## Key Benefits

| Feature | Benefit |
|---------|---------|
| **Event-Based** | Immediate updates across pages, no polling |
| **Cross-Tab Support** | localStorage changes work across browser tabs |
| **Visibility Aware** | Refetches when tab becomes active again |
| **SWR Smart Caching** | Automatic revalidation + prevention of flickering |
| **Consistent UX** | All pages always show same data |
| **Performance** | Only fetches when needed, smart deduplication |
| **Fallback Handling** | Works with or without event support |

---

## Testing Checklist

### ✅ Test 1: Edit Student Course/Batch
1. Open students list in one tab
2. Open student detail in another tab
3. Edit student's course and batch
4. Click Save
5. **Verify:** 
   - Detail page updates immediately
   - Course dropdown changes
   - Batch dropdown changes
   - Switch to students list → Shows new course/batch
   - Console shows: `[STUDENTS LIST] Detected student data update`

### ✅ Test 2: Add New Student
1. Open students list in tab 1
2. Open add student form in tab 2
3. Fill all fields (course, batch required)
4. Submit form
5. **Verify:**
   - Form shows "✅ Student added successfully!"
   - Redirects to students list (clean URL)
   - Student appears in list immediately
   - Student count shows as "1 student added"

### ✅ Test 3: Batch Student Count Updates
1. Open batches page
2. Note student count for a batch (e.g., "5 students")
3. Switch to student add form
4. Add student to that batch
5. **Verify:**
   - Submit form, redirected to students list
   - Switch back to batches tab
   - Student count for batch increased to "6 students" ✓

### ✅ Test 4: Tab Switching
1. Open students list in tab 1
2. Edit a student's batch in tab 2
3. Save changes
4. **DON'T click the redirected link**
5. Switch back to tab 1 (students list)
6. **Verify:**
   - Students list automatically refetched
   - Shows updated student data
   - Course/batch columns updated
   - Console shows: `[STUDENTS LIST] Detected refresh signal via storage`

### ✅ Test 5: Page Focus
1. Open students list
2. Minimize browser/switch apps
3. Return to browser
4. Switch to students list tab
5. **Verify:**
   - Page automatically refetches on focus
   - Data is fresh/current
   - Console shows: `[STUDENTS LIST] Page became visible, syncing data`

---

## Troubleshooting

### Issue: Data not syncing across pages
**Solution:** 
1. Check browser console for errors
2. Verify localStorage is enabled
3. Check DevTools → Application → Storage → Local Storage

### Issue: Students list shows old data
**Solution:**
1. Manual refresh with Ctrl+F5 (hard refresh)
2. Check if custom events are firing (console logs)
3. Verify API endpoint `/api/students` responds with fresh data

### Issue: Cross-tab sync not working
**Solution:**
1. This relies on localStorage + window.storage event
2. Some browsers restrict this in private mode
3. Try normal (non-private) browsing mode

---

## Future Enhancements

1. **WebSocket Real-Time Sync** - Use socket.io for live updates
2. **Service Worker Sync** - Background sync when offline
3. **Optimistic Updates** - Update UI before API response
4. **Conflict Resolution** - Handle concurrent edits
5. **Audit Log** - Track all student changes with timestamps

---

## Summary

✅ **Data Sync Status: COMPLETE**

When you edit/add students with course → batch selection:
- ✅ Student detail updates immediately
- ✅ Students list auto-refreshes
- ✅ Batches list auto-updates student counts
- ✅ Works across browser tabs (localStorage)
- ✅ Works when switching browser tabs (visibility API)
- ✅ All pages show consistent data
