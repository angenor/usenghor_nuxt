<script setup lang="ts">
/**
 * Ancienne page « Objectifs & Réalisations » : les objectifs, réalisations et
 * projets se gèrent dans les onglets de la page de chaque service, depuis
 * l'arborescence /admin/organisation.
 */
definePageMeta({
  layout: 'admin',
  redirect: () => ({ path: '/admin/organisation', query: {} }),
})
</script>

<template>
  <div />
</template>
