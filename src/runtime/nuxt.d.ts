// Type shim for Nuxt virtual modules used in runtime plugins.
// At runtime these are resolved by Nuxt's build system; this file
// satisfies the TypeScript language server in non-Nuxt project contexts.

declare module '#app' {
  import type { App } from 'vue'

  interface NuxtApp {
    vueApp: App
    [key: string]: unknown
  }

  export function defineNuxtPlugin(
    plugin: (nuxtApp: NuxtApp) => void | Record<string, unknown>
  ): (nuxtApp: NuxtApp) => void | Record<string, unknown>

  export type { NuxtApp }
}
