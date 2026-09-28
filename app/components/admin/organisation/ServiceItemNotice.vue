<script setup lang="ts">
/**
 * Bandeau de retour local (succès / erreur) des sections d'un service.
 * L'admin n'a pas de système de toast : le message s'affiche en tête de section
 * et un succès disparaît de lui-même après quelques secondes.
 */
const props = withDefaults(defineProps<{
  notice: { type: 'success' | 'error', text: string } | null
  /** Durée d'affichage d'un succès (ms) */
  duration?: number
}>(), {
  duration: 4000,
})

const emit = defineEmits<{
  dismiss: []
}>()

let timer: ReturnType<typeof setTimeout> | null = null

function clearTimer() {
  if (timer) clearTimeout(timer)
  timer = null
}

watch(
  () => props.notice,
  (notice) => {
    clearTimer()
    if (notice?.type === 'success' && props.duration > 0) {
      timer = setTimeout(() => emit('dismiss'), props.duration)
    }
  },
)

onBeforeUnmount(clearTimer)
</script>

<template>
  <!-- Région vivante toujours présente pour que les lecteurs d'écran annoncent le message -->
  <div aria-live="polite" aria-atomic="true">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="-translate-y-1 opacity-0"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="notice"
        class="flex items-start gap-3 rounded-lg border px-4 py-3 text-sm"
        :class="notice.type === 'success'
          ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800/60 dark:bg-green-900/20 dark:text-green-300'
          : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800/60 dark:bg-red-900/20 dark:text-red-300'"
      >
        <font-awesome-icon
          :icon="['fas', notice.type === 'success' ? 'circle-check' : 'circle-exclamation']"
          class="mt-0.5 h-4 w-4 flex-shrink-0"
          aria-hidden="true"
        />
        <p class="min-w-0 flex-1">{{ notice.text }}</p>
        <button
          type="button"
          class="-m-1 rounded p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
          aria-label="Masquer le message"
          @click="emit('dismiss')"
        >
          <font-awesome-icon :icon="['fas', 'xmark']" class="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </Transition>
  </div>
</template>
