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
const getColorClasses = (index: number) => {
  const colors = [
    { bg: 'bg-gradient-to-br from-emerald-500 to-teal-600', ring: 'ring-emerald-500/30' },
    { bg: 'bg-gradient-to-br from-cyan-500 to-blue-600', ring: 'ring-cyan-500/30' },
    { bg: 'bg-gradient-to-br from-amber-500 to-orange-600', ring: 'ring-amber-500/30' },
    { bg: 'bg-gradient-to-br from-purple-500 to-indigo-600', ring: 'ring-purple-500/30' },
    { bg: 'bg-gradient-to-br from-rose-500 to-pink-600', ring: 'ring-rose-500/30' }
  ]
  return colors[index % colors.length]
}

// Get initials from name
const getInitials = (member: CAMember) => {
  return `${member.first_name.charAt(0)}${member.last_name.charAt(0)}`
}
</script>

<template>
  <section class="relative py-16 lg:py-24 bg-white dark:bg-gray-950 transition-colors duration-300 overflow-hidden">
    <!-- Animated Background -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-transparent to-blue-50/50 dark:from-emerald-900/10 dark:via-transparent dark:to-blue-900/10"></div>
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/30 dark:bg-emerald-500/10 rounded-full blur-3xl animate-blob"></div>
      <div class="absolute top-1/2 -left-20 w-96 h-96 bg-blue-200/30 dark:bg-blue-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      <div class="absolute -bottom-40 right-1/3 w-72 h-72 bg-purple-200/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      <div class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
    </div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div ref="headerRef" class="text-center mb-16 lg:mb-20">
        <span class="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 mb-4">
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

      <!-- Org Chart Container -->
      <div ref="orgChartRef" class="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-3xl p-8 lg:p-12 overflow-x-auto">
        <div class="org-chart min-w-[600px]">
          <!-- Niveau 1 : Président -->
          <div v-if="props.president" class="flex justify-center mb-8">
            <div class="org-node connector-down">
              <div class="org-card bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 w-72">
                <div class="flex flex-col items-center">
                  <div class="president-avatar-ring p-1 rounded-full mb-4">
                    <img
                      :src="props.president.photo || 'https://i.pravatar.cc/200?u=president'"
                      :alt="`${props.president.first_name} ${props.president.last_name}`"
                      class="w-20 h-20 rounded-full object-cover"
                    />
                  </div>
                  <span class="text-2xl mb-2">{{ getFlagEmoji(props.president.country_code) }}</span>
                  <h4 class="text-xl font-semibold text-gray-900 dark:text-white mb-1 text-center">
                    {{ props.president.civility }} {{ props.president.first_name }} {{ props.president.last_name }}
                  </h4>
                  <span class="px-4 py-1.5 rounded-full text-sm font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Président du Conseil
                  </span>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">{{ props.president.representing_fr }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Niveau 2 : Vice-Présidents -->
          <div v-if="props.vicePresidents.length > 0" class="vp-level horizontal-line pt-8 mb-8">
            <div class="flex justify-center gap-6 flex-wrap">
              <div
                v-for="(vp, index) in props.vicePresidents"
                :key="vp.id"
                class="org-node connector-up"
              >
                <div class="org-card bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 w-56">
                  <div class="flex flex-col items-center">
                    <div :class="[getColorClasses(index).bg, 'w-16 h-16 rounded-full flex items-center justify-center mb-3 ring-4 ring-opacity-30', getColorClasses(index).ring]">
                      <img
                        :src="vp.photo || 'https://i.pravatar.cc/150?u=' + vp.id"
                        :alt="`${vp.first_name} ${vp.last_name}`"
                        class="w-14 h-14 rounded-full object-cover border-2 border-white"
                      />
                    </div>
                    <span class="text-xl mb-1">{{ getFlagEmoji(vp.country_code) }}</span>
                    <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-1 text-center">
                      {{ vp.civility }} {{ vp.first_name }} {{ vp.last_name }}
                    </h4>
                    <span class="px-3 py-1 rounded-full text-xs font-medium bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 text-center">
                      Vice-Président
                    </span>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">{{ vp.representing_fr }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Niveau 3 : Membres du Conseil -->
          <div v-if="props.members.length > 0" class="members-level horizontal-line-members pt-8">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center justify-center gap-2">
              <span class="w-1.5 h-6 bg-blue-500 rounded-full"></span>
              Membres du Conseil
            </h3>
            <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                v-for="(member, index) in props.members"
                :key="member.id"
                class="member-card group bg-white dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200/50 dark:border-gray-700/50 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div class="flex flex-col items-center text-center">
                  <div :class="[getColorClasses(index + 2).bg, 'w-14 h-14 rounded-full flex items-center justify-center mb-3 ring-4 ring-opacity-30 group-hover:scale-110 transition-transform duration-300', getColorClasses(index + 2).ring]">
                    <img
                      :src="member.photo || 'https://i.pravatar.cc/150?u=' + member.id"
                      :alt="`${member.first_name} ${member.last_name}`"
                      class="w-12 h-12 rounded-full object-cover border-2 border-white"
                    />
                  </div>
                  <span class="text-xl">{{ getFlagEmoji(member.country_code) }}</span>
                  <h4 class="font-semibold text-gray-900 dark:text-white mt-1 text-sm">
                    {{ member.civility }} {{ member.first_name }} {{ member.last_name }}
                  </h4>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ member.representing_fr }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Observateurs -->
        <div v-if="props.observers.length > 0" class="mt-12">
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
              <img
                :src="obs.photo || 'https://i.pravatar.cc/150?u=' + obs.id"
                :alt="`${obs.first_name} ${obs.last_name}`"
                class="w-10 h-10 rounded-full object-cover opacity-80"
              />
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

.org-node {
  position: relative;
}

.org-card {
  position: relative;
  animation: fadeInUp 0.6s ease-out forwards;
}

/* Connector down - vertical line going down from element */
.connector-down::after {
  content: '';
  position: absolute;
  bottom: -32px;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 32px;
  background: linear-gradient(to bottom, #10b981, #6366f1);
}

/* Connector up - vertical line going up to element */
.connector-up::before {
  content: '';
  position: absolute;
  top: -32px;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 32px;
  background: linear-gradient(to bottom, #6366f1, #10b981);
}

/* Horizontal line for grouping children */
.horizontal-line {
  position: relative;
}

.horizontal-line::before {
  content: '';
  position: absolute;
  top: 0;
  left: 15%;
  right: 15%;
  height: 2px;
  background: linear-gradient(to right, transparent, #10b981, #6366f1, #10b981, transparent);
}

/* VP level with connector going down to Members */
.vp-level {
  position: relative;
}

.vp-level::after {
  content: '';
  position: absolute;
  bottom: -32px;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 32px;
  background: linear-gradient(to bottom, #10b981, #3b82f6);
}

/* Horizontal line before Members section */
.horizontal-line-members {
  position: relative;
}

.horizontal-line-members::before {
  content: '';
  position: absolute;
  top: 0;
  left: 10%;
  right: 10%;
  height: 2px;
  background: linear-gradient(to right, transparent, #3b82f6, #8b5cf6, #3b82f6, transparent);
}

/* Vertical connector from horizontal line to Members title */
.horizontal-line-members::after {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 32px;
  background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
}

/* President avatar ring - gradient border */
.president-avatar-ring {
  background: linear-gradient(135deg, #10b981, #6366f1, #8b5cf6);
  padding: 4px;
}

/* Member card animation */
.member-card {
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
}

.member-card:nth-child(1) { animation-delay: 0.1s; }
.member-card:nth-child(2) { animation-delay: 0.15s; }
.member-card:nth-child(3) { animation-delay: 0.2s; }
.member-card:nth-child(4) { animation-delay: 0.25s; }
.member-card:nth-child(5) { animation-delay: 0.3s; }
.member-card:nth-child(6) { animation-delay: 0.35s; }
.member-card:nth-child(7) { animation-delay: 0.4s; }
.member-card:nth-child(8) { animation-delay: 0.45s; }

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
