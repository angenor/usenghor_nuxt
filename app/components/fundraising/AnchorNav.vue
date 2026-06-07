<script setup lang="ts">
interface AnchorSection {
  id: string
  label: string
  icon?: string
}

const props = defineProps<{
  sections: AnchorSection[]
}>()

const activeSection = ref<string>('')
const navRef = ref<HTMLElement | null>(null)

const NAVBAR_HEIGHT = 80 // Hauteur de la navbar principale fixe (h-20 / top-20)

// Offset total à réserver = navbar fixe + hauteur de cette tab bar sticky
function stickyOffset() {
  return NAVBAR_HEIGHT + (navRef.value?.offsetHeight ?? 48)
}

// Verrou temporaire pendant le scroll programmatique (clic) pour éviter le clignotement
let lockUntil = 0

// Smooth scroll to section
function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - stickyOffset()
    window.scrollTo({ top, behavior: 'smooth' })
  }
  // Coloration immédiate au clic
  activeSection.value = id
  lockUntil = performance.now() + 700
}

// Détermine la section active en fonction de la position de scroll
function updateActiveSection() {
  if (performance.now() < lockUntil) return

  // En bas de page : activer la dernière section (gère les sections finales courtes)
  const scrollBottom = window.scrollY + window.innerHeight
  if (scrollBottom >= document.documentElement.scrollHeight - 4) {
    const last = props.sections[props.sections.length - 1]
    if (last) activeSection.value = last.id
    return
  }

  // Ligne de détection : juste sous la pile sticky (navbar + tab bar)
  const line = stickyOffset() + 1
  let current = props.sections[0]?.id ?? ''
  for (const section of props.sections) {
    const el = document.getElementById(section.id)
    if (!el) continue
    if (el.getBoundingClientRect().top <= line) {
      current = section.id
    }
  }
  activeSection.value = current
}

onMounted(() => {
  updateActiveSection()
  window.addEventListener('scroll', updateActiveSection, { passive: true })
  window.addEventListener('resize', updateActiveSection, { passive: true })

  onUnmounted(() => {
    window.removeEventListener('scroll', updateActiveSection)
    window.removeEventListener('resize', updateActiveSection)
  })
})
</script>

<template>
  <nav
    ref="navRef"
    class="sticky top-20 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center gap-1 overflow-x-auto scrollbar-hide py-1 -mx-2">
        <button
          v-for="section in sections"
          :key="section.id"
          class="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-200"
          :class="[
            activeSection === section.id
              ? 'text-brand-blue-600 dark:text-brand-blue-400 bg-brand-blue-50 dark:bg-brand-blue-900/30'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
          ]"
          @click="scrollToSection(section.id)"
        >
          <font-awesome-icon v-if="section.icon" :icon="section.icon" class="h-4 w-4" />
          {{ section.label }}
        </button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
