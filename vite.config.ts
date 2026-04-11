import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsconfigPath: './tsconfig.app.json',
      outDir: 'dist/types',
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: ['src/nuxt.ts', 'src/runtime/**'],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'GooeyToastVue',
      formats: ['es', 'cjs'],
      fileName: (format) => `gooey-toast-vue.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['vue', 'vue-sonner', 'motion-v', 'motion', '@vueuse/core'],
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
