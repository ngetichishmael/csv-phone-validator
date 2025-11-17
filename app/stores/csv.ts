import { defineStore } from 'pinia'
import type { CsvRow, StatsSummary, UploadedFile } from '~/types'

export const useCsvStore = defineStore('csv', {
  state: () => ({
    rows: [] as CsvRow[],
    headers: [] as string[],
    file: null as UploadedFile | null,
    phoneColumn: 'mobile' as string,
    isLoading: false,
    error: null as string | null
  }),
  
  getters: {
    /**
     * Check if we have data loaded
     */
    hasData: (state) => state.rows.length > 0,
    
    /**
     * Get statistics summary
     */
    stats: (state): StatsSummary => {
      const total = state.rows.length
      const valid = state.rows.filter(row => row._status === 'valid').length
      const invalid = state.rows.filter(row => row._status === 'invalid').length
      const duplicates = state.rows.filter(row => row._status === 'duplicate').length
      const pending = state.rows.filter(row => row._status === 'pending').length
      
      return {
        total,
        valid,
        invalid,
        duplicates,
        pending
      }
    },
    
    /**
     * Get all valid rows
     */
    validRows: (state) => state.rows.filter(row => row._status === 'valid'),
    
    /**
     * Get all invalid rows
     */
    invalidRows: (state) => state.rows.filter(row => row._status === 'invalid'),
    
    /**
     * Get all duplicate rows
     */
    duplicateRows: (state) => state.rows.filter(row => row._status === 'duplicate'),
    
    /**
     * Get validation percentage
     */
    validationPercentage: (state): number => {
      if (state.rows.length === 0) return 0
      const valid = state.rows.filter(row => row._status === 'valid').length
      return Math.round((valid / state.rows.length) * 100)
    }
  },
  
  actions: {
    /**
     * Process uploaded CSV file
     */
    async processFile(file: File) {
      this.isLoading = true
      this.error = null
      
      try {
        const parser = useCsvParser()
        const result = await parser.parseFile(file)
        
        if (result) {
          this.rows = result.rows
          this.headers = result.headers
          this.file = {
            name: file.name,
            size: file.size,
            uploadedAt: new Date()
          }
          
          // Detect phone column
          this.phoneColumn = this.detectPhoneColumn(result.headers)
          
          // Check for duplicates
          this.checkDuplicates()
        }
      } catch (err: any) {
        this.error = err.message || 'Failed to process file'
        throw err
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Detect phone column from headers
     */
    detectPhoneColumn(headers: string[]): string {
      const phoneColumnNames = ['mobile', 'phone', 'phoneNumber', 'phone_number', 'number']
      
      for (const header of headers) {
        if (phoneColumnNames.includes(header.toLowerCase().trim())) {
          return header
        }
      }
      
      // Default to 'mobile' if not found
      return headers.find(h => h.toLowerCase().includes('mobile')) || 
             headers.find(h => h.toLowerCase().includes('phone')) || 
             'mobile'
    },
    
    /**
     * Check for duplicate phone numbers
     */
    checkDuplicates() {
      const duplicateDetector = useDuplicateDetection()
      this.rows = duplicateDetector.detectDuplicates(this.rows, this.phoneColumn)
    },
    
    /**
     * Update a single row
     */
    updateRow(id: number, updatedData: Partial<CsvRow>) {
      const index = this.rows.findIndex(row => row._id === id)
      if (index !== -1) {
        // Update the row
        this.rows[index] = {
          ...this.rows[index],
          ...updatedData
        }
        
        // Re-validate the row
        const parser = useCsvParser()
        this.rows[index] = parser.validateRow(this.rows[index], this.phoneColumn)
        
        // Re-check duplicates
        this.checkDuplicates()
      }
    },
    
    /**
     * Delete a row
     */
    deleteRow(id: number) {
      const index = this.rows.findIndex(row => row._id === id)
      if (index !== -1) {
        this.rows.splice(index, 1)
        
        // Re-check duplicates after deletion
        this.checkDuplicates()
      }
    },
    
    /**
     * Sort rows by a column
     */
    sortBy(column: string, ascending: boolean = false) {
      this.rows.sort((a, b) => {
        const aVal = a[column]
        const bVal = b[column]
        
        // Handle numeric sorting
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return ascending ? aVal - bVal : bVal - aVal
        }
        
        // Try to convert to numbers for sorting
        const aNum = parseFloat(aVal)
        const bNum = parseFloat(bVal)
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return ascending ? aNum - bNum : bNum - aNum
        }
        
        // String sorting
        const aStr = String(aVal).toLowerCase()
        const bStr = String(bVal).toLowerCase()
        
        if (ascending) {
          return aStr.localeCompare(bStr)
        } else {
          return bStr.localeCompare(aStr)
        }
      })
    },
    
    /**
     * Clear all data
     */
    clear() {
      this.rows = []
      this.headers = []
      this.file = null
      this.error = null
    },
    
    /**
     * Export data
     */
    exportData(onlyValid: boolean = true) {
      const exporter = useDataExport()
      const filename = this.file ? 
        `cleaned-${this.file.name}` : 
        'cleaned-data.csv'
      
      return exporter.exportToCsv(this.rows, filename, onlyValid)
    }
  }
})

