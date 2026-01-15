<script setup lang="ts">
const localePath = useLocalePath()

// Redirect to /carrieres#etudiants
navigateTo(localePath('/carrieres') + '#etudiants', { redirectCode: 301 })
</script>

<template>
  <div></div>
</template>
