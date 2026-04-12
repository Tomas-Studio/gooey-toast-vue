import { ref } from 'vue'

export function useCopy() {
  const copied = ref(false)
  let timer: ReturnType<typeof setTimeout> | null = null

  function copy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      copied.value = true
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => { copied.value = false }, 2000)
    })
  }

  return { copied, copy }
}
