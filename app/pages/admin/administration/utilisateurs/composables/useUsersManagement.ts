import type {
  UserWithRoles,
  UserSalutation,
  UserCreatePayload,
  UserUpdatePayload,
  RoleRead,
} from '~/composables/useUsersApi'
import type { ImageVariants } from '~/types/api'
import type { ServiceTeamMemberRead } from '~/composables/useServicesApi'
import type { CampusTeamRead } from '~/composables/useCampusApi'
import { useDebounceFn } from '@vueuse/core'

export interface AffectationFormData {
  sector_id: string | null
  service_id: string | null
  service_position: string
  campus_id: string | null
  campus_position: string
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

export interface UserAffectation {
  service: ServiceTeamMemberRead | null
  campus: CampusTeamRead | null
}

export interface UserFilters {
  search: string
  role_id: string
  active: boolean | undefined
  sort_by: string
  sort_order: string
}

export interface UserFormData {
  email: string
  password: string
  salutation: UserSalutation | null
  last_name: string
  first_name: string
  birth_date: string
  phone: string
  phone_whatsapp: string
  linkedin: string
  city: string
  address: string
  role_ids: string[]
  active: boolean
  photo_external_id: string | null
  // Affectation organisationnelle
  affectation: AffectationFormData
}

const defaultAffectation: AffectationFormData = {
  sector_id: null,
  service_id: null,
  service_position: '',
  campus_id: null,
  campus_position: '',
}

const defaultFormData: UserFormData = {
  email: '',
  password: '',
  salutation: null,
  last_name: '',
  first_name: '',
  birth_date: '',
  phone: '',
  phone_whatsapp: '',
  linkedin: '',
  city: '',
  address: '',
  role_ids: [],
  active: true,
  photo_external_id: null,
  affectation: { ...defaultAffectation },
}

export function useUsersManagement() {
  const {
    listUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser: deleteUserApi,
    toggleUserActive: toggleUserActiveApi,
    updateUserRoles,
    resetUserPassword,
    verifyUserEmail,
    bulkAction,
    getFullName,
    formatLastLogin,
    getRoleColor,
    validateEmail,
    validatePassword,
    canDeleteUser,
    canDeactivateUser,
    computeStats,
    salutationOptions,
    userStatusColors,
    verificationColors,
  } = useUsersApi()

  const { getRolesForSelect } = useRolesApi()

  const {
    uploadMediaVariants,
    getMediaUrl,
  } = useMediaApi()

  const { getSectorsForSelect } = useSectorsApi()

  const {
    getAllServices,
    addServiceTeamMember,
    updateServiceTeamMember,
    deleteServiceTeamMember,
    getUserServiceAffectation,
  } = useServicesApi()

  const {
    getAllCampuses,
    addCampusTeamMember,
    updateCampusTeamMember,
    deleteCampusTeamMember,
    getUserCampusAffectation,
  } = useCampusApi()

  // === STATE ===
  const isLoading = ref(true)
  const users = ref<UserWithRoles[]>([])
  const roles = ref<RoleRead[]>([])
  const selectedUser = ref<UserWithRoles | null>(null)
  const roleOptions = ref<Array<{ id: string; code: string; name_fr: string }>>([])

  // Modals
  const showDetailModal = ref(false)
  const showCreateModal = ref(false)
  const showFilters = ref(false)
  const showStatistics = ref(false)
  const showDeleteConfirm = ref(false)
  const showPasswordModal = ref(false)
  const userToDelete = ref<UserWithRoles | null>(null)
  const temporaryPassword = ref('')

  // Photo upload
  const pendingPhotoFile = ref<File | null>(null)
  const showPhotoEditor = ref(false)
  const isUploadingPhoto = ref(false)
  const photoPreviewUrl = ref<string | null>(null)

  // Pagination
  const currentPage = ref(1)
  const itemsPerPage = ref(20)
  const totalItems = ref(0)
  const totalPages = ref(1)

  // Filters
  const filters = ref<UserFilters>({
    search: '',
    role_id: '',
    active: undefined,
    sort_by: 'last_name',
    sort_order: 'asc',
  })

  // Form
  const isEditing = ref(false)
  const isSaving = ref(false)
  const formErrors = ref<Record<string, string>>({})
  const formData = ref<UserFormData>({ ...defaultFormData })
  const editingUserId = ref<string | null>(null)

  // Selection
  const selectedUserIds = ref<string[]>([])

  // Affectation options
  const sectorOptions = ref<SectorOption[]>([])
  const serviceOptions = ref<ServiceOption[]>([])
  const campusOptions = ref<CampusOption[]>([])
  const currentUserAffectation = ref<UserAffectation>({ service: null, campus: null })

  // === COMPUTED ===
  const statistics = computed(() => computeStats(users.value, roles.value))

  const hasActiveFilters = computed(() => {
    return !!(
      filters.value.search
      || filters.value.role_id
      || filters.value.active !== undefined
    )
  })

  const allSelected = computed(() => {
    return users.value.length > 0 && users.value.every(u => selectedUserIds.value.includes(u.id))
  })

  const someSelected = computed(() => {
    return selectedUserIds.value.length > 0 && !allSelected.value
  })

  // Services filtrés par secteur sélectionné
  const filteredServiceOptions = computed(() => {
    const sectorId = formData.value.affectation.sector_id
    if (!sectorId) return serviceOptions.value
    return serviceOptions.value.filter(s => s.sector_id === sectorId)
  })

  // === METHODS ===
  const loadAffectationOptions = async () => {
    try {
      // Charger secteurs, services et campus en parallèle
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
      console.error('Erreur lors du chargement des options d\'affectation:', error)
    }
  }

  const loadData = async () => {
    isLoading.value = true
    try {
      const [rolesData] = await Promise.all([
        getRolesForSelect(),
        loadAffectationOptions(),
      ])
      roleOptions.value = rolesData.map(r => ({ id: r.id, code: r.code, name_fr: r.name_fr }))
      roles.value = rolesData as unknown as RoleRead[]

      const response = await listUsers({
        page: currentPage.value,
        limit: itemsPerPage.value,
        search: filters.value.search || undefined,
        active: filters.value.active,
        role_id: filters.value.role_id || undefined,
      })

      const usersWithRoles: UserWithRoles[] = []
      for (const user of response.items) {
        try {
          const userWithRoles = await getUserById(user.id)
          usersWithRoles.push(userWithRoles)
        }
        catch {
          usersWithRoles.push({ ...user, roles: [] } as UserWithRoles)
        }
      }

      users.value = usersWithRoles
      totalItems.value = response.total
      totalPages.value = response.pages
    }
    catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    }
    finally {
      isLoading.value = false
    }
  }

  const viewUserDetail = async (user: UserWithRoles) => {
    try {
      selectedUser.value = await getUserById(user.id)
      showDetailModal.value = true
    }
    catch {
      selectedUser.value = user
      showDetailModal.value = true
    }
  }

  const openCreateModal = () => {
    isEditing.value = false
    editingUserId.value = null
    formData.value = { ...defaultFormData, affectation: { ...defaultAffectation } }
    formErrors.value = {}
    photoPreviewUrl.value = null
    pendingPhotoFile.value = null
    currentUserAffectation.value = { service: null, campus: null }
    showCreateModal.value = true
  }

  const openEditModal = async (user: UserWithRoles) => {
    isEditing.value = true
    editingUserId.value = user.id

    // Charger les affectations existantes en parallèle
    const [serviceAffectation, campusAffectation] = await Promise.all([
      getUserServiceAffectation(user.id),
      getUserCampusAffectation(user.id),
    ])

    currentUserAffectation.value = {
      service: serviceAffectation,
      campus: campusAffectation,
    }

    // Trouver le secteur du service si affectation service existe
    let sectorId: string | null = null
    if (serviceAffectation) {
      const service = serviceOptions.value.find(s => s.id === serviceAffectation.service_id)
      sectorId = service?.sector_id || null
    }

    formData.value = {
      email: user.email,
      password: '',
      salutation: user.salutation,
      last_name: user.last_name,
      first_name: user.first_name,
      birth_date: user.birth_date || '',
      phone: user.phone || '',
      phone_whatsapp: user.phone_whatsapp || '',
      linkedin: user.linkedin || '',
      city: user.city || '',
      address: user.address || '',
      role_ids: user.roles.map(r => r.id),
      active: user.active,
      photo_external_id: user.photo_external_id || null,
      affectation: {
        sector_id: sectorId,
        service_id: serviceAffectation?.service_id || null,
        service_position: serviceAffectation?.position || '',
        campus_id: campusAffectation?.campus_id || null,
        campus_position: campusAffectation?.position || '',
      },
    }
    selectedUser.value = user
    formErrors.value = {}
    // Charger l'URL de la photo existante
    photoPreviewUrl.value = user.photo_external_id
      ? (getMediaUrl(user.photo_external_id) || null)
      : null
    pendingPhotoFile.value = null
    showCreateModal.value = true
  }

  const validateForm = (): boolean => {
    formErrors.value = {}

    if (!formData.value.email) {
      formErrors.value.email = 'L\'email est requis'
    }
    else if (!validateEmail(formData.value.email)) {
      formErrors.value.email = 'Format d\'email invalide'
    }

    if (!isEditing.value && !formData.value.password) {
      formErrors.value.password = 'Le mot de passe est requis'
    }
    else if (formData.value.password) {
      const passwordValidation = validatePassword(formData.value.password)
      if (!passwordValidation.valid) {
        formErrors.value.password = passwordValidation.errors[0]
      }
    }

    if (!formData.value.last_name) {
      formErrors.value.last_name = 'Le nom est requis'
    }

    if (!formData.value.first_name) {
      formErrors.value.first_name = 'Le prénom est requis'
    }

    if (formData.value.role_ids.length === 0) {
      formErrors.value.role_ids = 'Au moins un rôle est requis'
    }

    return Object.keys(formErrors.value).length === 0
  }

  const saveAffectations = async (userId: string) => {
    const { affectation } = formData.value
    const existingService = currentUserAffectation.value.service
    const existingCampus = currentUserAffectation.value.campus

    // Gestion de l'affectation service
    if (affectation.service_id) {
      const position = affectation.service_position || 'Membre'
      if (existingService) {
        // Mise à jour ou changement de service
        if (existingService.service_id !== affectation.service_id) {
          // Supprimer l'ancienne affectation et créer la nouvelle
          await deleteServiceTeamMember(existingService.service_id, existingService.id)
          await addServiceTeamMember(affectation.service_id, {
            user_external_id: userId,
            position,
          })
        }
        else if (existingService.position !== position) {
          // Même service, mise à jour de la position
          await updateServiceTeamMember(existingService.service_id, existingService.id, { position })
        }
      }
      else {
        // Nouvelle affectation
        await addServiceTeamMember(affectation.service_id, {
          user_external_id: userId,
          position,
        })
      }
    }
    else if (existingService) {
      // Suppression de l'affectation service
      await deleteServiceTeamMember(existingService.service_id, existingService.id)
    }

    // Gestion de l'affectation campus
    if (affectation.campus_id) {
      const position = affectation.campus_position || 'Membre'
      if (existingCampus) {
        // Mise à jour ou changement de campus
        if (existingCampus.campus_id !== affectation.campus_id) {
          // Supprimer l'ancienne affectation et créer la nouvelle
          await deleteCampusTeamMember(existingCampus.campus_id, existingCampus.id)
          await addCampusTeamMember(affectation.campus_id, {
            user_external_id: userId,
            position,
          })
        }
        else if (existingCampus.position !== position) {
          // Même campus, mise à jour de la position
          await updateCampusTeamMember(existingCampus.campus_id, existingCampus.id, { position })
        }
      }
      else {
        // Nouvelle affectation
        await addCampusTeamMember(affectation.campus_id, {
          user_external_id: userId,
          position,
        })
      }
    }
    else if (existingCampus) {
      // Suppression de l'affectation campus
      await deleteCampusTeamMember(existingCampus.campus_id, existingCampus.id)
    }
  }

  const saveUser = async () => {
    if (!validateForm()) return

    isSaving.value = true
    try {
      let userId: string

      if (isEditing.value && editingUserId.value) {
        userId = editingUserId.value
        const updateData: UserUpdatePayload = {
          email: formData.value.email,
          last_name: formData.value.last_name,
          first_name: formData.value.first_name,
          salutation: formData.value.salutation,
          birth_date: formData.value.birth_date || null,
          phone: formData.value.phone || null,
          phone_whatsapp: formData.value.phone_whatsapp || null,
          linkedin: formData.value.linkedin || null,
          city: formData.value.city || null,
          address: formData.value.address || null,
          active: formData.value.active,
          photo_external_id: formData.value.photo_external_id,
        }
        await updateUser(userId, updateData)
        await updateUserRoles(userId, formData.value.role_ids)
      }
      else {
        const createData: UserCreatePayload = {
          email: formData.value.email,
          password: formData.value.password,
          last_name: formData.value.last_name,
          first_name: formData.value.first_name,
          salutation: formData.value.salutation,
          birth_date: formData.value.birth_date || null,
          phone: formData.value.phone || null,
          phone_whatsapp: formData.value.phone_whatsapp || null,
          linkedin: formData.value.linkedin || null,
          city: formData.value.city || null,
          address: formData.value.address || null,
          photo_external_id: formData.value.photo_external_id,
        }
        const result = await createUser(createData)
        userId = result.id
        if (formData.value.role_ids.length > 0) {
          await updateUserRoles(userId, formData.value.role_ids)
        }
      }

      // Sauvegarder les affectations
      await saveAffectations(userId)

      showCreateModal.value = false
      photoPreviewUrl.value = null
      pendingPhotoFile.value = null
      currentUserAffectation.value = { service: null, campus: null }
      loadData()
    }
    catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      formErrors.value.general = 'Une erreur est survenue lors de la sauvegarde'
    }
    finally {
      isSaving.value = false
    }
  }

  const confirmDelete = (user: UserWithRoles) => {
    const canDelete = canDeleteUser(user)
    if (!canDelete.canDelete) {
      alert(canDelete.reason)
      return
    }
    userToDelete.value = user
    showDeleteConfirm.value = true
  }

  const handleDeleteUser = async () => {
    if (!userToDelete.value) return

    isSaving.value = true
    try {
      await deleteUserApi(userToDelete.value.id)
      showDeleteConfirm.value = false
      userToDelete.value = null
      loadData()
    }
    catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
    finally {
      isSaving.value = false
    }
  }

  const toggleUserActive = async (user: UserWithRoles) => {
    if (user.active) {
      const canDeactivate = canDeactivateUser(user)
      if (!canDeactivate.canDeactivate) {
        alert(canDeactivate.reason)
        return
      }
    }

    try {
      await toggleUserActiveApi(user.id)
      loadData()
    }
    catch (error) {
      console.error('Erreur lors du changement de statut:', error)
    }
  }

  const handleResetPassword = async (user: UserWithRoles) => {
    try {
      const result = await resetUserPassword(user.id)
      temporaryPassword.value = result.temporary_password
      showPasswordModal.value = true
    }
    catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error)
    }
  }

  const handleVerifyEmail = async (user: UserWithRoles) => {
    try {
      await verifyUserEmail(user.id)
      loadData()
    }
    catch (error) {
      console.error('Erreur lors de la vérification de l\'email:', error)
    }
  }

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedUserIds.value.length === 0) return

    const confirmMessage = action === 'delete'
      ? `Êtes-vous sûr de vouloir supprimer ${selectedUserIds.value.length} utilisateur(s) ?`
      : `Êtes-vous sûr de vouloir ${action === 'activate' ? 'activer' : 'désactiver'} ${selectedUserIds.value.length} utilisateur(s) ?`

    if (!confirm(confirmMessage)) return

    try {
      await bulkAction({
        user_ids: selectedUserIds.value,
        action,
      })
      selectedUserIds.value = []
      loadData()
    }
    catch (error) {
      console.error('Erreur lors de l\'action en masse:', error)
    }
  }

  const clearFilters = () => {
    filters.value = {
      search: '',
      role_id: '',
      active: undefined,
      sort_by: 'last_name',
      sort_order: 'asc',
    }
    currentPage.value = 1
    loadData()
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
      loadData()
    }
  }

  const toggleSelectAll = () => {
    if (allSelected.value) {
      selectedUserIds.value = []
    }
    else {
      selectedUserIds.value = users.value.map(u => u.id)
    }
  }

  const toggleUserSelection = (userId: string) => {
    const index = selectedUserIds.value.indexOf(userId)
    if (index === -1) {
      selectedUserIds.value.push(userId)
    }
    else {
      selectedUserIds.value.splice(index, 1)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const copyPassword = () => {
    navigator.clipboard.writeText(temporaryPassword.value)
  }

  // === PHOTO UPLOAD ===
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
      const originalName = pendingPhotoFile.value?.name || 'avatar.jpg'
      const baseName = originalName.replace(/\.[^.]+$/, '')

      const response = await uploadMediaVariants(variants, baseName, {
        folder: 'users/avatars',
      })

      formData.value.photo_external_id = response.original.id
      photoPreviewUrl.value = URL.createObjectURL(variants.medium)
      showPhotoEditor.value = false
      pendingPhotoFile.value = null
    }
    catch (e) {
      console.error('Erreur lors de l\'upload de la photo:', e)
      formErrors.value.photo = 'Erreur lors de l\'upload de la photo'
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
    photoPreviewUrl.value = null
  }

  // Watch filters avec debounce
  const debouncedSearch = useDebounceFn(() => {
    currentPage.value = 1
    loadData()
  }, 300)

  watch(() => filters.value.search, () => {
    debouncedSearch()
  })

  watch([() => filters.value.role_id, () => filters.value.active], () => {
    currentPage.value = 1
    loadData()
  })

  return {
    // State
    isLoading,
    users,
    roles,
    selectedUser,
    roleOptions,
    showDetailModal,
    showCreateModal,
    showFilters,
    showStatistics,
    showDeleteConfirm,
    showPasswordModal,
    userToDelete,
    temporaryPassword,
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    filters,
    isEditing,
    isSaving,
    formErrors,
    formData,
    editingUserId,
    selectedUserIds,

    // Photo upload state
    pendingPhotoFile,
    showPhotoEditor,
    isUploadingPhoto,
    photoPreviewUrl,

    // Computed
    statistics,
    hasActiveFilters,
    allSelected,
    someSelected,
    filteredServiceOptions,

    // Affectation options
    sectorOptions,
    serviceOptions,
    campusOptions,

    // Methods
    loadData,
    viewUserDetail,
    openCreateModal,
    openEditModal,
    validateForm,
    saveUser,
    confirmDelete,
    handleDeleteUser,
    toggleUserActive,
    handleResetPassword,
    handleVerifyEmail,
    handleBulkAction,
    clearFilters,
    goToPage,
    toggleSelectAll,
    toggleUserSelection,
    formatDate,
    formatDateTime,
    copyPassword,

    // Photo upload methods
    handlePhotoUpload,
    saveEditedPhoto,
    cancelPhotoEditor,
    removePhoto,

    // From useUsersApi
    getFullName,
    formatLastLogin,
    getRoleColor,
    salutationOptions,
    userStatusColors,
    verificationColors,

    // From useMediaApi
    getMediaUrl,
  }
}
