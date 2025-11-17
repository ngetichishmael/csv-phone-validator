<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">
              CSV Data Cleaner
            </h1>
            <p class="text-sm text-gray-500 mt-1">
              Validate, clean, and format your CSV data with ease
            </p>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-600">by <span class="font-semibold">Ish</span></p>
          </div>
        </div>
      </div>
    </header>
    
    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Upload Zone (shown when no data) -->
      <div v-if="!csvStore.hasData" class="flex items-center justify-center min-h-[60vh]">
        <UploadZone @uploaded="handleFileUpload" />
      </div>
      
      <!-- Data View (shown when data is loaded) -->
      <div v-else class="space-y-6">
        <!-- Stats Summary -->
        <DashboardStatsSummary />
        
        <!-- Data Table -->
        <TableDataTable />
        
        <!-- Export Controls -->
        <ExportControls />
      </div>
    </main>
    
    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <p class="text-center text-sm text-gray-500">
          Peak Hackathon Project - Smart CSV Data Cleaner
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const csvStore = useCsvStore()

const handleFileUpload = (file: File) => {
  console.log('File uploaded:', file.name)
}
</script>
