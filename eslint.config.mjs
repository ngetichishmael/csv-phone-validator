// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Your custom configs here
  {
    rules: {
      // Enforce component block order: script first, then template, then style
      'vue/block-order': ['error', {
        order: ['script', 'template', 'style']
      }]
    }
  }
)
