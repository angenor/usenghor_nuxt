/**
 * Composable pour gérer le drawer latéral des détails pays
 */
import type { PaysBailleur } from '@bank/mock-data/pays-bailleurs'

export function useCountryDrawer() {
  const selectedPays = ref<PaysBailleur | null>(null)

  const openDrawer = (pays: PaysBailleur) => {
    selectedPays.value = pays
    if (import.meta.client) {
      document.body.style.overflow = 'hidden'
    }
  }

  const closeDrawer = () => {
    selectedPays.value = null
    if (import.meta.client) {
      document.body.style.overflow = ''
    }
  }

  // Fermer avec Escape
  onMounted(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer()
    }
    window.addEventListener('keydown', handleEsc)
    onUnmounted(() => window.removeEventListener('keydown', handleEsc))
  })

  return {
    selectedPays,
    openDrawer,
    closeDrawer
  }
}
