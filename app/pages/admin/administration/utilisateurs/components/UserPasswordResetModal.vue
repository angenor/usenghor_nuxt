<script setup lang="ts">
defineProps<{
  show: boolean
  temporaryPassword: string
}>()

const emit = defineEmits<{
  'close': []
}>()

const copyPassword = (password: string) => {
  navigator.clipboard.writeText(password)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
      @click.self="emit('close')"
    >
      <div class="w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-gray-800">
        <div class="p-6">
          <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <font-awesome-icon :icon="['fas', 'key']" class="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            Mot de passe réinitialisé
          </h3>
          <p class="mb-4 text-gray-500 dark:text-gray-400">
            Le nouveau mot de passe temporaire est :
          </p>
          <div class="flex items-center gap-2 rounded-lg bg-gray-100 p-3 dark:bg-gray-700">
            <code class="flex-1 font-mono text-lg text-gray-900 dark:text-white">{{ temporaryPassword }}</code>
            <button
              type="button"
              class="rounded-lg p-2 text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-600"
              title="Copier"
              @click="copyPassword(temporaryPassword)"
            >
              <font-awesome-icon :icon="['fas', 'copy']" class="h-4 w-4" />
            </button>
          </div>
          <p class="mt-4 text-sm text-amber-600 dark:text-amber-400">
            <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="mr-1" />
            L'utilisateur devra changer ce mot de passe à sa prochaine connexion.
          </p>
        </div>
        <div class="flex justify-end border-t border-gray-200 p-4 dark:border-gray-700">
          <button
            type="button"
            class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            @click="emit('close')"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
