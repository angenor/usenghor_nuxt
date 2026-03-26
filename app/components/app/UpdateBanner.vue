<script setup lang="ts">
const { updateAvailable, reload, dismiss } = useAppVersion()
</script>

<template>
  <Transition
    enter-active-class="transition-transform duration-300 ease-out"
    enter-from-class="-translate-y-full"
    enter-to-class="translate-y-0"
    leave-active-class="transition-transform duration-200 ease-in"
    leave-from-class="translate-y-0"
    leave-to-class="-translate-y-full"
  >
    <div
      v-if="updateAvailable"
      class="fixed top-0 inset-x-0 z-[9999] bg-brand-blue-700 text-white px-4 py-3 flex items-center justify-center gap-4 shadow-lg"
    >
      <span class="text-sm font-medium">
        Une nouvelle version du site est disponible.
      </span>
      <button
        class="bg-white text-brand-blue-700 px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-brand-blue-50 transition-colors"
        @click="reload"
      >
        Actualiser
      </button>
      <button
        class="text-white/70 hover:text-white transition-colors text-sm underline underline-offset-2"
        @click="dismiss"
      >
        Plus tard
      </button>
    </div>
  </Transition>
</template>
