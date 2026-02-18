import type { Ref } from 'vue'
import type { ApplicationCallPublicWithDetails, CallType } from '~/types/api'

export function useCallDetail(call: Ref<ApplicationCallPublicWithDetails | null>) {
  const { t, locale } = useI18n()
  const localePath = useLocalePath()

  // Mapping des types API vers les clés i18n
  const typeToI18nKey: Record<CallType, string> = {
    application: 'candidature',
    scholarship: 'bourse',
    project: 'projet',
    recruitment: 'recrutement',
    training: 'formation',
  }

  // Type badge colors
  const typeBadgeColors: Record<CallType, string> = {
    application: 'bg-brand-blue-600',
    scholarship: 'bg-purple-600',
    project: 'bg-green-600',
    recruitment: 'bg-orange-600',
    training: 'bg-cyan-600',
  }

  // Format date
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString(
      locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
      { day: 'numeric', month: 'long', year: 'numeric' }
    )
  }

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString(
      locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
      { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    )
  }

  const formatShortDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString(
      locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
      { day: 'numeric', month: 'short' }
    )
  }

  // Check if deadline has passed
  const isDeadlinePassed = computed(() => {
    if (!call.value?.deadline) return false
    return new Date(call.value.deadline) < new Date()
  })

  // Days until deadline
  const daysUntilDeadline = computed(() => {
    if (!call.value?.deadline) return 0
    const deadline = new Date(call.value.deadline)
    const now = new Date()
    const diffTime = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  })

  // Get type label for i18n
  const getTypeLabel = (type: CallType) => {
    const key = typeToI18nKey[type]
    return t(`actualites.calls.filters.${key}`)
  }

  // Get call image from media service or fallback to placeholder
  const getCallImage = (callData: ApplicationCallPublicWithDetails) => {
    if (callData.cover_image_external_id) {
      return `/api/public/media/${callData.cover_image_external_id}/download?variant=medium`
    }
    return null
  }

  const getHeroImage = (callData: ApplicationCallPublicWithDetails) => {
    if (callData.cover_image_external_id) {
      return `/api/public/media/${callData.cover_image_external_id}/download`
    }
    return null
  }

  return {
    t,
    locale,
    localePath,
    typeToI18nKey,
    typeBadgeColors,
    formatDate,
    formatDateTime,
    formatShortDate,
    isDeadlinePassed,
    daysUntilDeadline,
    getTypeLabel,
    getCallImage,
    getHeroImage,
  }
}
