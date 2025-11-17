// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  // SPA mode - no SSR needed for this tool
  ssr: false,
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],
  
  typescript: {
    strict: true,
    typeCheck: false
  },
  
  // Auto-import components
  components: true,
  
  app: {
    head: {
      title: 'CSV Data Cleaner - by Ish',
      meta: [
        { name: 'description', content: 'Smart CSV cleaning tool for phone number validation' }
      ]
    }
  }
})
