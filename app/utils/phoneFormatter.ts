import type { ValidationResult } from '~/types'

/**
 * Standardizes phone numbers to +2547XXXXXXXX format
 * Handles various input formats and validates Kenya mobile numbers
 */
export class PhoneNumberFormatter {
  private static readonly KENYA_CODE = '254'
  private static readonly EXPECTED_LENGTH = 12 // +2547XXXXXXXX
  private static readonly MOBILE_PREFIXES = ['7', '1'] // Kenya mobile prefixes
  
  /**
   * Format and validate a phone number
   */
  static format(value: string | number): ValidationResult {
    const originalValue = String(value)
    
    // Handle empty or null values
    if (!value || value === '') {
      return {
        isValid: false,
        error: 'Phone number is required',
        originalValue
      }
    }
    
    // Convert to string and handle scientific notation
    let phoneStr = this.normalizeScientificNotation(originalValue)
    
    // Check for non-numeric characters AFTER converting scientific notation
    // But exclude 'E' or 'e' that are part of scientific notation in the ORIGINAL value
    const isScientificNotation = /\d+\.?\d*[eE][+-]?\d+/.test(originalValue)
    if (!isScientificNotation && /[a-zA-Z]/.test(originalValue)) {
      return {
        isValid: false,
        error: 'Phone number contains invalid characters',
        originalValue
      }
    }
    
    // Remove all non-digit characters except +
    phoneStr = phoneStr.replace(/[^\d+]/g, '')
    
    // Remove any + signs that aren't at the beginning
    phoneStr = phoneStr.replace(/^(\+?)(.*)$/g, (_, prefix, rest) => {
      return prefix + rest.replace(/\+/g, '')
    })
    
    // Remove leading + for processing
    phoneStr = phoneStr.replace(/^\+/, '')
    
    // Handle leading zero (0722... -> 722...)
    if (phoneStr.startsWith('0')) {
      phoneStr = phoneStr.substring(1)
    }
    
    // Add Kenya code if missing
    if (!phoneStr.startsWith(this.KENYA_CODE)) {
      phoneStr = this.KENYA_CODE + phoneStr
    }
    
    // Validate length (should be 12 digits total)
    if (phoneStr.length !== this.EXPECTED_LENGTH) {
      return {
        isValid: false,
        error: `Invalid length (expected 12 digits, got ${phoneStr.length})`,
        formatted: '+' + phoneStr,
        originalValue
      }
    }
    
    // Validate it's a valid mobile prefix
    const prefix = phoneStr.charAt(3) // Position after 254
    if (!this.MOBILE_PREFIXES.includes(prefix)) {
      return {
        isValid: false,
        error: `Invalid Kenya mobile prefix (must start with 7 or 1)`,
        formatted: '+' + phoneStr,
        originalValue
      }
    }
    
    // Check if all digits are valid
    if (!/^\d+$/.test(phoneStr)) {
      return {
        isValid: false,
        error: 'Phone number must contain only digits',
        formatted: '+' + phoneStr,
        originalValue
      }
    }
    
    const formatted = '+' + phoneStr
    const telco = this.detectTelco(phoneStr)
    
    return {
      isValid: true,
      formatted,
      telco,
      originalValue
    }
  }
  
  /**
   * Convert scientific notation to regular number string
   */
  private static normalizeScientificNotation(value: string): string {
    // Check if it's in scientific notation
    if (value.includes('E') || value.includes('e')) {
      try {
        const num = parseFloat(value)
        if (!isNaN(num)) {
          // Convert to fixed notation without decimals
          return num.toFixed(0)
        }
      } catch (e) {
        // If parsing fails, return original
        return value
      }
    }
    return value
  }
  
  /**
   * Detect telco based on prefix (approximate due to number portability)
   */
  private static detectTelco(phoneStr: string): 'Safaricom' | 'Airtel' | 'Telkom' | 'Unknown' {
    // Remove country code
    const localNumber = phoneStr.substring(3)
    const prefix = localNumber.substring(0, 2)
    
    // Safaricom prefixes
    const safaricomPrefixes = ['70', '71', '72', '74', '79', '11', '12']
    if (safaricomPrefixes.includes(prefix)) {
      return 'Safaricom'
    }
    
    // Airtel prefixes
    const airtelPrefixes = ['73', '78', '10']
    if (airtelPrefixes.includes(prefix)) {
      return 'Airtel'
    }
    
    // Telkom prefixes
    const telkomPrefixes = ['77']
    if (telkomPrefixes.includes(prefix)) {
      return 'Telkom'
    }
    
    return 'Unknown'
  }
  
  /**
   * Batch validate multiple phone numbers
   */
  static formatBatch(values: (string | number)[]): ValidationResult[] {
    return values.map(value => this.format(value))
  }
}

/**
 * Convenience function for formatting a single phone number
 */
export const formatPhoneNumber = (value: string | number): ValidationResult => {
  return PhoneNumberFormatter.format(value)
}

/**
 * Convenience function for batch formatting
 */
export const formatPhoneNumbers = (values: (string | number)[]): ValidationResult[] => {
  return PhoneNumberFormatter.formatBatch(values)
}

