import { defineNuxtModule, addPlugin, createResolver, addImports } from '@nuxt/kit'

export interface GooeyToastNuxtOptions {
  /** Auto-import gooeyToast and useGooeyToast composables (default: true) */
  autoImports?: boolean
}

export default defineNuxtModule<GooeyToastNuxtOptions>({
  meta: {
    name: 'gooey-toast-vue',
    configKey: 'gooeyToast',
    compatibility: {
      nuxt: '>=3.0.0',
    },
  },
  defaults: {
    autoImports: true,
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    nuxt.options.css.push('gooey-toast-vue/style.css')

    nuxt.options.build.transpile.push('gooey-toast-vue')

    addPlugin({
      src: resolve('./runtime/plugin'),
      mode: 'client',
    })

    if (options.autoImports) {
      addImports([
        {
          name: 'gooeyToast',
          from: 'gooey-toast-vue',
        },
        {
          name: 'useGooeyToast',
          from: 'gooey-toast-vue',
        },
      ])
    }
  },
})
