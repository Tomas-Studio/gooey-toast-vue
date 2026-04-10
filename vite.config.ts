import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'GooeyToasstVue',
      formats: ['es', 'cjs'],
      fileName: (format) => `gooey-toasst-vue.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['vue', 'vue-sonner', 'motion-v', 'motion'],
      output: {
        globals: {
          vue: 'Vue',
          'vue-sonner': 'VueSonner',
          'motion-v': 'MotionV',
          motion: 'Motion',
        },
      },
    },
  },
})
