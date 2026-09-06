<script setup lang="ts">
import type { ProgramType, ProgramWithDetails, ProgramFieldRead, PublicationStatus, ProgramSkillRead, ProgramCareerOpportunityRead, ImageVariants } from '~/types/api'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()

const {
  getProgramById,
  updateProgram,
  translateProgram,
  programTypeLabels,
  publicationStatusLabels,
  listProgramPartners,
  addPartnerToProgram,
  removePartnerFromProgram,
  reorderProgramPartners,
} = useProgramsApi()

const {
  getAllPartners,
} = usePartnersApi()

const {
  listSkills,
  createSkill,
  updateSkill: apiUpdateSkill,
  deleteSkill: apiDeleteSkill,
  reorderSkills,
} = useProgramSkillsApi()

const {
  listCareerOpportunities,
  createCareerOpportunity,
  updateCareerOpportunity: apiUpdateCareerOpportunity,
  deleteCareerOpportunity: apiDeleteCareerOpportunity,
  reorderCareerOpportunities,
} = useCareerOpportunitiesApi()

const {
  uploadMediaVariants,
  getMediaUrl,
} = useMediaApi()

const {
  listFields,
} = useProgramFieldsApi()

// Données de référence (campus, secteurs, services)
const {
  getCampuses,
  getDepartments,
  getServices,
  campuses: allCampuses,
  departments: allDepartments,
  services: allServices,
} = useReferenceData()

// Champs disciplinaires (pour les certificats)
const programFields = ref<ProgramFieldRead[]>([])

async function loadProgramFields() {
  try {
    const response = await listFields({ limit: 100 })
    programFields.value = response.items.sort((a, b) => a.display_order - b.display_order)
  }
  catch (e) {
    console.error('Erreur chargement champs:', e)
  }
}

onMounted(() => {
  loadProgramFields()
  getCampuses()
  getDepartments()
  getServices()
})

// Services filtrés par secteur
const filteredServices = computed(() => {
  if (!form.value.sector_id) return []
  return allServices.value.filter(s => s.sector_id === form.value.sector_id)
})

// === GESTION DES OBJECTIFS ===
const newObjective = ref('')
const addObjective = () => {
  const value = newObjective.value.trim()
  if (value && !form.value.objectives.includes(value)) {
    form.value.objectives.push(value)
  }
  newObjective.value = ''
}
const removeObjective = (index: number) => {
  form.value.objectives.splice(index, 1)
}

// === GESTION DU PUBLIC CIBLE ===
const newTargetAudience = ref('')
const addTargetAudience = () => {
  const value = newTargetAudience.value.trim()
  if (value && !form.value.target_audience.includes(value)) {
    form.value.target_audience.push(value)
  }
  newTargetAudience.value = ''
}
const removeTargetAudience = (index: number) => {
  form.value.target_audience.splice(index, 1)
}

// Options du format
const formatOptions = [
  { value: 'presential', label: 'Présentiel' },
  { value: 'distance', label: 'Distanciel' },
  { value: 'hybrid', label: 'Hybride' },
  { value: 'elearning', label: 'E-learning' },
]

// Modalités d'évaluation (liste dynamique, stockée en JSON)
const evaluationMethods = ref<string[]>([])
const newEvaluationMethod = ref('')

function parseEvaluationMethods(raw: string | null | undefined): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
  } catch {
    // Texte brut : séparer par virgule/point-virgule
    if (raw.trim()) return raw.split(/[;,]\s*/).filter(Boolean)
  }
  return []
}

function addEvaluationMethod() {
  const value = newEvaluationMethod.value.trim()
  if (value && !evaluationMethods.value.includes(value)) {
    evaluationMethods.value.push(value)
    newEvaluationMethod.value = ''
  }
}

function removeEvaluationMethod(index: number) {
  evaluationMethods.value.splice(index, 1)
}

// États
const loading = ref(true)
const initialLoadDone = ref(false)
const isSubmitting = ref(false)
const program = ref<ProgramWithDetails | null>(null)

// État du formulaire
const form = ref<{
  code: string
  title: string
  subtitle: string
  slug: string
  description_md: string
  description_html: string
  teaching_methods: string
  objectives: string[]
  target_audience: string[]
  format: string
  cover_image: string
  cover_image_external_id: string | null
  campus_id: string
  sector_id: string
  service_id: string
  field_id: string | null
  type: ProgramType
  duration_months: number | null
  credits: number | null
  degree_awarded: string
  required_degree: string
  status: PublicationStatus
  is_featured: boolean
  // Traductions EN/AR (convention state <champ>_<html|md>_<langue>).
  title_en: string
  title_ar: string
  subtitle_en: string
  subtitle_ar: string
  required_degree_en: string
  required_degree_ar: string
  teaching_methods_en: string
  teaching_methods_ar: string
  description_md_en: string
  description_html_en: string
  description_md_ar: string
  description_html_ar: string
  objectives_en: string[]
  objectives_ar: string[]
  target_audience_en: string[]
  target_audience_ar: string[]
}>({
  code: '',
  title: '',
  subtitle: '',
  slug: '',
  description_md: '',
  description_html: '',
  teaching_methods: '',
  objectives: [],
  target_audience: [],
  format: '',
  cover_image: '',
  cover_image_external_id: null,
  campus_id: '',
  sector_id: '',
  service_id: '',
  field_id: null,
  type: 'master',
  duration_months: null,
  credits: null,
  degree_awarded: '',
  required_degree: '',
  status: 'draft',
  is_featured: false,
  title_en: '',
  title_ar: '',
  subtitle_en: '',
  subtitle_ar: '',
  required_degree_en: '',
  required_degree_ar: '',
  teaching_methods_en: '',
  teaching_methods_ar: '',
  description_md_en: '',
  description_html_en: '',
  description_md_ar: '',
  description_html_ar: '',
  objectives_en: [],
  objectives_ar: [],
  target_audience_en: [],
  target_audience_ar: [],
})

// === TRADUCTION AUTO FR → EN/AR ===
const isTranslating = ref(false)

async function handleTranslate() {
  isTranslating.value = true
  try {
    const r = await translateProgram({
      title: form.value.title || null,
      subtitle: form.value.subtitle || null,
      description_html: form.value.description_html || null,
      description_md: form.value.description_md || null,
      teaching_methods_html: form.value.teaching_methods || null,
      teaching_methods_md: form.value.teaching_methods || null,
      required_degree: form.value.required_degree || null,
      objectives: form.value.objectives.length > 0 ? form.value.objectives : null,
      target_audience: form.value.target_audience.length > 0 ? form.value.target_audience : null,
    })
    if (r.title_en != null) form.value.title_en = r.title_en
    if (r.title_ar != null) form.value.title_ar = r.title_ar
    if (r.subtitle_en != null) form.value.subtitle_en = r.subtitle_en
    if (r.subtitle_ar != null) form.value.subtitle_ar = r.subtitle_ar
    if (r.required_degree_en != null) form.value.required_degree_en = r.required_degree_en
    if (r.required_degree_ar != null) form.value.required_degree_ar = r.required_degree_ar
    if (r.teaching_methods_en_md != null) form.value.teaching_methods_en = r.teaching_methods_en_md
    if (r.teaching_methods_ar_md != null) form.value.teaching_methods_ar = r.teaching_methods_ar_md
    if (r.description_en_html != null) form.value.description_html_en = r.description_en_html
    if (r.description_en_md != null) form.value.description_md_en = r.description_en_md
    if (r.description_ar_html != null) form.value.description_html_ar = r.description_ar_html
    if (r.description_ar_md != null) form.value.description_md_ar = r.description_ar_md
    if (r.objectives_en) form.value.objectives_en = r.objectives_en
    if (r.objectives_ar) form.value.objectives_ar = r.objectives_ar
    if (r.target_audience_en) form.value.target_audience_en = r.target_audience_en
    if (r.target_audience_ar) form.value.target_audience_ar = r.target_audience_ar
  }
  catch (e) {
    console.error('Erreur traduction:', e)
    alert('La traduction a échoué. Réessayez plus tard.')
  }
  finally {
    isTranslating.value = false
  }
}

// Proxies texte ↔ liste pour l'édition des listes JSONB traduites (un item par ligne).
const objectivesEnText = computed({
  get: () => form.value.objectives_en.join('\n'),
  set: (v: string) => { form.value.objectives_en = v.split('\n').map(s => s.trim()).filter(Boolean) },
})
const objectivesArText = computed({
  get: () => form.value.objectives_ar.join('\n'),
  set: (v: string) => { form.value.objectives_ar = v.split('\n').map(s => s.trim()).filter(Boolean) },
})
const targetAudienceEnText = computed({
  get: () => form.value.target_audience_en.join('\n'),
  set: (v: string) => { form.value.target_audience_en = v.split('\n').map(s => s.trim()).filter(Boolean) },
})
const targetAudienceArText = computed({
  get: () => form.value.target_audience_ar.join('\n'),
  set: (v: string) => { form.value.target_audience_ar = v.split('\n').map(s => s.trim()).filter(Boolean) },
})

// État de l'upload d'image
const pendingCoverFile = ref<File | null>(null)
const showCoverEditor = ref(false)
const isUploadingCover = ref(false)

// État des compétences
const skills = ref<ProgramSkillRead[]>([])
const loadingSkills = ref(false)
const isSubmittingSkill = ref(false)
const showAddSkillModal = ref(false)
const showEditSkillModal = ref(false)
const showDeleteSkillModal = ref(false)
const editingSkill = ref<ProgramSkillRead | null>(null)
const deletingSkill = ref<ProgramSkillRead | null>(null)
const newSkill = ref({ title: '', description: '' })
const draggedSkillIndex = ref<number | null>(null)

// État des débouchés
const careerOpportunities = ref<ProgramCareerOpportunityRead[]>([])
const loadingCareerOpportunities = ref(false)
const isSubmittingCareerOpportunity = ref(false)
const showAddCareerOpportunityModal = ref(false)
const showEditCareerOpportunityModal = ref(false)
const showDeleteCareerOpportunityModal = ref(false)
const editingCareerOpportunity = ref<ProgramCareerOpportunityRead | null>(null)
const deletingCareerOpportunity = ref<ProgramCareerOpportunityRead | null>(null)
const newCareerOpportunity = ref({ title: '', description: '' })

// État des partenaires
interface PartnerItem {
  id: string
  name: string
  logo_external_id: string | null
  active: boolean
  type: string
}
const programPartners = ref<Array<{ partner_external_id: string, partnership_type: string | null, display_order: number }>>([])
const allPartnersList = ref<PartnerItem[]>([])
const loadingPartners = ref(false)
const selectedPartnerId = ref('')
const partnerSearchQuery = ref('')
const draggedPartnerIndex = ref<number | null>(null)
const draggedCareerOpportunityIndex = ref<number | null>(null)

// Chargement du programme
async function loadProgram() {
  loading.value = true
  try {
    program.value = await getProgramById(route.params.id as string)
    // Charger les données dans le formulaire
    form.value = {
      code: program.value.code,
      title: program.value.title,
      subtitle: program.value.subtitle || '',
      slug: program.value.slug,
      description_md: program.value.description_md || '',
      description_html: program.value.description_html || '',
      teaching_methods: program.value.teaching_methods_md || program.value.teaching_methods_html || '',
      objectives: program.value.objectives || [],
      target_audience: program.value.target_audience || [],
      format: program.value.format_md || '',
      cover_image_external_id: program.value.cover_image_external_id || null,
      cover_image: program.value.cover_image_external_id
        ? (getMediaUrl(program.value.cover_image_external_id) || '')
        : '',
      campus_id: program.value.campus_external_id || '',
      sector_id: program.value.sector_external_id || '',
      service_id: program.value.service_external_id || '',
      field_id: program.value.field_id || null,
      type: program.value.type,
      duration_months: program.value.duration_months,
      credits: program.value.credits,
      degree_awarded: program.value.degree_awarded || '',
      required_degree: program.value.required_degree || '',
      status: program.value.status,
      is_featured: program.value.is_featured || false,
      title_en: program.value.title_en || '',
      title_ar: program.value.title_ar || '',
      subtitle_en: program.value.subtitle_en || '',
      subtitle_ar: program.value.subtitle_ar || '',
      required_degree_en: program.value.required_degree_en || '',
      required_degree_ar: program.value.required_degree_ar || '',
      teaching_methods_en: program.value.teaching_methods_en_md || program.value.teaching_methods_en_html || '',
      teaching_methods_ar: program.value.teaching_methods_ar_md || program.value.teaching_methods_ar_html || '',
      description_md_en: program.value.description_en_md || '',
      description_html_en: program.value.description_en_html || '',
      description_md_ar: program.value.description_ar_md || '',
      description_html_ar: program.value.description_ar_html || '',
      objectives_en: program.value.objectives_en || [],
      objectives_ar: program.value.objectives_ar || [],
      target_audience_en: program.value.target_audience_en || [],
      target_audience_ar: program.value.target_audience_ar || [],
    }
    evaluationMethods.value = parseEvaluationMethods(program.value.evaluation_methods)
    await nextTick()
    initialLoadDone.value = true
  } catch (e) {
    console.error('Erreur lors du chargement du programme:', e)
    alert('Programme non trouvé')
    router.replace('/admin/formations/programmes')
  } finally {
    loading.value = false
  }
}

onMounted(loadProgram)

// === GESTION DES COMPÉTENCES ===
async function loadSkills() {
  if (!program.value) return
  loadingSkills.value = true
  try {
    const response = await listSkills({ program_id: program.value.id, limit: 100 })
    skills.value = response.items.sort((a, b) => a.display_order - b.display_order)
  } catch (e) {
    console.error('Erreur lors du chargement des compétences:', e)
  } finally {
    loadingSkills.value = false
  }
}

// Charger les compétences et débouchés après le programme
watch(program, (newProgram) => {
  if (newProgram) {
    loadSkills()
    loadCareerOpportunities()
    loadPartners()
  }
})

// Modales compétences
const openAddSkillModal = () => {
  newSkill.value = { title: '', description: '' }
  showAddSkillModal.value = true
}

const closeAddSkillModal = () => {
  showAddSkillModal.value = false
  newSkill.value = { title: '', description: '' }
}

const openEditSkillModal = (skill: ProgramSkillRead) => {
  editingSkill.value = { ...skill }
  showEditSkillModal.value = true
}

const closeEditSkillModal = () => {
  showEditSkillModal.value = false
  editingSkill.value = null
}

const openDeleteSkillModal = (skill: ProgramSkillRead) => {
  deletingSkill.value = skill
  showDeleteSkillModal.value = true
}

const closeDeleteSkillModal = () => {
  showDeleteSkillModal.value = false
  deletingSkill.value = null
}

// CRUD Compétences
const addSkill = async () => {
  if (!newSkill.value.title.trim() || !program.value) return

  isSubmittingSkill.value = true
  try {
    await createSkill({
      program_id: program.value.id,
      title: newSkill.value.title,
      description: newSkill.value.description || undefined,
      display_order: skills.value.length + 1,
    })
    closeAddSkillModal()
    await loadSkills()
  } catch (e) {
    console.error('Erreur lors de la création de la compétence:', e)
    alert('Erreur lors de la création de la compétence')
  } finally {
    isSubmittingSkill.value = false
  }
}

const updateSkillHandler = async () => {
  if (!editingSkill.value) return

  isSubmittingSkill.value = true
  try {
    await apiUpdateSkill(editingSkill.value.id, {
      title: editingSkill.value.title,
      description: editingSkill.value.description || undefined,
    })
    closeEditSkillModal()
    await loadSkills()
  } catch (e) {
    console.error('Erreur lors de la mise à jour de la compétence:', e)
    alert('Erreur lors de la mise à jour de la compétence')
  } finally {
    isSubmittingSkill.value = false
  }
}

const deleteSkillHandler = async () => {
  if (!deletingSkill.value) return

  isSubmittingSkill.value = true
  try {
    await apiDeleteSkill(deletingSkill.value.id)
    closeDeleteSkillModal()
    await loadSkills()
  } catch (e) {
    console.error('Erreur lors de la suppression de la compétence:', e)
    alert('Erreur lors de la suppression de la compétence')
  } finally {
    isSubmittingSkill.value = false
  }
}

// Drag & Drop compétences
const onSkillDragStart = (index: number) => {
  draggedSkillIndex.value = index
}

const onSkillDragOver = (e: DragEvent) => {
  e.preventDefault()
}

const onSkillDrop = async (e: DragEvent, targetIndex: number) => {
  e.preventDefault()
  if (draggedSkillIndex.value === null || draggedSkillIndex.value === targetIndex) return

  const newSkills = [...skills.value]
  const [draggedSkill] = newSkills.splice(draggedSkillIndex.value, 1)
  newSkills.splice(targetIndex, 0, draggedSkill)
  skills.value = newSkills

  const skillIds = newSkills.map(s => s.id)
  try {
    await reorderSkills(skillIds)
    await loadSkills()
  } catch (e) {
    console.error('Erreur lors de la réorganisation:', e)
    await loadSkills()
  } finally {
    draggedSkillIndex.value = null
  }
}

const onSkillDragEnd = () => {
  draggedSkillIndex.value = null
}

// === GESTION DES DÉBOUCHÉS ===
async function loadCareerOpportunities() {
  if (!program.value) return
  loadingCareerOpportunities.value = true
  try {
    const response = await listCareerOpportunities({ program_id: program.value.id, limit: 100 })
    careerOpportunities.value = response.items.sort((a, b) => a.display_order - b.display_order)
  } catch (e) {
    console.error('Erreur lors du chargement des débouchés:', e)
  } finally {
    loadingCareerOpportunities.value = false
  }
}

// Modales débouchés
const openAddCareerOpportunityModal = () => {
  newCareerOpportunity.value = { title: '', description: '' }
  showAddCareerOpportunityModal.value = true
}

const closeAddCareerOpportunityModal = () => {
  showAddCareerOpportunityModal.value = false
  newCareerOpportunity.value = { title: '', description: '' }
}

const openEditCareerOpportunityModal = (opportunity: ProgramCareerOpportunityRead) => {
  editingCareerOpportunity.value = { ...opportunity }
  showEditCareerOpportunityModal.value = true
}

const closeEditCareerOpportunityModal = () => {
  showEditCareerOpportunityModal.value = false
  editingCareerOpportunity.value = null
}

const openDeleteCareerOpportunityModal = (opportunity: ProgramCareerOpportunityRead) => {
  deletingCareerOpportunity.value = opportunity
  showDeleteCareerOpportunityModal.value = true
}

const closeDeleteCareerOpportunityModal = () => {
  showDeleteCareerOpportunityModal.value = false
  deletingCareerOpportunity.value = null
}

// CRUD Débouchés
const addCareerOpportunity = async () => {
  if (!newCareerOpportunity.value.title.trim() || !program.value) return

  isSubmittingCareerOpportunity.value = true
  try {
    await createCareerOpportunity({
      program_id: program.value.id,
      title: newCareerOpportunity.value.title,
      description: newCareerOpportunity.value.description || undefined,
      display_order: careerOpportunities.value.length + 1,
    })
    closeAddCareerOpportunityModal()
    await loadCareerOpportunities()
  } catch (e) {
    console.error('Erreur lors de la création du débouché:', e)
    alert('Erreur lors de la création du débouché')
  } finally {
    isSubmittingCareerOpportunity.value = false
  }
}

const updateCareerOpportunityHandler = async () => {
  if (!editingCareerOpportunity.value) return

  isSubmittingCareerOpportunity.value = true
  try {
    await apiUpdateCareerOpportunity(editingCareerOpportunity.value.id, {
      title: editingCareerOpportunity.value.title,
      description: editingCareerOpportunity.value.description || undefined,
    })
    closeEditCareerOpportunityModal()
    await loadCareerOpportunities()
  } catch (e) {
    console.error('Erreur lors de la mise à jour du débouché:', e)
    alert('Erreur lors de la mise à jour du débouché')
  } finally {
    isSubmittingCareerOpportunity.value = false
  }
}

const deleteCareerOpportunityHandler = async () => {
  if (!deletingCareerOpportunity.value) return

  isSubmittingCareerOpportunity.value = true
  try {
    await apiDeleteCareerOpportunity(deletingCareerOpportunity.value.id)
    closeDeleteCareerOpportunityModal()
    await loadCareerOpportunities()
  } catch (e) {
    console.error('Erreur lors de la suppression du débouché:', e)
    alert('Erreur lors de la suppression du débouché')
  } finally {
    isSubmittingCareerOpportunity.value = false
  }
}

// Drag & Drop débouchés
const onCareerOpportunityDragStart = (index: number) => {
  draggedCareerOpportunityIndex.value = index
}

const onCareerOpportunityDragOver = (e: DragEvent) => {
  e.preventDefault()
}

const onCareerOpportunityDrop = async (e: DragEvent, targetIndex: number) => {
  e.preventDefault()
  if (draggedCareerOpportunityIndex.value === null || draggedCareerOpportunityIndex.value === targetIndex) return

  const newOpportunities = [...careerOpportunities.value]
  const [draggedOpportunity] = newOpportunities.splice(draggedCareerOpportunityIndex.value, 1)
  newOpportunities.splice(targetIndex, 0, draggedOpportunity)
  careerOpportunities.value = newOpportunities

  const opportunityIds = newOpportunities.map(o => o.id)
  try {
    await reorderCareerOpportunities(opportunityIds)
    await loadCareerOpportunities()
  } catch (e) {
    console.error('Erreur lors de la réorganisation:', e)
    await loadCareerOpportunities()
  } finally {
    draggedCareerOpportunityIndex.value = null
  }
}

const onCareerOpportunityDragEnd = () => {
  draggedCareerOpportunityIndex.value = null
}

// === GESTION DES PARTENAIRES ===
async function loadPartners() {
  if (!program.value) return
  loadingPartners.value = true
  try {
    const [partnersResponse, allPartnersResponse] = await Promise.all([
      listProgramPartners(program.value.id),
      getAllPartners(),
    ])
    programPartners.value = [...partnersResponse].sort((a, b) => a.display_order - b.display_order)
    allPartnersList.value = allPartnersResponse as unknown as PartnerItem[]
  } catch (e) {
    console.error('Erreur lors du chargement des partenaires:', e)
  } finally {
    loadingPartners.value = false
  }
}

const availablePartners = computed(() => {
  const associatedIds = new Set(programPartners.value.map(p => p.partner_external_id))
  const query = partnerSearchQuery.value.toLowerCase()
  return allPartnersList.value.filter(p => {
    if (associatedIds.has(p.id)) return false
    if (query && !p.name.toLowerCase().includes(query)) return false
    return true
  })
})

const associatedPartnersDetails = computed(() => {
  return programPartners.value.map(pp => {
    const detail = allPartnersList.value.find(p => p.id === pp.partner_external_id)
    return {
      ...pp,
      name: detail?.name || pp.partner_external_id,
      logo_external_id: detail?.logo_external_id || null,
      active: detail?.active ?? true,
    }
  })
})

async function handleAddPartner() {
  if (!selectedPartnerId.value || !program.value) return
  try {
    await addPartnerToProgram(program.value.id, {
      partner_external_id: selectedPartnerId.value,
    })
    selectedPartnerId.value = ''
    partnerSearchQuery.value = ''
    await loadPartners()
  } catch (e: unknown) {
    const error = e as { data?: { detail?: string } }
    if (error?.data?.detail?.includes('déjà')) {
      alert('Ce partenaire est déjà associé à cette formation.')
    } else {
      console.error('Erreur ajout partenaire:', e)
    }
  }
}

async function handleRemovePartner(partnerExternalId: string) {
  if (!program.value) return
  if (!confirm('Retirer ce partenaire de la formation ?')) return
  try {
    await removePartnerFromProgram(program.value.id, partnerExternalId)
    await loadPartners()
  } catch (e) {
    console.error('Erreur suppression partenaire:', e)
  }
}

// Réordonnancement des partenaires par glisser-déposer
const onPartnerDragStart = (index: number) => {
  draggedPartnerIndex.value = index
}

const onPartnerDragOver = (e: DragEvent) => {
  e.preventDefault()
}

const onPartnerDrop = async (e: DragEvent, targetIndex: number) => {
  e.preventDefault()
  if (draggedPartnerIndex.value === null || draggedPartnerIndex.value === targetIndex) return
  if (!program.value) return

  const newPartners = [...programPartners.value]
  const [dragged] = newPartners.splice(draggedPartnerIndex.value, 1)
  if (!dragged) return
  newPartners.splice(targetIndex, 0, dragged)
  programPartners.value = newPartners

  try {
    await reorderProgramPartners(program.value.id, newPartners.map(p => p.partner_external_id))
    await loadPartners()
  } catch (e) {
    console.error('Erreur lors de la réorganisation des partenaires:', e)
    await loadPartners()
  } finally {
    draggedPartnerIndex.value = null
  }
}

const onPartnerDragEnd = () => {
  draggedPartnerIndex.value = null
}

// === GESTION DE L'IMAGE DE COUVERTURE ===
function handleCoverImageUpload(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    pendingCoverFile.value = input.files[0]
    showCoverEditor.value = true
  }
  // Reset input pour permettre de resélectionner le même fichier
  input.value = ''
}

async function saveEditedCover(variants: ImageVariants) {
  isUploadingCover.value = true
  try {
    const originalName = pendingCoverFile.value?.name || 'cover.jpg'
    const baseName = originalName.replace(/\.[^.]+$/, '')

    const response = await uploadMediaVariants(variants, baseName, {
      folder: 'programs/covers',
    })

    form.value.cover_image_external_id = response.original.id
    form.value.cover_image = URL.createObjectURL(variants.medium)
    showCoverEditor.value = false
    pendingCoverFile.value = null
  } catch (e) {
    console.error('Erreur lors de l\'upload de l\'image:', e)
    alert('Erreur lors de l\'upload de l\'image')
  } finally {
    isUploadingCover.value = false
  }
}

function cancelCoverEditor() {
  showCoverEditor.value = false
  pendingCoverFile.value = null
}

function removeCoverImage() {
  form.value.cover_image = ''
  form.value.cover_image_external_id = null
}

// Génération de slug
const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Génération de code (initiales des mots significatifs)
const generateCode = (title: string): string => {
  if (!title.trim()) return ''
  const stopWords = new Set(['de', 'du', 'des', 'le', 'la', 'les', 'en', 'et', 'a', 'au', 'aux', 'un', 'une', 'pour', 'par', 'sur', 'dans', 'avec', 'sans', 'sous', 'entre', 'd', 'l', 'n'])
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[\s''-]+/)
    .filter(word => word.length > 0 && !stopWords.has(word.toLowerCase()))
    .map(word => word[0].toUpperCase())
    .join('')
}

// Auto-génération du code et slug quand le titre change
watch(() => form.value.title, (newTitle) => {
  if (!initialLoadDone.value) return
  form.value.code = generateCode(newTitle)
  form.value.slug = generateSlug(newTitle)
})

// États de modification
const hasChanges = ref(false)
const showDiscardModal = ref(false)

// Détecter les changements du formulaire
watch(form, () => {
  hasChanges.value = true
}, { deep: true })

// Soumettre le formulaire
const submitForm = async () => {
  if (!program.value) return

  isSubmitting.value = true
  try {
    await updateProgram(program.value.id, {
      code: form.value.code,
      title: form.value.title,
      subtitle: form.value.subtitle || null,
      slug: form.value.slug,
      description_html: form.value.description_html || null,
      description_md: form.value.description_md || null,
      teaching_methods_html: form.value.teaching_methods || null,
      teaching_methods_md: form.value.teaching_methods || null,
      objectives: form.value.objectives.length > 0 ? form.value.objectives : null,
      target_audience: form.value.target_audience.length > 0 ? form.value.target_audience : null,
      format_md: form.value.format || null,
      format_html: form.value.format || null,
      evaluation_methods_html: evaluationMethods.value.length > 0 ? JSON.stringify(evaluationMethods.value) : null,
      evaluation_methods_md: evaluationMethods.value.length > 0 ? JSON.stringify(evaluationMethods.value) : null,
      cover_image_external_id: form.value.cover_image_external_id,
      campus_external_id: form.value.campus_id || null,
      sector_external_id: form.value.sector_id || null,
      service_external_id: form.value.service_id || null,
      field_id: form.value.type === 'certificate' ? form.value.field_id : null,
      type: form.value.type,
      duration_months: form.value.duration_months,
      credits: form.value.credits,
      degree_awarded: form.value.degree_awarded || null,
      required_degree: form.value.required_degree || null,
      status: form.value.status,
      is_featured: form.value.is_featured,
      // Traductions EN/AR (champs propres ; format/evaluation_methods auto-traduits backend).
      title_en: form.value.title_en || null,
      title_ar: form.value.title_ar || null,
      subtitle_en: form.value.subtitle_en || null,
      subtitle_ar: form.value.subtitle_ar || null,
      required_degree_en: form.value.required_degree_en || null,
      required_degree_ar: form.value.required_degree_ar || null,
      teaching_methods_en_html: form.value.teaching_methods_en || null,
      teaching_methods_en_md: form.value.teaching_methods_en || null,
      teaching_methods_ar_html: form.value.teaching_methods_ar || null,
      teaching_methods_ar_md: form.value.teaching_methods_ar || null,
      description_en_html: form.value.description_html_en || null,
      description_en_md: form.value.description_md_en || null,
      description_ar_html: form.value.description_html_ar || null,
      description_ar_md: form.value.description_md_ar || null,
      objectives_en: form.value.objectives_en.length > 0 ? form.value.objectives_en : null,
      objectives_ar: form.value.objectives_ar.length > 0 ? form.value.objectives_ar : null,
      target_audience_en: form.value.target_audience_en.length > 0 ? form.value.target_audience_en : null,
      target_audience_ar: form.value.target_audience_ar.length > 0 ? form.value.target_audience_ar : null,
    })

    hasChanges.value = false
    router.push(`/admin/formations/programmes/${program.value.id}`)
  } catch (error: unknown) {
    console.error('Erreur lors de la mise à jour:', error)
    const fetchError = error as { data?: { detail?: string } }
    const detail = fetchError.data?.detail || 'Impossible de mettre à jour le programme'
    alert(detail)
  } finally {
    isSubmitting.value = false
  }
}

// Annuler
const handleCancel = () => {
  if (hasChanges.value) {
    showDiscardModal.value = true
  } else {
    router.push(`/admin/formations/programmes/${program.value?.id}`)
  }
}

const confirmDiscard = () => {
  showDiscardModal.value = false
  router.push(`/admin/formations/programmes/${program.value?.id}`)
}

// Régénérer le slug
const regenerateSlug = () => {
  form.value.slug = generateSlug(form.value.title)
}

// Options pour les selects
const programTypes = Object.entries(programTypeLabels).map(([value, label]) => ({
  value: value as ProgramType,
  label,
}))

const publicationStatuses: { value: PublicationStatus; label: string }[] = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'published', label: 'Publié' },
  { value: 'archived', label: 'Archivé' },
]
</script>

<template>
  <!-- État de chargement -->
  <div v-if="loading" class="flex items-center justify-center py-12">
    <div class="text-center">
      <font-awesome-icon icon="fa-solid fa-spinner" class="w-8 h-8 animate-spin text-blue-600" />
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Chargement du programme...</p>
    </div>
  </div>

  <div v-else-if="program" class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-3">
        <button
          class="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          @click="handleCancel"
        >
          <font-awesome-icon icon="fa-solid fa-arrow-left" class="w-5 h-5" />
        </button>
        <div>
          <nav class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <NuxtLink to="/admin/formations/programmes" class="hover:text-blue-600 dark:hover:text-blue-400">
              Programmes
            </NuxtLink>
            <font-awesome-icon icon="fa-solid fa-chevron-right" class="w-3 h-3" />
            <NuxtLink :to="`/admin/formations/programmes/${program.id}`" class="hover:text-blue-600 dark:hover:text-blue-400">
              {{ program.title }}
            </NuxtLink>
            <font-awesome-icon icon="fa-solid fa-chevron-right" class="w-3 h-3" />
            <span class="text-gray-900 dark:text-white">Modifier</span>
          </nav>
          <h1 class="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
            Modifier le programme
          </h1>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          @click="handleCancel"
        >
          Annuler
        </button>
        <button
          type="button"
          :disabled="isTranslating || !form.title"
          class="inline-flex items-center gap-2 rounded-lg border border-blue-300 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50 disabled:opacity-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/30"
          title="Génère les versions anglaise et arabe à partir du français. Corrigez-les avant d'enregistrer."
          @click="handleTranslate"
        >
          <font-awesome-icon :icon="isTranslating ? 'fa-solid fa-spinner' : 'fa-solid fa-language'" :class="isTranslating ? 'animate-spin' : ''" class="h-4 w-4" />
          {{ isTranslating ? 'Traduction…' : 'Traduire FR → EN/AR' }}
        </button>
        <button
          type="submit"
          form="edit-form"
          :disabled="isSubmitting"
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          <font-awesome-icon v-if="isSubmitting" icon="fa-solid fa-spinner" class="w-4 h-4 animate-spin" />
          <font-awesome-icon v-else icon="fa-solid fa-save" class="w-4 h-4" />
          Enregistrer
        </button>
      </div>
    </div>

    <!-- Formulaire -->
    <form id="edit-form" @submit.prevent="submitForm" class="space-y-6">
      <!-- Informations générales -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <font-awesome-icon icon="fa-solid fa-info-circle" class="w-5 h-5 text-blue-500" />
          Informations générales
        </h2>

        <div class="space-y-6">
          <!-- Code et Titre -->
          <div class="grid gap-4 sm:grid-cols-3">
            <div>
              <label for="code" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Code <span class="text-red-500">*</span>
              </label>
              <input
                id="code"
                v-model="form.code"
                type="text"
                required
                placeholder="MPAGD"
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div class="sm:col-span-2">
              <label for="title" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Titre <span class="text-red-500">*</span>
              </label>
              <input
                id="title"
                v-model="form.title"
                type="text"
                required
                placeholder="Master en..."
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <!-- Sous-titre -->
          <div>
            <label for="subtitle" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Sous-titre
            </label>
            <input
              id="subtitle"
              v-model="form.subtitle"
              type="text"
              placeholder="Une courte description..."
              class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <!-- Slug -->
          <div>
            <label for="slug" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Slug (URL) <span class="text-red-500">*</span>
            </label>
            <div class="flex gap-2">
              <input
                id="slug"
                v-model="form.slug"
                type="text"
                required
                placeholder="master-en-..."
                class="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                title="Régénérer depuis le titre"
                @click="regenerateSlug"
              >
                <font-awesome-icon icon="fa-solid fa-rotate" class="w-4 h-4" />
              </button>
            </div>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              URL: /formations/{{ form.slug || '...' }}
            </p>
          </div>

          <!-- Type -->
          <div class="sm:max-w-xs">
            <label for="type" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Type de formation <span class="text-red-500">*</span>
            </label>
            <select
              id="type"
              v-model="form.type"
              required
              class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option v-for="pt in programTypes" :key="pt.value" :value="pt.value">
                {{ pt.label }}
              </option>
            </select>
          </div>

          <!-- Champ disciplinaire (certificats uniquement) -->
          <div v-if="form.type === 'certificate'" class="sm:max-w-xs">
            <label for="field_id" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Champ disciplinaire
            </label>
            <select
              id="field_id"
              v-model="form.field_id"
              class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option :value="null">-- Aucun --</option>
              <option v-for="field in programFields" :key="field.id" :value="field.id">
                {{ field.name }}
              </option>
            </select>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Domaine thématique du certificat
            </p>
          </div>
        </div>
      </div>

      <!-- Associations -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <font-awesome-icon icon="fa-solid fa-link" class="w-5 h-5 text-cyan-500" />
          Associations
        </h2>

        <div class="grid gap-4 sm:grid-cols-3">
          <!-- Campus -->
          <div>
            <label for="campus_id" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Campus associé
            </label>
            <select
              id="campus_id"
              v-model="form.campus_id"
              class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Aucun</option>
              <option v-for="campus in allCampuses" :key="campus.id" :value="campus.id">
                {{ campus.name }}
              </option>
            </select>
          </div>

          <!-- Secteur -->
          <div>
            <label for="sector_id" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Secteur associé
            </label>
            <select
              id="sector_id"
              v-model="form.sector_id"
              class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Aucun</option>
              <option v-for="dept in allDepartments" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </option>
            </select>
          </div>

          <!-- Service -->
          <div>
            <label for="service_id" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Service associé
            </label>
            <select
              id="service_id"
              v-model="form.service_id"
              :disabled="!form.sector_id"
              class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Aucun</option>
              <option v-for="service in filteredServices" :key="service.id" :value="service.id">
                {{ service.name }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Image de couverture -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <font-awesome-icon icon="fa-solid fa-image" class="w-5 h-5 text-indigo-500" />
          Image de couverture
        </h2>

        <div class="space-y-4">
          <!-- Prévisualisation -->
          <div v-if="form.cover_image" class="relative">
            <img
              :src="form.cover_image"
              alt="Image de couverture"
              class="h-48 w-full rounded-lg object-cover"
            />
            <div class="absolute inset-0 flex items-center justify-center gap-2 rounded-lg bg-black/50 opacity-0 transition-opacity hover:opacity-100">
              <label class="cursor-pointer rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100">
                <font-awesome-icon icon="fa-solid fa-pen" class="mr-2 h-4 w-4" />
                Modifier
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleCoverImageUpload"
                />
              </label>
              <button
                type="button"
                class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                @click="removeCoverImage"
              >
                <font-awesome-icon icon="fa-solid fa-trash" class="mr-2 h-4 w-4" />
                Supprimer
              </button>
            </div>
          </div>

          <!-- Upload -->
          <div v-else class="relative">
            <label
              class="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition-colors hover:border-indigo-400 hover:bg-indigo-50 dark:border-gray-600 dark:bg-gray-700/50 dark:hover:border-indigo-500 dark:hover:bg-indigo-900/20"
            >
              <font-awesome-icon icon="fa-solid fa-cloud-upload-alt" class="mb-3 h-10 w-10 text-gray-400" />
              <p class="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Cliquez pour télécharger une image
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                PNG, JPG ou WebP (recommandé : 1200x675px, ratio 16:9)
              </p>
              <input
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleCoverImageUpload"
              />
            </label>
          </div>

          <!-- Indicateur de chargement -->
          <div v-if="isUploadingCover" class="flex items-center gap-2 text-sm text-gray-500">
            <font-awesome-icon icon="fa-solid fa-spinner" class="h-4 w-4 animate-spin" />
            Upload en cours...
          </div>
        </div>
      </div>

      <!-- Description -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <font-awesome-icon icon="fa-solid fa-align-left" class="w-5 h-5 text-green-500" />
          Description
        </h2>

        <div class="space-y-6">
          <div>
            <label for="description" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description complète
            </label>
            <AdminRichTextEditor
              v-model="form.description_md"
              v-model:html-value="form.description_html"
              v-model:model-value-en="form.description_md_en"
              v-model:html-value-en="form.description_html_en"
              v-model:model-value-ar="form.description_md_ar"
              v-model:html-value-ar="form.description_html_ar"
              :show-card="false"
              placeholder="Décrivez le programme en détail..."
              height="200px"
            />
          </div>

          <div>
            <label for="teaching_methods" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Approche pédagogique
            </label>
            <textarea
              id="teaching_methods"
              v-model="form.teaching_methods"
              rows="4"
              placeholder="Décrivez les méthodes pédagogiques utilisées..."
              class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label for="objectives" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Objectifs
            </label>
            <div class="flex gap-2">
              <input
                id="objectives"
                v-model="newObjective"
                type="text"
                placeholder="Ajouter un objectif..."
                class="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                @keydown.enter.prevent="addObjective"
              />
              <button
                type="button"
                class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                @click="addObjective"
              >
                Ajouter
              </button>
            </div>
            <div v-if="form.objectives.length > 0" class="mt-2 flex flex-wrap gap-2">
              <span
                v-for="(item, index) in form.objectives"
                :key="index"
                class="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-800 dark:border-gray-600 dark:text-gray-200"
              >
                {{ item }}
                <button
                  type="button"
                  class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  @click="removeObjective(index)"
                >
                  <font-awesome-icon :icon="['fas', 'xmark']" class="h-3 w-3" />
                </button>
              </span>
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="target_audience" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Public cible
              </label>
              <div class="flex gap-2">
                <input
                  id="target_audience"
                  v-model="newTargetAudience"
                  type="text"
                  placeholder="Ajouter un public cible..."
                  class="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  @keydown.enter.prevent="addTargetAudience"
                />
                <button
                  type="button"
                  class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  @click="addTargetAudience"
                >
                  Ajouter
                </button>
              </div>
              <div v-if="form.target_audience.length > 0" class="mt-2 flex flex-wrap gap-2">
                <span
                  v-for="(item, index) in form.target_audience"
                  :key="index"
                  class="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-800 dark:border-gray-600 dark:text-gray-200"
                >
                  {{ item }}
                  <button
                    type="button"
                    class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    @click="removeTargetAudience(index)"
                  >
                    <font-awesome-icon :icon="['fas', 'xmark']" class="h-3 w-3" />
                  </button>
                </span>
              </div>
            </div>
            <div>
              <label for="format" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Format
              </label>
              <select
                id="format"
                v-model="form.format"
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">-- Aucun --</option>
                <option v-for="opt in formatOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Traductions EN/AR (champs propres) -->
          <div class="rounded-lg border border-blue-100 bg-blue-50/40 p-4 dark:border-blue-900/40 dark:bg-blue-900/10">
            <p class="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <font-awesome-icon icon="fa-solid fa-language" class="h-4 w-4 text-blue-500" />
              Traductions (EN / AR)
            </p>
            <p class="mb-4 text-xs text-gray-500 dark:text-gray-400">
              Générées par « Traduire FR → EN/AR » ; corrigez-les avant d'enregistrer. Listes : un élément par ligne.
            </p>
            <div class="grid gap-6 md:grid-cols-2">
              <!-- Anglais -->
              <div class="space-y-3">
                <p class="text-sm font-semibold text-gray-700 dark:text-gray-300">🇬🇧 English</p>
                <input v-model="form.title_en" type="text" placeholder="Title (EN)" class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                <input v-model="form.subtitle_en" type="text" placeholder="Subtitle (EN)" class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                <input v-model="form.required_degree_en" type="text" placeholder="Required degree (EN)" class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                <textarea v-model="form.teaching_methods_en" rows="3" placeholder="Teaching approach (EN)" class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                <textarea v-model="objectivesEnText" rows="3" placeholder="Objectives (EN — one per line)" class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                <textarea v-model="targetAudienceEnText" rows="3" placeholder="Target audience (EN — one per line)" class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              </div>
              <!-- Arabe -->
              <div class="space-y-3" dir="rtl">
                <p class="text-sm font-semibold text-gray-700 dark:text-gray-300">🇸🇦 العربية</p>
                <input v-model="form.title_ar" type="text" placeholder="العنوان (AR)" class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                <input v-model="form.subtitle_ar" type="text" placeholder="العنوان الفرعي (AR)" class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                <input v-model="form.required_degree_ar" type="text" placeholder="الشهادة المطلوبة (AR)" class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                <textarea v-model="form.teaching_methods_ar" rows="3" placeholder="المقاربة البيداغوجية (AR)" class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                <textarea v-model="objectivesArText" rows="3" placeholder="الأهداف (AR — سطر لكل عنصر)" class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                <textarea v-model="targetAudienceArText" rows="3" placeholder="الجمهور المستهدف (AR — سطر لكل عنصر)" class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              </div>
            </div>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Modalités d'évaluation
            </label>
            <div class="space-y-2">
              <!-- Liste des modalités -->
              <div
                v-for="(method, index) in evaluationMethods"
                :key="index"
                class="flex items-center gap-2"
              >
                <span class="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                  {{ method }}
                </span>
                <button
                  type="button"
                  class="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                  @click="removeEvaluationMethod(index)"
                >
                  <font-awesome-icon icon="fa-solid fa-xmark" class="h-3 w-3" />
                </button>
              </div>
              <!-- Ajout -->
              <div class="flex gap-2">
                <input
                  v-model="newEvaluationMethod"
                  type="text"
                  placeholder="Ex: Contrôle continu, Examen final..."
                  class="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  @keydown.enter.prevent="addEvaluationMethod"
                />
                <button
                  type="button"
                  class="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  @click="addEvaluationMethod"
                >
                  <font-awesome-icon icon="fa-solid fa-plus" class="h-3 w-3" />
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Détails académiques -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <font-awesome-icon icon="fa-solid fa-graduation-cap" class="w-5 h-5 text-purple-500" />
          Détails académiques
        </h2>

        <div class="space-y-6">
          <!-- Durée et Crédits -->
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="duration_months" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Durée (en mois)
              </label>
              <input
                id="duration_months"
                v-model.number="form.duration_months"
                type="number"
                min="1"
                max="120"
                placeholder="24"
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Exemple: 24 mois = 2 ans
              </p>
            </div>
            <div>
              <label for="credits" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Crédits ECTS
              </label>
              <input
                id="credits"
                v-model.number="form.credits"
                type="number"
                min="0"
                max="500"
                placeholder="120"
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <!-- Diplôme délivré et requis -->
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="degree_awarded" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Diplôme délivré
              </label>
              <input
                id="degree_awarded"
                v-model="form.degree_awarded"
                type="text"
                placeholder="Master professionnel"
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label for="required_degree" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Diplôme requis
              </label>
              <input
                id="required_degree"
                v-model="form.required_degree"
                type="text"
                placeholder="Licence ou équivalent Bac+3"
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Options de publication -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <font-awesome-icon icon="fa-solid fa-cog" class="w-5 h-5 text-gray-500" />
          Publication
        </h2>

        <div class="grid gap-6 sm:grid-cols-2">
          <div>
            <label for="status" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Statut de publication
            </label>
            <select
              id="status"
              v-model="form.status"
              class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option v-for="ps in publicationStatuses" :key="ps.value" :value="ps.value">
                {{ ps.label }}
              </option>
            </select>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Seuls les programmes publiés sont visibles sur le site public.
            </p>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mise en avant
            </label>
            <label class="mt-2 flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-700/50 dark:hover:bg-gray-700">
              <input
                v-model="form.is_featured"
                type="checkbox"
                class="h-5 w-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700"
              >
              <div>
                <span class="flex items-center gap-1.5 text-sm font-medium text-gray-900 dark:text-white">
                  <font-awesome-icon icon="fa-solid fa-star" class="h-3.5 w-3.5 text-amber-500" />
                  À la une
                </span>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Afficher sur la page d'accueil
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      <!-- Compétences -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <font-awesome-icon icon="fa-solid fa-list-check" class="h-5 w-5 text-amber-500" />
            Compétences visées
            <span class="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-sm font-normal text-gray-600 dark:bg-gray-700 dark:text-gray-400">
              {{ skills.length }}
            </span>
          </h2>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-amber-700"
            @click="openAddSkillModal"
          >
            <font-awesome-icon icon="fa-solid fa-plus" class="h-3 w-3" />
            Ajouter
          </button>
        </div>

        <!-- Chargement -->
        <div v-if="loadingSkills" class="flex items-center justify-center py-8">
          <font-awesome-icon icon="fa-solid fa-spinner" class="h-6 w-6 animate-spin text-gray-400" />
        </div>

        <!-- Liste vide -->
        <div v-else-if="skills.length === 0" class="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center dark:border-gray-700">
          <font-awesome-icon icon="fa-solid fa-list-check" class="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Aucune compétence définie pour ce programme.
          </p>
          <button
            type="button"
            class="mt-3 text-sm text-amber-600 hover:underline dark:text-amber-400"
            @click="openAddSkillModal"
          >
            Ajouter la première compétence
          </button>
        </div>

        <!-- Liste des compétences -->
        <div v-else class="space-y-2">
          <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">
            <font-awesome-icon icon="fa-solid fa-grip-vertical" class="mr-1 h-3 w-3" />
            Glissez-déposez pour réorganiser
          </p>

          <div
            v-for="(skill, index) in skills"
            :key="skill.id"
            class="group flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 transition-all dark:border-gray-700 dark:bg-gray-700/50"
            :class="{ 'opacity-50': draggedSkillIndex === index }"
            draggable="true"
            @dragstart="onSkillDragStart(index)"
            @dragover="onSkillDragOver"
            @drop="(e) => onSkillDrop(e, index)"
            @dragend="onSkillDragEnd"
          >
            <!-- Poignée -->
            <div class="cursor-grab text-gray-400 active:cursor-grabbing">
              <font-awesome-icon icon="fa-solid fa-grip-vertical" class="h-4 w-4" />
            </div>

            <!-- Numéro -->
            <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              {{ index + 1 }}
            </div>

            <!-- Contenu -->
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ skill.title }}</p>
              <p v-if="skill.description" class="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                {{ skill.description }}
              </p>
            </div>

            <!-- Actions -->
            <div class="flex shrink-0 gap-1">
              <button
                type="button"
                class="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-blue-600 dark:hover:bg-gray-600 dark:hover:text-blue-400"
                title="Modifier"
                @click="openEditSkillModal(skill)"
              >
                <font-awesome-icon icon="fa-solid fa-pen" class="h-3 w-3" />
              </button>
              <button
                type="button"
                class="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-red-600 dark:hover:bg-gray-600 dark:hover:text-red-400"
                title="Supprimer"
                @click="openDeleteSkillModal(skill)"
              >
                <font-awesome-icon icon="fa-solid fa-trash" class="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Débouchés -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <font-awesome-icon icon="fa-solid fa-briefcase" class="h-5 w-5 text-green-500" />
            Débouchés professionnels
            <span class="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-sm font-normal text-gray-600 dark:bg-gray-700 dark:text-gray-400">
              {{ careerOpportunities.length }}
            </span>
          </h2>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
            @click="openAddCareerOpportunityModal"
          >
            <font-awesome-icon icon="fa-solid fa-plus" class="h-3 w-3" />
            Ajouter
          </button>
        </div>

        <!-- Chargement -->
        <div v-if="loadingCareerOpportunities" class="flex items-center justify-center py-8">
          <font-awesome-icon icon="fa-solid fa-spinner" class="h-6 w-6 animate-spin text-gray-400" />
        </div>

        <!-- Liste vide -->
        <div v-else-if="careerOpportunities.length === 0" class="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center dark:border-gray-700">
          <font-awesome-icon icon="fa-solid fa-briefcase" class="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Aucun débouché défini pour ce programme.
          </p>
          <button
            type="button"
            class="mt-3 text-sm text-green-600 hover:underline dark:text-green-400"
            @click="openAddCareerOpportunityModal"
          >
            Ajouter le premier débouché
          </button>
        </div>

        <!-- Liste des débouchés -->
        <div v-else class="space-y-2">
          <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">
            <font-awesome-icon icon="fa-solid fa-grip-vertical" class="mr-1 h-3 w-3" />
            Glissez-déposez pour réorganiser
          </p>

          <div
            v-for="(opportunity, index) in careerOpportunities"
            :key="opportunity.id"
            class="group flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 transition-all dark:border-gray-700 dark:bg-gray-700/50"
            :class="{ 'opacity-50': draggedCareerOpportunityIndex === index }"
            draggable="true"
            @dragstart="onCareerOpportunityDragStart(index)"
            @dragover="onCareerOpportunityDragOver"
            @drop="(e) => onCareerOpportunityDrop(e, index)"
            @dragend="onCareerOpportunityDragEnd"
          >
            <!-- Poignée -->
            <div class="cursor-grab text-gray-400 active:cursor-grabbing">
              <font-awesome-icon icon="fa-solid fa-grip-vertical" class="h-4 w-4" />
            </div>

            <!-- Numéro -->
            <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-600 dark:bg-green-900/30 dark:text-green-400">
              {{ index + 1 }}
            </div>

            <!-- Contenu -->
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ opportunity.title }}</p>
              <p v-if="opportunity.description" class="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                {{ opportunity.description }}
              </p>
            </div>

            <!-- Actions -->
            <div class="flex shrink-0 gap-1">
              <button
                type="button"
                class="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-blue-600 dark:hover:bg-gray-600 dark:hover:text-blue-400"
                title="Modifier"
                @click="openEditCareerOpportunityModal(opportunity)"
              >
                <font-awesome-icon icon="fa-solid fa-pen" class="h-3 w-3" />
              </button>
              <button
                type="button"
                class="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-red-600 dark:hover:bg-gray-600 dark:hover:text-red-400"
                title="Supprimer"
                @click="openDeleteCareerOpportunityModal(opportunity)"
              >
                <font-awesome-icon icon="fa-solid fa-trash" class="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Partenaires -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <font-awesome-icon icon="fa-solid fa-handshake" class="h-5 w-5 text-brand-blue-500" />
            Partenaires
            <span class="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-sm font-normal text-gray-600 dark:bg-gray-700 dark:text-gray-400">
              {{ programPartners.length }}
            </span>
          </h2>
        </div>

        <!-- Sélecteur d'ajout -->
        <div class="mb-4 flex gap-2">
          <div class="relative flex-1">
            <input
              v-model="partnerSearchQuery"
              type="text"
              placeholder="Rechercher un partenaire..."
              class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-blue-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              @focus="selectedPartnerId = ''"
            />
            <!-- Dropdown résultats -->
            <div
              v-if="partnerSearchQuery && availablePartners.length > 0"
              class="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700"
            >
              <button
                v-for="partner in availablePartners"
                :key="partner.id"
                type="button"
                class="flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                @click="selectedPartnerId = partner.id; partnerSearchQuery = partner.name"
              >
                <img
                  v-if="partner.logo_external_id"
                  :src="`/api/public/media/${partner.logo_external_id}/download`"
                  :alt="partner.name"
                  class="h-6 w-6 rounded object-contain"
                />
                <font-awesome-icon v-else icon="fa-solid fa-building" class="h-4 w-4 text-gray-400" />
                <span class="text-gray-900 dark:text-white">{{ partner.name }}</span>
                <span v-if="!partner.active" class="ml-auto rounded bg-yellow-100 px-1.5 py-0.5 text-xs text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                  Inactif
                </span>
              </button>
            </div>
            <div
              v-if="partnerSearchQuery && availablePartners.length === 0"
              class="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white p-3 text-center text-sm text-gray-500 shadow-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400"
            >
              Aucun partenaire trouvé
            </div>
          </div>
          <button
            type="button"
            :disabled="!selectedPartnerId"
            class="inline-flex items-center gap-2 rounded-lg bg-brand-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-blue-700 disabled:opacity-50"
            @click="handleAddPartner"
          >
            <font-awesome-icon icon="fa-solid fa-plus" class="h-3 w-3" />
            Ajouter
          </button>
        </div>

        <!-- Chargement -->
        <div v-if="loadingPartners" class="flex items-center justify-center py-8">
          <font-awesome-icon icon="fa-solid fa-spinner" class="h-6 w-6 animate-spin text-gray-400" />
        </div>

        <!-- Liste vide -->
        <div v-else-if="programPartners.length === 0" class="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center dark:border-gray-700">
          <font-awesome-icon icon="fa-solid fa-handshake" class="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Aucun partenaire associé à cette formation.
          </p>
        </div>

        <!-- Liste des partenaires -->
        <div v-else class="space-y-2">
          <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">
            <font-awesome-icon icon="fa-solid fa-grip-vertical" class="mr-1 h-3 w-3" />
            Glissez-déposez pour définir l'ordre d'affichage sur la page publique
          </p>

          <div
            v-for="(partner, index) in associatedPartnersDetails"
            :key="partner.partner_external_id"
            class="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 transition-all dark:border-gray-700 dark:bg-gray-700/50"
            :class="{ 'opacity-50': draggedPartnerIndex === index }"
            draggable="true"
            @dragstart="onPartnerDragStart(index)"
            @dragover="onPartnerDragOver"
            @drop="(e) => onPartnerDrop(e, index)"
            @dragend="onPartnerDragEnd"
          >
            <!-- Poignée -->
            <div class="cursor-grab text-gray-400 active:cursor-grabbing">
              <font-awesome-icon icon="fa-solid fa-grip-vertical" class="h-4 w-4" />
            </div>

            <!-- Numéro -->
            <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              {{ index + 1 }}
            </div>

            <!-- Logo -->
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-white dark:bg-gray-600">
              <img
                v-if="partner.logo_external_id"
                :src="`/api/public/media/${partner.logo_external_id}/download`"
                :alt="partner.name"
                class="h-8 w-8 object-contain"
              />
              <font-awesome-icon v-else icon="fa-solid fa-building" class="h-5 w-5 text-gray-400" />
            </div>

            <!-- Infos -->
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ partner.name }}</p>
              <p v-if="partner.partnership_type" class="text-xs text-gray-500 dark:text-gray-400">
                {{ partner.partnership_type }}
              </p>
            </div>

            <!-- Badge inactif -->
            <span v-if="!partner.active" class="rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
              Inactif
            </span>

            <!-- Supprimer -->
            <button
              type="button"
              class="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-red-600 dark:hover:bg-gray-600 dark:hover:text-red-400"
              title="Retirer ce partenaire"
              @click="handleRemovePartner(partner.partner_external_id)"
            >
              <font-awesome-icon icon="fa-solid fa-trash" class="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      <!-- Boutons -->
      <div class="flex items-center justify-between rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          <span v-if="hasChanges" class="text-yellow-600 dark:text-yellow-400">
            <font-awesome-icon icon="fa-solid fa-circle" class="mr-1 w-2 h-2" />
            Modifications non enregistrées
          </span>
          <span v-else class="text-green-600 dark:text-green-400">
            <font-awesome-icon icon="fa-solid fa-check" class="mr-1 w-3 h-3" />
            Aucune modification
          </span>
        </p>
        <div class="flex gap-3">
          <button
            type="button"
            class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            @click="handleCancel"
          >
            Annuler
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            <font-awesome-icon v-if="isSubmitting" icon="fa-solid fa-spinner" class="w-4 h-4 animate-spin" />
            <font-awesome-icon v-else icon="fa-solid fa-save" class="w-4 h-4" />
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </form>

    <!-- Modal de confirmation d'annulation -->
    <Teleport to="body">
      <div
        v-if="showDiscardModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="showDiscardModal = false"
      >
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
              <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Modifications non enregistrées
            </h3>
          </div>

          <p class="mb-6 text-gray-600 dark:text-gray-300">
            Vous avez des modifications non enregistrées. Voulez-vous vraiment quitter sans enregistrer ?
          </p>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="showDiscardModal = false"
            >
              Continuer l'édition
            </button>
            <button
              type="button"
              class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              @click="confirmDiscard"
            >
              Quitter sans enregistrer
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Ajouter compétence -->
    <Teleport to="body">
      <div
        v-if="showAddSkillModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeAddSkillModal"
      >
        <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Ajouter une compétence
            </h3>
            <button
              class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              @click="closeAddSkillModal"
            >
              <font-awesome-icon icon="fa-solid fa-xmark" class="h-4 w-4" />
            </button>
          </div>

          <form @submit.prevent="addSkill">
            <div class="mb-4">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Titre de la compétence *
              </label>
              <input
                v-model="newSkill.title"
                type="text"
                required
                placeholder="Ex: Maîtriser les outils de gestion de projet"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="mb-6">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description (optionnel)
              </label>
              <textarea
                v-model="newSkill.description"
                rows="3"
                placeholder="Détail de la compétence..."
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="flex justify-end gap-3">
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                :disabled="isSubmittingSkill"
                @click="closeAddSkillModal"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
                :disabled="isSubmittingSkill"
              >
                <font-awesome-icon v-if="isSubmittingSkill" icon="fa-solid fa-spinner" class="mr-2 h-4 w-4 animate-spin" />
                {{ isSubmittingSkill ? 'Ajout...' : 'Ajouter' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal Modifier compétence -->
    <Teleport to="body">
      <div
        v-if="showEditSkillModal && editingSkill"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeEditSkillModal"
      >
        <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Modifier la compétence
            </h3>
            <button
              class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              @click="closeEditSkillModal"
            >
              <font-awesome-icon icon="fa-solid fa-xmark" class="h-4 w-4" />
            </button>
          </div>

          <form @submit.prevent="updateSkillHandler">
            <div class="mb-4">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Titre de la compétence *
              </label>
              <input
                v-model="editingSkill.title"
                type="text"
                required
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="mb-6">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description (optionnel)
              </label>
              <textarea
                v-model="editingSkill.description"
                rows="3"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="flex justify-end gap-3">
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                :disabled="isSubmittingSkill"
                @click="closeEditSkillModal"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
                :disabled="isSubmittingSkill"
              >
                <font-awesome-icon v-if="isSubmittingSkill" icon="fa-solid fa-spinner" class="mr-2 h-4 w-4 animate-spin" />
                {{ isSubmittingSkill ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal Supprimer compétence -->
    <Teleport to="body">
      <div
        v-if="showDeleteSkillModal && deletingSkill"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeDeleteSkillModal"
      >
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Supprimer la compétence
            </h3>
          </div>

          <p class="mb-3 text-gray-600 dark:text-gray-300">
            Êtes-vous sûr de vouloir supprimer cette compétence ?
          </p>
          <p class="mb-3 rounded-lg bg-gray-100 p-3 text-sm font-medium text-gray-900 dark:bg-gray-700 dark:text-white">
            {{ deletingSkill.title }}
          </p>

          <div class="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
            <div class="flex items-start gap-2">
              <font-awesome-icon icon="fa-solid fa-info-circle" class="mt-0.5 h-4 w-4 text-amber-600 dark:text-amber-400" />
              <div class="text-sm text-amber-800 dark:text-amber-300">
                <p class="font-medium">Cette compétence n'est actuellement utilisée nulle part.</p>
                <p class="mt-1 text-amber-700 dark:text-amber-400">
                  Cette action est irréversible.
                </p>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              :disabled="isSubmittingSkill"
              @click="closeDeleteSkillModal"
            >
              Annuler
            </button>
            <button
              type="button"
              class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              :disabled="isSubmittingSkill"
              @click="deleteSkillHandler"
            >
              <font-awesome-icon v-if="isSubmittingSkill" icon="fa-solid fa-spinner" class="mr-2 h-4 w-4 animate-spin" />
              {{ isSubmittingSkill ? 'Suppression...' : 'Supprimer' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Ajouter débouché -->
    <Teleport to="body">
      <div
        v-if="showAddCareerOpportunityModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeAddCareerOpportunityModal"
      >
        <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Ajouter un débouché
            </h3>
            <button
              class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              @click="closeAddCareerOpportunityModal"
            >
              <font-awesome-icon icon="fa-solid fa-xmark" class="h-4 w-4" />
            </button>
          </div>

          <form @submit.prevent="addCareerOpportunity">
            <div class="mb-4">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Titre du débouché *
              </label>
              <input
                v-model="newCareerOpportunity.title"
                type="text"
                required
                placeholder="Ex: Chef de projet en développement durable"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="mb-6">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description (optionnel)
              </label>
              <textarea
                v-model="newCareerOpportunity.description"
                rows="3"
                placeholder="Détail du débouché..."
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="flex justify-end gap-3">
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                :disabled="isSubmittingCareerOpportunity"
                @click="closeAddCareerOpportunityModal"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                :disabled="isSubmittingCareerOpportunity"
              >
                <font-awesome-icon v-if="isSubmittingCareerOpportunity" icon="fa-solid fa-spinner" class="mr-2 h-4 w-4 animate-spin" />
                {{ isSubmittingCareerOpportunity ? 'Ajout...' : 'Ajouter' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal Modifier débouché -->
    <Teleport to="body">
      <div
        v-if="showEditCareerOpportunityModal && editingCareerOpportunity"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeEditCareerOpportunityModal"
      >
        <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Modifier le débouché
            </h3>
            <button
              class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              @click="closeEditCareerOpportunityModal"
            >
              <font-awesome-icon icon="fa-solid fa-xmark" class="h-4 w-4" />
            </button>
          </div>

          <form @submit.prevent="updateCareerOpportunityHandler">
            <div class="mb-4">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Titre du débouché *
              </label>
              <input
                v-model="editingCareerOpportunity.title"
                type="text"
                required
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="mb-6">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description (optionnel)
              </label>
              <textarea
                v-model="editingCareerOpportunity.description"
                rows="3"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="flex justify-end gap-3">
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                :disabled="isSubmittingCareerOpportunity"
                @click="closeEditCareerOpportunityModal"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                :disabled="isSubmittingCareerOpportunity"
              >
                <font-awesome-icon v-if="isSubmittingCareerOpportunity" icon="fa-solid fa-spinner" class="mr-2 h-4 w-4 animate-spin" />
                {{ isSubmittingCareerOpportunity ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal Supprimer débouché -->
    <Teleport to="body">
      <div
        v-if="showDeleteCareerOpportunityModal && deletingCareerOpportunity"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeDeleteCareerOpportunityModal"
      >
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Supprimer le débouché
            </h3>
          </div>

          <p class="mb-3 text-gray-600 dark:text-gray-300">
            Êtes-vous sûr de vouloir supprimer ce débouché ?
          </p>
          <p class="mb-3 rounded-lg bg-gray-100 p-3 text-sm font-medium text-gray-900 dark:bg-gray-700 dark:text-white">
            {{ deletingCareerOpportunity.title }}
          </p>

          <div class="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
            <div class="flex items-start gap-2">
              <font-awesome-icon icon="fa-solid fa-info-circle" class="mt-0.5 h-4 w-4 text-amber-600 dark:text-amber-400" />
              <div class="text-sm text-amber-800 dark:text-amber-300">
                <p class="mt-1 text-amber-700 dark:text-amber-400">
                  Cette action est irréversible.
                </p>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              :disabled="isSubmittingCareerOpportunity"
              @click="closeDeleteCareerOpportunityModal"
            >
              Annuler
            </button>
            <button
              type="button"
              class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              :disabled="isSubmittingCareerOpportunity"
              @click="deleteCareerOpportunityHandler"
            >
              <font-awesome-icon v-if="isSubmittingCareerOpportunity" icon="fa-solid fa-spinner" class="mr-2 h-4 w-4 animate-spin" />
              {{ isSubmittingCareerOpportunity ? 'Suppression...' : 'Supprimer' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Éditeur d'image -->
    <Teleport to="body">
      <div
        v-if="showCoverEditor && pendingCoverFile"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      >
        <MediaImageEditor
          :image-file="pendingCoverFile"
          :aspect-ratio="16/9"
          @save="saveEditedCover"
          @cancel="cancelCoverEditor"
        />
      </div>
    </Teleport>
  </div>

  <!-- État non trouvé -->
  <div v-else class="flex flex-col items-center justify-center py-12">
    <div class="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-700">
      <font-awesome-icon icon="fa-solid fa-graduation-cap" class="w-8 h-8 text-gray-400" />
    </div>
    <h3 class="mb-2 font-medium text-gray-900 dark:text-white">
      Programme non trouvé
    </h3>
    <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">
      Ce programme n'existe pas ou a été supprimé.
    </p>
    <NuxtLink
      to="/admin/formations/programmes"
      class="text-sm text-blue-600 hover:underline dark:text-blue-400"
    >
      Retour à la liste des programmes
    </NuxtLink>
  </div>
</template>
