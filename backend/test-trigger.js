/**
 * Test script to verify trigger keyword matching logic
 */

// Simulate the fixed trigger matching logic
function testTriggerMatching(triggerKeyword, messageText) {
  const triggerKeywords = (triggerKeyword || 'hi')
    .split(',')
    .map(k => k.toLowerCase().trim())
    .filter(k => k.length > 0);
  
  const incomingMessage = messageText.toLowerCase().trim();
  
  const keywordMatched = triggerKeywords.some(keyword => 
    incomingMessage.includes(keyword)
  );
  
  const matchedKeyword = triggerKeywords.find(keyword => 
    incomingMessage.includes(keyword)
  );

  return {
    triggerKeywords,
    incomingMessage,
    keywordMatched,
    matchedKeyword,
    allKeywords: triggerKeywords
  };
}

// Test cases
const testCases = [
  {
    name: 'Single word trigger (admissions)',
    triggerKeyword: 'admissions, coaching class, how to',
    messageText: 'admissions',
    expectedMatch: true
  },
  {
    name: 'Single word trigger (coaching class)',
    triggerKeyword: 'admissions, coaching class, how to',
    messageText: 'coaching class',
    expectedMatch: true
  },
  {
    name: 'Single word trigger (how to)',
    triggerKeyword: 'admissions, coaching class, how to',
    messageText: 'how to enroll?',
    expectedMatch: true
  },
  {
    name: 'Default trigger (hi)',
    triggerKeyword: null,
    messageText: 'hi there',
    expectedMatch: true
  },
  {
    name: 'No match',
    triggerKeyword: 'admissions, coaching class, how to',
    messageText: 'hello world',
    expectedMatch: false
  },
  {
    name: 'Case insensitive match',
    triggerKeyword: 'admissions, coaching class, how to',
    messageText: 'ADMISSIONS please',
    expectedMatch: true
  }
];

console.log('🧪 Testing Trigger Keyword Matching Logic\n');
console.log('═'.repeat(80));

let passedTests = 0;
let failedTests = 0;

testCases.forEach((testCase, index) => {
  const result = testTriggerMatching(testCase.triggerKeyword, testCase.messageText);
  const passed = result.keywordMatched === testCase.expectedMatch;
  
  if (passed) {
    passedTests++;
    console.log(`✅ Test ${index + 1}: ${testCase.name}`);
  } else {
    failedTests++;
    console.log(`❌ Test ${index + 1}: ${testCase.name}`);
  }
  
  console.log(`   Trigger keywords: [${result.allKeywords.join(', ')}]`);
  console.log(`   Message: "${result.incomingMessage}"`);
  console.log(`   Matched: ${result.keywordMatched ? '✅ YES' : '❌ NO'}`);
  if (result.matchedKeyword) {
    console.log(`   Matched keyword: "${result.matchedKeyword}"`);
  }
  console.log();
});

console.log('═'.repeat(80));
console.log(`\n📊 Results: ${passedTests}/${testCases.length} tests passed`);
if (failedTests > 0) {
  console.log(`⚠️  ${failedTests} test(s) FAILED`);
} else {
  console.log('🎉 All tests PASSED!');
}
