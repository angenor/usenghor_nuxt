<script setup lang="ts">
import type { News, HighlightStatus, EditorJSContent, EditorJSBlock } from '~/composables/useMockData'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()

const {
  getAdminNewsItemById,
  newsStatusLabels,
  newsStatusColors,
  highlightStatusLabels,
  highlightStatusColors
} = useMockData()

// === STATE ===
const showDeleteModal = ref(false)

// Get news item
const newsId = computed(() => route.params.id as string)
const newsItem = computed(() => getAdminNewsItemById(newsId.value))

// 404 handling
if (!newsItem.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Actualité non trouvée'
  })
}

// === METHODS ===
function editNews() {
  router.push(`/admin/contenus/actualites/${newsId.value}/edit`)
}

function duplicateNews() {
  console.log('Duplicating news:', newsId.value)
  // En production: POST /api/admin/news/{id}/duplicate
}

function deleteNews() {
  console.log('Deleting news:', newsId.value)
  // En production: DELETE /api/admin/news/{id}
  showDeleteModal.value = false
  router.push('/admin/contenus/actualites')
}

function setHighlightStatus(status: HighlightStatus) {
  console.log('Setting highlight status:', newsId.value, status)
  // En production: POST /api/admin/news/{id}/highlight
}

function publishNews() {
  console.log('Publishing news:', newsId.value)
  // En production: POST /api/admin/news/{id}/publish
}

function unpublishNews() {
  console.log('Unpublishing news:', newsId.value)
  // En production: POST /api/admin/news/{id}/unpublish
}

function formatDate(dateString?: string) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function formatDateTime(dateString?: string) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Convertir le contenu EditorJS en HTML
function editorJsToHtml(content: EditorJSContent | undefined): string {
  if (!content || !content.blocks || content.blocks.length === 0) {
    return '<p class="text-gray-500 italic">Aucun contenu</p>'
  }

  return content.blocks.map((block: EditorJSBlock) => {
    switch (block.type) {
      case 'paragraph':
        return `<p>${block.data.text || ''}</p>`

      case 'header':
        const level = block.data.level || 2
        return `<h${level}>${block.data.text || ''}</h${level}>`

      case 'list':
        const listTag = block.data.style === 'ordered' ? 'ol' : 'ul'
        const items = (block.data.items as string[] || [])
          .map(item => `<li>${item}</li>`)
          .join('')
        return `<${listTag}>${items}</${listTag}>`

      case 'quote':
        const caption = block.data.caption ? `<cite>${block.data.caption}</cite>` : ''
        return `<blockquote><p>${block.data.text || ''}</p>${caption}</blockquote>`

      case 'image':
        const alt = block.data.caption || 'Image'
        return `<figure><img src="${block.data.file?.url || block.data.url || ''}" alt="${alt}" />${block.data.caption ? `<figcaption>${block.data.caption}</figcaption>` : ''}</figure>`

      case 'delimiter':
        return '<hr />'

      case 'code':
        return `<pre><code>${block.data.code || ''}</code></pre>`

      case 'table':
        const rows = (block.data.content as string[][] || [])
          .map((row, i) => {
            const cells = row.map(cell => i === 0 && block.data.withHeadings ? `<th>${cell}</th>` : `<td>${cell}</td>`).join('')
            return `<tr>${cells}</tr>`
          })
          .join('')
        return `<table>${rows}</table>`

      default:
        return `<p>${JSON.stringify(block.data)}</p>`
    }
  }).join('\n')
}

// Contenu HTML calculé
const contentHtml = computed(() => editorJsToHtml(newsItem.value?.content))
</script>

<template>
  <div v-if="newsItem" class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div class="flex items-start gap-4">
        <button
          class="mt-1 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          @click="router.push('/admin/contenus/actualites')"
        >
          <font-awesome-icon icon="fa-solid fa-arrow-left" class="h-5 w-5" />
        </button>
        <div>
          <div class="mb-2 flex flex-wrap items-center gap-2">
            <span
              class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
              :class="newsStatusColors[newsItem.status]"
            >
              {{ newsStatusLabels[newsItem.status] }}
            </span>
            <span
              class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
              :class="highlightStatusColors[newsItem.highlight_status]"
            >
              {{ highlightStatusLabels[newsItem.highlight_status] }}
            </span>
          </div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ newsItem.title }}
          </h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            /actualites/{{ newsItem.slug }}
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <!-- Actions rapides -->
        <div class="flex items-center gap-2">
          <button
            v-if="newsItem.status !== 'published'"
            class="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
            @click="publishNews"
          >
            <font-awesome-icon icon="fa-solid fa-globe" class="h-4 w-4" />
            Publier
          </button>
          <button
            v-else
            class="inline-flex items-center gap-2 rounded-lg border border-yellow-500 px-4 py-2 text-sm font-medium text-yellow-600 transition-colors hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-900/20"
            @click="unpublishNews"
          >
            <font-awesome-icon icon="fa-solid fa-eye-slash" class="h-4 w-4" />
            Dépublier
          </button>
        </div>

        <!-- Dropdown mise en avant -->
        <select
          :value="newsItem.highlight_status"
          class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          @change="setHighlightStatus(($event.target as HTMLSelectElement).value as HighlightStatus)"
        >
          <option value="standard">Standard</option>
          <option value="featured">Mise en avant</option>
          <option value="headline">À la une</option>
        </select>

        <!-- Actions -->
        <button
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          @click="editNews"
        >
          <font-awesome-icon icon="fa-solid fa-pen" class="h-4 w-4" />
          Modifier
        </button>
        <button
          class="rounded-lg border border-gray-300 p-2 text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
          title="Dupliquer"
          @click="duplicateNews"
        >
          <font-awesome-icon icon="fa-solid fa-copy" class="h-4 w-4" />
        </button>
        <button
          class="rounded-lg border border-red-300 p-2 text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
          title="Supprimer"
          @click="showDeleteModal = true"
        >
          <font-awesome-icon icon="fa-solid fa-trash" class="h-4 w-4" />
        </button>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Contenu principal -->
      <div class="space-y-6 lg:col-span-2">
        <!-- Image de couverture -->
        <div v-if="newsItem.cover_image" class="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
          <img
            :src="newsItem.cover_image"
            :alt="newsItem.cover_image_alt || newsItem.title"
            class="h-64 w-full object-cover"
          />
        </div>

        <!-- Résumé -->
        <div v-if="newsItem.summary" class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
            Résumé
          </h2>
          <p class="text-gray-600 dark:text-gray-300">
            {{ newsItem.summary }}
          </p>
        </div>

        <!-- Contenu -->
        <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
            Contenu
          </h2>
          <div
            class="prose prose-sm max-w-none dark:prose-invert"
            v-html="contentHtml"
          ></div>
        </div>

        <!-- Vidéo -->
        <div v-if="newsItem.video_url" class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
            Vidéo
          </h2>
          <a
            :href="newsItem.video_url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 text-blue-600 hover:underline dark:text-blue-400"
          >
            <font-awesome-icon icon="fa-solid fa-video" class="h-4 w-4" />
            {{ newsItem.video_url }}
          </a>
        </div>

        <!-- Galerie médias -->
        <div v-if="newsItem.media && newsItem.media.length > 0" class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
            Galerie ({{ newsItem.media.length }} médias)
          </h2>
          <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div
              v-for="media in newsItem.media"
              :key="media.id"
              class="overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700"
            >
              <img
                :src="media.url"
                :alt="media.alt || 'Image'"
                class="h-32 w-full object-cover"
              />
              <p v-if="media.caption" class="p-2 text-xs text-gray-600 dark:text-gray-400">
                {{ media.caption }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Métadonnées -->
        <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Informations
          </h2>
          <dl class="space-y-3">
            <div>
              <dt class="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                Auteur
              </dt>
              <dd class="mt-1 flex items-center gap-2">
                <img
                  v-if="newsItem.author.avatar"
                  :src="newsItem.author.avatar"
                  :alt="newsItem.author.name"
                  class="h-6 w-6 rounded-full"
                />
                <span class="text-sm text-gray-900 dark:text-white">
                  {{ newsItem.author.name }}
                </span>
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                Créé le
              </dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ formatDateTime(newsItem.created_at) }}
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                Modifié le
              </dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ formatDateTime(newsItem.updated_at) }}
              </dd>
            </div>
            <div v-if="newsItem.published_at">
              <dt class="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                Publié le
              </dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ formatDateTime(newsItem.published_at) }}
              </dd>
            </div>
            <div v-if="newsItem.visible_from">
              <dt class="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                Visible à partir de
              </dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ formatDateTime(newsItem.visible_from) }}
              </dd>
            </div>
          </dl>
        </div>

        <!-- Tags -->
        <div v-if="newsItem.tags.length > 0" class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
            Tags
          </h2>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in newsItem.tags"
              :key="tag.id"
              class="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300"
            >
              {{ tag.name }}
            </span>
          </div>
        </div>

        <!-- Associations -->
        <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Associations
          </h2>
          <dl class="space-y-3">
            <div v-if="newsItem.campus_name">
              <dt class="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                Campus
              </dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ newsItem.campus_name }}
              </dd>
            </div>
            <div v-if="newsItem.department_name">
              <dt class="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                Département
              </dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ newsItem.department_name }}
              </dd>
            </div>
            <div v-if="newsItem.service_name">
              <dt class="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                Service
              </dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ newsItem.service_name }}
              </dd>
            </div>
            <div v-if="newsItem.project_name">
              <dt class="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                Projet
              </dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ newsItem.project_name }}
              </dd>
            </div>
            <div v-if="newsItem.event_name">
              <dt class="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                Événement
              </dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ newsItem.event_name }}
              </dd>
            </div>
            <div v-if="!newsItem.campus_name && !newsItem.department_name && !newsItem.service_name && !newsItem.project_name && !newsItem.event_name">
              <p class="text-sm italic text-gray-500 dark:text-gray-400">
                Aucune association
              </p>
            </div>
          </dl>
        </div>

        <!-- Actions rapides -->
        <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Actions
          </h2>
          <div class="space-y-2">
            <a
              :href="`/actualites/${newsItem.slug}`"
              target="_blank"
              class="flex w-full items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <font-awesome-icon icon="fa-solid fa-external-link-alt" class="h-4 w-4" />
              Prévisualiser sur le site
            </a>
            <button
              class="flex w-full items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="duplicateNews"
            >
              <font-awesome-icon icon="fa-solid fa-copy" class="h-4 w-4" />
              Dupliquer
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Supprimer -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="showDeleteModal = false"
      >
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Supprimer l'actualité
            </h3>
          </div>

          <p class="mb-2 text-gray-600 dark:text-gray-300">
            Êtes-vous sûr de vouloir supprimer cette actualité ?
          </p>
          <p class="mb-6 rounded-lg bg-gray-100 p-3 text-sm font-medium text-gray-900 dark:bg-gray-700 dark:text-white">
            {{ newsItem.title }}
          </p>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="showDeleteModal = false"
            >
              Annuler
            </button>
            <button
              type="button"
              class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              @click="deleteNews"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
