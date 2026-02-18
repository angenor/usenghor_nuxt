<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})
</script>

<template>
  <div class="flex items-center justify-center min-h-[60vh]">
    <div class="text-center max-w-md">
      <div
        class="mx-auto w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6"
      >
        <font-awesome-icon
          icon="fa-solid fa-lock"
          class="w-10 h-10 text-red-500 dark:text-red-400"
        />
      </div>

      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        Accès refusé
      </h1>

      <p class="text-gray-500 dark:text-gray-400 mb-8">
        Vous n'avez pas les permissions nécessaires pour accéder à cet espace.
        Contactez un administrateur si vous pensez qu'il s'agit d'une erreur.
      </p>

      <NuxtLink
        to="/admin"
        class="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue-600 hover:bg-brand-blue-700
               text-white font-medium rounded-lg transition-colors"
      >
        <font-awesome-icon icon="fa-solid fa-arrow-left" class="w-4 h-4" />
        Retour au tableau de bord
      </NuxtLink>
    </div>
  </div>
</template>
