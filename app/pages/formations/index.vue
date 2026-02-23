<script setup lang="ts">
const localePath = useLocalePath()

// Redirect to /nousrejoindre#etudiants
navigateTo(localePath('/nousrejoindre') + '#etudiants', { redirectCode: 301 })
</script>

<template>
  <div></div>
</template>
