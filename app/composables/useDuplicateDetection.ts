import type { CsvRow } from '~/types'

export const useDuplicateDetection = () => {
  /**
   * Detect duplicate phone numbers in the dataset
   */
  const detectDuplicates = (rows: CsvRow[], phoneColumn: string = 'mobile'): CsvRow[] => {
    const phoneNumberMap = new Map<string, number[]>()
    
    // Build a map of phone numbers to row IDs
    rows.forEach((row) => {
      const phone = String(row[phoneColumn] || '').trim()
      if (phone) {
        if (!phoneNumberMap.has(phone)) {
          phoneNumberMap.set(phone, [])
        }
        phoneNumberMap.get(phone)!.push(row._id!)
      }
    })
    
    // Mark rows as duplicates if they appear more than once
    const updatedRows = rows.map((row) => {
      const phone = String(row[phoneColumn] || '').trim()
      const occurrences = phoneNumberMap.get(phone) || []
      
      if (occurrences.length > 1) {
        return {
          ...row,
          _status: 'duplicate' as const,
          _duplicateCount: occurrences.length
        }
      }
      
      return row
    })
    
    return updatedRows
  }
  
  /**
   * Get count of duplicate phone numbers
   */
  const getDuplicateCount = (rows: CsvRow[]): number => {
    return rows.filter(row => row._status === 'duplicate').length
  }
  
  /**
   * Remove duplicate rows (keep first occurrence)
   */
  const removeDuplicates = (rows: CsvRow[], phoneColumn: string = 'mobile'): CsvRow[] => {
    const seen = new Set<string>()
    
    return rows.filter((row) => {
      const phone = String(row[phoneColumn] || '').trim()
      if (seen.has(phone)) {
        return false
      }
      seen.add(phone)
      return true
    })
  }
  
  return {
    detectDuplicates,
    getDuplicateCount,
    removeDuplicates
  }
}

