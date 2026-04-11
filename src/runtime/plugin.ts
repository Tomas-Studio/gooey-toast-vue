import { defineNuxtPlugin } from '#app'
import { GooeyToaster } from 'gooey-toast-vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('GooeyToaster', GooeyToaster)
})
