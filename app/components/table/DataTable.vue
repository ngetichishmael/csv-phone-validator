<script setup lang="ts">
import type { CsvRow } from '~/types'

const csvStore = useCsvStore()
const editingRow = ref<number | null>(null)

// Pagination state
const currentPage = ref(1)
const pageSize = ref(50)
const pageSizeOptions = [25, 50, 100, 250, 500]

// Computed pagination values
const totalPages = computed(() => Math.ceil(csvStore.rows.length / pageSize.value))
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
const endIndex = computed(() => Math.min(startIndex.value + pageSize.value, csvStore.rows.length))

// Paginated rows
const paginatedRows = computed(() => {
  return csvStore.rows.slice(startIndex.value, endIndex.value)
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
  // Reset to first page when changing page size
  currentPage.value = 1
}

// Watch for data changes and reset to first page
watch(() => csvStore.rows.length, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = 1
  }
})

const getRowClass = (row: CsvRow) => {
  switch (row._status) {
    case 'valid':
      return 'bg-green-50 hover:bg-green-100'
    case 'invalid':
      return 'bg-red-50 hover:bg-red-100'
    case 'duplicate':
      return 'bg-yellow-50 hover:bg-yellow-100'
    default:
      return 'hover:bg-gray-50'
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
  // The store will re-validate the row
  csvStore.updateRow(row._id!, row)
}

const deleteRow = (id: number) => {
  if (confirm('Are you sure you want to delete this row?')) {
    csvStore.deleteRow(id)
  }
}

const sortByPackage = () => {
  // Sort by package column (descending - largest first)
  csvStore.sortBy('package', false)
}
</script>

<template>
  <div class="space-y-4">
    <!-- Table Controls -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <h2 class="text-lg font-semibold text-gray-900">
          Data Preview
        </h2>
        <UiBadge variant="gray">
          {{ csvStore.rows.length }} rows
        </UiBadge>
        <div class="text-sm text-gray-500">
          Showing {{ startIndex + 1 }}-{{ endIndex }} of {{ csvStore.rows.length }}
        </div>
      </div>
      
      <div class="flex items-center space-x-2">
        <!-- Page Size Selector -->
        <div class="flex items-center space-x-2">
          <label class="text-sm text-gray-600">Rows per page:</label>
          <select
            v-model.number="pageSize"
            class="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          @click="sortByPackage"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
          </svg>
          Sort by Bundle
        </UiButton>
        
        <UiButton
          variant="outline"
          size="sm"
          @click="csvStore.clear()"
        >
          Clear Data
        </UiButton>
      </div>
    </div>
    
    <!-- Table Container -->
    <div class="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th
              v-for="header in csvStore.headers"
              :key="header"
              class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {{ header }}
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="row in paginatedRows"
            :key="row._id"
            :class="getRowClass(row)"
            class="transition-colors duration-150"
          >
            <!-- Status Column -->
            <td class="px-4 py-3 whitespace-nowrap">
              <UiBadge :variant="getStatusVariant(row._status)">
                {{ row._status }}
              </UiBadge>
            </td>
            
            <!-- Data Columns -->
            <td
              v-for="header in csvStore.headers"
              :key="header"
              class="px-4 py-3 whitespace-nowrap text-sm"
            >
              <!-- Editable cell for phone column -->
              <div v-if="header === csvStore.phoneColumn">
                <input
                  v-if="editingRow === row._id"
                  v-model="row[header]"
                  class="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autofocus
                  @blur="saveEdit(row)"
                  @keyup.enter="saveEdit(row)"
                >
                <div
                  v-else
                  class="cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
                  :class="{ 'text-red-600 font-medium': row._status === 'invalid' }"
                  @dblclick="startEdit(row._id!)"
                >
                  {{ row[header] }}
                  
                  <!-- Telco indicator -->
                  <span
                    v-if="row._telco && row._status === 'valid'"
                    class="ml-2 text-xs"
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
                  class="text-xs text-red-600 mt-1"
                >
                  {{ row._errors[0].message }}
                </div>
              </div>
              
              <!-- Regular cell -->
              <div v-else class="text-gray-900">
                {{ row[header] }}
              </div>
            </td>
            
            <!-- Actions Column -->
            <td class="px-4 py-3 whitespace-nowrap text-sm">
              <button
                class="text-red-600 hover:text-red-800 transition-colors"
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
    
    <!-- Pagination Controls -->
    <div v-if="totalPages > 1" class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 rounded-b-lg">
      <div class="flex items-center space-x-2">
        <span class="text-sm text-gray-700">
          Page <span class="font-semibold">{{ currentPage }}</span> of <span class="font-semibold">{{ totalPages }}</span>
        </span>
      </div>
      
      <div class="flex items-center space-x-2">
        <!-- Previous Button -->
        <button
          :disabled="currentPage === 1"
          class="px-3 py-1 border border-gray-300 rounded text-sm font-medium transition-colors"
          :class="currentPage === 1 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-white text-gray-700 hover:bg-gray-50'"
          @click="prevPage"
        >
          ← Previous
        </button>
        
        <!-- Page Numbers -->
        <div class="hidden sm:flex items-center space-x-1">
          <!-- First page -->
          <button
            v-if="currentPage > 3"
            class="px-3 py-1 border border-gray-300 rounded text-sm font-medium bg-white text-gray-700 hover:bg-gray-50"
            @click="goToPage(1)"
          >
            1
          </button>
          <span v-if="currentPage > 4" class="text-gray-400">...</span>
          
          <!-- Pages around current -->
          <button
            v-for="page in [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2]"
            v-show="page > 0 && page <= totalPages"
            :key="page"
            class="px-3 py-1 border rounded text-sm font-medium transition-colors"
            :class="page === currentPage 
              ? 'bg-blue-600 text-white border-blue-600' 
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
          
          <!-- Last page -->
          <span v-if="currentPage < totalPages - 3" class="text-gray-400">...</span>
          <button
            v-if="currentPage < totalPages - 2"
            class="px-3 py-1 border border-gray-300 rounded text-sm font-medium bg-white text-gray-700 hover:bg-gray-50"
            @click="goToPage(totalPages)"
          >
            {{ totalPages }}
          </button>
        </div>
        
        <!-- Next Button -->
        <button
          :disabled="currentPage === totalPages"
          class="px-3 py-1 border border-gray-300 rounded text-sm font-medium transition-colors"
          :class="currentPage === totalPages 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-white text-gray-700 hover:bg-gray-50'"
          @click="nextPage"
        >
          Next →
        </button>
      </div>
      
      <!-- Go to page input -->
      <div class="hidden md:flex items-center space-x-2">
        <label class="text-sm text-gray-600">Go to:</label>
        <input
          type="number"
          min="1"
          :max="totalPages"
          :value="currentPage"
          class="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          @change="(e) => goToPage(parseInt((e.target as HTMLInputElement).value))"
        >
      </div>
    </div>
    
    <!-- Hint -->
    <div class="text-sm text-gray-500 italic">
      💡 Double-click on a phone number to edit it
    </div>
  </div>
</template>

