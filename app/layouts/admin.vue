<script setup lang="ts">
const { isCollapsed } = useAdminSidebar()
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Header -->
    <AdminHeader />

    <!-- Main content -->
    <main
      :class="[
        'pt-16 min-h-screen transition-all duration-300',
        isCollapsed ? 'pl-20' : 'pl-72'
      ]"
    >
      <div class="p-6">
        <slot />
      </div>
    </main>
  </div>
</template>
