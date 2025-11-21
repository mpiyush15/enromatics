import mongoose from 'mongoose';
import ScholarshipExam from './src/models/ScholarshipExam.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mpiyush:Piyush@cluster0.wj1oezq.mongodb.net/enromatics?retryWrites=true&w=majority';

const createUtkarshScholarshipExams = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete existing seed data for Utkarsh tenant
    await ScholarshipExam.deleteMany({ tenantId: '0946d809' });
    console.log('🗑️ Cleaned existing scholarship exams for Utkarsh tenant');

    // Create real Utkarsh Education scholarship exams
    const scholarshipExams = [
      {
        examName: 'Utkarsh National Scholarship Test (UNST) 2025',
        description: 'A comprehensive scholarship examination for Class 8-12 students aiming for JEE/NEET preparation with scholarship opportunities up to 100%',
        examCode: 'UNST2025',
        tenantId: '0946d809',
        registrationStartDate: new Date('2024-11-15'),
        registrationEndDate: new Date('2025-01-15'),
        examDate: new Date('2025-01-26'),
        examDates: [
          {
            date: new Date('2025-01-26'),
            timeSlot: '10:00 AM - 1:00 PM',
            duration: 180,
            description: 'Main examination'
          }
        ],
        totalMarks: 300,
        passingMarks: 150,
        duration: 180,
        eligibleClasses: ['8', '9', '10', '11', '12'],
        minimumPercentage: 60,
        ageLimit: {
          minimum: 13,
          maximum: 18
        },
        examFee: {
          amount: 0,
          paymentRequired: false
        },
        registrationFee: {
          amount: 0,
          paymentRequired: false
        },
        scholarshipDetails: {
          totalScholarships: 500,
          scholarshipTiers: [
            {
              rank: '1-10',
              scholarshipPercentage: 100,
              additionalBenefits: ['Free study material', 'Personal mentorship', 'Tablet/iPad']
            },
            {
              rank: '11-50', 
              scholarshipPercentage: 75,
              additionalBenefits: ['Free study material', 'Group mentorship']
            },
            {
              rank: '51-150',
              scholarshipPercentage: 50,
              additionalBenefits: ['Free study material']
            },
            {
              rank: '151-500',
              scholarshipPercentage: 25,
              additionalBenefits: ['Discounted study material']
            }
          ]
        },
        rewards: [
          {
            position: 1,
            rewardType: 'scholarship',
            rewardValue: 100,
            rewardDescription: '100% scholarship + Tablet + Personal mentor',
            cashReward: 25000
          },
          {
            position: 2,
            rewardType: 'scholarship', 
            rewardValue: 100,
            rewardDescription: '100% scholarship + Tablet + Personal mentor',
            cashReward: 15000
          },
          {
            position: 3,
            rewardType: 'scholarship',
            rewardValue: 100, 
            rewardDescription: '100% scholarship + Tablet + Personal mentor',
            cashReward: 10000
          }
        ],
        syllabus: [
          {
            subject: 'Mathematics',
            topics: ['Algebra', 'Geometry', 'Trigonometry', 'Calculus (11-12)', 'Statistics']
          },
          {
            subject: 'Physics',
            topics: ['Mechanics', 'Thermodynamics', 'Optics', 'Electricity', 'Modern Physics (11-12)']
          },
          {
            subject: 'Chemistry', 
            topics: ['Atomic Structure', 'Chemical Bonding', 'Periodic Table', 'Organic Chemistry (11-12)', 'Inorganic Chemistry']
          },
          {
            subject: 'Biology',
            topics: ['Cell Biology', 'Genetics', 'Human Physiology', 'Plant Biology', 'Ecology']
          }
        ],
        examFormat: {
          questionTypes: ['MCQ', 'Integer Type'],
          sectionsCount: 4,
          questionsPerSection: 25,
          markingScheme: {
            correct: 4,
            incorrect: -1,
            unattempted: 0
          }
        },
        status: 'active',
        isPublic: true,
        stats: {
          totalRegistrations: 0,
          totalAppearedStudents: 0,
          passedStudents: 0,
          totalEnrollments: 0
        },
        createdBy: new mongoose.Types.ObjectId()
      },
      {
        examName: 'Utkarsh Foundation Scholarship Test (UFST) 2025',
        description: 'Specialized scholarship test for Class 8-10 students focusing on building strong foundations for competitive exams',
        examCode: 'UFST2025',
        tenantId: '0946d809',
        registrationStartDate: new Date('2024-11-20'),
        registrationEndDate: new Date('2025-02-10'),
        examDate: new Date('2025-02-16'),
        examDates: [
          {
            date: new Date('2025-02-16'),
            timeSlot: '2:00 PM - 4:30 PM',
            duration: 150,
            description: 'Foundation level examination'
          }
        ],
        totalMarks: 200,
        passingMarks: 100,
        duration: 150,
        eligibleClasses: ['8', '9', '10'],
        minimumPercentage: 55,
        ageLimit: {
          minimum: 13,
          maximum: 16
        },
        examFee: {
          amount: 0,
          paymentRequired: false
        },
        registrationFee: {
          amount: 0,
          paymentRequired: false
        },
        scholarshipDetails: {
          totalScholarships: 300,
          scholarshipTiers: [
            {
              rank: '1-5',
              scholarshipPercentage: 90,
              additionalBenefits: ['Free foundation course', 'Study kit', 'Personal guidance']
            },
            {
              rank: '6-25',
              scholarshipPercentage: 70,
              additionalBenefits: ['Free foundation course', 'Study kit']
            },
            {
              rank: '26-100',
              scholarshipPercentage: 50,
              additionalBenefits: ['Free foundation course']
            },
            {
              rank: '101-300',
              scholarshipPercentage: 30,
              additionalBenefits: ['Discounted foundation course']
            }
          ]
        },
        rewards: [
          {
            position: 1,
            rewardType: 'scholarship',
            rewardValue: 90,
            rewardDescription: '90% scholarship + Study kit + Personal guidance',
            cashReward: 15000
          },
          {
            position: 2,
            rewardType: 'scholarship',
            rewardValue: 90,
            rewardDescription: '90% scholarship + Study kit + Personal guidance', 
            cashReward: 10000
          },
          {
            position: 3,
            rewardType: 'scholarship',
            rewardValue: 90,
            rewardDescription: '90% scholarship + Study kit + Personal guidance',
            cashReward: 7500
          }
        ],
        syllabus: [
          {
            subject: 'Mathematics',
            topics: ['Basic Algebra', 'Geometry', 'Number System', 'Mensuration', 'Data Handling']
          },
          {
            subject: 'Science',
            topics: ['Physics - Motion & Forces', 'Chemistry - Atomic Structure', 'Biology - Life Processes', 'Environmental Science']
          },
          {
            subject: 'Mental Ability',
            topics: ['Logical Reasoning', 'Pattern Recognition', 'Analytical Thinking', 'Problem Solving']
          }
        ],
        examFormat: {
          questionTypes: ['MCQ'],
          sectionsCount: 3,
          questionsPerSection: 25,
          markingScheme: {
            correct: 3,
            incorrect: -1,
            unattempted: 0
          }
        },
        status: 'active',
        isPublic: true,
        stats: {
          totalRegistrations: 0,
          totalAppearedStudents: 0,
          passedStudents: 0,
          totalEnrollments: 0
        },
        createdBy: new mongoose.Types.ObjectId()
      },
      {
        examName: 'Utkarsh Medical Entrance Scholarship Test (UMEST) 2025',
        description: 'Dedicated scholarship examination for NEET aspirants with comprehensive medical entrance preparation support',
        examCode: 'UMEST2025',
        tenantId: '0946d809',
        registrationStartDate: new Date('2024-12-01'),
        registrationEndDate: new Date('2025-03-01'),
        examDate: new Date('2025-03-09'),
        examDates: [
          {
            date: new Date('2025-03-09'),
            timeSlot: '9:00 AM - 12:30 PM',
            duration: 210,
            description: 'NEET pattern medical entrance test'
          }
        ],
        totalMarks: 360,
        passingMarks: 180,
        duration: 210,
        eligibleClasses: ['11', '12', '12-pass'],
        minimumPercentage: 65,
        ageLimit: {
          minimum: 16,
          maximum: 25
        },
        examFee: {
          amount: 0,
          paymentRequired: false
        },
        registrationFee: {
          amount: 0,
          paymentRequired: false
        },
        scholarshipDetails: {
          totalScholarships: 200,
          scholarshipTiers: [
            {
              rank: '1-5',
              scholarshipPercentage: 100,
              additionalBenefits: ['Free NEET course', 'Mock tests', 'Personal mentor', 'Medical college guidance']
            },
            {
              rank: '6-20',
              scholarshipPercentage: 80,
              additionalBenefits: ['Free NEET course', 'Mock tests', 'Group mentorship']
            },
            {
              rank: '21-75',
              scholarshipPercentage: 60,
              additionalBenefits: ['Free NEET course', 'Mock tests']
            },
            {
              rank: '76-200',
              scholarshipPercentage: 40,
              additionalBenefits: ['Discounted NEET course']
            }
          ]
        },
        rewards: [
          {
            position: 1,
            rewardType: 'scholarship',
            rewardValue: 100,
            rewardDescription: '100% NEET course scholarship + Medical college guidance',
            cashReward: 50000
          },
          {
            position: 2,
            rewardType: 'scholarship',
            rewardValue: 100,
            rewardDescription: '100% NEET course scholarship + Medical college guidance',
            cashReward: 30000
          },
          {
            position: 3,
            rewardType: 'scholarship',
            rewardValue: 100,
            rewardDescription: '100% NEET course scholarship + Medical college guidance',
            cashReward: 20000
          }
        ],
        syllabus: [
          {
            subject: 'Physics',
            topics: ['Mechanics', 'Thermodynamics', 'Electromagnetism', 'Optics', 'Modern Physics', 'Nuclear Physics']
          },
          {
            subject: 'Chemistry',
            topics: ['Physical Chemistry', 'Inorganic Chemistry', 'Organic Chemistry', 'Biomolecules', 'Environmental Chemistry']
          },
          {
            subject: 'Biology',
            topics: ['Cell Biology', 'Genetics', 'Human Physiology', 'Plant Physiology', 'Ecology', 'Biotechnology']
          }
        ],
        examFormat: {
          questionTypes: ['MCQ'],
          sectionsCount: 3,
          questionsPerSection: 50,
          markingScheme: {
            correct: 4,
            incorrect: -1,
            unattempted: 0
          }
        },
        status: 'active',
        isPublic: true,
        stats: {
          totalRegistrations: 0,
          totalAppearedStudents: 0,
          passedStudents: 0,
          totalEnrollments: 0
        },
        createdBy: new mongoose.Types.ObjectId()
      }
    ];

    // Insert all scholarship exams
    const createdExams = await ScholarshipExam.insertMany(scholarshipExams);
    
    console.log(`✅ Created ${createdExams.length} scholarship exams for Utkarsh Education:`);
    createdExams.forEach(exam => {
      console.log(`   📚 ${exam.examName} (${exam.examCode})`);
    });

    console.log('\n🎯 All scholarship exams are now available in mobile app!');
    
  } catch (error) {
    console.error('❌ Error creating scholarship exams:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Database connection closed');
  }
};

// Run the script
createUtkarshScholarshipExams();