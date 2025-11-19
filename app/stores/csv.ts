import { defineStore } from 'pinia'
import type { CsvRow, StatsSummary, UploadedFile, BalanceInfo } from '~/types'
import type { ExportOptions } from '~/composables/useDataExport'

export const useCsvStore = defineStore('csv', {
  state: () => ({
    rows: [] as CsvRow[],
    headers: [] as string[],
    file: null as UploadedFile | null,
    phoneColumn: 'mobile' as string,
    packageColumn: 'package' as string,
    isLoading: false,
    error: null as string | null,
    balance: {
      availableUnits: 0,
      requiredUnits: 0,
      isInsufficient: false,
      packageColumn: 'package'
    } as BalanceInfo
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
          
          // Calculate required units
          this.calculateRequiredUnits()
        }
      } catch (err: unknown) {
        this.error = (err as Error).message || 'Failed to process file'
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
        
        // Handle undefined or null values
        if (aVal === undefined || aVal === null) return 1
        if (bVal === undefined || bVal === null) return -1
        
        // Handle numeric sorting
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return ascending ? aVal - bVal : bVal - aVal
        }
        
        // Try to convert to numbers for sorting (only for string/number types)
        if (typeof aVal !== 'object' && typeof bVal !== 'object') {
          const aNum = parseFloat(String(aVal))
          const bNum = parseFloat(String(bVal))
          
          if (!isNaN(aNum) && !isNaN(bNum)) {
            return ascending ? aNum - bNum : bNum - aNum
          }
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
     * Calculate required units from data
     */
    calculateRequiredUnits() {
      let total = 0
      
      // Find package column
      const packageCol = this.headers.find(h => 
        h.toLowerCase().includes('package') || 
        h.toLowerCase().includes('bundle') ||
        h.toLowerCase().includes('amount')
      )
      
      if (packageCol) {
        this.packageColumn = packageCol
        this.balance.packageColumn = packageCol
        
        // Sum up valid rows only
        this.validRows.forEach(row => {
          const value = row[packageCol]
          const numValue = typeof value === 'number' ? value : parseFloat(String(value))
          if (!isNaN(numValue)) {
            total += numValue
          }
        })
      }
      
      this.balance.requiredUnits = total
      this.checkBalanceSufficiency()
    },
    
    /**
     * Set available balance
     */
    setAvailableBalance(units: number) {
      this.balance.availableUnits = units
      this.checkBalanceSufficiency()
    },
    
    /**
     * Check if balance is sufficient
     */
    checkBalanceSufficiency() {
      this.balance.isInsufficient = this.balance.availableUnits > 0 && 
                                     this.balance.requiredUnits > this.balance.availableUnits
    },
    
    /**
     * Export data (legacy method for backward compatibility)
     */
    exportData(onlyValid: boolean = true) {
      const exporter = useDataExport()
      const filename = this.file ? 
        `cleaned-${this.file.name}` : 
        'cleaned-data.csv'
      
      return exporter.exportToCsv(this.rows, filename, onlyValid)
    },
    
    /**
     * Export data with advanced options
     */
    async exportDataAdvanced(options: ExportOptions = {}) {
      const exporter = useDataExport()
      const defaultOptions: ExportOptions = {
        customFilename: this.file ? 
          `cleaned-${this.file.name.replace(/\.[^/.]+$/, '')}` : 
          'cleaned-data',
        ...options
      }
      
      return await exporter.exportData(this.rows, defaultOptions)
    }
  }
})

