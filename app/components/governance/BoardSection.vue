<script setup lang="ts">
import type { CAMember } from '@bank/mock-data/conseil-administration'

interface Props {
  president: CAMember | undefined
  vicePresidents: CAMember[]
  members: CAMember[]
  observers: CAMember[]
}

const props = defineProps<Props>()

const { t } = useI18n()
const { getFlagEmoji } = useMockData()
const { elementRef: headerRef } = useScrollAnimation({ animation: 'fadeInDown' })
const { elementRef: orgChartRef } = useScrollAnimation({ animation: 'fadeInUp', threshold: 0.1 })

// Color classes for gradient avatars
const getColorClasses = (color: string) => {
  const colors: Record<string, { bg: string; badge: string; ring: string }> = {
    blue: { bg: 'bg-gradient-to-br from-brand-blue-500 to-brand-blue-600', badge: 'bg-brand-blue-100 dark:bg-brand-blue-900/40 text-brand-blue-700 dark:text-brand-blue-300', ring: 'ring-brand-blue-500/30' },
    red: { bg: 'bg-gradient-to-br from-brand-red-500 to-brand-red-600', badge: 'bg-brand-red-100 dark:bg-brand-red-900/40 text-brand-red-700 dark:text-brand-red-300', ring: 'ring-brand-red-500/30' },
    purple: { bg: 'bg-gradient-to-br from-purple-500 to-purple-600', badge: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300', ring: 'ring-purple-500/30' },
    cyan: { bg: 'bg-gradient-to-br from-cyan-500 to-cyan-600', badge: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300', ring: 'ring-cyan-500/30' }
  }
  return colors[color] || colors.blue
}

// Assign colors to VP and member positions
const vpColors = ['blue', 'red', 'purple', 'blue']
const memberColors = ['blue', 'red', 'purple', 'blue', 'red', 'purple', 'blue', 'red']

// Refs for leader-line
const presidentRef = ref<HTMLElement | null>(null)
const vpRefs = ref<HTMLElement[]>([])
const memberRefs = ref<HTMLElement[]>([])
const lines = ref<any[]>([])

const setVpRef = (el: any, index: number) => {
  if (el) vpRefs.value[index] = el
}

const setMemberRef = (el: any, index: number) => {
  if (el) memberRefs.value[index] = el
}

// Draw lines with leader-line
const drawLines = async () => {
  // Clear existing lines
  lines.value.forEach(line => {
    try { line.remove() } catch (e) { /* ignore */ }
  })
  lines.value = []

  // Only run on client
  if (typeof window === 'undefined') return

  // Dynamic import for SSR compatibility
  const LeaderLine = (await import('leader-line-new')).default

  // President → VPs (straight lines)
  if (presidentRef.value && vpRefs.value.length > 0) {
    vpRefs.value.forEach(vpEl => {
      if (vpEl && presidentRef.value) {
        const line = new LeaderLine(presidentRef.value, vpEl, {
          color: 'rgba(43, 75, 191, 0.5)',
          size: 2,
          path: 'straight',
          startSocket: 'bottom',
          endSocket: 'top',
          startPlug: 'behind',
          endPlug: 'behind'
        })
        lines.value.push(line)
      }
    })
  }

  // VP (center) → Members (straight lines from center VP only)
  if (vpRefs.value.length > 0 && memberRefs.value.length > 0) {
    const centerVpIndex = Math.floor(vpRefs.value.length / 2)
    const centerVp = vpRefs.value[centerVpIndex]

    if (centerVp) {
      memberRefs.value.forEach(memberEl => {
        if (memberEl) {
          const line = new LeaderLine(centerVp, memberEl, {
            color: 'rgba(243, 37, 37, 0.4)',
            size: 2,
            path: 'straight',
            startSocket: 'bottom',
            endSocket: 'top',
            startPlug: 'behind',
            endPlug: 'behind'
          })
          lines.value.push(line)
        }
      })
    }
  }
}

// Redraw on resize
const handleResize = () => {
  lines.value.forEach(line => {
    try { line.position() } catch (e) { /* ignore */ }
  })
}

onMounted(() => {
  setTimeout(() => drawLines(), 500)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  lines.value.forEach(line => {
    try { line.remove() } catch (e) { /* ignore */ }
  })
  window.removeEventListener('resize', handleResize)
})

watch([() => props.vicePresidents, () => props.members], () => {
  nextTick(() => setTimeout(() => drawLines(), 300))
}, { deep: true })
</script>

<template>
  <section class="relative py-16 lg:py-24 bg-white dark:bg-gray-950 transition-colors duration-300 overflow-hidden">
    <!-- Animated Background -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-brand-blue-50/50 via-transparent to-brand-red-50/50 dark:from-brand-blue-900/10 dark:via-transparent dark:to-brand-red-900/10"></div>
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-brand-blue-200/30 dark:bg-brand-blue-500/10 rounded-full blur-3xl animate-blob"></div>
      <div class="absolute top-1/2 -left-20 w-96 h-96 bg-brand-red-200/30 dark:bg-brand-red-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      <div class="absolute -bottom-40 right-1/3 w-72 h-72 bg-purple-200/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      <div class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
    </div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div ref="headerRef" class="text-center mb-16 lg:mb-20">
        <span class="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-brand-blue-100 dark:bg-brand-blue-900/30 text-brand-blue-700 dark:text-brand-blue-400 mb-4">
          <font-awesome-icon icon="fa-solid fa-landmark" class="w-3.5 h-3.5 mr-2" />
          {{ t('governance.board.title') }}
        </span>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          {{ t('governance.board.title') }}
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {{ t('governance.board.description') }}
        </p>
      </div>

      <!-- Conseil d'Administration - Organigramme -->
      <div ref="orgChartRef" class="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-3xl p-8 lg:p-12 overflow-x-auto">
        <!-- Hierarchical Org Chart -->
        <div class="org-chart min-w-[900px]">
          <!-- Niveau 1 : Président -->
          <div v-if="props.president" class="flex justify-center mb-16">
            <div
              ref="presidentRef"
              class="org-card bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 w-72"
            >
              <div class="flex flex-col items-center">
                <div class="president-avatar-ring p-1 rounded-full mb-4">
                  <div class="bg-gradient-to-br from-brand-blue-500 to-brand-blue-600 w-20 h-20 rounded-full flex items-center justify-center overflow-hidden">
                    <img
                      v-if="props.president.photo"
                      :src="props.president.photo"
                      :alt="`${props.president.first_name} ${props.president.last_name}`"
                      class="w-full h-full object-cover"
                    />
                    <span v-else class="text-2xl font-bold text-white">
                      {{ props.president.first_name.charAt(0) }}{{ props.president.last_name.charAt(0) }}
                    </span>
                  </div>
                </div>
                <span class="text-2xl mb-2">{{ getFlagEmoji(props.president.country_code) }}</span>
                <h4 class="text-xl font-semibold text-gray-900 dark:text-white mb-1 text-center">
                  {{ props.president.civility }} {{ props.president.first_name }} {{ props.president.last_name }}
                </h4>
                <span class="bg-brand-blue-100 dark:bg-brand-blue-900/40 text-brand-blue-700 dark:text-brand-blue-300 px-4 py-1.5 rounded-full text-sm font-medium border border-brand-blue-200 dark:border-brand-blue-800">
                  Président du Conseil
                </span>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">{{ props.president.representing_fr }}</p>
              </div>
            </div>
          </div>

          <!-- Niveau 2 : Vice-Présidents -->
          <div v-if="props.vicePresidents.length > 0" class="mb-16">
            <div class="flex justify-center gap-8 flex-wrap">
              <div
                v-for="(vp, index) in props.vicePresidents"
                :key="vp.id"
                :ref="(el) => setVpRef(el, index)"
                class="org-card bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 w-56"
              >
                <div class="flex flex-col items-center">
                  <div :class="[getColorClasses(vpColors[index % vpColors.length]).bg, 'w-16 h-16 rounded-full flex items-center justify-center mb-3 ring-4 ring-opacity-30 overflow-hidden', getColorClasses(vpColors[index % vpColors.length]).ring]">
                    <img
                      v-if="vp.photo"
                      :src="vp.photo"
                      :alt="`${vp.first_name} ${vp.last_name}`"
                      class="w-full h-full object-cover"
                    />
                    <span v-else class="text-lg font-bold text-white">
                      {{ vp.first_name.charAt(0) }}{{ vp.last_name.charAt(0) }}
                    </span>
                  </div>
                  <span class="text-xl mb-1">{{ getFlagEmoji(vp.country_code) }}</span>
                  <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-1 text-center">
                    {{ vp.civility }} {{ vp.first_name }} {{ vp.last_name }}
                  </h4>
                  <span :class="[getColorClasses(vpColors[index % vpColors.length]).badge, 'px-3 py-1 rounded-full text-xs font-medium border text-center']">
                    Vice-Président
                  </span>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">{{ vp.representing_fr }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Niveau 3 : Membres du Conseil -->
          <div v-if="props.members.length > 0">
            <div class="flex justify-center gap-4 flex-wrap">
              <div
                v-for="(member, index) in props.members"
                :key="member.id"
                :ref="(el) => setMemberRef(el, index)"
                class="org-card bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50 hover:border-brand-blue-300 dark:hover:border-brand-blue-600 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 w-44"
              >
                <div class="flex flex-col items-center text-center">
                  <div :class="[getColorClasses(memberColors[index % memberColors.length]).bg, 'w-12 h-12 rounded-full flex items-center justify-center mb-2 ring-4 ring-opacity-30 overflow-hidden', getColorClasses(memberColors[index % memberColors.length]).ring]">
                    <img
                      v-if="member.photo"
                      :src="member.photo"
                      :alt="`${member.first_name} ${member.last_name}`"
                      class="w-full h-full object-cover"
                    />
                    <span v-else class="text-sm font-bold text-white">
                      {{ member.first_name.charAt(0) }}{{ member.last_name.charAt(0) }}
                    </span>
                  </div>
                  <span class="text-lg">{{ getFlagEmoji(member.country_code) }}</span>
                  <h4 class="font-semibold text-gray-900 dark:text-white mt-1 text-xs">
                    {{ member.civility }} {{ member.first_name }} {{ member.last_name }}
                  </h4>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ member.representing_fr }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Observateurs -->
        <div v-if="props.observers.length > 0" class="mt-12 pt-8 border-t border-dashed border-gray-300 dark:border-gray-600">
          <h3 class="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-6 flex items-center justify-center gap-2">
            <span class="w-1.5 h-6 bg-gray-400 rounded-full"></span>
            Observateurs
          </h3>
          <div class="flex flex-wrap justify-center gap-4">
            <div
              v-for="obs in props.observers"
              :key="obs.id"
              class="flex items-center gap-3 px-4 py-3 bg-white/50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
            >
              <div class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                <img
                  v-if="obs.photo"
                  :src="obs.photo"
                  :alt="`${obs.first_name} ${obs.last_name}`"
                  class="w-full h-full object-cover opacity-80"
                />
                <span v-else class="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {{ obs.first_name.charAt(0) }}{{ obs.last_name.charAt(0) }}
                </span>
              </div>
              <div>
                <h4 class="font-medium text-gray-700 dark:text-gray-300 text-sm">
                  {{ obs.civility }} {{ obs.first_name }} {{ obs.last_name }}
                </h4>
                <span class="text-xs text-gray-500 dark:text-gray-400">Observateur</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Blob Animation */
@keyframes blob {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(20px, -30px) scale(1.1);
  }
  50% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  75% {
    transform: translate(30px, 10px) scale(1.05);
  }
}

.animate-blob {
  animation: blob 12s ease-in-out infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

/* Org Chart Layout */
.org-chart {
  padding: 1rem 0;
}

.org-card {
  position: relative;
  animation: fadeInUp 0.6s ease-out forwards;
}

/* President avatar ring - static gradient border */
.president-avatar-ring {
  background: linear-gradient(135deg, #2b4bbf, #f32525, #8b5cf6);
  padding: 3px;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
