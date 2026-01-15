# 🧪 Data Sync Testing Protocol

## Test Environment
- **Frontend:** http://localhost:3001
- **Date:** January 15, 2026
- **Focus:** Student List ↔ Batches List Synchronization

---

## Test Case 1: Edit Student Course/Batch → Verify Both Pages Sync

### Steps:
1. **Open Browser to:** http://localhost:3001/dashboard/client/[tenantId]/students
   - Look for tenant ID in URL or sidebar
   - Note: You may see list of students

2. **In Students List Page:**
   - Find any student (e.g., "Pawan Pinkarkar")
   - Note their current: Course, Batch
   - Open DevTools → Console (Ctrl+Shift+I or Cmd+Option+I)
   - Look for any `[STUDENTS LIST]` messages

3. **Click on Student Name or Edit:**
   - Navigate to student detail page: `/students/[studentId]`
   - OR use the edit action from the table

4. **In Student Edit Page:**
   - Click "Edit" button (top right)
   - Change Course dropdown (pick a different course)
   - Change Batch dropdown (batch will auto-filter by course)
   - Click "Save"

5. **Verify:**
   - ✅ Detail page shows new course/batch immediately
   - ✅ See message: "✅ Saved successfully!"
   - ✅ DevTools Console shows: `[STUDENTS LIST] Detected student data update`

6. **Switch Back to Students List Tab:**
   - Click on students list tab (or navigate back)
   - **Verify:** Student row now shows:
     - ✅ New Course value (in course column)
     - ✅ New Batch value (in batch column)
   - **Expected:** Data updates within 100-200ms

7. **Navigate to Batches Page:**
   - Go to: `http://localhost:3001/dashboard/client/[tenantId]/academics/batches`
   - Find the old batch and new batch from step 4
   - **Verify:**
     - ✅ Old batch: Student count decreased
     - ✅ New batch: Student count increased
   - DevTools Console should show: `[BATCHES PAGE] Detected student update`

---

## Test Case 2: Add New Student → Verify Sync

### Steps:
1. **Navigate to Add Student Form:**
   - URL: `http://localhost:3001/dashboard/client/[tenantId]/students/add`

2. **Fill Form (Step-by-step):**
   - Step 1: Personal Information
     - Name: "Test Student Sync"
     - Email: "test.sync@example.com"
     - Phone: "9876543210"
     - Click Next
   
   - Step 2: Guardian Details
     - Father/Mother name (any value)
     - Click Next
   
   - Step 3: Academic Information
     - **Course:** Select any course (note the name)
     - **Batch:** Should auto-filter to show only that course's batches
     - Select a batch (note the name)
     - Fees: Enter any amount (e.g., 5000)
     - Click Next
   
   - Step 4: Review & Submit
     - Verify all details
     - Click "Submit"

3. **Verify:**
   - ✅ Form shows: "✅ Student added successfully!"
   - ✅ Auto-redirects to students list
   - ✅ DevTools Console shows: `[STUDENTS LIST] Detected student added`

4. **Check Students List:**
   - **Verify:** New student "Test Student Sync" appears in list
   - Course shows correct value
   - Batch shows correct value

5. **Navigate to Batches:**
   - Go to batches page
   - Find the batch you selected in step 2
   - **Verify:** Student count increased by 1
   - DevTools Console should show: `[BATCHES PAGE] Detected student update`

---

## Test Case 3: Cross-Tab Sync Test

### Setup:
- Have 2 browser windows/tabs visible side-by-side
- Tab 1: Student Detail page (ready to edit)
- Tab 2: Students List page (ready to verify)

### Steps:
1. **In Tab 1 (Student Detail):**
   - Click "Edit"
   - Change Course and/or Batch
   - Click "Save"
   - **DO NOT navigate away**

2. **In Tab 2 (Students List):**
   - **WITHOUT refreshing manually**
   - **Verify:** Data updates automatically within 100-200ms
   - Student row now shows new Course/Batch
   - DevTools Console shows: `[STUDENTS LIST] Detected refresh signal via storage`

3. **Navigation to Batches Tab:**
   - Tab 2: Switch from students to batches page
   - **Verify:** Batch data is current, no stale cache
   - Student count reflects changes from Tab 1

---

## Test Case 4: Tab Focus Auto-Sync Test

### Steps:
1. **Open Students List:**
   - Keep it in a tab but switch away

2. **Edit Student:**
   - In another window/tab: Edit a student's course/batch
   - Save changes
   - Wait 2-3 seconds

3. **Return to Students List Tab:**
   - Click on the students list tab
   - **Verify:** Page auto-refreshes (you may see brief spinner)
   - Data is fresh and current
   - DevTools Console shows: `[STUDENTS LIST] Page became visible, syncing data`

---

## Console Logging Reference

### Expected Console Messages

**When Editing Student:**
```
[STUDENTS LIST] Detected student data update, refetching...
[BATCHES PAGE] Detected student update, refreshing batch data...
```

**When Adding Student:**
```
[STUDENTS LIST] Detected student added, refetching...
[BATCHES PAGE] Detected student added, refreshing batch data...
```

**When Tab Becomes Visible:**
```
[STUDENTS LIST] Page became visible, syncing data...
```

**Storage Changes (Cross-Tab):**
```
[STUDENTS LIST] Detected refresh signal via storage, refetching...
[BATCHES PAGE] Detected refresh signal, refreshing batch data...
```

### How to Check Logs:
1. Open DevTools: Ctrl+Shift+I (Windows) or Cmd+Option+I (Mac)
2. Click "Console" tab
3. Filter for: `[STUDENTS LIST]` or `[BATCHES PAGE]`
4. Should see messages appear in real-time during edits

---

## Verification Checklist

### ✅ Core Sync Features
- [ ] Student detail updates immediately on save
- [ ] Students list updates within 100-200ms
- [ ] Batches page updates student counts
- [ ] Works when pages in same tab
- [ ] Works when pages in different tabs
- [ ] Works when tabs in background (storage events)
- [ ] Auto-refreshes on tab focus
- [ ] Console logs appear as expected

### ✅ Data Integrity
- [ ] Edited student shows correct new course
- [ ] Edited student shows correct new batch
- [ ] Old batch count decreased
- [ ] New batch count increased
- [ ] No data corruption or duplication
- [ ] Multiple student edits work correctly
- [ ] Added student visible in list immediately
- [ ] Added student count correct in batches

### ✅ UI/UX
- [ ] No errors in console
- [ ] No "Failed to fetch" messages
- [ ] Smooth transitions (no flickering)
- [ ] Status messages clear and helpful
- [ ] Page doesn't break or freeze
- [ ] Dropdowns filter correctly (course → batch)

### ✅ Performance
- [ ] Updates happen quickly (< 200ms)
- [ ] No excessive API calls
- [ ] No lag or slowdown
- [ ] Page remains responsive
- [ ] No memory leaks
- [ ] Efficient event handling

---

## Troubleshooting

### Issue: Data not updating in list
**Solution:**
1. Check browser console for errors
2. Verify `[STUDENTS LIST]` messages appear
3. Hard refresh (Ctrl+F5)
4. Check localStorage enabled (DevTools → Application → Storage)

### Issue: Batch counts incorrect
**Solution:**
1. Go to batches page and hard refresh
2. Check if student's previous batch was correctly updated
3. Verify backend BatchStudent collection sync

### Issue: Cross-tab sync not working
**Solution:**
1. Check if localStorage is enabled
2. Try in non-private/incognito mode
3. Check browser console for storage errors
4. Verify tabs are in same origin (same domain)

### Issue: Console messages not appearing
**Solution:**
1. Verify console is open before editing
2. Check Filter field - may be filtering messages
3. Scroll up in console (messages may be above fold)
4. Hard refresh and try again

---

## Success Criteria

✅ **Test passes if:**
1. All 4 test cases complete without errors
2. All console messages appear as expected
3. All data updates within expected timeframes
4. No errors in DevTools console
5. UI remains responsive throughout
6. Data consistency maintained across all pages

✅ **Test fails if:**
1. Any page shows stale data
2. Manual refresh needed to see updates
3. Error messages in console
4. Inconsistent student counts
5. Pages don't sync across tabs
6. Performance is slow (> 500ms updates)

---

## Test Report Template

```
TEST DATE: _____________
TESTER: _________________
BROWSER: _________________

TEST 1: Edit Student → Both Pages Sync
Result: PASS / FAIL
Details: _____________

TEST 2: Add Student → Auto-Refresh
Result: PASS / FAIL
Details: _____________

TEST 3: Cross-Tab Sync
Result: PASS / FAIL
Details: _____________

TEST 4: Tab Focus Auto-Sync
Result: PASS / FAIL
Details: _____________

OVERALL RESULT: ✅ PASS / ❌ FAIL

Issues Found:
1. ___________
2. ___________

Notes:
_________________
```

---

## Quick Start Commands

```bash
# Start frontend dev server
cd frontend && npm run dev

# Open browser
open http://localhost:3001

# Start backend (if needed)
cd backend && npm start

# Clear browser cache (if issues)
# Chrome: Ctrl+Shift+Delete → Select "All time" → Clear

# View logs
# DevTools → Console tab → Filter by "[STUDENTS LIST]" or "[BATCHES PAGE]"
```

---

**Ready to test! Follow the test cases above and verify all syncs work correctly. 🚀**
