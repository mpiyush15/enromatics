// Sample scholarship exams for Utkarsh Education
// Run this script to create scholarship exams for testing

const sampleUtkarshExams = [
  {
    tenantId: 'utkarsh_education_2024',
    examName: 'Utkarsh JEE Foundation Scholarship 2024',
    examCode: 'UJFS-2024',
    description: 'Merit-based scholarship for JEE Foundation students. Get up to 90% fee waiver based on your performance.',
    examType: 'scholarship',
    category: 'JEE Foundation',
    totalMarks: 300,
    passingMarks: 180,
    duration: 180, // 3 hours
    examDate: new Date('2024-12-15T09:00:00Z'),
    registrationStartDate: new Date('2024-11-15T00:00:00Z'),
    registrationEndDate: new Date('2024-12-10T23:59:59Z'),
    examFee: 0,
    registrationFee: 0,
    status: 'active',
    isPublic: true,
    scholarshipDetails: {
      totalScholarships: 100,
      scholarshipAmounts: [
        { rank: '1-5', percentage: 90, amount: 45000 },
        { rank: '6-20', percentage: 75, amount: 37500 },
        { rank: '21-50', percentage: 50, amount: 25000 },
        { rank: '51-100', percentage: 25, amount: 12500 }
      ]
    },
    eligibleClasses: ['9th', '10th', '11th'],
    minimumPercentage: 60,
    ageLimit: { min: 13, max: 18 },
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    createdBy: 'system',
    lastUpdatedBy: 'system'
  },
  {
    tenantId: 'utkarsh_education_2024',
    examName: 'Utkarsh NEET Foundation Scholarship 2024',
    examCode: 'UNFS-2024',
    description: 'Merit-based scholarship for NEET Foundation students. Excellence in Biology, Physics, and Chemistry.',
    examType: 'scholarship',
    category: 'NEET Foundation',
    totalMarks: 360,
    passingMarks: 216,
    duration: 180, // 3 hours
    examDate: new Date('2024-12-20T09:00:00Z'),
    registrationStartDate: new Date('2024-11-20T00:00:00Z'),
    registrationEndDate: new Date('2024-12-15T23:59:59Z'),
    examFee: 0,
    registrationFee: 0,
    status: 'active',
    isPublic: true,
    scholarshipDetails: {
      totalScholarships: 75,
      scholarshipAmounts: [
        { rank: '1-3', percentage: 95, amount: 47500 },
        { rank: '4-15', percentage: 80, amount: 40000 },
        { rank: '16-40', percentage: 60, amount: 30000 },
        { rank: '41-75', percentage: 30, amount: 15000 }
      ]
    },
    eligibleClasses: ['11th', '12th'],
    minimumPercentage: 65,
    ageLimit: { min: 15, max: 19 },
    subjects: ['Biology', 'Physics', 'Chemistry'],
    createdBy: 'system',
    lastUpdatedBy: 'system'
  },
  {
    tenantId: 'utkarsh_education_2024',
    examName: 'Utkarsh Board Exam Excellence Scholarship',
    examCode: 'UBES-2024',
    description: 'Scholarship for students preparing for Class 10th and 12th board examinations.',
    examType: 'scholarship',
    category: 'Board Preparation',
    totalMarks: 200,
    passingMarks: 120,
    duration: 120, // 2 hours
    examDate: new Date('2024-12-25T14:00:00Z'),
    registrationStartDate: new Date('2024-11-25T00:00:00Z'),
    registrationEndDate: new Date('2024-12-20T23:59:59Z'),
    examFee: 0,
    registrationFee: 0,
    status: 'active',
    isPublic: true,
    scholarshipDetails: {
      totalScholarships: 50,
      scholarshipAmounts: [
        { rank: '1-2', percentage: 85, amount: 25500 },
        { rank: '3-10', percentage: 65, amount: 19500 },
        { rank: '11-25', percentage: 45, amount: 13500 },
        { rank: '26-50', percentage: 25, amount: 7500 }
      ]
    },
    eligibleClasses: ['10th', '12th'],
    minimumPercentage: 70,
    ageLimit: { min: 14, max: 18 },
    subjects: ['English', 'Mathematics', 'Science', 'Social Science'],
    createdBy: 'system',
    lastUpdatedBy: 'system'
  }
];

// Export for database seeding
export default sampleUtkarshExams;