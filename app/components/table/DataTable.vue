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
      </div>
      
      <div class="flex items-center space-x-2">
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
            v-for="row in csvStore.rows"
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
                  @blur="saveEdit(row)"
                  @keyup.enter="saveEdit(row)"
                  class="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autofocus
                />
                <div
                  v-else
                  @dblclick="startEdit(row._id!)"
                  class="cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
                  :class="{ 'text-red-600 font-medium': row._status === 'invalid' }"
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
                @click="deleteRow(row._id!)"
                class="text-red-600 hover:text-red-800 transition-colors"
                title="Delete row"
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
    
    <!-- Hint -->
    <div class="text-sm text-gray-500 italic">
      💡 Double-click on a phone number to edit it
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CsvRow } from '~/types'

const csvStore = useCsvStore()
const editingRow = ref<number | null>(null)

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

