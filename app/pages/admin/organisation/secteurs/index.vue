<script setup lang="ts">
/**
 * Ancienne adresse « Secteurs » : la gestion des secteurs se fait désormais
 * dans l'arborescence de /admin/organisation.
 */
definePageMeta({
  layout: 'admin',
  redirect: () => ({ path: '/admin/organisation', query: {} }),
})
</script>

<template>
  <div />
</template>
