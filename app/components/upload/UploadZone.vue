<script setup lang="ts">
const csvStore = useCsvStore()

const isDragging = ref(false)
const isUploading = ref(false)
const errorMessage = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const emit = defineEmits<{
  uploaded: [file: File]
}>()

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    await processFile(file)
  }
}

const handleDrop = async (event: DragEvent) => {
  isDragging.value = false
  
  const file = event.dataTransfer?.files?.[0]
  
  if (file) {
    await processFile(file)
  }
}

const processFile = async (file: File) => {
  errorMessage.value = null
  
  // Validate file type
  if (!file.name.endsWith('.csv')) {
    errorMessage.value = 'Please upload a CSV file'
    return
  }
  
  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    errorMessage.value = 'File is too large. Maximum size is 10MB'
    return
  }
  
  isUploading.value = true
  
  try {
    await csvStore.processFile(file)
    emit('uploaded', file)
  } catch (error: unknown) {
    errorMessage.value = (error as Error).message || 'Failed to process file'
  } finally {
    isUploading.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-2xl">
    <div
      class="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-200"
      :class="{
        'border-primary-500 bg-primary-50': isDragging,
        'border-gray-300 hover:border-gray-400 bg-white': !isDragging
      }"
      @drop.prevent="handleDrop"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @click="triggerFileInput"
    >
      <div class="flex flex-col items-center space-y-4">
        <!-- Upload Icon -->
        <svg
          class="w-16 h-16 text-gray-400"
          :class="{ 'text-primary-500': isDragging }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        
        <div>
          <p class="text-lg font-semibold text-gray-700">
            {{ isDragging ? 'Drop your CSV file here' : 'Upload CSV File' }}
          </p>
          <p class="text-sm text-gray-500 mt-2">
            Drag and drop or click to browse
          </p>
        </div>
        
        <div class="text-xs text-gray-400">
          Supported format: CSV
        </div>
      </div>
    </div>
    
    <!-- Hidden file input -->
    <input
      ref="fileInput"
      type="file"
      accept=".csv"
      class="hidden"
      @change="handleFileSelect"
    >
    
    <!-- Error message -->
    <div
      v-if="errorMessage"
      class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
    >
      {{ errorMessage }}
    </div>
    
    <!-- Loading state -->
    <div
      v-if="isUploading"
      class="mt-4 p-4 bg-primary-50 border border-primary-200 rounded-lg"
    >
      <div class="flex items-center space-x-3">
        <div class="animate-spin h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full"/>
        <span class="text-sm text-primary-700">Processing your CSV file...</span>
      </div>
    </div>
  </div>
</template>

