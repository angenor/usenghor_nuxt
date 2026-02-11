<script setup lang="ts">
const route = useRoute()

// Hide main navbar on externalized campus pages (they have their own CampusNavBar)
const showMainNavbar = computed(() => {
  const path = route.path
  // Match /a-propos/partenaires/campus/[slug] and its localized versions
  return !path.match(/^\/(en\/|ar\/)?a-propos\/partenaires\/campus\//)
})
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-gray-950 bg-grid-pattern">
    <AppNavBar v-if="showMainNavbar" />
    <main>
      <slot />
    </main>
    <AppFooter />
    <!-- <EventsWidget /> -->
  </div>
</template>
