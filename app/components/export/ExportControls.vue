<script setup lang="ts">
import type { ExportOptions, ExportFormat } from '~/composables/useDataExport'

const csvStore = useCsvStore()
const exporter = useDataExport()

// Export options state
const exportOptions = ref<ExportOptions>({
  format: 'csv',
  filter: 'valid-only',
  includeHeaders: true,
  selectedColumns: [],
  telcoFilter: []
})

const showAdvanced = ref(false)
const showPreview = ref(false)
const exportSuccess = ref(false)
const exportError = ref<string | null>(null)

// Available telcos from data
const availableTelcos = computed(() => {
  const telcos = new Set<string>()
  csvStore.rows.forEach(row => {
    if (row._telco && typeof row._telco === 'string') {
      telcos.add(row._telco)
    }
  })
  return Array.from(telcos).sort()
})

// Export stats
const exportStats = computed(() => {
  return exporter.getExportStats(csvStore.rows, exportOptions.value)
})

// Preview data
const previewData = computed(() => {
  const preview = exporter.getExportPreview(csvStore.rows, exportOptions.value, 5)
  return JSON.stringify(preview, null, 2)
})

// Handle export
const handleExport = async () => {
  exportError.value = null
  exportSuccess.value = false
  
  const success = await exporter.exportData(csvStore.rows, exportOptions.value)
  
  if (success) {
    exportSuccess.value = true
    setTimeout(() => {
      exportSuccess.value = false
    }, 3000)
  } else {
    exportError.value = 'Export failed. Please try again.'
  }
}

// Toggle column selection
const toggleColumn = (column: string) => {
  if (!exportOptions.value.selectedColumns) {
    exportOptions.value.selectedColumns = []
  }
  
  const index = exportOptions.value.selectedColumns.indexOf(column)
  if (index > -1) {
    exportOptions.value.selectedColumns.splice(index, 1)
  } else {
    exportOptions.value.selectedColumns.push(column)
  }
}

// Toggle telco filter
const toggleTelco = (telco: string) => {
  if (!exportOptions.value.telcoFilter) {
    exportOptions.value.telcoFilter = []
  }
  
  const index = exportOptions.value.telcoFilter.indexOf(telco)
  if (index > -1) {
    exportOptions.value.telcoFilter.splice(index, 1)
  } else {
    exportOptions.value.telcoFilter.push(telco)
  }
}

// Select all columns
const selectAllColumns = () => {
  exportOptions.value.selectedColumns = [...csvStore.headers]
}

// Clear column selection
const clearColumnSelection = () => {
  exportOptions.value.selectedColumns = []
}

// Format icons
const formatIcons = {
  csv: '📄',
  json: '📋',
  txt: '📝'
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
    <!-- Header Section -->
    <div class="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 px-6 py-5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <div>
            <h2 class="text-2xl font-bold text-white">Export Cleaned Data</h2>
            <p class="text-sm text-white/90 mt-0.5">Configure and download your processed data</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div class="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/30">
            <div class="text-xs text-white/80">Rows Ready</div>
            <div class="text-xl font-bold text-white">{{ exportStats.exportedRows.toLocaleString() }}</div>
          </div>
          <button
            class="p-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 text-white hover:bg-white/30 transition-colors"
            title="Advanced options"
            @click="showAdvanced = !showAdvanced"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <div class="p-6 space-y-6">
      <!-- Export Stats Cards -->
      <div class="grid grid-cols-3 gap-4">
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-600">Total Rows</span>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div class="text-2xl font-bold text-gray-900">{{ exportStats.totalRows.toLocaleString() }}</div>
        </div>
        
        <div class="bg-green-50 rounded-lg p-4 border-2 border-green-200">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-green-700">To Export</span>
            <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="text-2xl font-bold text-green-700">{{ exportStats.exportedRows.toLocaleString() }}</div>
        </div>
        
        <div class="bg-red-50 rounded-lg p-4 border-2 border-red-200">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-red-700">To Skip</span>
            <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div class="text-2xl font-bold text-red-700">{{ exportStats.skippedRows.toLocaleString() }}</div>
        </div>
      </div>

      <!-- Export Configuration -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Format Selection -->
        <div class="space-y-3">
          <label class="block text-sm font-semibold text-gray-900">Export Format</label>
          <div class="grid grid-cols-3 gap-3">
            <button
              v-for="format in ['csv', 'json', 'txt'] as ExportFormat[]"
              :key="format"
              class="relative px-4 py-4 rounded-xl border-2 transition-all duration-200 font-medium text-sm group"
              :class="exportOptions.format === format
                ? 'border-green-500 bg-green-50 shadow-md scale-105'
                : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50 hover:shadow-sm'"
              @click="exportOptions.format = format"
            >
              <div class="flex flex-col items-center gap-2">
                <span class="text-2xl">{{ formatIcons[format] }}</span>
                <span :class="exportOptions.format === format ? 'text-green-700' : 'text-gray-700'">
                  {{ format.toUpperCase() }}
                </span>
              </div>
              <div
                v-if="exportOptions.format === format"
                class="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
              >
                <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        <!-- Filter Selection -->
        <div class="space-y-3">
          <label class="block text-sm font-semibold text-gray-900">Data Filter</label>
          <select
            v-model="exportOptions.filter"
            class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm font-medium bg-white transition-all"
          >
            <option value="all">All Rows</option>
            <option value="valid-only">Valid Only</option>
            <option value="valid">Valid (including duplicates)</option>
            <option value="invalid">Invalid Only</option>
            <option value="duplicate">Duplicates Only</option>
          </select>
          <p class="text-xs text-gray-500">
            {{ exportOptions.filter === 'valid-only' ? 'Only validated and clean rows will be exported' : 
               exportOptions.filter === 'all' ? 'All rows including invalid and duplicates' :
               `Only ${exportOptions.filter} rows will be exported` }}
          </p>
        </div>
      </div>
      
      <!-- Advanced Options -->
      <div v-if="showAdvanced" class="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-5 animate-fadeIn">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Advanced Options
          </h3>
          <button
            class="text-xs text-gray-500 hover:text-gray-700"
            @click="showAdvanced = false"
          >
            Hide
          </button>
        </div>

        <!-- Telco Filter -->
        <div v-if="availableTelcos.length > 0">
          <label class="block text-sm font-medium text-gray-700 mb-3">Filter by Telco (Optional)</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="telco in availableTelcos"
              :key="telco"
              class="px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all"
              :class="exportOptions.telcoFilter?.includes(telco)
                ? 'border-green-500 bg-green-500 text-white shadow-md'
                : 'border-gray-300 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50'"
              @click="toggleTelco(telco)"
            >
              {{ telco }}
            </button>
            <button
              v-if="(exportOptions.telcoFilter?.length || 0) > 0"
              class="px-4 py-2 rounded-lg border-2 border-red-300 bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100"
              @click="exportOptions.telcoFilter = []"
            >
              Clear All
            </button>
          </div>
        </div>

        <!-- Column Selection -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <label class="block text-sm font-medium text-gray-700">Select Columns (Optional)</label>
            <div class="flex gap-2">
              <button
                class="text-xs px-2 py-1 bg-primary-50 text-primary-600 hover:bg-primary-100 rounded font-medium transition-colors"
                @click="selectAllColumns"
              >
                Select All
              </button>
              <button
                class="text-xs px-2 py-1 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded font-medium transition-colors"
                @click="clearColumnSelection"
              >
                Clear
              </button>
            </div>
          </div>
          <div class="max-h-40 overflow-y-auto bg-white rounded-lg p-3 border border-gray-200">
            <div class="flex flex-wrap gap-2">
              <button
                v-for="column in csvStore.headers"
                :key="column"
                class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all border-2"
                :class="exportOptions.selectedColumns?.includes(column)
                  ? 'bg-green-500 text-white border-green-600 shadow-sm'
                  : 'bg-gray-50 text-gray-700 border-gray-300 hover:border-green-300 hover:bg-green-50'"
                @click="toggleColumn(column)"
              >
                {{ column }}
              </button>
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-2">
            <span class="font-medium">{{ exportOptions.selectedColumns?.length || 0 }}</span> of 
            <span class="font-medium">{{ csvStore.headers.length }}</span> columns selected
            <span v-if="(exportOptions.selectedColumns?.length || 0) === 0" class="text-gray-400 ml-1">(All columns will be exported)</span>
          </p>
        </div>

        <!-- Include Headers -->
        <div class="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
          <input
            v-model="exportOptions.includeHeaders"
            type="checkbox"
            class="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
          >
          <label class="text-sm text-gray-700 font-medium">Include column headers in export</label>
        </div>
      </div>
      
      <!-- Export Actions -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4 border-t border-gray-200">
        <UiButton
          variant="success"
          :disabled="csvStore.rows.length === 0 || exportStats.exportedRows === 0 || exporter.isExporting.value"
          class="flex-1 py-4 text-lg font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
          @click="handleExport"
        >
          <svg v-if="!exporter.isExporting.value" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <svg v-else class="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{{ exporter.isExporting.value ? 'Exporting...' : 'Download Cleaned Data' }}</span>
        </UiButton>
        
        <UiButton
          variant="outline"
          title="Preview export"
          class="py-4 px-6 border-2 flex items-center justify-center gap-2 sm:h-auto"
          @click="showPreview = !showPreview"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span>{{ showPreview ? 'Hide' : 'Preview' }}</span>
        </UiButton>
      </div>
      
      <!-- Progress Bar -->
      <div v-if="exporter.isExporting.value" class="space-y-2">
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-600 font-medium">Exporting data...</span>
          <span class="text-gray-500">{{ exporter.exportProgress.value }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
          <div
            class="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
            :style="{ width: `${exporter.exportProgress.value}%` }"
          >
            <div class="w-2 h-2 bg-white rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      <!-- Success Message -->
      <div v-if="exportSuccess" class="animate-fadeIn">
        <UiAlert variant="success">
          <div class="flex items-center gap-3">
            <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <div class="font-semibold text-sm">Export Successful!</div>
              <div class="text-sm mt-1">
                Successfully exported <strong>{{ exportStats.exportedRows.toLocaleString() }}</strong> rows as 
                <strong>{{ exportOptions.format?.toUpperCase() }}</strong> format.
              </div>
            </div>
          </div>
        </UiAlert>
      </div>

      <!-- Error Message -->
      <div v-if="exportError" class="animate-fadeIn">
        <UiAlert variant="error">
          <div class="flex items-center gap-3">
            <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="font-medium text-sm">{{ exportError }}</div>
          </div>
        </UiAlert>
      </div>
      
      <!-- Preview -->
      <div v-if="showPreview" class="border-t border-gray-200 pt-5 animate-fadeIn">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Export Preview (first 5 rows)
          </h3>
          <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{{ exportOptions.format?.toUpperCase() }} format</span>
        </div>
        <div class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto max-h-64 border-2 border-gray-700">
          <pre class="text-xs font-mono leading-relaxed">{{ previewData }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
</style>
