<script setup lang="ts">
interface Stat {
  value: string
  label: string
}

interface Props {
  stats: Stat[]
  backgroundImage?: string
}

const props = withDefaults(defineProps<Props>(), {
  backgroundImage: '/images/bg/backgroud_senghor3.jpg'
})

const statsRef = ref<HTMLElement | null>(null)
const hasAnimated = ref(false)
const animatedValues = ref<number[]>([])

// Parse numeric values from stats
const targetValues = computed(() => {
  return props.stats.map(stat => {
    const num = parseInt(stat.value.replace(/[^0-9]/g, ''))
    return isNaN(num) ? 0 : num
  })
})

// Initialize animated values
onMounted(() => {
  animatedValues.value = props.stats.map(() => 0)
})

const animateValue = (index: number, target: number, duration = 2000) => {
  const startTime = performance.now()
  const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4)

  const updateValue = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easedProgress = easeOutQuart(progress)
    animatedValues.value[index] = Math.round(target * easedProgress)
    if (progress < 1) requestAnimationFrame(updateValue)
  }
  requestAnimationFrame(updateValue)
}

const startAnimation = () => {
  if (hasAnimated.value) return
  hasAnimated.value = true
  targetValues.value.forEach((target, index) => {
    setTimeout(() => animateValue(index, target, 1500), index * 150)
  })
}

// Get suffix from original value (e.g., "+" from "30+")
const getSuffix = (value: string): string => {
  const match = value.match(/[^0-9]+$/)
  return match ? match[0] : ''
}

let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) startAnimation()
      })
    },
    { threshold: 0.3 }
  )
  if (statsRef.value) observer.observe(statsRef.value)
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

<template>
  <section
    ref="statsRef"
    class="relative py-16 lg:py-24 pb-24 lg:pb-32"
  >
    <!-- Background Image with Fixed Attachment (Parallax) -->
    <div
      class="absolute inset-0 bg-cover bg-center bg-fixed"
      :style="{ backgroundImage: `url(${props.backgroundImage})` }"
    ></div>

    <!-- Dark Overlay with Gradient -->
    <div class="absolute inset-0 bg-gradient-to-r from-amber-900/85 via-amber-800/80 to-amber-900/85"></div>

    <!-- Content -->
    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
        <div
          v-for="(stat, index) in props.stats"
          :key="index"
          class="text-center transform transition-all duration-500"
          :class="{ 'translate-y-0 opacity-100': hasAnimated, 'translate-y-4 opacity-0': !hasAnimated }"
          :style="{ transitionDelay: `${index * 100}ms` }"
        >
          <div class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-2 tabular-nums drop-shadow-lg">
            {{ animatedValues[index] || 0 }}{{ getSuffix(stat.value) }}
          </div>
          <div class="text-white/90 text-sm sm:text-base font-medium">
            {{ stat.label }}
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Wave Border -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1000 100"
      class="absolute -bottom-5 left-0 w-full rotate-180"
      preserveAspectRatio="none"
    >
      <path
        d="M0 0v80l227.5 18c12.1 1 22.5-8.6 22.5-20.7s10.4-21.8 22.5-20.8l205 16.3c12.1 1 22.5-8.6 22.5-20.8s10.4-21.7 22.5-20.8l205 16.3c12.1 1 22.5-8.6 22.5-20.8S760.4 5 772.5 6L1000 24V0H0Z"
        class="fill-gray-50 dark:fill-gray-800"
      />
    </svg>
  </section>
</template>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
