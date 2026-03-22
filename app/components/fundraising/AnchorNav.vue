<script setup lang="ts">
interface AnchorSection {
  id: string
  label: string
}

const props = defineProps<{
  sections: AnchorSection[]
}>()

const activeSection = ref<string>('')
const navRef = ref<HTMLElement | null>(null)

// Smooth scroll to section
function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (el) {
    const offset = 80 // Account for sticky nav height
    const top = el.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top, behavior: 'smooth' })
  }
}

// IntersectionObserver to track active section
onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeSection.value = entry.target.id
        }
      }
    },
    {
      rootMargin: '-80px 0px -60% 0px',
      threshold: 0,
    },
  )

  for (const section of props.sections) {
    const el = document.getElementById(section.id)
    if (el) observer.observe(el)
  }

  onUnmounted(() => observer.disconnect())
})
</script>

<template>
  <nav
    ref="navRef"
    class="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center gap-1 overflow-x-auto scrollbar-hide py-1 -mx-2">
        <button
          v-for="section in sections"
          :key="section.id"
          class="flex-shrink-0 px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-200"
          :class="[
            activeSection === section.id
              ? 'text-brand-blue-600 dark:text-brand-blue-400 bg-brand-blue-50 dark:bg-brand-blue-900/30'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
          ]"
          @click="scrollToSection(section.id)"
        >
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
