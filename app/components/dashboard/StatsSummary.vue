<script setup lang="ts">
const csvStore = useCsvStore()

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
    <h2 class="text-lg font-semibold text-gray-900 mb-4">Data Summary</h2>
    
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
      <!-- Total Records -->
      <div class="text-center p-4 bg-gray-50 rounded-lg">
        <div class="text-3xl font-bold text-gray-900">
          {{ csvStore.stats.total }}
        </div>
        <div class="text-sm text-gray-600 mt-1">Total Records</div>
      </div>
      
      <!-- Valid Records -->
      <div class="text-center p-4 bg-green-50 rounded-lg">
        <div class="text-3xl font-bold text-green-600">
          {{ csvStore.stats.valid }}
        </div>
        <div class="text-sm text-green-700 mt-1">Valid</div>
      </div>
      
      <!-- Invalid Records -->
      <div class="text-center p-4 bg-red-50 rounded-lg">
        <div class="text-3xl font-bold text-red-600">
          {{ csvStore.stats.invalid }}
        </div>
        <div class="text-sm text-red-700 mt-1">Invalid</div>
      </div>
      
      <!-- Duplicates -->
      <div class="text-center p-4 bg-yellow-50 rounded-lg">
        <div class="text-3xl font-bold text-yellow-600">
          {{ csvStore.stats.duplicates }}
        </div>
        <div class="text-sm text-yellow-700 mt-1">Duplicates</div>
      </div>
      
      <!-- Success Rate -->
      <div class="text-center p-4 bg-blue-50 rounded-lg">
        <div class="text-3xl font-bold text-blue-600">
          {{ csvStore.validationPercentage }}%
        </div>
        <div class="text-sm text-blue-700 mt-1">Success Rate</div>
      </div>
    </div>
    
    <!-- File Info -->
    <div v-if="csvStore.file" class="mt-4 pt-4 border-t border-gray-200">
      <div class="flex items-center justify-between text-sm text-gray-600">
        <div class="flex items-center space-x-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span class="font-medium">{{ csvStore.file.name }}</span>
        </div>
        <div>
          {{ formatFileSize(csvStore.file.size) }}
        </div>
      </div>
    </div>
    
    <!-- Warnings/Alerts -->
    <div v-if="csvStore.stats.invalid > 0" class="mt-4">
      <UiAlert variant="warning">
        <div class="text-sm">
          <strong>{{ csvStore.stats.invalid }}</strong> rows have validation errors. 
          Please review and correct them before exporting.
        </div>
      </UiAlert>
    </div>
    
    <div v-if="csvStore.stats.duplicates > 0" class="mt-4">
      <UiAlert variant="info">
        <div class="text-sm">
          <strong>{{ csvStore.stats.duplicates }}</strong> duplicate phone numbers detected. 
          These will be marked in the table.
        </div>
      </UiAlert>
    </div>
    
    <div v-if="csvStore.stats.valid === csvStore.stats.total" class="mt-4">
      <UiAlert variant="success">
        <div class="text-sm">
          All records are valid! Your data is ready to export.
        </div>
      </UiAlert>
    </div>
  </div>
</template>

