<script setup lang="ts">
import type { Testimonial } from '~/types/api'

defineProps<{
  testimonials: Testimonial[]
}>()

const emit = defineEmits<{
  add: []
  edit: [testimonial: Testimonial]
  delete: [testimonial: Testimonial]
  move: [index: number, direction: 'up' | 'down']
  history: [testimonial: Testimonial]
}>()

const formatDateShort = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
        Témoignages alumni
      </h2>
      <button
        class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
        @click="emit('add')"
      >
        <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" />
        Ajouter un témoignage
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="testimonials.length === 0" class="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
      <font-awesome-icon :icon="['fas', 'quote-left']" class="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
      <h3 class="mb-2 text-lg font-medium text-gray-900 dark:text-white">
        Aucun témoignage
      </h3>
      <p class="mb-6 text-gray-500 dark:text-gray-400">
        Ajoutez des témoignages d'anciens diplômés pour la page Alumni.
      </p>
      <button
        class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
        @click="emit('add')"
      >
        <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" />
        Ajouter un témoignage
      </button>
    </div>

    <!-- Testimonials list -->
    <div v-else class="space-y-3">
      <div
        v-for="(testimonial, index) in testimonials"
        :key="testimonial.id"
        class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
        :class="{ 'opacity-60': !testimonial.is_active }"
      >
        <div class="flex items-start gap-4">
          <!-- Photo -->
          <img
            v-if="testimonial.photo"
            :src="testimonial.photo"
            :alt="`${testimonial.first_name} ${testimonial.last_name}`"
            class="h-12 w-12 flex-shrink-0 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600"
          >
          <div
            v-else
            class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30"
          >
            <font-awesome-icon :icon="['fas', 'user']" class="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>

          <!-- Info -->
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="font-medium text-gray-900 dark:text-white">
                {{ testimonial.civility }} {{ testimonial.first_name }} {{ testimonial.last_name }}
              </h3>
              <span
                v-if="testimonial.is_featured"
                class="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              >
                <font-awesome-icon :icon="['fas', 'star']" class="mr-1 h-3 w-3" />
                En vedette
              </span>
              <span
                v-if="!testimonial.is_active"
                class="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400"
              >
                Inactif
              </span>
            </div>
            <p class="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
              {{ testimonial.current_position_fr }} — {{ testimonial.organization }}, {{ testimonial.country }}
            </p>
            <p class="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
              {{ testimonial.promotion }} • Modifié le {{ formatDateShort(testimonial.updated_at) }}
            </p>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-1">
            <button
              class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Monter"
              :disabled="index === 0"
              @click="emit('move', index, 'up')"
            >
              <font-awesome-icon :icon="['fas', 'chevron-up']" class="h-4 w-4" />
            </button>
            <button
              class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Descendre"
              :disabled="index === testimonials.length - 1"
              @click="emit('move', index, 'down')"
            >
              <font-awesome-icon :icon="['fas', 'chevron-down']" class="h-4 w-4" />
            </button>
            <button
              class="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title="Historique"
              @click="emit('history', testimonial)"
            >
              <font-awesome-icon :icon="['fas', 'history']" class="h-4 w-4" />
            </button>
            <button
              class="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              title="Modifier"
              @click="emit('edit', testimonial)"
            >
              <font-awesome-icon :icon="['fas', 'edit']" class="h-4 w-4" />
            </button>
            <button
              class="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Supprimer"
              @click="emit('delete', testimonial)"
            >
              <font-awesome-icon :icon="['fas', 'trash']" class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
