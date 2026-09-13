<script setup lang="ts">
/**
 * Backoffice PEI — partenaires du pôle : rattachement de partenaires existants
 * aux trois familles, ordre par famille, retrait. Les fiches partenaires se
 * créent et se modifient dans le backoffice Partenaires.
 */
import type { PeiPartnerFamily, PeiPartnerLinkAdmin } from '~/types/api/entrepreneurship'

definePageMeta({
  layout: 'admin',
})

const { hasPermission } = usePermissions()
const {
  listPeiPartners,
  linkPeiPartner,
  updatePeiPartnerFamily,
  unlinkPeiPartner,
  reorderPeiPartners,
} = useEntrepreneurshipApi()

const canCreate = computed(() => hasPermission('entrepreneurship.create'))
const canEdit = computed(() => hasPermission('entrepreneurship.edit'))
const canDelete = computed(() => hasPermission('entrepreneurship.delete'))

const links = ref<PeiPartnerLinkAdmin[]>([])
const loading = ref(true)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const pickerOpen = ref(false)
const linking = ref(false)

let successTimer: ReturnType<typeof setTimeout> | null = null

function showSuccess(text: string) {
  successMessage.value = text
  if (successTimer) clearTimeout(successTimer)
  successTimer = setTimeout(() => {
    successMessage.value = null
  }, 4000)
}

onBeforeUnmount(() => {
  if (successTimer) clearTimeout(successTimer)
})

function extractError(error: unknown, fallback: string): string {
  const err = error as { data?: { detail?: unknown } }
  const detail = err?.data?.detail
  return typeof detail === 'string' && detail ? detail : fallback
}

async function load(showSpinner = false) {
  if (showSpinner) loading.value = true
  try {
    links.value = await listPeiPartners()
  }
  catch (error: unknown) {
    errorMessage.value = extractError(error, 'Impossible de charger les partenaires du pôle.')
  }
  finally {
    loading.value = false
  }
}

onMounted(() => load(true))

async function onSelect(partnerId: string, family: PeiPartnerFamily) {
  errorMessage.value = null
  linking.value = true
  try {
    const created = await linkPeiPartner(partnerId, family)
    pickerOpen.value = false
    showSuccess(`« ${created.partner.name} » rattaché au pôle.`)
    await load()
  }
  catch (error: unknown) {
    pickerOpen.value = false
    errorMessage.value = extractError(error, 'Le rattachement du partenaire a échoué.')
  }
  finally {
    linking.value = false
  }
}

async function onChangeFamily(partnerId: string, family: PeiPartnerFamily) {
  errorMessage.value = null
  try {
    await updatePeiPartnerFamily(partnerId, family)
    showSuccess('Famille modifiée.')
  }
  catch (error: unknown) {
    errorMessage.value = extractError(error, 'Impossible de modifier la famille du partenaire.')
  }
  finally {
    await load()
  }
}

async function onUnlink(partnerId: string) {
  errorMessage.value = null
  try {
    await unlinkPeiPartner(partnerId)
    showSuccess('Partenaire retiré du pôle.')
  }
  catch (error: unknown) {
    errorMessage.value = extractError(error, 'Le retrait du partenaire a échoué.')
  }
  finally {
    await load()
  }
}

async function onReorder(family: PeiPartnerFamily, ids: string[]) {
  errorMessage.value = null
  try {
    await reorderPeiPartners(family, ids)
  }
  catch (error: unknown) {
    errorMessage.value = extractError(error, 'Le réordonnancement a échoué. L\'ordre précédent a été rétabli.')
  }
  finally {
    await load()
  }
}
</script>

<template>
  <div class="p-6">
    <!-- En-tête -->
    <header class="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
          Partenaires du pôle
        </h1>
        <p class="mt-1 max-w-3xl text-sm text-gray-500 dark:text-gray-400">
          Les partenaires se créent et se modifient dans le backoffice Partenaires ; ici on les classe dans les trois familles du pôle. Glissez-déposez pour définir l'ordre dans chaque famille.
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <NuxtLink
          to="/admin/partenaires"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <font-awesome-icon icon="fa-solid fa-arrow-up-right-from-square" class="h-4 w-4" />
          Ouvrir le backoffice Partenaires
        </NuxtLink>
        <button
          v-if="canCreate"
          type="button"
          class="inline-flex items-center gap-2 rounded-lg bg-brand-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue-700"
          @click="pickerOpen = true"
        >
          <font-awesome-icon icon="fa-solid fa-link" class="h-4 w-4" />
          Rattacher un partenaire
        </button>
      </div>
    </header>

    <div
      v-if="errorMessage"
      class="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
      role="alert"
    >
      <font-awesome-icon icon="fa-solid fa-circle-exclamation" class="mt-0.5 h-4 w-4 shrink-0" />
      <span class="flex-1">{{ errorMessage }}</span>
      <button type="button" class="text-red-500 hover:text-red-700" aria-label="Fermer" @click="errorMessage = null">
        <font-awesome-icon icon="fa-solid fa-xmark" class="h-4 w-4" />
      </button>
    </div>

    <div
      v-if="successMessage"
      class="mb-4 flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300"
      role="status"
    >
      <font-awesome-icon icon="fa-solid fa-check" class="mt-0.5 h-4 w-4 shrink-0" />
      <span>{{ successMessage }}</span>
    </div>

    <EntrepreneurshipAdminPartnerFamilyBoard
      :links="links"
      :loading="loading"
      :can-edit="canEdit"
      :can-delete="canDelete"
      @change-family="onChangeFamily"
      @unlink="onUnlink"
      @reorder="onReorder"
    />

    <EntrepreneurshipAdminPartnerPicker
      :open="pickerOpen"
      :saving="linking"
      @select="onSelect"
      @close="pickerOpen = false"
    />
  </div>
</template>
