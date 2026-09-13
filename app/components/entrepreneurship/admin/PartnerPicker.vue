<script setup lang="ts">
/**
 * Modale de sélection d'un partenaire existant (non encore rattaché) à
 * rattacher à une famille du pôle PEI. Aucun partenaire n'est créé ici.
 */
import type { PeiPartnerAvailable, PeiPartnerFamily } from '~/types/api/entrepreneurship'
import { partnerFamilyOptions } from '~/composables/useEntrepreneurshipApi'
import { partnerTypeColors, partnerTypeLabels } from '~/composables/usePartnersApi'

const props = withDefaults(defineProps<{
  open: boolean
  defaultFamily?: PeiPartnerFamily
  saving?: boolean
}>(), {
  defaultFamily: 'academic',
  saving: false,
})

const emit = defineEmits<{
  select: [partnerId: string, family: PeiPartnerFamily]
  close: []
}>()

const { searchAvailablePartners } = useEntrepreneurshipApi()

const query = ref('')
const results = ref<PeiPartnerAvailable[]>([])
const loading = ref(false)
const loadError = ref<string | null>(null)
const selectedId = ref<string | null>(null)
const family = ref<PeiPartnerFamily>(props.defaultFamily)

let searchTimer: ReturnType<typeof setTimeout> | null = null
let requestSeq = 0

async function search() {
  const seq = ++requestSeq
  loading.value = true
  loadError.value = null
  try {
    const items = await searchAvailablePartners(query.value.trim(), 50)
    if (seq !== requestSeq) return
    results.value = items
    if (selectedId.value && !items.some(p => p.id === selectedId.value)) {
      selectedId.value = null
    }
  }
  catch {
    if (seq === requestSeq) loadError.value = 'Impossible de charger les partenaires.'
  }
  finally {
    if (seq === requestSeq) loading.value = false
  }
}

watch(query, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(search, 300)
})

watch(
  () => props.open,
  (open) => {
    if (open) {
      query.value = ''
      selectedId.value = null
      family.value = props.defaultFamily
      search()
    }
  },
  { immediate: true },
)

function onKeydown(event: KeyboardEvent) {
  if (props.open && event.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  if (searchTimer) clearTimeout(searchTimer)
})

function confirm() {
  if (!selectedId.value) return
  emit('select', selectedId.value, family.value)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="emit('close')"
    >
      <div
        class="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-800"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pei-partner-picker-title"
      >
        <!-- En-tête -->
        <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h3 id="pei-partner-picker-title" class="text-lg font-semibold text-gray-900 dark:text-white">
            Rattacher un partenaire
          </h3>
          <button
            type="button"
            class="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            aria-label="Fermer"
            @click="emit('close')"
          >
            <font-awesome-icon icon="fa-solid fa-xmark" class="h-4 w-4" />
          </button>
        </div>

        <!-- Recherche -->
        <div class="border-b border-gray-200 px-6 py-3 dark:border-gray-700">
          <div class="relative">
            <font-awesome-icon
              icon="fa-solid fa-magnifying-glass"
              class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            />
            <input
              v-model="query"
              type="search"
              placeholder="Rechercher un partenaire par nom ou description…"
              aria-label="Rechercher un partenaire"
              class="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 focus:border-brand-blue-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
          </div>
        </div>

        <!-- Résultats -->
        <div class="min-h-[12rem] flex-1 overflow-y-auto px-6 py-3">
          <div v-if="loading && !results.length" class="flex items-center justify-center gap-2 py-10 text-sm text-gray-500 dark:text-gray-400">
            <font-awesome-icon icon="fa-solid fa-spinner" class="h-4 w-4 animate-spin" />
            Chargement…
          </div>
          <p v-else-if="loadError" class="py-10 text-center text-sm text-red-600 dark:text-red-400">
            {{ loadError }}
          </p>
          <p v-else-if="!results.length" class="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
            Aucun partenaire disponible
          </p>
          <ul v-else class="space-y-1" role="listbox" aria-label="Partenaires disponibles">
            <li v-for="partner in results" :key="partner.id">
              <button
                type="button"
                role="option"
                :aria-selected="selectedId === partner.id"
                class="flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors"
                :class="selectedId === partner.id
                  ? 'border-brand-blue-500 bg-brand-blue-50 dark:border-brand-blue-400 dark:bg-brand-blue-900/30'
                  : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50'"
                @click="selectedId = partner.id"
              >
                <img
                  v-if="partner.logo_url"
                  :src="partner.logo_url"
                  :alt="partner.name"
                  class="h-9 w-9 shrink-0 rounded bg-white object-contain"
                  loading="lazy"
                >
                <span
                  v-else
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-gray-100 text-sm font-semibold text-gray-500 dark:bg-gray-700 dark:text-gray-300"
                >
                  {{ partner.name.charAt(0).toUpperCase() }}
                </span>
                <span class="min-w-0 flex-1 truncate text-sm font-medium text-gray-900 dark:text-white">
                  {{ partner.name }}
                </span>
                <span
                  class="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
                  :class="partnerTypeColors[partner.type]"
                >
                  {{ partnerTypeLabels[partner.type] }}
                </span>
                <span
                  v-if="!partner.active"
                  class="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                  title="Non visible publiquement"
                >
                  Inactif
                </span>
                <font-awesome-icon
                  v-if="selectedId === partner.id"
                  icon="fa-solid fa-circle-check"
                  class="h-4 w-4 shrink-0 text-brand-blue-600 dark:text-brand-blue-400"
                />
              </button>
            </li>
          </ul>
        </div>

        <!-- Pied -->
        <div class="space-y-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
          <div class="flex flex-wrap items-end justify-between gap-3">
            <label class="flex flex-col gap-1 text-sm">
              <span class="font-medium text-gray-700 dark:text-gray-300">Famille</span>
              <select
                v-model="family"
                class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option v-for="opt in partnerFamilyOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </label>
            <div class="flex gap-2">
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="emit('close')"
              >
                Annuler
              </button>
              <button
                type="button"
                :disabled="!selectedId || saving"
                class="inline-flex items-center gap-2 rounded-lg bg-brand-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                @click="confirm"
              >
                <font-awesome-icon
                  :icon="saving ? 'fa-solid fa-spinner' : 'fa-solid fa-link'"
                  :class="['h-4 w-4', saving ? 'animate-spin' : '']"
                />
                Rattacher
              </button>
            </div>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Le partenaire n'existe pas ? Créez-le dans le
            <NuxtLink to="/admin/partenaires" class="font-medium text-brand-blue-600 hover:underline dark:text-brand-blue-400">
              backoffice Partenaires
            </NuxtLink>, puis rattachez-le ici.
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>
