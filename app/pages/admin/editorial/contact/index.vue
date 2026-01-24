<script setup lang="ts">
import type {
  ContactAddress,
  ContactPhones,
  ContactEmails,
  ContactHours,
  ContactFormConfig,
  DepartmentContact
} from '~/composables/useMockData'

definePageMeta({
  layout: 'admin'
})

const {
  getContactInfo,
  getContactStats,
  getContactHistory,
  getDepartmentContacts,
  validateContactEmail,
  validatePhoneNumber,
  validateCoordinates,
  getGoogleMapsUrl,
  getGoogleMapsUrlWithCoords,
  getMailtoLink,
  getTelLink,
  contactSectionLabels,
  contactSectionIcons,
  generateDepartmentContactId
} = useMockData()

// === STATE ===
const isLoading = ref(true)
const isSaving = ref(false)
const activeSection = ref<string | null>(null)
const showHistory = ref(false)
const showDepartmentModal = ref(false)
const editingDepartmentContact = ref<DepartmentContact | null>(null)

// Form states for each section
const addressForm = ref<ContactAddress>({
  street: '',
  postal_code: '',
  city: '',
  country: '',
  latitude: 0,
  longitude: 0
})

const phonesForm = ref<ContactPhones>({
  main: '',
  secondary: null,
  fax: null
})

const emailsForm = ref<ContactEmails>({
  general: '',
  admissions: '',
  partnerships: '',
  press: null
})

const hoursForm = ref<ContactHours>({
  days: '',
  hours: '',
  timezone: '',
  closures: ''
})

const formConfigForm = ref<ContactFormConfig>({
  default_recipients: [],
  subjects: [],
  confirmation_message: ''
})

const departmentContacts = ref<DepartmentContact[]>([])

// Department contact form
const departmentForm = ref({
  department_name: '',
  email: '',
  phone: '',
  responsible_name: ''
})

// New recipient/subject inputs
const newRecipient = ref('')
const newSubject = ref('')

// === COMPUTED ===
const stats = computed(() => getContactStats())
const history = computed(() => getContactHistory())

// Validation
const isAddressValid = computed(() => {
  return addressForm.value.street.trim() &&
    addressForm.value.city.trim() &&
    addressForm.value.country.trim() &&
    validateCoordinates(addressForm.value.latitude, addressForm.value.longitude)
})

const isPhonesValid = computed(() => {
  return phonesForm.value.main.trim() &&
    validatePhoneNumber(phonesForm.value.main)
})

const isEmailsValid = computed(() => {
  return emailsForm.value.general.trim() &&
    validateContactEmail(emailsForm.value.general) &&
    validateContactEmail(emailsForm.value.admissions) &&
    validateContactEmail(emailsForm.value.partnerships)
})

const isHoursValid = computed(() => {
  return hoursForm.value.days.trim() &&
    hoursForm.value.hours.trim()
})

const isFormConfigValid = computed(() => {
  return formConfigForm.value.default_recipients.length > 0 &&
    formConfigForm.value.subjects.length > 0 &&
    formConfigForm.value.confirmation_message.trim()
})

const isDepartmentFormValid = computed(() => {
  return departmentForm.value.department_name.trim() &&
    departmentForm.value.email.trim() &&
    validateContactEmail(departmentForm.value.email)
})

// === LIFECYCLE ===
onMounted(() => {
  loadData()
})

// === METHODS ===
const loadData = () => {
  isLoading.value = true
  try {
    const info = getContactInfo()

    // Load all sections
    addressForm.value = { ...info.address }
    phonesForm.value = { ...info.phones }
    emailsForm.value = { ...info.emails }
    hoursForm.value = { ...info.hours }
    formConfigForm.value = {
      ...info.contact_form,
      default_recipients: [...info.contact_form.default_recipients],
      subjects: [...info.contact_form.subjects]
    }
    departmentContacts.value = getDepartmentContacts()
  } finally {
    isLoading.value = false
  }
}

// Toggle section editing
const toggleSection = (section: string) => {
  if (activeSection.value === section) {
    activeSection.value = null
  } else {
    activeSection.value = section
  }
}

// Save section
const saveSection = async (section: string) => {
  isSaving.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    console.log(`Sauvegarde de la section ${section}:`, {
      address: addressForm.value,
      phones: phonesForm.value,
      emails: emailsForm.value,
      hours: hoursForm.value,
      contact_form: formConfigForm.value
    }[section])

    activeSection.value = null
  } finally {
    isSaving.value = false
  }
}

// Cancel editing
const cancelSection = () => {
  loadData()
  activeSection.value = null
}

// Recipients management
const addRecipient = () => {
  const email = newRecipient.value.trim()
  if (email && validateContactEmail(email) && !formConfigForm.value.default_recipients.includes(email)) {
    formConfigForm.value.default_recipients.push(email)
    newRecipient.value = ''
  }
}

const removeRecipient = (index: number) => {
  formConfigForm.value.default_recipients.splice(index, 1)
}

// Subjects management
const addSubject = () => {
  const subject = newSubject.value.trim()
  if (subject && !formConfigForm.value.subjects.includes(subject)) {
    formConfigForm.value.subjects.push(subject)
    newSubject.value = ''
  }
}

const removeSubject = (index: number) => {
  formConfigForm.value.subjects.splice(index, 1)
}

const moveSubject = (index: number, direction: 'up' | 'down') => {
  const newIndex = direction === 'up' ? index - 1 : index + 1
  if (newIndex >= 0 && newIndex < formConfigForm.value.subjects.length) {
    const items = formConfigForm.value.subjects
    ;[items[index], items[newIndex]] = [items[newIndex], items[index]]
  }
}

// Department contacts management
const openDepartmentModal = (contact?: DepartmentContact) => {
  if (contact) {
    editingDepartmentContact.value = contact
    departmentForm.value = {
      department_name: contact.department_name,
      email: contact.email,
      phone: contact.phone || '',
      responsible_name: contact.responsible_name || ''
    }
  } else {
    editingDepartmentContact.value = null
    departmentForm.value = {
      department_name: '',
      email: '',
      phone: '',
      responsible_name: ''
    }
  }
  showDepartmentModal.value = true
}

const saveDepartmentContact = async () => {
  if (!isDepartmentFormValid.value) return

  isSaving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 300))

    if (editingDepartmentContact.value) {
      // Update existing
      const index = departmentContacts.value.findIndex(d => d.id === editingDepartmentContact.value!.id)
      if (index !== -1) {
        departmentContacts.value[index] = {
          ...editingDepartmentContact.value,
          department_name: departmentForm.value.department_name.trim(),
          email: departmentForm.value.email.trim(),
          phone: departmentForm.value.phone.trim() || null,
          responsible_name: departmentForm.value.responsible_name.trim() || null
        }
      }
    } else {
      // Create new
      const newContact: DepartmentContact = {
        id: generateDepartmentContactId(),
        department_name: departmentForm.value.department_name.trim(),
        email: departmentForm.value.email.trim(),
        phone: departmentForm.value.phone.trim() || null,
        responsible_name: departmentForm.value.responsible_name.trim() || null,
        order: departmentContacts.value.length + 1
      }
      departmentContacts.value.push(newContact)
    }

    showDepartmentModal.value = false
  } finally {
    isSaving.value = false
  }
}

const deleteDepartmentContact = async (contact: DepartmentContact) => {
  if (!confirm(`Supprimer le contact "${contact.department_name}" ?`)) return

  isSaving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    departmentContacts.value = departmentContacts.value.filter(d => d.id !== contact.id)
  } finally {
    isSaving.value = false
  }
}

const moveDepartmentContact = (index: number, direction: 'up' | 'down') => {
  const newIndex = direction === 'up' ? index - 1 : index + 1
  if (newIndex >= 0 && newIndex < departmentContacts.value.length) {
    const items = departmentContacts.value
    ;[items[index], items[newIndex]] = [items[newIndex], items[index]]
    // Update order
    items.forEach((item, i) => {
      item.order = i + 1
    })
  }
}

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="mx-auto max-w-6xl p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Informations de contact
      </h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Gérez les coordonnées et informations de contact de l'université
      </p>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <font-awesome-icon :icon="['fas', 'spinner']" class="h-8 w-8 animate-spin text-gray-400" />
    </div>

    <template v-else>
      <!-- Statistics cards -->
      <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <font-awesome-icon :icon="['fas', 'th-large']" class="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.sections_count }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Sections</p>
            </div>
          </div>
        </div>

        <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <font-awesome-icon :icon="['fas', 'users']" class="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.department_contacts_count }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Contacts services</p>
            </div>
          </div>
        </div>

        <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <font-awesome-icon :icon="['fas', 'list']" class="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.form_subjects_count }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Sujets formulaire</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions bar -->
      <div class="mb-6 flex items-center justify-end">
        <button
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="showHistory = !showHistory"
        >
          <font-awesome-icon :icon="['fas', 'history']" class="h-4 w-4" />
          {{ showHistory ? 'Masquer' : 'Voir' }} l'historique
        </button>
      </div>

      <!-- History panel -->
      <div
        v-if="showHistory"
        class="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
      >
        <h3 class="mb-4 font-medium text-gray-900 dark:text-white">
          Historique des modifications
        </h3>
        <div v-if="history.length === 0" class="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Aucune modification enregistrée
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="item in history"
            :key="item.id"
            class="flex items-start gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50"
          >
            <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <font-awesome-icon :icon="['fas', 'edit']" class="h-3 w-3 text-blue-600 dark:text-blue-400" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ item.section }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ item.old_value }} &rarr; {{ item.new_value }}
              </p>
              <p class="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Par {{ item.modified_by_name }} le {{ formatDate(item.modified_at) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Sections -->
      <div class="space-y-4">
        <!-- Address Section -->
        <div class="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <button
            class="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
            @click="toggleSection('address')"
          >
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                <font-awesome-icon :icon="['fas', 'map-marker-alt']" class="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 class="font-medium text-gray-900 dark:text-white">{{ contactSectionLabels.address }}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ addressForm.street }}, {{ addressForm.city }}
                </p>
              </div>
            </div>
            <font-awesome-icon
              :icon="['fas', 'chevron-down']"
              class="h-4 w-4 text-gray-400 transition-transform"
              :class="{ 'rotate-180': activeSection === 'address' }"
            />
          </button>

          <div v-if="activeSection === 'address'" class="border-t border-gray-200 p-4 dark:border-gray-700">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="md:col-span-2">
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Adresse *
                </label>
                <input
                  v-model="addressForm.street"
                  type="text"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Code postal
                </label>
                <input
                  v-model="addressForm.postal_code"
                  type="text"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ville *
                </label>
                <input
                  v-model="addressForm.city"
                  type="text"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Pays *
                </label>
                <input
                  v-model="addressForm.country"
                  type="text"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Latitude
                </label>
                <input
                  v-model.number="addressForm.latitude"
                  type="number"
                  step="0.0001"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Longitude
                </label>
                <input
                  v-model.number="addressForm.longitude"
                  type="number"
                  step="0.0001"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <!-- Map link -->
            <div class="mt-4">
              <a
                :href="getGoogleMapsUrlWithCoords(addressForm)"
                target="_blank"
                class="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                <font-awesome-icon :icon="['fas', 'external-link-alt']" class="h-3 w-3" />
                Voir sur Google Maps
              </a>
            </div>

            <!-- Actions -->
            <div class="mt-4 flex justify-end gap-2">
              <button
                type="button"
                class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="cancelSection"
              >
                Annuler
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-red-700 disabled:opacity-50"
                :disabled="!isAddressValid || isSaving"
                @click="saveSection('address')"
              >
                <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
                Enregistrer
              </button>
            </div>
          </div>
        </div>

        <!-- Phones Section -->
        <div class="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <button
            class="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
            @click="toggleSection('phones')"
          >
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                <font-awesome-icon :icon="['fas', 'phone']" class="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 class="font-medium text-gray-900 dark:text-white">{{ contactSectionLabels.phones }}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ phonesForm.main }}
                </p>
              </div>
            </div>
            <font-awesome-icon
              :icon="['fas', 'chevron-down']"
              class="h-4 w-4 text-gray-400 transition-transform"
              :class="{ 'rotate-180': activeSection === 'phones' }"
            />
          </button>

          <div v-if="activeSection === 'phones'" class="border-t border-gray-200 p-4 dark:border-gray-700">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Téléphone principal *
                </label>
                <input
                  v-model="phonesForm.main"
                  type="tel"
                  placeholder="+20 3 484 3562"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Téléphone secondaire
                </label>
                <input
                  v-model="phonesForm.secondary"
                  type="tel"
                  placeholder="+20 3 484 3563"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fax
                </label>
                <input
                  v-model="phonesForm.fax"
                  type="tel"
                  placeholder="+20 3 484 3564"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div class="mt-4 flex justify-end gap-2">
              <button
                type="button"
                class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="cancelSection"
              >
                Annuler
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-red-700 disabled:opacity-50"
                :disabled="!isPhonesValid || isSaving"
                @click="saveSection('phones')"
              >
                <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
                Enregistrer
              </button>
            </div>
          </div>
        </div>

        <!-- Emails Section -->
        <div class="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <button
            class="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
            @click="toggleSection('emails')"
          >
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <font-awesome-icon :icon="['fas', 'envelope']" class="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 class="font-medium text-gray-900 dark:text-white">{{ contactSectionLabels.emails }}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ emailsForm.general }}
                </p>
              </div>
            </div>
            <font-awesome-icon
              :icon="['fas', 'chevron-down']"
              class="h-4 w-4 text-gray-400 transition-transform"
              :class="{ 'rotate-180': activeSection === 'emails' }"
            />
          </button>

          <div v-if="activeSection === 'emails'" class="border-t border-gray-200 p-4 dark:border-gray-700">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email général *
                </label>
                <input
                  v-model="emailsForm.general"
                  type="email"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email admissions *
                </label>
                <input
                  v-model="emailsForm.admissions"
                  type="email"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email partenariats *
                </label>
                <input
                  v-model="emailsForm.partnerships"
                  type="email"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email presse
                </label>
                <input
                  v-model="emailsForm.press"
                  type="email"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div class="mt-4 flex justify-end gap-2">
              <button
                type="button"
                class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="cancelSection"
              >
                Annuler
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-red-700 disabled:opacity-50"
                :disabled="!isEmailsValid || isSaving"
                @click="saveSection('emails')"
              >
                <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
                Enregistrer
              </button>
            </div>
          </div>
        </div>

        <!-- Hours Section -->
        <div class="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <button
            class="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
            @click="toggleSection('hours')"
          >
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <font-awesome-icon :icon="['fas', 'clock']" class="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 class="font-medium text-gray-900 dark:text-white">{{ contactSectionLabels.hours }}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ hoursForm.days }}, {{ hoursForm.hours }}
                </p>
              </div>
            </div>
            <font-awesome-icon
              :icon="['fas', 'chevron-down']"
              class="h-4 w-4 text-gray-400 transition-transform"
              :class="{ 'rotate-180': activeSection === 'hours' }"
            />
          </button>

          <div v-if="activeSection === 'hours'" class="border-t border-gray-200 p-4 dark:border-gray-700">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Jours d'ouverture *
                </label>
                <input
                  v-model="hoursForm.days"
                  type="text"
                  placeholder="Dimanche - Jeudi"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Heures d'ouverture *
                </label>
                <input
                  v-model="hoursForm.hours"
                  type="text"
                  placeholder="08h00 - 16h00"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fuseau horaire
                </label>
                <input
                  v-model="hoursForm.timezone"
                  type="text"
                  placeholder="EET (UTC+2)"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fermetures exceptionnelles
                </label>
                <input
                  v-model="hoursForm.closures"
                  type="text"
                  placeholder="Jours fériés égyptiens"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div class="mt-4 flex justify-end gap-2">
              <button
                type="button"
                class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="cancelSection"
              >
                Annuler
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-red-700 disabled:opacity-50"
                :disabled="!isHoursValid || isSaving"
                @click="saveSection('hours')"
              >
                <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
                Enregistrer
              </button>
            </div>
          </div>
        </div>

        <!-- Contact Form Config Section -->
        <div class="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <button
            class="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
            @click="toggleSection('contact_form')"
          >
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                <font-awesome-icon :icon="['fas', 'paper-plane']" class="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 class="font-medium text-gray-900 dark:text-white">{{ contactSectionLabels.contact_form }}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ formConfigForm.subjects.length }} sujets, {{ formConfigForm.default_recipients.length }} destinataire(s)
                </p>
              </div>
            </div>
            <font-awesome-icon
              :icon="['fas', 'chevron-down']"
              class="h-4 w-4 text-gray-400 transition-transform"
              :class="{ 'rotate-180': activeSection === 'contact_form' }"
            />
          </button>

          <div v-if="activeSection === 'contact_form'" class="border-t border-gray-200 p-4 dark:border-gray-700">
            <!-- Recipients -->
            <div class="mb-4">
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Destinataires par défaut *
              </label>
              <div class="mb-2 flex flex-wrap gap-2">
                <span
                  v-for="(recipient, index) in formConfigForm.default_recipients"
                  :key="index"
                  class="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                >
                  {{ recipient }}
                  <button
                    type="button"
                    class="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400"
                    @click="removeRecipient(index)"
                  >
                    <font-awesome-icon :icon="['fas', 'times']" class="h-3 w-3" />
                  </button>
                </span>
              </div>
              <div class="flex gap-2">
                <input
                  v-model="newRecipient"
                  type="email"
                  placeholder="nouveau@email.com"
                  class="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  @keyup.enter="addRecipient"
                />
                <button
                  type="button"
                  class="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  @click="addRecipient"
                >
                  Ajouter
                </button>
              </div>
            </div>

            <!-- Subjects -->
            <div class="mb-4">
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Sujets prédéfinis *
              </label>
              <div class="mb-2 space-y-2">
                <div
                  v-for="(subject, index) in formConfigForm.subjects"
                  :key="index"
                  class="flex items-center gap-2 rounded-lg bg-gray-50 p-2 dark:bg-gray-700/50"
                >
                  <span class="flex-1 text-sm text-gray-900 dark:text-white">{{ subject }}</span>
                  <button
                    type="button"
                    class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    :disabled="index === 0"
                    @click="moveSubject(index, 'up')"
                  >
                    <font-awesome-icon :icon="['fas', 'chevron-up']" class="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    :disabled="index === formConfigForm.subjects.length - 1"
                    @click="moveSubject(index, 'down')"
                  >
                    <font-awesome-icon :icon="['fas', 'chevron-down']" class="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    class="text-red-400 hover:text-red-600"
                    @click="removeSubject(index)"
                  >
                    <font-awesome-icon :icon="['fas', 'trash']" class="h-3 w-3" />
                  </button>
                </div>
              </div>
              <div class="flex gap-2">
                <input
                  v-model="newSubject"
                  type="text"
                  placeholder="Nouveau sujet"
                  class="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  @keyup.enter="addSubject"
                />
                <button
                  type="button"
                  class="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  @click="addSubject"
                >
                  Ajouter
                </button>
              </div>
            </div>

            <!-- Confirmation message -->
            <div class="mb-4">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Message de confirmation *
              </label>
              <textarea
                v-model="formConfigForm.confirmation_message"
                rows="3"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="flex justify-end gap-2">
              <button
                type="button"
                class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="cancelSection"
              >
                Annuler
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-red-700 disabled:opacity-50"
                :disabled="!isFormConfigValid || isSaving"
                @click="saveSection('contact_form')"
              >
                <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
                Enregistrer
              </button>
            </div>
          </div>
        </div>

        <!-- Department Contacts Section -->
        <div class="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <button
            class="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
            @click="toggleSection('department_contacts')"
          >
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30">
                <font-awesome-icon :icon="['fas', 'users']" class="h-5 w-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <h3 class="font-medium text-gray-900 dark:text-white">{{ contactSectionLabels.department_contacts }}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ departmentContacts.length }} contact(s) configuré(s)
                </p>
              </div>
            </div>
            <font-awesome-icon
              :icon="['fas', 'chevron-down']"
              class="h-4 w-4 text-gray-400 transition-transform"
              :class="{ 'rotate-180': activeSection === 'department_contacts' }"
            />
          </button>

          <div v-if="activeSection === 'department_contacts'" class="border-t border-gray-200 p-4 dark:border-gray-700">
            <!-- Add button -->
            <div class="mb-4">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-red-700"
                @click="openDepartmentModal()"
              >
                <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" />
                Ajouter un contact
              </button>
            </div>

            <!-- Contacts list -->
            <div v-if="departmentContacts.length === 0" class="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Aucun contact de service configuré
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="(contact, index) in departmentContacts"
                :key="contact.id"
                class="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700/50"
              >
                <div class="flex flex-col gap-1">
                  <button
                    type="button"
                    class="text-gray-400 hover:text-gray-600 disabled:opacity-30 dark:hover:text-gray-300"
                    :disabled="index === 0"
                    @click="moveDepartmentContact(index, 'up')"
                  >
                    <font-awesome-icon :icon="['fas', 'chevron-up']" class="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    class="text-gray-400 hover:text-gray-600 disabled:opacity-30 dark:hover:text-gray-300"
                    :disabled="index === departmentContacts.length - 1"
                    @click="moveDepartmentContact(index, 'down')"
                  >
                    <font-awesome-icon :icon="['fas', 'chevron-down']" class="h-3 w-3" />
                  </button>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="font-medium text-gray-900 dark:text-white">{{ contact.department_name }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ contact.email }}
                    <span v-if="contact.phone"> | {{ contact.phone }}</span>
                  </p>
                  <p v-if="contact.responsible_name" class="text-xs text-gray-400 dark:text-gray-500">
                    Responsable: {{ contact.responsible_name }}
                  </p>
                </div>
                <div class="flex gap-2">
                  <button
                    type="button"
                    class="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                    @click="openDepartmentModal(contact)"
                  >
                    <font-awesome-icon :icon="['fas', 'edit']" class="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    class="rounded p-1 text-red-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30"
                    @click="deleteDepartmentContact(contact)"
                  >
                    <font-awesome-icon :icon="['fas', 'trash']" class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Last updated info -->
      <div class="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Dernière modification: {{ formatDate(stats.last_updated) }}
      </div>
    </template>

    <!-- Department Contact Modal -->
    <Teleport to="body">
      <div
        v-if="showDepartmentModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        @click.self="showDepartmentModal = false"
      >
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            {{ editingDepartmentContact ? 'Modifier le contact' : 'Ajouter un contact' }}
          </h3>

          <div class="space-y-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nom du service *
              </label>
              <input
                v-model="departmentForm.department_name"
                type="text"
                placeholder="Service des admissions"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email *
              </label>
              <input
                v-model="departmentForm.email"
                type="email"
                placeholder="service@usenghor.org"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Téléphone
              </label>
              <input
                v-model="departmentForm.phone"
                type="tel"
                placeholder="+20 3 484 3565"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Responsable
              </label>
              <input
                v-model="departmentForm.responsible_name"
                type="text"
                placeholder="Dr. Jean Dupont"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-2">
            <button
              type="button"
              class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="showDepartmentModal = false"
            >
              Annuler
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-red-700 disabled:opacity-50"
              :disabled="!isDepartmentFormValid || isSaving"
              @click="saveDepartmentContact"
            >
              <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
              {{ editingDepartmentContact ? 'Modifier' : 'Ajouter' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
