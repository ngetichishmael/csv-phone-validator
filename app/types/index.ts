export interface CsvRow {
  [key: string]: string | number | ValidationError[] | undefined
  _id?: number
  _status?: 'pending' | 'valid' | 'invalid' | 'duplicate'
  _errors?: ValidationError[]
}

export interface ValidationResult {
  isValid: boolean
  error?: string
  formatted?: string | null
  telco?: 'Safaricom' | 'Airtel' | 'Telkom' | 'Unknown'
  originalValue: string
}

export interface ValidationError {
  field: string
  message: string
  originalValue: string
}

export interface StatsSummary {
  total: number
  valid: number
  invalid: number
  duplicates: number
  pending: number
}

export interface UploadedFile {
  name: string
  size: number
  uploadedAt: Date
}

export interface CsvData {
  rows: CsvRow[]
  headers: string[]
  file?: UploadedFile
}

