import { gooeyToast } from '../store/toast-store'

export function useGooeyToast() {
  return {
    toast: gooeyToast,
    dismiss: gooeyToast.dismiss,
    update: gooeyToast.update,
  }
}
