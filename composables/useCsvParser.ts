import Papa from 'papaparse'
import type { CsvRow, ValidationError } from '~/types'
import { formatPhoneNumber } from '~/utils/phoneFormatter'

export const useCsvParser = () => {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const progress = ref(0)
  
  /**
   * Parse a CSV file and validate phone numbers
   */
  const parseFile = async (file: File): Promise<{ rows: CsvRow[], headers: string[] } | null> => {
    isLoading.value = true
    error.value = null
    progress.value = 0
    
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false, // Keep as strings to preserve leading zeros
        complete: (results) => {
          try {
            if (results.errors.length > 0) {
              const parsingError = results.errors[0]
              error.value = `CSV parsing error: ${parsingError.message}`
              reject(error.value)
              return
            }
            
            const headers = results.meta.fields || []
            
            // Detect phone number column (look for 'mobile', 'phone', 'number', etc.)
            const phoneColumn = detectPhoneColumn(headers)
            
            if (!phoneColumn) {
              error.value = 'Could not detect phone number column. Expected column names: mobile, phone, number, or phoneNumber'
              reject(error.value)
              return
            }
            
            // Process each row
            const rows: CsvRow[] = results.data.map((row: any, index: number) => {
              const phoneValue = row[phoneColumn]
              const validationResult = formatPhoneNumber(phoneValue)
              
              const errors: ValidationError[] = []
              
              if (!validationResult.isValid) {
                errors.push({
                  field: phoneColumn,
                  message: validationResult.error || 'Invalid phone number',
                  originalValue: validationResult.originalValue
                })
              }
              
              // Update the phone number with formatted version if available
              if (validationResult.formatted) {
                row[phoneColumn] = validationResult.formatted
              }
              
              return {
                ...row,
                _id: index + 1,
                _status: validationResult.isValid ? 'valid' : 'invalid',
                _errors: errors.length > 0 ? errors : undefined,
                _telco: validationResult.telco
              } as CsvRow
            })
            
            progress.value = 100
            isLoading.value = false
            
            resolve({ rows, headers })
          } catch (err) {
            error.value = `Error processing CSV: ${err}`
            isLoading.value = false
            reject(err)
          }
        },
        error: (err) => {
          error.value = `Failed to parse CSV: ${err.message}`
          isLoading.value = false
          reject(err)
        }
      })
    })
  }
  
  /**
   * Detect which column contains phone numbers
   */
  const detectPhoneColumn = (headers: string[]): string | null => {
    const phoneColumnNames = ['mobile', 'phone', 'phoneNumber', 'phone_number', 'number', 'msisdn', 'cell', 'telephone']
    
    for (const header of headers) {
      const normalizedHeader = header.toLowerCase().trim()
      if (phoneColumnNames.includes(normalizedHeader)) {
        return header
      }
    }
    
    // If no exact match, look for partial matches
    for (const header of headers) {
      const normalizedHeader = header.toLowerCase().trim()
      if (normalizedHeader.includes('phone') || normalizedHeader.includes('mobile')) {
        return header
      }
    }
    
    return null
  }
  
  /**
   * Re-validate a single row (used after editing)
   */
  const validateRow = (row: CsvRow, phoneColumn: string): CsvRow => {
    const phoneValue = row[phoneColumn]
    const validationResult = formatPhoneNumber(phoneValue)
    
    const errors: ValidationError[] = []
    
    if (!validationResult.isValid) {
      errors.push({
        field: phoneColumn,
        message: validationResult.error || 'Invalid phone number',
        originalValue: validationResult.originalValue
      })
    }
    
    // Update the phone number with formatted version
    if (validationResult.formatted) {
      row[phoneColumn] = validationResult.formatted
    }
    
    return {
      ...row,
      _status: validationResult.isValid ? 'valid' : 'invalid',
      _errors: errors.length > 0 ? errors : undefined,
      _telco: validationResult.telco
    }
  }
  
  return {
    isLoading: readonly(isLoading),
    error: readonly(error),
    progress: readonly(progress),
    parseFile,
    validateRow
  }
}

