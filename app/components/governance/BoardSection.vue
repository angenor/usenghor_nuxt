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
const { elementRef } = useScrollAnimation({ animation: 'fadeInUp', threshold: 0.2 })
</script>

<template>
  <section
    ref="elementRef"
    class="py-16 lg:py-24 bg-white dark:bg-gray-900"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-12">
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {{ t('governance.board.title') }}
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          {{ t('governance.board.description') }}
        </p>
      </div>

      <!-- Président (featured) -->
      <div v-if="props.president" class="max-w-3xl mx-auto mb-16">
        <div
          class="relative bg-gradient-to-br from-amber-500 via-amber-500 to-amber-600
                 rounded-3xl p-8 md:p-10 text-white overflow-hidden shadow-2xl shadow-amber-500/20"
        >
          <!-- Decorative elements -->
          <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div class="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

          <!-- Badge -->
          <div class="absolute top-4 right-4">
            <span class="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium">
              Président du Conseil
            </span>
          </div>

          <!-- Content -->
          <div class="relative flex flex-col md:flex-row items-center gap-6 md:gap-8">
            <img
              :src="props.president.photo || 'https://i.pravatar.cc/200?u=president'"
              :alt="`${props.president.first_name} ${props.president.last_name}`"
              class="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white/30 object-cover shadow-xl"
            />
            <div class="text-center md:text-left">
              <h3 class="text-2xl md:text-3xl font-bold">
                {{ props.president.civility }} {{ props.president.first_name }} {{ props.president.last_name }}
              </h3>
              <p class="text-white/90 text-lg mt-1">{{ props.president.title_fr }}</p>
              <p class="text-white/75 mt-3 flex items-center justify-center md:justify-start gap-2">
                <span class="text-3xl">{{ getFlagEmoji(props.president.country_code) }}</span>
                <span>{{ props.president.representing_fr }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Vice-Présidents -->
      <div v-if="props.vicePresidents.length > 0" class="mb-12">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <span class="w-1.5 h-6 bg-amber-500 rounded-full"></span>
          Vice-Présidents
        </h3>
        <div class="grid sm:grid-cols-2 gap-6">
          <div
            v-for="vp in props.vicePresidents"
            :key="vp.id"
            class="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50
                   rounded-2xl p-6 flex items-center gap-5
                   border border-gray-200 dark:border-gray-700
                   hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            <img
              :src="vp.photo || 'https://i.pravatar.cc/150?u=' + vp.id"
              :alt="`${vp.first_name} ${vp.last_name}`"
              class="w-20 h-20 rounded-full object-cover ring-4 ring-white dark:ring-gray-700 shadow"
            />
            <div>
              <span class="text-2xl">{{ getFlagEmoji(vp.country_code) }}</span>
              <h4 class="font-semibold text-gray-900 dark:text-white mt-1">
                {{ vp.civility }} {{ vp.first_name }} {{ vp.last_name }}
              </h4>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ vp.title_fr }}</p>
              <p class="text-xs text-amber-600 dark:text-amber-400 mt-1">{{ vp.representing_fr }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Membres -->
      <div v-if="props.members.length > 0" class="mb-12">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <span class="w-1.5 h-6 bg-blue-500 rounded-full"></span>
          Membres
        </h3>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="(member, index) in props.members"
            :key="member.id"
            class="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 text-center
                   hover:shadow-lg transition-all duration-300 hover:-translate-y-1
                   border border-transparent hover:border-amber-200 dark:hover:border-amber-800"
            :style="{ animationDelay: `${index * 75}ms` }"
          >
            <img
              :src="member.photo || 'https://i.pravatar.cc/150?u=' + member.id"
              :alt="`${member.first_name} ${member.last_name}`"
              class="w-20 h-20 rounded-full mx-auto mb-4 object-cover
                     ring-4 ring-white dark:ring-gray-700 shadow"
            />
            <span class="text-3xl">{{ getFlagEmoji(member.country_code) }}</span>
            <h4 class="font-semibold text-gray-900 dark:text-white mt-2">
              {{ member.civility }} {{ member.first_name }} {{ member.last_name }}
            </h4>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ member.title_fr }}</p>
            <p class="text-xs text-amber-600 dark:text-amber-400 mt-2">{{ member.representing_fr }}</p>
          </div>
        </div>
      </div>

      <!-- Observateurs -->
      <div v-if="props.observers.length > 0">
        <h3 class="text-xl font-semibold text-gray-500 dark:text-gray-400 mb-6 flex items-center gap-2">
          <span class="w-1.5 h-6 bg-gray-400 rounded-full"></span>
          Observateurs
        </h3>
        <div class="grid sm:grid-cols-2 gap-6">
          <div
            v-for="obs in props.observers"
            :key="obs.id"
            class="border-2 border-dashed border-gray-300 dark:border-gray-600
                   rounded-2xl p-6 flex items-center gap-4
                   hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
          >
            <img
              :src="obs.photo || 'https://i.pravatar.cc/150?u=' + obs.id"
              :alt="`${obs.first_name} ${obs.last_name}`"
              class="w-16 h-16 rounded-full object-cover opacity-90"
            />
            <div>
              <h4 class="font-semibold text-gray-700 dark:text-gray-300">
                {{ obs.civility }} {{ obs.first_name }} {{ obs.last_name }}
              </h4>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ obs.title_fr }}</p>
              <span
                class="inline-block mt-2 text-xs bg-gray-200 dark:bg-gray-700
                       text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded"
              >
                Observateur
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
