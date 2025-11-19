import { saveAs } from 'file-saver'
import Papa from 'papaparse'
import type { CsvRow } from '~/types'

export type ExportFormat = 'csv' | 'json' | 'txt'
export type ExportFilter = 'all' | 'valid' | 'invalid' | 'duplicate' | 'valid-only'

export interface ExportOptions {
  format?: ExportFormat
  filter?: ExportFilter
  selectedColumns?: string[]
  includeHeaders?: boolean
  telcoFilter?: string[]
  customFilename?: string
}

export const useDataExport = () => {
  const isExporting = ref(false)
  const exportProgress = ref(0)

  /**
   * Filter rows based on export options
   */
  const filterRows = (rows: CsvRow[], options: ExportOptions): CsvRow[] => {
    let filtered = [...rows]

    // Apply status filter
    if (options.filter === 'valid' || options.filter === 'valid-only') {
      filtered = filtered.filter(row => row._status === 'valid')
    } else if (options.filter === 'invalid') {
      filtered = filtered.filter(row => row._status === 'invalid')
    } else if (options.filter === 'duplicate') {
      filtered = filtered.filter(row => row._status === 'duplicate')
      }
      
    // Apply telco filter
    if (options.telcoFilter && options.telcoFilter.length > 0) {
      filtered = filtered.filter(row => {
        const telco = row._telco as string
        return telco && options.telcoFilter!.includes(telco)
      })
    }

    return filtered
  }

  /**
   * Clean row data for export (remove internal fields, select columns)
   */
  const cleanRowData = (rows: CsvRow[], options: ExportOptions): Record<string, any>[] => {
    return rows.map(row => {
      // Remove internal fields
        const { _id, _status, _errors, _telco, _duplicateCount, ...cleanRow } = row

      // If specific columns are selected, only include those
      if (options.selectedColumns && options.selectedColumns.length > 0) {
        const selected: Record<string, any> = {}
        options.selectedColumns.forEach(col => {
          if (col in cleanRow) {
            selected[col] = cleanRow[col]
          }
        })
        return selected
      }

      return cleanRow
    })
  }

  /**
   * Export data with advanced options
   */
  const exportData = async (
    rows: CsvRow[],
    options: ExportOptions = {}
  ): Promise<boolean> => {
    try {
      isExporting.value = true
      exportProgress.value = 0

      // Filter rows
      const filteredRows = filterRows(rows, options)
      exportProgress.value = 30

      if (filteredRows.length === 0) {
        throw new Error('No data to export with the selected filters')
      }

      // Clean data
      const cleanedData = cleanRowData(filteredRows, options)
      exportProgress.value = 60

      // Generate filename
      const format = options.format || 'csv'
      const baseFilename = options.customFilename || 
        (options.filter === 'valid-only' ? 'cleaned-data' : 'exported-data')
      const filename = `${baseFilename}.${format}`

      // Export based on format
      let blob: Blob
      let mimeType: string

      switch (format) {
        case 'json':
          blob = new Blob([JSON.stringify(cleanedData, null, 2)], { 
            type: 'application/json;charset=utf-8' 
          })
          break
        case 'txt':
          // Tab-separated values
          const txt = cleanedData.map(row => 
            Object.values(row).join('\t')
          ).join('\n')
          blob = new Blob([txt], { type: 'text/plain;charset=utf-8' })
          break
        case 'csv':
        default:
          const csv = Papa.unparse(cleanedData, {
            header: options.includeHeaders !== false
          })
          blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
          break
      }

      exportProgress.value = 90
      saveAs(blob, filename)
      exportProgress.value = 100

      // Reset after a short delay
      setTimeout(() => {
        isExporting.value = false
        exportProgress.value = 0
      }, 500)
      
      return true
    } catch (error) {
      console.error('Export failed:', error)
      isExporting.value = false
      exportProgress.value = 0
      return false
    }
  }

  /**
   * Legacy CSV export (for backward compatibility)
   */
  const exportToCsv = (
    rows: CsvRow[], 
    filename: string = 'cleaned-data.csv', 
    onlyValid: boolean = true
  ) => {
    return exportData(rows, {
      format: 'csv',
      filter: onlyValid ? 'valid-only' : 'all',
      customFilename: filename.replace('.csv', ''),
      includeHeaders: true
    })
  }
  
  /**
   * Get export preview (first few rows)
   */
  const getExportPreview = (
    rows: CsvRow[], 
    options: ExportOptions = {},
    limit: number = 5
  ): CsvRow[] => {
    const filteredRows = filterRows(rows, options)
    return filteredRows.slice(0, limit)
  }
  
  /**
   * Get export statistics
   */
  const getExportStats = (rows: CsvRow[], options: ExportOptions = {}) => {
    const filteredRows = filterRows(rows, options)
    
    return {
      totalRows: rows.length,
      exportedRows: filteredRows.length,
      skippedRows: rows.length - filteredRows.length,
      format: options.format || 'csv'
    }
  }
  
  return {
    exportData,
    exportToCsv, // Legacy support
    getExportPreview,
    getExportStats,
    isExporting: readonly(isExporting),
    exportProgress: readonly(exportProgress)
  }
}

