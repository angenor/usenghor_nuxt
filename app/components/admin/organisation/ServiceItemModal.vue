<script setup lang="ts">
/**
 * Coque de modale accessible partagée par les sections « Objectifs »,
 * « Réalisations » et « Projets » d'un service (formulaires et confirmations).
 *
 * - `role="dialog"` (ou `alertdialog`), `aria-modal`, titre relié par `aria-labelledby` ;
 * - focus initial sur `[data-autofocus]` (sinon premier élément focalisable),
 *   restitué à l'élément d'origine à la fermeture ;
 * - Échap et Tab gérés sur le panneau lui-même : les surcouches ouvertes par-dessus
 *   (éditeur riche plein écran d'`AdminRichTextEditor`, recadrage d'image) gardent la main.
 */
const props = withDefaults(defineProps<{
  open: boolean
  title: string
  description?: string
  /** Largeur maximale du panneau */
  size?: 'sm' | 'md' | 'lg'
  role?: 'dialog' | 'alertdialog'
  /** Enveloppe le contenu dans un <form> et émet `submit` */
  asForm?: boolean
  /** Opération en cours : la fermeture est bloquée */
  busy?: boolean
  /** Fermeture au clic sur le fond (désactivée par défaut pour ne pas perdre une saisie) */
  closeOnBackdrop?: boolean
}>(), {
  description: '',
  size: 'lg',
  role: 'dialog',
  asForm: false,
  busy: false,
  closeOnBackdrop: false,
})

const emit = defineEmits<{
  close: []
  submit: []
}>()

const uid = useId()
const titleId = `service-item-modal-title-${uid}`
const descriptionId = `service-item-modal-desc-${uid}`

const panelRef = ref<HTMLElement | null>(null)
let previouslyFocused: HTMLElement | null = null

const sizeClass = computed(() => ({
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-2xl',
}[props.size]))

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function focusables(): HTMLElement[] {
  if (!panelRef.value) return []
  return Array.from(panelRef.value.querySelectorAll<HTMLElement>(FOCUSABLE))
    .filter(el => el.offsetParent !== null || el === document.activeElement)
}

/**
 * Une surcouche est-elle ouverte au-dessus de la modale ?
 * - éditeur riche plein écran d'`AdminRichTextEditor` (`fixed inset-0 z-[9999]` ;
 *   le bandeau de mise à jour, `fixed top-0 z-[9999]`, n'est pas concerné) ;
 * - recadrage d'image (`[data-service-item-overlay]`).
 */
function hasOverlayAbove(): boolean {
  return !!document.querySelector('.fixed.inset-0.z-\\[9999\\], [data-service-item-overlay]')
}

function requestClose() {
  if (props.busy) return
  emit('close')
}

function onBackdrop() {
  if (props.closeOnBackdrop) requestClose()
}

function onKeydown(event: KeyboardEvent) {
  if (hasOverlayAbove()) return
  if (event.key === 'Escape') {
    event.stopPropagation()
    requestClose()
    return
  }
  if (event.key !== 'Tab') return
  const items = focusables()
  if (!items.length) {
    event.preventDefault()
    panelRef.value?.focus()
    return
  }
  const first = items[0]!
  const last = items[items.length - 1]!
  if (event.shiftKey && (document.activeElement === first || document.activeElement === panelRef.value)) {
    event.preventDefault()
    last.focus()
  }
  else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(
  () => props.open,
  async (open) => {
    if (!import.meta.client) return
    if (open) {
      previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
      await nextTick()
      const target = panelRef.value?.querySelector<HTMLElement>('[data-autofocus]') ?? focusables()[0] ?? panelRef.value
      target?.focus()
    }
    else {
      const el = previouslyFocused
      previouslyFocused = null
      if (el && document.body.contains(el)) {
        await nextTick()
        el.focus()
      }
    }
  },
  { immediate: true },
)
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="fixed inset-0 bg-gray-900/60 dark:bg-black/70" aria-hidden="true" />
        <div
          class="relative flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4"
          @click.self="onBackdrop"
        >
          <div
            ref="panelRef"
            :role="role"
            aria-modal="true"
            :aria-labelledby="titleId"
            :aria-describedby="description ? descriptionId : undefined"
            :aria-busy="busy || undefined"
            tabindex="-1"
            class="relative flex max-h-[100dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl ring-1 ring-black/5 focus:outline-none sm:max-h-[calc(100dvh-2rem)] sm:rounded-2xl dark:bg-gray-800 dark:ring-white/10"
            :class="sizeClass"
            @keydown="onKeydown"
          >
            <component
              :is="asForm ? 'form' : 'div'"
              class="flex min-h-0 flex-1 flex-col"
              :novalidate="asForm || undefined"
              @submit.prevent="emit('submit')"
            >
              <!-- En-tête -->
              <div class="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4 dark:border-gray-700">
                <div class="min-w-0">
                  <h2 :id="titleId" class="text-lg font-semibold text-gray-900 dark:text-white">
                    {{ title }}
                  </h2>
                  <p v-if="description" :id="descriptionId" class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                    {{ description }}
                  </p>
                </div>
                <button
                  type="button"
                  class="-m-1 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-500 disabled:opacity-50 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                  aria-label="Fermer"
                  :disabled="busy"
                  @click="requestClose"
                >
                  <font-awesome-icon :icon="['fas', 'xmark']" class="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <!-- Contenu -->
              <div class="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                <slot />
              </div>

              <!-- Pied -->
              <div
                v-if="$slots.footer"
                class="flex flex-col-reverse gap-2 border-t border-gray-200 bg-gray-50 px-5 py-3 sm:flex-row sm:items-center sm:justify-end sm:gap-3 dark:border-gray-700 dark:bg-gray-800/80"
              >
                <slot name="footer" />
              </div>
            </component>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
