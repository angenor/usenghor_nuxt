<script setup lang="ts">
import type { ShortLinkRead, AllowedDomainRead } from '~/composables/useShortLinksApi'

definePageMeta({
  layout: 'admin',
})

const { t } = useI18n()

const {
  listShortLinks,
  createShortLink,
  deleteShortLink,
  listAllowedDomains,
  addAllowedDomain,
  removeAllowedDomain,
} = useShortLinksApi()

// === State ===
const links = ref<ShortLinkRead[]>([])
const domains = ref<AllowedDomainRead[]>([])
const totalLinks = ref(0)
const currentPage = ref(1)
const totalPages = ref(1)
const searchQuery = ref('')
const isLoading = ref(true)
const error = ref<string | null>(null)

// Modal states
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const showDomainsModal = ref(false)
const isSaving = ref(false)

// Form state
const newTargetUrl = ref('')
const newDomain = ref('')
const deletingLink = ref<ShortLinkRead | null>(null)

// === Data Loading ===
async function loadLinks() {
  isLoading.value = true
  error.value = null
  try {
    const data = await listShortLinks({
      page: currentPage.value,
      limit: 20,
      search: searchQuery.value || undefined,
    })
    links.value = data.items
    totalLinks.value = data.total
    totalPages.value = data.pages
  }
  catch (err: any) {
    error.value = err?.data?.detail || err.message || 'Erreur lors du chargement'
  }
  finally {
    isLoading.value = false
  }
}

async function loadDomains() {
  try {
    const data = await listAllowedDomains()
    domains.value = data.items
  }
  catch (err: any) {
    console.error('Erreur chargement domaines:', err)
  }
}

// === Actions ===
async function handleCreate() {
  if (!newTargetUrl.value.trim()) return
  isSaving.value = true
  try {
    await createShortLink(newTargetUrl.value.trim())
    showCreateModal.value = false
    newTargetUrl.value = ''
    await loadLinks()
  }
  catch (err: any) {
    error.value = err?.data?.detail || err.message || 'Erreur lors de la création'
  }
  finally {
    isSaving.value = false
  }
}

function openDeleteModal(link: ShortLinkRead) {
  deletingLink.value = link
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!deletingLink.value) return
  isSaving.value = true
  try {
    await deleteShortLink(deletingLink.value.id)
    showDeleteModal.value = false
    deletingLink.value = null
    await loadLinks()
  }
  catch (err: any) {
    error.value = err?.data?.detail || err.message || 'Erreur lors de la suppression'
  }
  finally {
    isSaving.value = false
  }
}

async function copyToClipboard(url: string) {
  try {
    await navigator.clipboard.writeText(url)
  }
  catch {
    // Fallback silencieux
  }
}

async function handleAddDomain() {
  if (!newDomain.value.trim()) return
  isSaving.value = true
  try {
    await addAllowedDomain(newDomain.value.trim())
    newDomain.value = ''
    await loadDomains()
  }
  catch (err: any) {
    error.value = err?.data?.detail || err.message || 'Erreur lors de l\'ajout du domaine'
  }
  finally {
    isSaving.value = false
  }
}

async function handleRemoveDomain(id: string) {
  try {
    await removeAllowedDomain(id)
    await loadDomains()
  }
  catch (err: any) {
    error.value = err?.data?.detail || err.message || 'Erreur lors de la suppression du domaine'
  }
}

function handleSearch() {
  currentPage.value = 1
  loadLinks()
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// === Init ===
onMounted(async () => {
  await Promise.all([loadLinks(), loadDomains()])
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('shortLinks.title') }}
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ t('shortLinks.description') }}
        </p>
      </div>
      <div class="flex gap-2">
        <button
          class="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          @click="showDomainsModal = true"
        >
          <i class="fa-solid fa-globe" />
          {{ t('shortLinks.domains.title') }}
        </button>
        <button
          class="inline-flex items-center gap-2 rounded-lg bg-brand-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue-700"
          @click="showCreateModal = true"
        >
          <i class="fa-solid fa-plus" />
          {{ t('shortLinks.createLink') }}
        </button>
      </div>
    </div>

    <!-- Erreur -->
    <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
      <p class="text-sm text-red-700 dark:text-red-400">
        {{ error }}
      </p>
      <button class="mt-2 text-sm font-medium text-red-600 underline hover:text-red-800 dark:text-red-400" @click="error = null">
        Fermer
      </button>
    </div>

    <!-- Recherche -->
    <div class="flex items-center gap-4">
      <div class="relative flex-1">
        <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('shortLinks.search')"
          class="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-brand-blue-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          @keyup.enter="handleSearch"
        >
      </div>
      <span class="text-sm text-gray-500 dark:text-gray-400">
        {{ totalLinks }} lien{{ totalLinks > 1 ? 's' : '' }}
      </span>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <i class="fa-solid fa-spinner fa-spin text-2xl text-brand-blue-600" />
    </div>

    <!-- État vide -->
    <div
      v-else-if="links.length === 0"
      class="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-600"
    >
      <i class="fa-solid fa-link mb-4 text-4xl text-gray-400" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white">
        {{ t('shortLinks.noLinks') }}
      </h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ t('shortLinks.noLinksDescription') }}
      </p>
      <button
        class="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue-700"
        @click="showCreateModal = true"
      >
        <i class="fa-solid fa-plus" />
        {{ t('shortLinks.createLink') }}
      </button>
    </div>

    <!-- Tableau -->
    <div v-else class="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ t('shortLinks.table.code') }}
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ t('shortLinks.table.targetUrl') }}
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ t('shortLinks.table.shortUrl') }}
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ t('shortLinks.table.createdBy') }}
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ t('shortLinks.table.createdAt') }}
            </th>
            <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ t('shortLinks.table.actions') }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
          <tr v-for="link in links" :key="link.id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
            <td class="whitespace-nowrap px-4 py-3">
              <code class="rounded bg-gray-100 px-2 py-1 text-sm font-mono font-semibold text-brand-blue-600 dark:bg-gray-800 dark:text-brand-blue-400">
                {{ link.code }}
              </code>
            </td>
            <td class="max-w-xs truncate px-4 py-3 text-sm text-gray-700 dark:text-gray-300" :title="link.target_url">
              {{ link.target_url }}
            </td>
            <td class="whitespace-nowrap px-4 py-3">
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-500 dark:text-gray-400">
                  {{ link.full_short_url }}
                </span>
                <button
                  class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                  :title="t('shortLinks.messages.copied')"
                  @click="copyToClipboard(link.full_short_url)"
                >
                  <i class="fa-solid fa-copy text-sm" />
                </button>
              </div>
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              {{ link.created_by_name || '—' }}
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              {{ formatDate(link.created_at) }}
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-right">
              <button
                class="rounded p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                @click="openDeleteModal(link)"
              >
                <i class="fa-solid fa-trash text-sm" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-between">
      <button
        :disabled="currentPage <= 1"
        class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        @click="currentPage--; loadLinks()"
      >
        Précédent
      </button>
      <span class="text-sm text-gray-500 dark:text-gray-400">
        Page {{ currentPage }} / {{ totalPages }}
      </span>
      <button
        :disabled="currentPage >= totalPages"
        class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        @click="currentPage++; loadLinks()"
      >
        Suivant
      </button>
    </div>

    <!-- Modal Création -->
    <Teleport to="body">
      <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="showCreateModal = false">
        <div class="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            {{ t('shortLinks.createLink') }}
          </h2>
          <div class="space-y-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('shortLinks.form.targetUrl') }}
              </label>
              <input
                v-model="newTargetUrl"
                type="text"
                :placeholder="t('shortLinks.form.targetUrlPlaceholder')"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-blue-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                @keyup.enter="handleCreate"
              >
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {{ t('shortLinks.form.targetUrlHelp') }}
              </p>
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="showCreateModal = false"
            >
              {{ t('shortLinks.confirm.cancel') }}
            </button>
            <button
              :disabled="isSaving || !newTargetUrl.trim()"
              class="inline-flex items-center gap-2 rounded-lg bg-brand-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue-700 disabled:opacity-50"
              @click="handleCreate"
            >
              <i v-if="isSaving" class="fa-solid fa-spinner fa-spin" />
              {{ t('shortLinks.createLink') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Suppression -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="showDeleteModal = false">
        <div class="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <h2 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            {{ t('shortLinks.confirm.deleteTitle') }}
          </h2>
          <p class="mb-1 text-sm text-gray-500 dark:text-gray-400">
            {{ t('shortLinks.confirm.deleteMessage') }}
          </p>
          <p v-if="deletingLink" class="mb-4 rounded bg-gray-100 px-3 py-2 font-mono text-sm dark:bg-gray-700">
            /r/{{ deletingLink.code }} → {{ deletingLink.target_url }}
          </p>
          <div class="flex justify-end gap-3">
            <button
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="showDeleteModal = false"
            >
              {{ t('shortLinks.confirm.cancel') }}
            </button>
            <button
              :disabled="isSaving"
              class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              @click="handleDelete"
            >
              <i v-if="isSaving" class="fa-solid fa-spinner fa-spin" />
              {{ t('shortLinks.confirm.delete') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Domaines autorisés -->
    <Teleport to="body">
      <div v-if="showDomainsModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="showDomainsModal = false">
        <div class="mx-4 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <h2 class="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
            {{ t('shortLinks.domains.title') }}
          </h2>
          <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">
            {{ t('shortLinks.domains.description') }}
          </p>

          <!-- Formulaire d'ajout -->
          <div class="mb-4 flex gap-2">
            <input
              v-model="newDomain"
              type="text"
              :placeholder="t('shortLinks.domains.domainPlaceholder')"
              class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-blue-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              @keyup.enter="handleAddDomain"
            >
            <button
              :disabled="isSaving || !newDomain.trim()"
              class="rounded-lg bg-brand-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue-700 disabled:opacity-50"
              @click="handleAddDomain"
            >
              <i v-if="isSaving" class="fa-solid fa-spinner fa-spin" />
              <span v-else>{{ t('shortLinks.domains.addDomain') }}</span>
            </button>
          </div>

          <!-- Liste des domaines -->
          <div v-if="domains.length === 0" class="py-8 text-center">
            <i class="fa-solid fa-globe mb-2 text-2xl text-gray-400" />
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ t('shortLinks.domains.noDomains') }}
            </p>
          </div>
          <ul v-else class="max-h-60 space-y-2 overflow-y-auto">
            <li
              v-for="domain in domains"
              :key="domain.id"
              class="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700"
            >
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ domain.domain }}
              </span>
              <button
                class="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                @click="handleRemoveDomain(domain.id)"
              >
                <i class="fa-solid fa-times text-sm" />
              </button>
            </li>
          </ul>

          <div class="mt-4 flex justify-end">
            <button
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="showDomainsModal = false"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
