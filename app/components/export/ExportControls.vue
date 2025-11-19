<script setup lang="ts">
import type { ExportOptions, ExportFormat, ExportFilter } from '~/composables/useDataExport'

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
</script>

<template>
  <div class="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 rounded-xl border-2 border-green-200 shadow-xl p-6 transition-all duration-300 hover:shadow-2xl">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <svg class="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export Cleaned Data
        </h2>
        <p class="text-sm text-gray-600 mt-1">Configure and download your cleaned data</p>
      </div>
      <div class="flex items-center gap-2">
        <div class="text-xs text-gray-600 bg-white px-3 py-1.5 rounded-full border border-green-200 shadow-sm">
          <span class="font-semibold text-green-600">{{ exportStats.exportedRows }}</span> rows ready
        </div>
        <button
          class="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          @click="showAdvanced = !showAdvanced"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </button>
      </div>
    </div>
    
    <div class="space-y-5">
      <!-- Basic Export Options -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Format Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
          <div class="flex gap-2">
            <button
              v-for="format in ['csv', 'json', 'txt'] as ExportFormat[]"
              :key="format"
              class="flex-1 px-4 py-2 rounded-lg border-2 transition-all font-medium text-sm"
              :class="exportOptions.format === format
                ? 'border-green-500 bg-green-500 text-white shadow-md'
                : 'border-gray-300 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50'"
              @click="exportOptions.format = format"
            >
              {{ format.toUpperCase() }}
            </button>
          </div>
        </div>

        <!-- Filter Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Data Filter</label>
          <select
            v-model="exportOptions.filter"
            class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm font-medium"
          >
            <option value="all">All Rows</option>
            <option value="valid-only">Valid Only</option>
            <option value="valid">Valid (including duplicates)</option>
            <option value="invalid">Invalid Only</option>
            <option value="duplicate">Duplicates Only</option>
          </select>
        </div>
      </div>

      <!-- Advanced Options -->
      <div v-if="showAdvanced" class="bg-white/60 rounded-lg p-4 border border-gray-200 space-y-4 animate-fadeIn">
        <!-- Telco Filter -->
        <div v-if="availableTelcos.length > 0">
          <label class="block text-sm font-medium text-gray-700 mb-2">Filter by Telco (Optional)</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="telco in availableTelcos"
              :key="telco"
              class="px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all"
              :class="exportOptions.telcoFilter?.includes(telco)
                ? 'border-green-500 bg-green-500 text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:border-green-300'"
              @click="toggleTelco(telco)"
            >
              {{ telco }}
            </button>
            <button
              v-if="(exportOptions.telcoFilter?.length || 0) > 0"
              class="px-3 py-1.5 rounded-lg border-2 border-red-300 bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100"
              @click="exportOptions.telcoFilter = []"
            >
              Clear
            </button>
          </div>
        </div>

        <!-- Column Selection -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="block text-sm font-medium text-gray-700">Select Columns (Optional)</label>
            <div class="flex gap-2">
              <button
                class="text-xs text-blue-600 hover:text-blue-700 font-medium"
                @click="selectAllColumns"
              >
                Select All
              </button>
              <button
                class="text-xs text-gray-600 hover:text-gray-700 font-medium"
                @click="clearColumnSelection"
              >
                Clear
              </button>
            </div>
          </div>
          <div class="max-h-32 overflow-y-auto bg-gray-50 rounded-lg p-2 border border-gray-200">
            <div class="flex flex-wrap gap-2">
              <button
                v-for="column in csvStore.headers"
                :key="column"
                class="px-2 py-1 rounded text-xs font-medium transition-all"
                :class="exportOptions.selectedColumns?.includes(column)
                  ? 'bg-green-500 text-white border-2 border-green-600'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-green-300'"
                @click="toggleColumn(column)"
              >
                {{ column }}
              </button>
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-1">
            {{ exportOptions.selectedColumns?.length || 0 }} of {{ csvStore.headers.length }} columns selected
            <span v-if="(exportOptions.selectedColumns?.length || 0) === 0" class="text-gray-400">(All columns will be exported)</span>
          </p>
        </div>

        <!-- Include Headers -->
        <div class="flex items-center space-x-2">
          <input
            v-model="exportOptions.includeHeaders"
            type="checkbox"
            class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
          >
          <label class="text-sm text-gray-700">Include column headers</label>
        </div>
      </div>

      <!-- Export Stats -->
      <div class="bg-white/80 rounded-lg p-4 border border-gray-200">
        <div class="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div class="text-gray-600">Total Rows</div>
            <div class="text-xl font-bold text-gray-900">{{ exportStats.totalRows.toLocaleString() }}</div>
          </div>
          <div>
            <div class="text-gray-600">To Export</div>
            <div class="text-xl font-bold text-green-600">{{ exportStats.exportedRows.toLocaleString() }}</div>
          </div>
          <div>
            <div class="text-gray-600">To Skip</div>
            <div class="text-xl font-bold text-red-600">{{ exportStats.skippedRows.toLocaleString() }}</div>
          </div>
        </div>
      </div>

      <!-- Export Button & Actions -->
      <div class="flex items-center gap-3">
        <UiButton
          variant="success"
          :disabled="csvStore.rows.length === 0 || exportStats.exportedRows === 0 || exporter.isExporting.value"
          class="flex-1 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          @click="handleExport"
        >
          <svg v-if="!exporter.isExporting.value" class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <svg v-else class="w-6 h-6 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {{ exporter.isExporting.value ? 'Exporting...' : 'Download Cleaned Data' }}
        </UiButton>
        
        <UiButton
          variant="outline"
          title="Preview export"
          class="py-4 px-4"
          @click="showPreview = !showPreview"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </UiButton>
      </div>

      <!-- Progress Bar -->
      <div v-if="exporter.isExporting.value" class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          class="bg-green-500 h-2 rounded-full transition-all duration-300"
          :style="{ width: `${exporter.exportProgress.value}%` }"
        />
      </div>

      <!-- Success Message -->
      <div v-if="exportSuccess" class="animate-fadeIn">
        <UiAlert variant="success">
          <div class="text-sm font-medium">
            ✓ Successfully exported <strong>{{ exportStats.exportedRows.toLocaleString() }}</strong> rows as {{ exportOptions.format?.toUpperCase() }}!
          </div>
        </UiAlert>
      </div>

      <!-- Error Message -->
      <div v-if="exportError" class="animate-fadeIn">
        <UiAlert variant="error">
          <div class="text-sm font-medium">{{ exportError }}</div>
        </UiAlert>
      </div>

      <!-- Preview -->
      <div v-if="showPreview" class="mt-4 pt-4 border-t border-gray-200 animate-fadeIn">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-semibold text-gray-900">Export Preview (first 5 rows)</h3>
          <span class="text-xs text-gray-500">{{ exportOptions.format?.toUpperCase() }} format</span>
        </div>
        <div class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto max-h-64">
          <pre class="text-xs font-mono">{{ previewData }}</pre>
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
