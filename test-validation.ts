/**
 * Test script for phone number validation
 * Run with: bun run test-validation.ts
 */

import { PhoneNumberFormatter } from './app/utils/phoneFormatter'

console.log('🧪 Testing Phone Number Validation\n')
console.log('=' .repeat(60))

const testCases = [
  // Valid cases
  { input: '0722123456', expected: '+254722123456', shouldBeValid: true, description: 'Leading zero' },
  { input: '722123456', expected: '+254722123456', shouldBeValid: true, description: 'No prefix' },
  { input: '+254722123456', expected: '+254722123456', shouldBeValid: true, description: 'With +254' },
  { input: '254722123456', expected: '+254722123456', shouldBeValid: true, description: 'With 254' },
  { input: '2.54708E+11', expected: '+254708000000', shouldBeValid: true, description: 'Scientific notation' },
  { input: '793928485', expected: '+254793928485', shouldBeValid: true, description: 'Valid 9-digit' },
  { input: '733569097', expected: '+254733569097', shouldBeValid: true, description: 'Airtel number' },
  { input: '770123456', expected: '+254770123456', shouldBeValid: true, description: 'Telkom number' },
  
  // Invalid cases
  { input: '0t2s431243', expected: null, shouldBeValid: false, description: 'Contains letters' },
  { input: 'p718626672', expected: null, shouldBeValid: false, description: 'Starts with letter' },
  { input: '123', expected: null, shouldBeValid: false, description: 'Too short' },
  { input: '07221234567890', expected: null, shouldBeValid: false, description: 'Too long' },
  { input: '', expected: null, shouldBeValid: false, description: 'Empty string' },
  { input: '0622123456', expected: null, shouldBeValid: false, description: 'Invalid prefix (6xx)' },
]

let passed = 0
let failed = 0

testCases.forEach((testCase, index) => {
  const result = PhoneNumberFormatter.format(testCase.input)
  
  const isValid = result.isValid === testCase.shouldBeValid
  const formatMatches = testCase.shouldBeValid ? 
    result.formatted === testCase.expected : 
    !result.isValid
  
  const testPassed = isValid && formatMatches
  
  if (testPassed) {
    passed++
    console.log(`✅ Test ${index + 1}: ${testCase.description}`)
    console.log(`   Input: "${testCase.input}"`)
    console.log(`   Output: ${result.formatted || 'Invalid'}`)
    if (result.telco) {
      console.log(`   Telco: ${result.telco}`)
    }
  } else {
    failed++
    console.log(`❌ Test ${index + 1}: ${testCase.description}`)
    console.log(`   Input: "${testCase.input}"`)
    console.log(`   Expected: ${testCase.expected || 'Invalid'}`)
    console.log(`   Got: ${result.formatted || 'Invalid'}`)
    console.log(`   Error: ${result.error || 'None'}`)
  }
  console.log('')
})

console.log('=' .repeat(60))
console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests`)

if (failed === 0) {
  console.log('🎉 All tests passed!\n')
  process.exit(0)
} else {
  console.log('⚠️  Some tests failed\n')
  process.exit(1)
}

