<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

// Redirige vers la page profil unique (layout public)
navigateTo('/profil', { replace: true })
</script>
