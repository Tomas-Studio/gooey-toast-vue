import { ref, onMounted, onUnmounted } from 'vue'

export function usePrefersReducedMotion() {
  const prefersReducedMotion = ref(false)
  let mql: MediaQueryList | null = null

  const update = () => {
    prefersReducedMotion.value = mql?.matches ?? false
  }

  onMounted(() => {
    if (typeof window === 'undefined') return
    mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = mql.matches
    mql.addEventListener('change', update)
  })

  onUnmounted(() => {
    mql?.removeEventListener('change', update)
  })

  return prefersReducedMotion
}
