<script setup lang="ts">
import type { AlbumRead } from '~/composables/useAlbumsApi'

const props = defineProps<{
  projectId: string
}>()

const {
  listProjectMedia,
  addProjectAlbum,
  removeProjectAlbum,
} = useProjectsApi()

const { listAlbums } = useAlbumsApi()

// État
const projectAlbumIds = ref<string[]>([])
const allAlbums = ref<AlbumRead[]>([])
const isLoading = ref(true)
const showAddModal = ref(false)
const selectedAlbumId = ref('')

// Chargement
onMounted(async () => {
  await Promise.all([loadProjectMedia(), loadAllAlbums()])
  isLoading.value = false
})

async function loadProjectMedia() {
  try {
    const data = await listProjectMedia(props.projectId)
    projectAlbumIds.value = data.map(m => m.album_external_id)
  }
  catch (err) {
    console.error('Erreur chargement média projet:', err)
  }
}

async function loadAllAlbums() {
  try {
    const response = await listAlbums({ limit: 100, status: 'published' })
    allAlbums.value = response.items
  }
  catch (err) {
    console.error('Erreur chargement albums:', err)
  }
}

// Albums enrichis
const enrichedAlbums = computed(() => {
  return projectAlbumIds.value
    .map(id => allAlbums.value.find(a => a.id === id))
    .filter((a): a is AlbumRead => !!a)
})

// Albums disponibles (non encore associés)
const availableAlbums = computed(() => {
  return allAlbums.value.filter(a => !projectAlbumIds.value.includes(a.id))
})

// Actions
async function handleAdd() {
  if (!selectedAlbumId.value) {
    alert('Veuillez sélectionner un album')
    return
  }

  try {
    await addProjectAlbum(props.projectId, selectedAlbumId.value)
    projectAlbumIds.value.push(selectedAlbumId.value)
    showAddModal.value = false
    selectedAlbumId.value = ''
  }
  catch (err) {
    console.error('Erreur ajout album:', err)
    alert('Erreur lors de l\'ajout de l\'album')
  }
}

async function handleRemove(albumId: string) {
  if (!confirm('Retirer cet album du projet ?')) return

  try {
    await removeProjectAlbum(props.projectId, albumId)
    projectAlbumIds.value = projectAlbumIds.value.filter(id => id !== albumId)
  }
  catch (err) {
    console.error('Erreur suppression album:', err)
    alert('Erreur lors de la suppression')
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
        <font-awesome-icon :icon="['fas', 'images']" class="h-5 w-5 text-purple-500" />
        Médiathèque
      </h2>
      <button
        class="text-sm text-blue-600 hover:underline dark:text-blue-400"
        @click="showAddModal = true"
      >
        + Ajouter un album
      </button>
    </div>

    <!-- Chargement -->
    <div v-if="isLoading" class="flex items-center justify-center py-8">
      <font-awesome-icon :icon="['fas', 'spinner']" class="animate-spin text-2xl text-gray-400" />
    </div>

    <!-- Liste des albums -->
    <div v-else-if="enrichedAlbums.length > 0" class="space-y-3">
      <div
        v-for="album in enrichedAlbums"
        :key="album.id"
        class="group flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
      >
        <div class="flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <font-awesome-icon :icon="['fas', 'photo-film']" class="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <div class="font-medium text-gray-900 dark:text-white">
              {{ album.title }}
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              Créé le {{ formatDate(album.created_at) }}
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <NuxtLink
            :to="`/admin/mediatheque/albums/${album.id}`"
            class="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700"
            title="Voir l'album"
          >
            <font-awesome-icon :icon="['fas', 'external-link']" class="h-4 w-4" />
          </NuxtLink>
          <button
            class="rounded p-1.5 text-gray-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 dark:hover:bg-red-900/20"
            title="Retirer"
            @click="handleRemove(album.id)"
          >
            <font-awesome-icon :icon="['fas', 'unlink']" class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- État vide -->
    <div v-else class="py-8 text-center text-gray-400">
      <font-awesome-icon :icon="['fas', 'photo-film']" class="mb-2 h-8 w-8" />
      <p>Aucun album associé</p>
    </div>

    <!-- Modal ajout album -->
    <Teleport to="body">
      <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Ajouter un album
          </h3>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Album <span class="text-red-500">*</span>
            </label>
            <select
              v-model="selectedAlbumId"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Sélectionnez un album</option>
              <option v-for="album in availableAlbums" :key="album.id" :value="album.id">
                {{ album.title }}
              </option>
            </select>
            <p v-if="availableAlbums.length === 0" class="mt-2 text-sm text-gray-500">
              Tous les albums sont déjà associés ou aucun album publié n'est disponible.
            </p>
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="showAddModal = false"
            >
              Annuler
            </button>
            <button
              :disabled="!selectedAlbumId"
              class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              @click="handleAdd"
            >
              Ajouter
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
