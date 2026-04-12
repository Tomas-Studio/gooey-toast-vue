import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      // Point to library source for dev (avoids needing to rebuild lib on every change)
      'gooey-toast-vue': resolve(__dirname, '../src/index.ts'),
    },
  },
  server: {
    port: 5173,
  },
})
