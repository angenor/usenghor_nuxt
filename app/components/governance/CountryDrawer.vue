<script setup lang="ts">
import type { PaysBailleur } from '@bank/mock-data/pays-bailleurs'

interface Props {
  pays: PaysBailleur | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const { getFlagEmoji } = useMockData()
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="props.pays" class="fixed inset-0 z-50">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="emit('close')"
        ></div>

        <!-- Drawer panel -->
        <div class="drawer-panel absolute top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl">
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-4">
              <span class="text-5xl">{{ getFlagEmoji(props.pays.code) }}</span>
              <div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                  {{ props.pays.name_fr }}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Membre depuis {{ props.pays.member_since }}
                </p>
              </div>
            </div>
            <button
              class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center
                     hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              @click="emit('close')"
            >
              <font-awesome-icon icon="fa-solid fa-xmark" class="text-gray-500" />
            </button>
          </div>

          <!-- Content -->
          <div class="p-6 space-y-6 overflow-y-auto h-[calc(100%-88px)]">
            <!-- Badge contribution -->
            <div v-if="props.pays.contribution_type_fr">
              <span class="inline-block px-4 py-2 bg-brand-blue-100 dark:bg-brand-blue-900/30 text-brand-blue-700 dark:text-brand-blue-400 rounded-full text-sm font-medium">
                {{ props.pays.contribution_type_fr }}
              </span>
            </div>

            <!-- Description -->
            <div>
              <h4 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Contribution
              </h4>
              <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
                {{ props.pays.description_fr || 'Ce pays contribue au développement et au rayonnement de l\'Université Senghor.' }}
              </p>
            </div>

            <!-- Infos -->
            <div class="space-y-4">
              <div class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div class="w-10 h-10 bg-brand-red-100 dark:bg-brand-red-900/30 rounded-full flex items-center justify-center">
                  <font-awesome-icon icon="fa-solid fa-location-dot" class="text-brand-red-600 dark:text-brand-red-400" />
                </div>
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Capitale</p>
                  <p class="font-semibold text-gray-900 dark:text-white">{{ props.pays.capital || 'Non renseignée' }}</p>
                </div>
              </div>

              <div class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <font-awesome-icon icon="fa-solid fa-calendar" class="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Membre depuis</p>
                  <p class="font-semibold text-gray-900 dark:text-white">{{ props.pays.member_since }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-enter-active .drawer-panel,
.drawer-leave-active .drawer-panel {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .drawer-panel,
.drawer-leave-to .drawer-panel {
  transform: translateX(100%);
}
</style>
