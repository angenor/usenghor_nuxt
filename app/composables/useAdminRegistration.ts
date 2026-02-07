import type { UserSalutation } from '~/composables/useUsersApi'
import type { ImageVariants } from '~/types/api/media'

export interface AffectationFormData {
  sector_id: string | null
  service_id: string | null
  campus_id: string | null
}

export interface RegisterFormData {
  email: string
  password: string
  password_confirm: string
  salutation: UserSalutation | null
  last_name: string
  first_name: string
  affectation: AffectationFormData
  photo_external_id: string | null
  photo_base64: string | null
}

export interface RegisterResponse {
  id: string
  email: string
  message: string
}

export interface SectorOption {
  id: string
  code: string
  name: string
}

export interface ServiceOption {
  id: string
  name: string
  sector_id: string | null
}

export interface CampusOption {
  id: string
  code: string
  name: string
}

const defaultAffectation: AffectationFormData = {
  sector_id: null,
  service_id: null,
  campus_id: null,
}

const defaultFormData: RegisterFormData = {
  email: '',
  password: '',
  password_confirm: '',
  salutation: null,
  last_name: '',
  first_name: '',
  affectation: { ...defaultAffectation },
  photo_external_id: null,
  photo_base64: null,
}

// Types pour les réponses des endpoints publics
interface PublicSector {
  id: string
  code: string
  name: string
}

interface PublicService {
  id: string
  name: string
  sector_id: string | null
}

interface PublicCampus {
  id: string
  code: string
  name: string
}

export function useAdminRegistration() {
  const { validateEmail, validatePassword, salutationOptions } = useUsersApi()

  // State
  const isLoading = ref(true)
  const isSubmitting = ref(false)
  const isSuccess = ref(false)
  const formData = ref<RegisterFormData>({ ...defaultFormData, affectation: { ...defaultAffectation } })
  const formErrors = ref<Record<string, string>>({})
  const serverError = ref<string | null>(null)

  // Photo upload state
  const pendingPhotoFile = ref<File | null>(null)
  const showPhotoEditor = ref(false)
  const isUploadingPhoto = ref(false)
  const photoPreviewUrl = ref<string | null>(null)

  // Options
  const sectorOptions = ref<SectorOption[]>([])
  const serviceOptions = ref<ServiceOption[]>([])
  const campusOptions = ref<CampusOption[]>([])

  // Services filtrés par secteur sélectionné
  const filteredServiceOptions = computed(() => {
    const sectorId = formData.value.affectation.sector_id
    if (!sectorId) return serviceOptions.value
    return serviceOptions.value.filter(s => s.sector_id === sectorId)
  })

  // Load options from public endpoints (no auth required)
  const loadOptions = async () => {
    isLoading.value = true
    try {
      const [sectorsData, servicesData, campusesData] = await Promise.all([
        $fetch<PublicSector[]>('/api/public/sectors'),
        $fetch<PublicService[]>('/api/public/services'),
        $fetch<PublicCampus[]>('/api/public/campuses/all'),
      ])

      sectorOptions.value = sectorsData.map(s => ({
        id: s.id,
        code: s.code,
        name: s.name,
      }))

      serviceOptions.value = servicesData.map(s => ({
        id: s.id,
        name: s.name,
        sector_id: s.sector_id,
      }))

      campusOptions.value = campusesData.map(c => ({
        id: c.id,
        code: c.code,
        name: c.name,
      }))
    }
    catch (error) {
      console.error('Erreur lors du chargement des options:', error)
    }
    finally {
      isLoading.value = false
    }
  }

  // Photo upload handlers
  const handlePhotoUpload = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (input.files && input.files[0]) {
      pendingPhotoFile.value = input.files[0]
      showPhotoEditor.value = true
    }
    input.value = ''
  }

  const saveEditedPhoto = async (variants: ImageVariants) => {
    isUploadingPhoto.value = true
    try {
      // Convertir le blob medium en base64 pour l'envoyer avec le formulaire
      const reader = new FileReader()
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
      })
      reader.readAsDataURL(variants.medium)
      const base64 = await base64Promise

      formData.value.photo_base64 = base64
      photoPreviewUrl.value = URL.createObjectURL(variants.medium)
      showPhotoEditor.value = false
      pendingPhotoFile.value = null
    }
    catch (e) {
      console.error('Erreur lors du traitement de la photo:', e)
      formErrors.value.photo = 'Erreur lors du traitement de la photo'
    }
    finally {
      isUploadingPhoto.value = false
    }
  }

  const cancelPhotoEditor = () => {
    showPhotoEditor.value = false
    pendingPhotoFile.value = null
  }

  const removePhoto = () => {
    formData.value.photo_external_id = null
    formData.value.photo_base64 = null
    photoPreviewUrl.value = null
  }

  // Validation
  const validateForm = (): boolean => {
    formErrors.value = {}

    // Email
    if (!formData.value.email) {
      formErrors.value.email = 'L\'email est requis'
    }
    else if (!validateEmail(formData.value.email)) {
      formErrors.value.email = 'Format d\'email invalide'
    }

    // Password
    if (!formData.value.password) {
      formErrors.value.password = 'Le mot de passe est requis'
    }
    else {
      const passwordValidation = validatePassword(formData.value.password)
      if (!passwordValidation.valid) {
        formErrors.value.password = passwordValidation.errors[0]
      }
    }

    // Password confirmation
    if (!formData.value.password_confirm) {
      formErrors.value.password_confirm = 'La confirmation du mot de passe est requise'
    }
    else if (formData.value.password !== formData.value.password_confirm) {
      formErrors.value.password_confirm = 'Les mots de passe ne correspondent pas'
    }

    // Last name
    if (!formData.value.last_name) {
      formErrors.value.last_name = 'Le nom est requis'
    }

    // First name
    if (!formData.value.first_name) {
      formErrors.value.first_name = 'Le prénom est requis'
    }

    // Affectation - Secteur obligatoire
    if (!formData.value.affectation.sector_id) {
      formErrors.value.sector_id = 'Le secteur est requis'
    }

    // Affectation - Département obligatoire
    if (!formData.value.affectation.service_id) {
      formErrors.value.service_id = 'Le département est requis'
    }

    // Affectation - Campus obligatoire
    if (!formData.value.affectation.campus_id) {
      formErrors.value.campus_id = 'Le campus est requis'
    }

    return Object.keys(formErrors.value).length === 0
  }

  // Submit registration
  const submitRegistration = async (): Promise<boolean> => {
    if (!validateForm()) return false

    isSubmitting.value = true
    serverError.value = null

    try {
      await $fetch<RegisterResponse>('/api/auth/register', {
        method: 'POST',
        body: {
          email: formData.value.email,
          password: formData.value.password,
          salutation: formData.value.salutation,
          last_name: formData.value.last_name,
          first_name: formData.value.first_name,
          sector_id: formData.value.affectation.sector_id,
          service_id: formData.value.affectation.service_id,
          campus_id: formData.value.affectation.campus_id,
          photo_base64: formData.value.photo_base64,
        },
      })

      isSuccess.value = true
      return true
    }
    catch (error: unknown) {
      const fetchError = error as { data?: { detail?: string } }
      serverError.value = fetchError.data?.detail || 'Une erreur est survenue lors de l\'inscription'
      return false
    }
    finally {
      isSubmitting.value = false
    }
  }

  // Reset form
  const resetForm = () => {
    formData.value = { ...defaultFormData, affectation: { ...defaultAffectation } }
    formErrors.value = {}
    serverError.value = null
    isSuccess.value = false
    photoPreviewUrl.value = null
    pendingPhotoFile.value = null
  }

  // Reset service when sector changes
  const onSectorChange = () => {
    formData.value.affectation.service_id = null
  }

  return {
    // State
    isLoading,
    isSubmitting,
    isSuccess,
    formData,
    formErrors,
    serverError,

    // Photo upload state
    pendingPhotoFile,
    showPhotoEditor,
    isUploadingPhoto,
    photoPreviewUrl,

    // Options
    salutationOptions,
    sectorOptions,
    serviceOptions,
    campusOptions,
    filteredServiceOptions,

    // Methods
    loadOptions,
    validateForm,
    submitRegistration,
    resetForm,
    onSectorChange,

    // Photo upload methods
    handlePhotoUpload,
    saveEditedPhoto,
    cancelPhotoEditor,
    removePhoto,
  }
}
