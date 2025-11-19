<script setup lang="ts">
import type { CsvRow } from '~/types'

const csvStore = useCsvStore()
const editingRow = ref<number | null>(null)

// Filter state
const statusFilter = ref<'all' | 'valid' | 'invalid' | 'duplicate'>('all')
const telcoFilter = ref<string[]>([])
const searchQuery = ref('')
const showFilters = ref(false)
const selectedRows = ref<Set<number>>(new Set())

// Pagination state
const currentPage = ref(1)
const pageSize = ref(50)
const pageSizeOptions = [25, 50, 100, 250, 500]

// Available telcos
const availableTelcos = computed(() => {
  const telcos = new Set<string>()
  csvStore.rows.forEach(row => {
    if (row._telco && typeof row._telco === 'string') {
      telcos.add(row._telco)
    }
  })
  return Array.from(telcos).sort()
})

// Filtered rows
const filteredRows = computed(() => {
  let rows = [...csvStore.rows]

  // Status filter
  if (statusFilter.value !== 'all') {
    rows = rows.filter(row => row._status === statusFilter.value)
  }

  // Telco filter
  if (telcoFilter.value.length > 0) {
    rows = rows.filter(row => {
      const telco = row._telco as string
      return telco && telcoFilter.value.includes(telco)
    })
  }

  // Search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    rows = rows.filter(row => {
      // Search in all string/number fields
      return csvStore.headers.some(header => {
        const value = String(row[header] || '').toLowerCase()
        return value.includes(query)
      }) || 
      // Also search in phone number with telco
      (row._telco && String(row._telco).toLowerCase().includes(query))
    })
  }

  return rows
})

// Computed pagination values
const totalPages = computed(() => Math.ceil(filteredRows.value.length / pageSize.value))
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
const endIndex = computed(() => Math.min(startIndex.value + pageSize.value, filteredRows.value.length))

// Paginated rows
const paginatedRows = computed(() => {
  return filteredRows.value.slice(startIndex.value, endIndex.value)
})

// Filter stats
const filterStats = computed(() => {
  return {
    total: csvStore.rows.length,
    filtered: filteredRows.value.length,
    showing: paginatedRows.value.length
  }
})

// Pagination controls
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const changePageSize = () => {
  currentPage.value = 1
}

// Watch for filter changes and reset to first page
watch([statusFilter, telcoFilter, searchQuery], () => {
  currentPage.value = 1
})

watch(() => filteredRows.value.length, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = 1
  }
})

// Toggle telco filter
const toggleTelco = (telco: string) => {
  const index = telcoFilter.value.indexOf(telco)
  if (index > -1) {
    telcoFilter.value.splice(index, 1)
  } else {
    telcoFilter.value.push(telco)
  }
}

// Clear all filters
const clearFilters = () => {
  statusFilter.value = 'all'
  telcoFilter.value = []
  searchQuery.value = ''
}

// Row selection
const toggleRowSelection = (id: number) => {
  if (selectedRows.value.has(id)) {
    selectedRows.value.delete(id)
  } else {
    selectedRows.value.add(id)
  }
}

const selectAll = () => {
  if (selectedRows.value.size === paginatedRows.value.length) {
    selectedRows.value.clear()
  } else {
    paginatedRows.value.forEach(row => {
      if (row._id) selectedRows.value.add(row._id)
    })
  }
}

const deleteSelected = () => {
  if (selectedRows.value.size === 0) return
  if (confirm(`Are you sure you want to delete ${selectedRows.value.size} row(s)?`)) {
    selectedRows.value.forEach(id => csvStore.deleteRow(id))
    selectedRows.value.clear()
  }
}

const getRowClass = (row: CsvRow) => {
  const baseClass = selectedRows.value.has(row._id!) 
    ? 'ring-2 ring-blue-500 ring-offset-2' 
    : ''
  
  switch (row._status) {
    case 'valid':
      return `${baseClass} bg-green-50 hover:bg-green-100`
    case 'invalid':
      return `${baseClass} bg-red-50 hover:bg-red-100`
    case 'duplicate':
      return `${baseClass} bg-yellow-50 hover:bg-yellow-100`
    default:
      return `${baseClass} hover:bg-gray-50`
  }
}

const getStatusVariant = (status?: string) => {
  switch (status) {
    case 'valid':
      return 'success'
    case 'invalid':
      return 'error'
    case 'duplicate':
      return 'warning'
    default:
      return 'gray'
  }
}

const startEdit = (id: number) => {
  editingRow.value = id
}

const saveEdit = (row: CsvRow) => {
  editingRow.value = null
  csvStore.updateRow(row._id!, row)
}

const deleteRow = (id: number) => {
  if (confirm('Are you sure you want to delete this row?')) {
    csvStore.deleteRow(id)
    selectedRows.value.delete(id)
  }
}

const sortByPackage = () => {
  csvStore.sortBy('package', false)
}
</script>

<template>
  <div class="space-y-4">
    <!-- Table Controls -->
    <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <!-- Header & Stats -->
        <div class="flex items-center gap-4">
          <h2 class="text-lg font-semibold text-gray-900">Data Preview</h2>
          <UiBadge variant="gray">
            {{ filterStats.filtered.toLocaleString() }} / {{ filterStats.total.toLocaleString() }} rows
          </UiBadge>
          <div class="text-sm text-gray-500">
            Showing {{ startIndex + 1 }}-{{ endIndex }} of {{ filterStats.filtered.toLocaleString() }}
          </div>
        </div>
        
        <!-- Controls -->
        <div class="flex items-center gap-2 flex-wrap">
          <!-- Search -->
          <div class="relative flex-1 min-w-[200px]">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent h-9"
            >
            <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <!-- Filter Toggle -->
          <UiButton
            variant="outline"
            size="sm"
            class="h-9 flex items-center justify-center"
            @click="showFilters = !showFilters"
          >
            <svg class="w-4 h-4 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span class="whitespace-nowrap">Filters</span>
            <span v-if="statusFilter !== 'all' || telcoFilter.length > 0" class="ml-1.5 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">
              {{ (statusFilter !== 'all' ? 1 : 0) + telcoFilter.length }}
            </span>
          </UiButton>

          <div class="h-6 w-px bg-gray-300" />
          
          <!-- Page Size -->
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600 whitespace-nowrap">Rows:</label>
            <select
              v-model.number="pageSize"
              class="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent h-9"
              @change="changePageSize"
            >
              <option v-for="size in pageSizeOptions" :key="size" :value="size">
                {{ size }}
              </option>
            </select>
          </div>
          
          <div class="h-6 w-px bg-gray-300" />
          
          <UiButton
            variant="outline"
            size="sm"
            class="h-9 flex items-center justify-center"
            @click="sortByPackage"
          >
            <svg class="w-4 h-4 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            <span class="whitespace-nowrap">Sort by Bundle</span>
          </UiButton>
          
          <UiButton
            variant="outline"
            size="sm"
            class="h-9 flex items-center justify-center"
            @click="csvStore.clear()"
          >
            <span class="whitespace-nowrap">Clear Data</span>
          </UiButton>
        </div>
      </div>

      <!-- Filter Panel -->
      <div v-if="showFilters" class="mt-4 pt-4 border-t border-gray-200 space-y-3 animate-fadeIn">
        <!-- Status Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="status in ['all', 'valid', 'invalid', 'duplicate'] as const"
              :key="status"
              class="px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all capitalize"
              :class="statusFilter === status
                ? 'border-blue-500 bg-blue-500 text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'"
              @click="statusFilter = status"
            >
              {{ status }}
            </button>
          </div>
        </div>

        <!-- Telco Filter -->
        <div v-if="availableTelcos.length > 0">
          <label class="block text-sm font-medium text-gray-700 mb-2">Telco</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="telco in availableTelcos"
              :key="telco"
              class="px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all"
              :class="telcoFilter.includes(telco)
                ? 'border-green-500 bg-green-500 text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:border-green-300'"
              @click="toggleTelco(telco)"
            >
              {{ telco }}
            </button>
          </div>
        </div>

        <!-- Clear Filters -->
        <div v-if="statusFilter !== 'all' || telcoFilter.length > 0 || searchQuery" class="pt-2">
          <button
            class="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
            @click="clearFilters"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear all filters
          </button>
        </div>
      </div>

      <!-- Bulk Actions -->
      <div v-if="selectedRows.size > 0" class="mt-4 pt-4 border-t border-gray-200 flex items-center gap-3 animate-fadeIn">
        <span class="text-sm font-medium text-gray-700">
          {{ selectedRows.size }} row(s) selected
        </span>
        <UiButton
          variant="danger"
          size="sm"
          @click="deleteSelected"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete Selected
        </UiButton>
        <button
          class="text-sm text-gray-600 hover:text-gray-700"
          @click="selectedRows.clear()"
        >
          Clear selection
        </button>
      </div>
    </div>
    
    <!-- Table Container -->
    <div class="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th class="px-4 py-3 text-left w-12">
                <input
                  type="checkbox"
                  :checked="selectedRows.size === paginatedRows.length && paginatedRows.length > 0"
                  :indeterminate="selectedRows.size > 0 && selectedRows.size < paginatedRows.length"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  @change="selectAll"
                >
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                Status
              </th>
              <th
                v-for="header in csvStore.headers"
                :key="header"
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]"
              >
                {{ header }}
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="row in paginatedRows"
              :key="row._id"
              :class="getRowClass(row)"
              class="transition-colors duration-150 hover:bg-opacity-80"
            >
              <!-- Checkbox Column -->
              <td class="px-4 py-3">
                <input
                  type="checkbox"
                  :checked="selectedRows.has(row._id!)"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  @change="toggleRowSelection(row._id!)"
                >
              </td>

              <!-- Status Column -->
              <td class="px-4 py-3">
                <UiBadge :variant="getStatusVariant(row._status)">
                  {{ row._status || 'pending' }}
                </UiBadge>
              </td>
              
              <!-- Data Columns -->
              <td
                v-for="header in csvStore.headers"
                :key="header"
                class="px-4 py-3 text-sm"
              >
                <!-- Editable cell for phone column -->
                <div v-if="header === csvStore.phoneColumn" class="min-w-[150px]">
                  <input
                    v-if="editingRow === row._id"
                    v-model="row[header]"
                    class="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    autofocus
                    @blur="saveEdit(row)"
                    @keyup.enter="saveEdit(row)"
                  >
                  <div
                    v-else
                    class="cursor-pointer hover:bg-gray-50 px-2 py-1 rounded -mx-2 -my-1"
                    :class="{ 'text-red-600 font-medium': row._status === 'invalid' }"
                    @dblclick="startEdit(row._id!)"
                  >
                    <span class="break-words">{{ row[header] || '-' }}</span>
                    
                    <!-- Telco indicator -->
                    <span
                      v-if="row._telco && row._status === 'valid'"
                      class="ml-2 text-xs font-medium whitespace-nowrap"
                      :class="{
                        'text-green-600': row._telco === 'Safaricom',
                        'text-red-600': row._telco === 'Airtel',
                        'text-blue-600': row._telco === 'Telkom'
                      }"
                    >
                      ({{ row._telco }})
                    </span>
                  </div>
                  
                  <!-- Error message -->
                  <div
                    v-if="row._errors && row._errors.length > 0"
                    class="text-xs text-red-600 mt-1 break-words"
                  >
                    {{ row._errors[0]?.message }}
                  </div>
                </div>
                
                <!-- Regular cell -->
                <div v-else class="text-gray-900 break-words min-w-[100px]">
                  {{ row[header] || '-' }}
                </div>
              </td>
              
              <!-- Actions Column -->
              <td class="px-4 py-3">
                <button
                  class="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50 inline-flex items-center justify-center"
                  title="Delete row"
                  @click="deleteRow(row._id!)"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Empty State -->
      <div v-if="paginatedRows.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No data to display</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ filteredRows.length === 0 && csvStore.rows.length > 0 
            ? 'No rows match your current filters' 
            : 'Upload a CSV file to get started' }}
        </p>
      </div>
    </div>
    
    <!-- Pagination Controls -->
    <div v-if="totalPages > 1" class="bg-white rounded-lg border border-gray-200 shadow-sm px-4 py-3">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-700">
            Page <span class="font-semibold">{{ currentPage }}</span> of <span class="font-semibold">{{ totalPages }}</span>
          </span>
        </div>
        
        <div class="flex items-center gap-2">
          <!-- Previous Button -->
          <button
            :disabled="currentPage === 1"
            class="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :class="currentPage === 1 
              ? 'bg-gray-100 text-gray-400' 
              : 'bg-white text-gray-700 hover:bg-gray-50'"
            @click="prevPage"
          >
            ← Previous
          </button>
          
          <!-- Page Numbers -->
          <div class="hidden sm:flex items-center gap-1">
            <!-- First page -->
            <button
              v-if="currentPage > 3"
              class="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium bg-white text-gray-700 hover:bg-gray-50"
              @click="goToPage(1)"
            >
              1
            </button>
            <span v-if="currentPage > 4" class="text-gray-400 px-1">...</span>
            
            <!-- Pages around current -->
            <button
              v-for="page in [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2]"
              v-show="page > 0 && page <= totalPages"
              :key="page"
              class="px-3 py-1.5 border rounded text-sm font-medium transition-colors"
              :class="page === currentPage 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
            
            <!-- Last page -->
            <span v-if="currentPage < totalPages - 3" class="text-gray-400 px-1">...</span>
            <button
              v-if="currentPage < totalPages - 2"
              class="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium bg-white text-gray-700 hover:bg-gray-50"
              @click="goToPage(totalPages)"
            >
              {{ totalPages }}
            </button>
          </div>
          
          <!-- Next Button -->
          <button
            :disabled="currentPage === totalPages"
            class="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :class="currentPage === totalPages 
              ? 'bg-gray-100 text-gray-400' 
              : 'bg-white text-gray-700 hover:bg-gray-50'"
            @click="nextPage"
          >
            Next →
          </button>
        </div>
        
        <!-- Go to page input -->
        <div class="hidden md:flex items-center gap-2">
          <label class="text-sm text-gray-600">Go to:</label>
          <input
            type="number"
            min="1"
            :max="totalPages"
            :value="currentPage"
            class="w-16 px-2 py-1.5 border border-gray-300 rounded text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @change="(e) => goToPage(parseInt((e.target as HTMLInputElement).value))"
          >
        </div>
      </div>
    </div>
    
    <!-- Hint -->
    <div class="text-sm text-gray-500 italic flex items-center gap-2">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Double-click on a phone number to edit it
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
