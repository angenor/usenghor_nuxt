import type { UserSalutation } from '~/composables/useUsersApi'

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
}

export function useAdminRegistration() {
  const { validateEmail, validatePassword, salutationOptions } = useUsersApi()
  const { getSectorsForSelect } = useSectorsApi()
  const { getAllServices } = useServicesApi()
  const { getAllCampuses } = useCampusApi()

  // State
  const isLoading = ref(true)
  const isSubmitting = ref(false)
  const isSuccess = ref(false)
  const formData = ref<RegisterFormData>({ ...defaultFormData, affectation: { ...defaultAffectation } })
  const formErrors = ref<Record<string, string>>({})
  const serverError = ref<string | null>(null)

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

  // Load options
  const loadOptions = async () => {
    isLoading.value = true
    try {
      const [sectorsData, servicesData, campusesData] = await Promise.all([
        getSectorsForSelect(),
        getAllServices(),
        getAllCampuses(),
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

      campusOptions.value = campusesData.items.map(c => ({
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
  }
}
