<script setup lang="ts">
/**
 * Ancienne liste des services : redirigée vers l'arborescence
 * /admin/organisation (ou vers la page du service demandé).
 *
 * - `?service_id=<id>` → /admin/organisation/services/<id>
 * - `?sector=<id>`     → /admin/organisation?secteur=<id>
 */
definePageMeta({
  layout: 'admin',
  redirect: (to) => {
    const first = (value: unknown): string | null => {
      const v = Array.isArray(value) ? value[0] : value
      return typeof v === 'string' && v ? v : null
    }
    const serviceId = first(to.query.service_id)
    if (serviceId) return { path: `/admin/organisation/services/${encodeURIComponent(serviceId)}`, query: {} }
    const sectorId = first(to.query.sector)
    return { path: '/admin/organisation', query: sectorId ? { secteur: sectorId } : {} }
  },
})
</script>

<template>
  <div />
</template>
