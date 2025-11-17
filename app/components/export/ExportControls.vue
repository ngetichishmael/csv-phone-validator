<script setup lang="ts">
const csvStore = useCsvStore()
const exporter = useDataExport()

const onlyValid = ref(true)
const showPreview = ref(false)
const exportSuccess = ref(false)

const exportStats = computed(() => {
  return exporter.getExportStats(csvStore.rows, onlyValid.value)
})

const previewData = computed(() => {
  const preview = exporter.getExportPreview(csvStore.rows, onlyValid.value, 5)
  return JSON.stringify(preview, null, 2)
})

const handleExport = () => {
  const success = csvStore.exportData(onlyValid.value)
  if (success) {
    exportSuccess.value = true
    setTimeout(() => {
      exportSuccess.value = false
    }, 3000)
  }
}
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
    <h2 class="text-lg font-semibold text-gray-900 mb-4">Export Data</h2>
    
    <div class="space-y-4">
      <!-- Export Options -->
      <div class="flex items-center space-x-4">
        <label class="flex items-center space-x-2 cursor-pointer">
          <input
            v-model="onlyValid"
            type="checkbox"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          >
          <span class="text-sm text-gray-700">Export only valid rows</span>
        </label>
      </div>
      
      <!-- Export Stats Preview -->
      <div class="bg-gray-50 p-4 rounded-lg text-sm">
        <div class="flex items-center justify-between mb-2">
          <span class="text-gray-600">Rows to export:</span>
          <span class="font-semibold text-gray-900">
            {{ exportStats.exportedRows }} / {{ exportStats.totalRows }}
          </span>
        </div>
        <div v-if="exportStats.skippedRows > 0" class="flex items-center justify-between text-red-600">
          <span>Rows to skip:</span>
          <span class="font-semibold">{{ exportStats.skippedRows }}</span>
        </div>
      </div>
      
      <!-- Export Button -->
      <div class="flex items-center space-x-3">
        <UiButton
          variant="success"
          :disabled="csvStore.rows.length === 0 || (onlyValid && csvStore.stats.valid === 0)"
          class="flex-1"
          @click="handleExport"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download CSV
        </UiButton>
        
        <UiButton
          variant="outline"
          title="Preview export"
          @click="showPreview = !showPreview"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </UiButton>
      </div>
      
      <!-- Export Success Message -->
      <div v-if="exportSuccess" class="mt-4">
        <UiAlert variant="success">
          <div class="text-sm">
            Successfully exported <strong>{{ exportStats.exportedRows }}</strong> rows!
          </div>
        </UiAlert>
      </div>
      
      <!-- Preview -->
      <div v-if="showPreview" class="mt-4 pt-4 border-t border-gray-200">
        <h3 class="text-sm font-medium text-gray-900 mb-2">Export Preview (first 5 rows)</h3>
        <div class="bg-gray-50 p-3 rounded-lg overflow-x-auto">
          <pre class="text-xs text-gray-700">{{ previewData }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

