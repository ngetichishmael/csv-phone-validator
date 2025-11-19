<script setup lang="ts">
const csvStore = useCsvStore()

const showBalanceInput = ref(false)
const availableBalance = ref('')

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const formatNumber = (num: number): string => {
  return num.toLocaleString()
}

const handleBalanceInput = () => {
  const units = parseFloat(availableBalance.value)
  if (!isNaN(units) && units >= 0) {
    csvStore.setAvailableBalance(units)
  }
}

const toggleBalanceInput = () => {
  showBalanceInput.value = !showBalanceInput.value
}

// Calculate success rate with better formatting
const successRate = computed(() => {
  return csvStore.validationPercentage
})

// Get stats with icons
const statCards = computed(() => [
  {
    label: 'Total Records',
    value: csvStore.stats.total,
    icon: '📊',
    color: 'gray',
    bg: 'bg-gray-50',
    text: 'text-gray-900',
    border: 'border-gray-200'
  },
  {
    label: 'Valid',
    value: csvStore.stats.valid,
    icon: '✓',
    color: 'green',
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200'
  },
  {
    label: 'Invalid',
    value: csvStore.stats.invalid,
    icon: '✗',
    color: 'red',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200'
  },
  {
    label: 'Duplicates',
    value: csvStore.stats.duplicates,
    icon: '⚠',
    color: 'yellow',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200'
  },
  {
    label: 'Success Rate',
    value: `${successRate.value}%`,
    icon: '📈',
    color: 'blue',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200'
  }
])
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-lg p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
        <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Data Summary
      </h2>
    </div>
    
    <!-- Stats Grid -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
      <div
        v-for="stat in statCards"
        :key="stat.label"
        class="text-center p-5 rounded-xl border-2 transition-all duration-200 hover:shadow-md hover:scale-105"
        :class="[stat.bg, stat.border]"
      >
        <div class="text-4xl mb-2">{{ stat.icon }}</div>
        <div class="text-3xl font-bold mb-1" :class="stat.text">
          {{ stat.value }}
        </div>
        <div class="text-sm font-medium" :class="stat.text + '/80'">
          {{ stat.label }}
        </div>
      </div>
    </div>
    
    <!-- File Info -->
    <div v-if="csvStore.file" class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-white rounded-lg shadow-sm">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <div class="font-semibold text-gray-900">{{ csvStore.file.name }}</div>
            <div class="text-sm text-gray-600">{{ formatFileSize(csvStore.file.size) }}</div>
          </div>
        </div>
        <div class="text-xs text-gray-500">
          Uploaded {{ new Date(csvStore.file.uploadedAt).toLocaleDateString() }}
        </div>
      </div>
    </div>
    
    <!-- Warnings/Alerts -->
    <div class="space-y-3">
      <div v-if="csvStore.stats.invalid > 0" class="animate-fadeIn">
        <UiAlert variant="warning">
          <div class="flex items-start gap-2">
            <svg class="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div class="text-sm">
              <strong>{{ formatNumber(csvStore.stats.invalid) }}</strong> rows have validation errors. 
              Please review and correct them before exporting.
            </div>
          </div>
        </UiAlert>
      </div>
      
      <div v-if="csvStore.stats.duplicates > 0" class="animate-fadeIn">
        <UiAlert variant="info">
          <div class="flex items-start gap-2">
            <svg class="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="text-sm">
              <strong>{{ formatNumber(csvStore.stats.duplicates) }}</strong> duplicate phone numbers detected. 
              These will be marked in the table.
            </div>
          </div>
        </UiAlert>
      </div>
      
      <div v-if="csvStore.stats.valid === csvStore.stats.total && csvStore.stats.total > 0" class="animate-fadeIn">
        <UiAlert variant="success">
          <div class="flex items-start gap-2">
            <svg class="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="text-sm font-medium">
              All records are valid! Your data is ready to export.
            </div>
          </div>
        </UiAlert>
      </div>
    </div>
    
    <!-- Balance Check Section -->
    <div class="border-t border-gray-200 pt-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-semibold text-gray-900 flex items-center gap-2">
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
           Mocked Balance Analysis
        </h3>
        <button
          class="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
          @click="toggleBalanceInput"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {{ showBalanceInput ? 'Hide' : 'Check Balance' }}
        </button>
      </div>
      
      <!-- Balance Input -->
      <div v-if="showBalanceInput" class="space-y-4 animate-fadeIn">
        <div class="flex items-center gap-3">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Available Units</label>
            <input
              v-model="availableBalance"
              type="number"
              min="0"
              step="1"
              placeholder="Enter available units"
              class="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              @input="handleBalanceInput"
            >
          </div>
          <UiButton
            variant="primary"
            size="md"
            class="mt-6"
            @click="handleBalanceInput"
          >
            Check
          </UiButton>
        </div>
        
        <!-- Balance Display -->
        <div class="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-lg border border-gray-200 space-y-3">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600 font-medium">Available Units:</span>
            <span class="font-bold text-lg text-gray-900">
              {{ formatNumber(csvStore.balance.availableUnits) }}
            </span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600 font-medium">Required Units:</span>
            <span class="font-bold text-lg text-gray-900">
              {{ formatNumber(csvStore.balance.requiredUnits) }}
            </span>
          </div>
          <div class="flex items-center justify-between text-sm pt-3 border-t-2 border-gray-300">
            <span class="text-gray-700 font-semibold">Remaining:</span>
            <span 
              class="font-bold text-xl"
              :class="csvStore.balance.isInsufficient ? 'text-red-600' : 'text-green-600'"
            >
              {{ formatNumber(csvStore.balance.availableUnits - csvStore.balance.requiredUnits) }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Insufficient Balance Warning -->
      <div v-if="csvStore.balance.isInsufficient" class="mt-4 animate-fadeIn">
        <UiAlert variant="error">
          <div class="flex items-start gap-2">
            <svg class="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div class="text-sm">
              <strong>⚠️ Insufficient Balance!</strong>
              <br>
              You need <strong>{{ formatNumber(csvStore.balance.requiredUnits - csvStore.balance.availableUnits) }}</strong> 
              more units to complete this upload.
            </div>
          </div>
        </UiAlert>
      </div>
      
      <!-- Sufficient Balance Message -->
      <div v-if="!csvStore.balance.isInsufficient && csvStore.balance.availableUnits > 0 && csvStore.balance.requiredUnits > 0" class="mt-4 animate-fadeIn">
        <UiAlert variant="success">
          <div class="flex items-start gap-2">
            <svg class="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="text-sm font-medium">
              ✓ Sufficient balance available for upload!
            </div>
          </div>
        </UiAlert>
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
