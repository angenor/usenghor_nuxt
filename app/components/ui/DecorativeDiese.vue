<script setup lang="ts">
interface Props {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  opacity?: number
  /** 'dark' = fond toujours sombre → screen blend (couleurs rayonnent)
   *  'light' = fond toujours clair → multiply blend (blanc transparent)
   *  'auto' = suit le thème de l'utilisateur (défaut) */
  bg?: 'dark' | 'light' | 'auto'
}

const props = withDefaults(defineProps<Props>(), {
  position: 'bottom-right',
  size: 'lg',
  opacity: 0.15,
  bg: 'auto',
})

const { isDark } = useDarkMode()

const onDarkBg = computed(() =>
  props.bg === 'dark' || (props.bg === 'auto' && isDark.value),
)

// screen  : couleurs s'ajoutent au fond sombre → effet lumineux
// multiply: blanc devient transparent, couleurs s'imprègnent sur fond clair
const blendMode = computed(() =>
  onDarkBg.value ? 'screen' : 'multiply',
)

const positionClasses: Record<string, string> = {
  'top-right': 'absolute -top-8 -right-8',
  'top-left': 'absolute -top-8 -left-8',
  'bottom-right': 'absolute -bottom-8 -right-8',
  'bottom-left': 'absolute -bottom-8 -left-8',
}

const sizeClasses: Record<string, string> = {
  sm: 'w-32 h-32',
  md: 'w-48 h-48',
  lg: 'w-64 h-64',
  xl: 'w-80 h-80',
  '2xl': 'w-96 h-96',
  '3xl': 'w-[480px] h-[480px]',
}
</script>

<template>
  <div
    :class="[positionClasses[position], sizeClasses[size], 'pointer-events-none print:hidden']"
  >
    <img
      src="/images/logos/Dieese_couleur.png"
      alt=""
      role="presentation"
      aria-hidden="true"
      :style="{
        opacity: props.opacity,
        mixBlendMode: blendMode,
      }"
      class="w-full h-full object-contain select-none"
    >
  </div>
</template>
