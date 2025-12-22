const THEME_KEY = 'usenghor-theme'

// Global shared state
const isDarkMode = ref(false)
const isInitialized = ref(false)

function updateDOM() {
  if (!import.meta.client) return

  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem(THEME_KEY, 'true')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem(THEME_KEY, 'false')
  }
}

function init() {
  if (!import.meta.client || isInitialized.value) return

  const saved = localStorage.getItem(THEME_KEY)

  if (saved !== null) {
    isDarkMode.value = saved === 'true'
  } else {
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  updateDOM()
  isInitialized.value = true
}

function toggle() {
  isDarkMode.value = !isDarkMode.value
  updateDOM()
}

export function useDarkMode() {
  onMounted(() => {
    init()
  })

  return {
    isDark: computed(() => isDarkMode.value),
    toggle,
    set: (value: boolean) => {
      isDarkMode.value = value
      updateDOM()
    }
  }
}
