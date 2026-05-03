/**
 * Composable API — FAQ Publique
 * ==============================
 *
 * Récupère l'arborescence FAQ depuis l'endpoint public.
 * Spec : specs/019-faq-backoffice/contracts/public-faq-api.md
 */

import type { FaqTreePublic } from '~/types/api/faq'

export function usePublicFaqApi() {
  const apiBase = useApiBase()

  async function getTree(): Promise<FaqTreePublic> {
    return await $fetch<FaqTreePublic>(`${apiBase}/api/public/faq`)
  }

  return { getTree }
}
