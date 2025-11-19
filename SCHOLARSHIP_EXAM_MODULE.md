# 🎓 Scholarship Entrance Exam Module - Complete Documentation

## Overview
A comprehensive module for coaching institutes to manage scholarship entrance exams, track registrations, publish results, and convert leads to admissions.

---

## 📋 Complete Flow

### 1. **Admin Creates Exam**
- Admin goes to: `Dashboard → Scholarship Exams → Create Exam`
- Fills exam details:
  - Exam Name, Duration, Total Marks, Passing Marks
  - Registration dates, Exam date, Result date
  - Venue, Exam mode (Online/Offline/Hybrid)
  - Eligibility criteria (age, class, qualification)
  - Registration fee (if applicable)
- Customizes landing page:
  - Hero title & subtitle
  - About exam section
  - Syllabus information
  - Important dates
  - Brand colors
- Defines rewards/scholarships:
  - Rank-wise rewards (1st, 2-5, 6-10, etc.)
  - Reward types (100% scholarship, 50% discount, certificates)
- **System auto-generates:**
  - Unique Exam Code (e.g., `EXAM240001`)
  - Landing Page URL: `your-domain.com/exam/EXAM240001`
  - Shareable registration link

### 2. **Landing Page & Registration**
**Public URL**: `/exam/{EXAM_CODE}`

**Landing Page Features:**
- Hero section with exam highlights
- About the exam
- Syllabus & exam pattern
- Important dates timeline
- Rewards/scholarship structure
- **"Register Now" button** → Registration form

**Registration Form (Public - No Login Required):**
- Personal Information:
  - Full Name, Email, Phone
  - Date of Birth, Gender
  - Father's Name, Mother's Name
  - Parent Contact (phone, email)
- Address Details
- Academic Information:
  - Current Class/Standard
  - School Name
  - Previous Year Marks
  - Qualification
- Documents Upload:
  - Photo (optional)
  - Aadhar (optional)
  - Previous marksheets
- Create Login:
  - **Email becomes username**
  - **Auto-generated temporary password**
  - Student can change later
- Terms & Conditions acceptance
- WhatsApp updates consent

**On Successful Registration:**
- Auto-generated Registration Number (e.g., `EXAM240001-00001`)
- Email sent with:
  - Registration confirmation
  - Login credentials (username + temp password)
  - Exam details (date, time, venue)
  - Student portal link: `/exam-portal/login`
- Becomes a **Lead** in admin dashboard

### 3. **Admin - Leads Dashboard**
**Path**: `Dashboard → Scholarship Exams → Registrations`

**Features:**
- View all registrations for each exam
- Filter by:
  - Status (registered, approved, rejected, appeared)
  - Enrollment status (not interested, interested, enrolled, converted)
  - Result (pass, fail, absent, pending)
  - Search (name, email, phone, registration number)
- See student details:
  - Personal info, academic details
  - Documents uploaded
  - Payment status
  - Enrollment interest
- **Action Buttons:**
  - ✏️ Edit registration details
  - 📝 Add admin notes
  - ✅ Approve/Reject
  - 🎯 Convert to Admission (direct enrollment)

### 4. **Mark Attendance & Results**
**Path**: `Dashboard → Scholarship Exams → Results`

**Attendance Marking:**
- Mark students as "Appeared" or "Absent"
- Bulk attendance upload (CSV)

**Results Entry:**
- Enter marks for each student
- System auto-calculates:
  - Percentage
  - Rank (sorted by marks)
  - Pass/Fail status
  - Reward eligibility (based on rank & defined rewards)
- Bulk upload via CSV

**Publish Results:**
- Click "Publish Results" button
- Sets status to "Result Published"
- Students can now view results in their portal

### 5. **Student Portal**
**Login URL**: `/exam-portal/login`
**Credentials**: Email + password (from registration email)

**Student Dashboard:**
- **Exam Details**:
  - Registration number
  - Exam date, time, venue
  - Status (registered, appeared, result published)
- **Results Section** (after publication):
  - Marks obtained / Total marks
  - Percentage
  - Rank
  - Result (Pass/Fail)
  - **Reward/Scholarship** (if eligible):
    - Reward type (scholarship/discount)
    - Reward value (100%, 50%, amount)
    - Description
- **Enrollment Section**:
  - **"Enroll Now" Button** → Express enrollment interest
  - View available batches
  - See fee structure (with scholarship discount applied)
  - Submit enrollment request
  - Track enrollment status

**After Clicking "Enroll Now":**
- Enrollment status changes to "Interested"
- Admin gets notification in dashboard
- Student can see "Enrollment Pending - Admin will contact you"

### 6. **Admin - Conversion to Admission**
**Two Ways to Convert:**

**Method 1: Student Initiated (from Enroll Now)**
- Admin sees enrollment request
- Reviews student details
- Clicks "Convert to Admission" button
- Selects:
  - Batch to assign
  - Course
  - Fee amount (with scholarship discount pre-applied)
- Confirms conversion

**Method 2: Admin Initiated (direct)**
- Admin opens student registration
- Clicks "Convert to Admission" button (even if student didn't click Enroll Now)
- Same process as above

**Conversion Process:**
- Creates **Student** record in students database
- Assigns to selected batch
- Sets up fee structure
- Updates registration status to "Converted"
- Marks enrollment status as "Enrolled"
- Links registration to student ID
- Student gets email notification
- Can now access full student portal

---

## 🗂️ Database Structure

### ScholarshipExam Model
```javascript
{
  examName, examCode, description,
  registrationStartDate, registrationEndDate,
  examDate, resultDate,
  examDuration, totalMarks, passingMarks,
  examMode (online/offline/hybrid),
  venue, eligibilityCriteria,
  formFields (customizable),
  rewards (rank-wise structure),
  registrationFee,
  landingPage (customization),
  status (draft/active/registrationClosed/examCompleted/resultPublished),
  stats (registrations, appeared, passed, enrolled)
}
```

### ExamRegistration Model
```javascript
{
  registrationNumber, examId, tenantId,
  studentName, email, phone, dateOfBirth, gender,
  fatherName, motherName, parentPhone, parentEmail,
  address, currentClass, school, previousMarks,
  photoUrl, documents,
  userId (for portal login), username,
  hasAttended, marksObtained, percentage, rank,
  result (pass/fail/absent/pending),
  rewardEligible, rewardDetails,
  enrollmentStatus (notInterested/interested/enrolled/converted),
  convertedToStudent, studentId,
  paymentStatus, status, remarks, adminNotes
}
```

---

## 🔐 Roles & Permissions

### TenantAdmin
- Create/edit/delete exams
- View all registrations
- Enter results
- Publish results
- Convert to admissions
- Full access

### Counsellor
- View exams
- View registrations
- Mark attendance
- View results
- Assist with enrollments
- Cannot create/delete exams

### Student
- Register for exams (public - no role needed)
- Access student portal
- View results
- Click "Enroll Now"
- Track enrollment status

---

## 📊 Statistics & Reports

**Exam Statistics:**
- Total registrations
- Students appeared
- Pass percentage
- Average marks
- Rank-wise distribution
- Enrollment conversion rate
- Revenue from registrations

**Lead Reports:**
- Source tracking (all from exam registration)
- Conversion funnel:
  - Registered → Appeared → Passed → Enrolled → Converted
- Time to conversion
- Scholarship/discount impact

---

## 🔗 URL Structure

### Public URLs (no auth)
- Landing Page: `/exam/{EXAM_CODE}`
- Registration: `/exam/{EXAM_CODE}/register`

### Student Portal
- Login: `/exam-portal/login`
- Dashboard: `/exam-portal/dashboard`
- Results: `/exam-portal/results`
- Enrollment: `/exam-portal/enrollment`

### Admin Dashboard
- All Exams: `/dashboard/client/{tenantId}/scholarship-exams`
- Create Exam: `/dashboard/client/{tenantId}/scholarship-exams/create`
- Edit Exam: `/dashboard/client/{tenantId}/scholarship-exams/{examId}/edit`
- Registrations: `/dashboard/client/{tenantId}/scholarship-exams/{examId}/registrations`
- Results: `/dashboard/client/{tenantId}/scholarship-exams/{examId}/results`

---

## 🚀 Usage Example

### Scenario: "ABC Coaching Institute Entrance Test 2024"

1. **Admin Creates Exam:**
   - Name: "ABC Scholarship Test 2024"
   - Code: AUTO → `EXAM240001`
   - Registration: Dec 1 - Dec 15, 2024
   - Exam Date: Dec 20, 2024
   - Rewards:
     - Rank 1: 100% scholarship
     - Rank 2-5: 50% scholarship
     - Rank 6-10: 25% discount
   - Landing URL: `abc-coaching.com/exam/EXAM240001`

2. **Marketing:**
   - Share URL on social media, WhatsApp, website
   - Students visit and see beautiful landing page
   - Click "Register Now"

3. **Student Registers:**
   - Rahul Kumar fills form
   - Gets Registration No: `EXAM240001-00001`
   - Receives email:
     - Username: rahul.kumar@email.com
     - Password: rahul@2024
     - Portal: abc-coaching.com/exam-portal/login

4. **Exam Day:**
   - Admin marks attendance
   - Rahul appears for exam

5. **Results:**
   - Admin enters marks: Rahul scored 85/100
   - System calculates: Rank 3, 85%
   - Reward: 50% scholarship eligible
   - Admin publishes results

6. **Rahul Checks Results:**
   - Logs into portal
   - Sees: "Congratulations! Rank 3, 85%, 50% scholarship"
   - Clicks "Enroll Now"
   - Selects batch, sees fee: ₹20,000 → ₹10,000 (with scholarship)
   - Submits enrollment request

7. **Admin Converts:**
   - Sees Rahul's enrollment request
   - Clicks "Convert to Admission"
   - Assigns to "JEE Batch 2024"
   - Confirms fee: ₹10,000
   - Rahul is now a student!

---

## 📈 Success Metrics

- **Registration Rate**: How many students register
- **Appearance Rate**: % who actually appear
- **Pass Rate**: % who pass the exam
- **Enrollment Rate**: % who click "Enroll Now"
- **Conversion Rate**: % converted to admissions
- **Revenue Impact**: Scholarship vs. actual enrollment

---

## 🔮 Future Enhancements

1. **Online Exam Module**: Conduct exams online with proctoring
2. **Payment Gateway**: Collect registration fees online
3. **SMS Notifications**: Auto-SMS for registration, results, enrollment
4. **Admit Card Generation**: Auto-generate and email admit cards
5. **Bulk Operations**: Bulk result upload, bulk email sending
6. **Analytics Dashboard**: Advanced reports & charts
7. **Mobile App**: Student mobile app for results & enrollment

---

## 📞 Support & Help

For any issues or questions:
1. Check this documentation
2. Contact system admin
3. Email support team

---

**Version**: 1.0  
**Last Updated**: November 2025  
**Status**: Backend Complete ✅ | Frontend In Progress 🚧
