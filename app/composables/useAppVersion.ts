/**
 * Composable qui vérifie périodiquement si une nouvelle version
 * de l'application est disponible en comparant le hash de version.json.
 * Si l'utilisateur ferme le bandeau, la page se recharge automatiquement
 * au prochain changement de route.
 */
export function useAppVersion(intervalMs = 3 * 60 * 1000) {
  const updateAvailable = ref(false)
  const pendingReload = ref(false)
  const currentHash = ref<string | null>(null)
  let timer: ReturnType<typeof setInterval> | null = null

  const checkVersion = async () => {
    try {
      const data = await $fetch<{ hash: string }>('/version.json', {
        headers: { 'Cache-Control': 'no-cache' },
        query: { _t: Date.now() }
      })

      if (!currentHash.value) {
        currentHash.value = data.hash
        return
      }

      if (data.hash !== currentHash.value) {
        updateAvailable.value = true
        stop()
      }
    } catch {
      // Silencieux en cas d'erreur réseau
    }
  }

  const reload = () => {
    window.location.reload()
  }

  const dismiss = () => {
    updateAvailable.value = false
    pendingReload.value = true
  }

  const start = () => {
    if (!import.meta.client) return
    checkVersion()
    timer = setInterval(checkVersion, intervalMs)
  }

  const stop = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  // Recharger automatiquement au changement de route si l'utilisateur a fermé le bandeau
  if (import.meta.client) {
    const router = useRouter()
    router.beforeEach((to, from) => {
      if (pendingReload.value && to.path !== from.path) {
        window.location.href = to.fullPath
        return false
      }
    })
  }

  onMounted(start)
  onUnmounted(stop)

  return {
    updateAvailable: readonly(updateAvailable),
    reload,
    dismiss
  }
}
