<script setup lang="ts">
import type { PageSectionField } from '~/composables/useEditorialValuesApi'

interface DonorCountry {
  id: string
  name_fr: string
  name_en: string
  name_ar: string
  code: string
  contribution_type_fr: string
  member_since: number
  description_fr: string
  capital: string
  website?: string
  sort_order: number
  is_active: boolean
}

const props = defineProps<{
  field: PageSectionField
  value: string
  isEditing: boolean
  isSaving: boolean
}>()

const emit = defineEmits<{
  edit: []
  save: [value: string, valueType: 'text' | 'number' | 'html']
  cancel: []
  history: []
}>()

// === STATE ===

const countries = ref<DonorCountry[]>([])
const editingCountryId = ref<string | null>(null)
const isAddingNew = ref(false)

const formData = ref<Partial<DonorCountry>>({})

// === COMPUTED ===

const hasValue = computed(() => countries.value.length > 0)

const sortedCountries = computed(() =>
  [...countries.value].sort((a, b) => a.sort_order - b.sort_order),
)

// === WATCHERS ===

watch(() => props.value, (val) => {
  parseCountries(val)
}, { immediate: true })

// === METHODS ===

function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return ''
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

function parseCountries(val: string) {
  if (!val) {
    countries.value = []
    return
  }
  try {
    const parsed = JSON.parse(val)
    countries.value = Array.isArray(parsed) ? parsed : []
  }
  catch {
    countries.value = []
  }
}

function startEditing() {
  emit('edit')
}

function cancel() {
  parseCountries(props.value)
  editingCountryId.value = null
  isAddingNew.value = false
  formData.value = {}
  emit('cancel')
}

function save() {
  const sorted = [...countries.value].sort((a, b) => a.sort_order - b.sort_order)
  emit('save', JSON.stringify(sorted), 'text')
}

// --- CRUD Pays ---

function startAddCountry() {
  editingCountryId.value = null
  isAddingNew.value = true
  formData.value = {
    name_fr: '',
    name_en: '',
    name_ar: '',
    code: '',
    contribution_type_fr: 'Membre fondateur',
    member_since: 1989,
    description_fr: '',
    capital: '',
    website: '',
    is_active: true,
  }
}

function startEditCountry(country: DonorCountry) {
  isAddingNew.value = false
  editingCountryId.value = country.id
  formData.value = { ...country }
}

function cancelForm() {
  editingCountryId.value = null
  isAddingNew.value = false
  formData.value = {}
}

function confirmAdd() {
  if (!formData.value.name_fr || !formData.value.code) return

  const newCountry: DonorCountry = {
    id: `pb-${formData.value.code!.toLowerCase()}`,
    name_fr: formData.value.name_fr!,
    name_en: formData.value.name_en || '',
    name_ar: formData.value.name_ar || '',
    code: formData.value.code!.toUpperCase(),
    contribution_type_fr: formData.value.contribution_type_fr || 'Membre fondateur',
    member_since: formData.value.member_since || 1989,
    description_fr: formData.value.description_fr || '',
    capital: formData.value.capital || '',
    website: formData.value.website || undefined,
    sort_order: countries.value.length + 1,
    is_active: formData.value.is_active ?? true,
  }

  countries.value.push(newCountry)
  cancelForm()
}

function confirmEdit() {
  if (!editingCountryId.value || !formData.value.name_fr || !formData.value.code) return

  const index = countries.value.findIndex(c => c.id === editingCountryId.value)
  if (index === -1) return

  const existing = countries.value[index]!
  countries.value[index] = {
    id: existing.id,
    sort_order: existing.sort_order,
    name_fr: formData.value.name_fr!,
    name_en: formData.value.name_en || '',
    name_ar: formData.value.name_ar || '',
    code: formData.value.code!.toUpperCase(),
    contribution_type_fr: formData.value.contribution_type_fr || '',
    member_since: formData.value.member_since || 1989,
    description_fr: formData.value.description_fr || '',
    capital: formData.value.capital || '',
    website: formData.value.website || undefined,
    is_active: formData.value.is_active ?? true,
  }

  cancelForm()
}

function deleteCountry(id: string) {
  countries.value = countries.value.filter(c => c.id !== id)
  countries.value.forEach((c, i) => {
    c.sort_order = i + 1
  })
}

function moveUp(index: number) {
  if (index <= 0) return
  const sorted = sortedCountries.value
  const current = sorted[index]
  const prev = sorted[index - 1]
  if (!current || !prev) return
  const tmp = current.sort_order
  current.sort_order = prev.sort_order
  prev.sort_order = tmp
}

function moveDown(index: number) {
  const sorted = sortedCountries.value
  if (index >= sorted.length - 1) return
  const current = sorted[index]
  const next = sorted[index + 1]
  if (!current || !next) return
  const tmp = current.sort_order
  current.sort_order = next.sort_order
  next.sort_order = tmp
}
</script>

<template>
  <div class="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
    <!-- Field header -->
    <div class="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700">
      <div class="flex items-center gap-2">
        <font-awesome-icon :icon="['fas', 'globe-africa']" class="h-4 w-4 text-green-500" />
        <span class="font-medium text-gray-900 dark:text-white text-sm">{{ field.label }}</span>
        <span
          v-if="hasValue"
          class="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
        >
          {{ countries.length }} pays
        </span>
        <span
          v-else
          class="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
        >
          Aucun pays
        </span>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="hasValue"
          class="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          title="Historique"
          @click="emit('history')"
        >
          <font-awesome-icon :icon="['fas', 'history']" class="h-3.5 w-3.5" />
        </button>
        <button
          v-if="!isEditing"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
          @click="startEditing"
        >
          <font-awesome-icon :icon="['fas', 'edit']" class="h-3 w-3" />
          Gérer
        </button>
      </div>
    </div>

    <!-- Field content -->
    <div class="p-3">
      <!-- === EDITING MODE === -->
      <div v-if="isEditing" class="space-y-4">
        <p class="text-xs text-gray-500 dark:text-gray-400">
          {{ field.description }}
        </p>

        <!-- Countries list -->
        <div v-if="sortedCountries.length > 0" class="space-y-2">
          <div
            v-for="(country, index) in sortedCountries"
            :key="country.id"
            class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50"
          >
            <!-- Drapeau -->
            <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center text-2xl">
              {{ getFlagEmoji(country.code) }}
            </div>

            <!-- Infos pays -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                {{ country.name_fr }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                <span>{{ country.code }}</span>
                <span v-if="country.contribution_type_fr"> &middot; {{ country.contribution_type_fr }}</span>
                <span v-if="country.member_since"> &middot; {{ country.member_since }}</span>
              </p>
            </div>

            <!-- Statut -->
            <span
              class="text-xs px-1.5 py-0.5 rounded flex-shrink-0"
              :class="country.is_active
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'"
            >
              {{ country.is_active ? 'Actif' : 'Inactif' }}
            </span>

            <!-- Actions -->
            <div class="flex items-center gap-1 flex-shrink-0">
              <button
                class="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Monter"
                :disabled="index === 0"
                @click="moveUp(index)"
              >
                <font-awesome-icon :icon="['fas', 'chevron-up']" class="h-3 w-3" />
              </button>
              <button
                class="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Descendre"
                :disabled="index === sortedCountries.length - 1"
                @click="moveDown(index)"
              >
                <font-awesome-icon :icon="['fas', 'chevron-down']" class="h-3 w-3" />
              </button>
              <button
                class="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="Modifier"
                @click="startEditCountry(country)"
              >
                <font-awesome-icon :icon="['fas', 'edit']" class="h-3 w-3" />
              </button>
              <button
                class="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Supprimer"
                @click="deleteCountry(country.id)"
              >
                <font-awesome-icon :icon="['fas', 'trash']" class="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div
          v-else
          class="flex items-center justify-center py-8 rounded-lg border border-dashed border-gray-300 dark:border-gray-600"
        >
          <div class="text-center">
            <font-awesome-icon :icon="['fas', 'globe-africa']" class="h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
            <p class="text-sm text-gray-400 dark:text-gray-500">
              Aucun pays. Cliquez sur « Ajouter » ci-dessous.
            </p>
          </div>
        </div>

        <!-- Add/Edit form -->
        <div
          v-if="isAddingNew || editingCountryId"
          class="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4 space-y-3"
        >
          <h5 class="text-sm font-semibold text-green-900 dark:text-green-100">
            {{ editingCountryId ? 'Modifier le pays' : 'Ajouter un pays' }}
          </h5>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <!-- Nom FR -->
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Nom (français) <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.name_fr"
                type="text"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Ex: France"
              />
            </div>
            <!-- Nom EN -->
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Nom (anglais)
              </label>
              <input
                v-model="formData.name_en"
                type="text"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Ex: France"
              />
            </div>
            <!-- Nom AR -->
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Nom (arabe)
              </label>
              <input
                v-model="formData.name_ar"
                type="text"
                dir="rtl"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="فرنسا"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <!-- Code ISO -->
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Code ISO <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.code"
                type="text"
                maxlength="2"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white uppercase"
                placeholder="FR"
              />
              <p v-if="formData.code && formData.code.length === 2" class="mt-1 text-lg">
                {{ getFlagEmoji(formData.code) }}
              </p>
            </div>
            <!-- Capitale -->
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Capitale
              </label>
              <input
                v-model="formData.capital"
                type="text"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Paris"
              />
            </div>
            <!-- Membre depuis -->
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Membre depuis
              </label>
              <input
                v-model.number="formData.member_since"
                type="number"
                min="1989"
                max="2100"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="1989"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <!-- Type de contribution -->
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Type de contribution
              </label>
              <input
                v-model="formData.contribution_type_fr"
                type="text"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Membre fondateur"
              />
            </div>
            <!-- Site web -->
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Site web
              </label>
              <input
                v-model="formData.website"
                type="text"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="https://..."
              />
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
              Description
            </label>
            <textarea
              v-model="formData.description_fr"
              rows="3"
              class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Description du rôle de ce pays..."
            />
          </div>

          <!-- Actif -->
          <div class="flex items-center gap-2">
            <input
              :id="`country-active-${editingCountryId || 'new'}`"
              v-model="formData.is_active"
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <label :for="`country-active-${editingCountryId || 'new'}`" class="text-sm text-gray-700 dark:text-gray-300">
              Pays actif (visible sur le site)
            </label>
          </div>

          <!-- Form actions -->
          <div class="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              class="rounded-md px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              @click="cancelForm"
            >
              Annuler
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
              :disabled="!formData.name_fr || !formData.code"
              @click="editingCountryId ? confirmEdit() : confirmAdd()"
            >
              <font-awesome-icon :icon="['fas', 'check']" class="h-3 w-3" />
              {{ editingCountryId ? 'Valider' : 'Ajouter' }}
            </button>
          </div>
        </div>

        <!-- Bottom actions -->
        <div class="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <button
            v-if="!isAddingNew && !editingCountryId"
            type="button"
            class="inline-flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 dark:border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
            @click="startAddCountry"
          >
            <font-awesome-icon :icon="['fas', 'plus']" class="h-3 w-3" />
            Ajouter un pays
          </button>
          <div v-else />

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="rounded-md px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              :disabled="isSaving"
              @click="cancel"
            >
              Annuler
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-md bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
              :disabled="isSaving || isAddingNew || !!editingCountryId"
              @click="save"
            >
              <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-3 w-3 animate-spin" />
              <font-awesome-icon v-else :icon="['fas', 'save']" class="h-3 w-3" />
              Enregistrer
            </button>
          </div>
        </div>
      </div>

      <!-- === DISPLAY MODE === -->
      <div v-else>
        <div v-if="sortedCountries.length > 0" class="space-y-1.5">
          <div
            v-for="country in sortedCountries"
            :key="country.id"
            class="flex items-center gap-2 text-sm"
          >
            <span class="text-base">{{ getFlagEmoji(country.code) }}</span>
            <span class="text-gray-700 dark:text-gray-300 truncate">{{ country.name_fr }}</span>
            <span v-if="country.member_since" class="text-xs text-gray-400 dark:text-gray-500">({{ country.member_since }})</span>
            <span
              v-if="!country.is_active"
              class="text-xs px-1 py-0.5 rounded bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
            >
              Inactif
            </span>
          </div>
        </div>
        <p v-else class="text-sm text-gray-400 dark:text-gray-500 italic">
          Aucun pays défini. Cliquez sur « Gérer » pour ajouter des pays fondateurs.
        </p>
      </div>
    </div>
  </div>
</template>
