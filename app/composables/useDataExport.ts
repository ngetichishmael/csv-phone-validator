import { saveAs } from 'file-saver'
import Papa from 'papaparse'
import type { CsvRow } from '~/types'

export const useDataExport = () => {
  /**
   * Export data as CSV file
   */
  const exportToCsv = (rows: CsvRow[], filename: string = 'cleaned-data.csv', onlyValid: boolean = true) => {
    try {
      // Filter rows if needed
      let dataToExport = rows
      if (onlyValid) {
        dataToExport = rows.filter(row => row._status === 'valid')
      }
      
      // Remove internal fields (_id, _status, _errors, _telco)
      const cleanedData = dataToExport.map(row => {
        const { _id, _status, _errors, _telco, _duplicateCount, ...cleanRow } = row
        return cleanRow
      })
      
      // Convert to CSV
      const csv = Papa.unparse(cleanedData)
      
      // Create blob and download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
      saveAs(blob, filename)
      
      return true
    } catch (error) {
      console.error('Export failed:', error)
      return false
    }
  }
  
  /**
   * Get export preview (first few rows)
   */
  const getExportPreview = (rows: CsvRow[], onlyValid: boolean = true, limit: number = 5): CsvRow[] => {
    let dataToExport = rows
    if (onlyValid) {
      dataToExport = rows.filter(row => row._status === 'valid')
    }
    
    return dataToExport.slice(0, limit)
  }
  
  /**
   * Get export statistics
   */
  const getExportStats = (rows: CsvRow[], onlyValid: boolean = true) => {
    let dataToExport = rows
    if (onlyValid) {
      dataToExport = rows.filter(row => row._status === 'valid')
    }
    
    return {
      totalRows: rows.length,
      exportedRows: dataToExport.length,
      skippedRows: rows.length - dataToExport.length
    }
  }
  
  return {
    exportToCsv,
    getExportPreview,
    getExportStats
  }
}

