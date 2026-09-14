/**
 * Composable API — FAQ Publique
 * ==============================
 *
 * Récupère l'arborescence FAQ depuis l'endpoint public.
 * Spec : specs/019-faq-backoffice/contracts/public-faq-api.md
 * Filtre `categoryPrefix` (ex. `see-`) : specs/025-pei-see-status-page/contracts/public-api.md
 */

import type { FaqTreePublic } from '~/types/api/faq'

export function usePublicFaqApi() {
  const apiBase = useApiBase()

  async function getTree(options: { categoryPrefix?: string } = {}): Promise<FaqTreePublic> {
    return await $fetch<FaqTreePublic>(`${apiBase}/api/public/faq`, {
      query: options.categoryPrefix ? { category_prefix: options.categoryPrefix } : undefined,
    })
  }

  return { getTree }
}
