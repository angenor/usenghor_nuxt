<script setup lang="ts">
const props = defineProps<{
  title: string
  slug?: string
  items: Array<{
    icon: string
    title: string
    description: string
  }>
}>()

const isListarStyle = computed(() => props.slug === 'engagement-examples')
const isProductCardStyle = computed(() => props.slug === 'contribution-benefits')

// Mapping Heroicons → Font Awesome pour les icônes stockées en base
const iconMap: Record<string, string> = {
  'currency-euro': 'fa-solid fa-euro-sign',
  'currency-dollar': 'fa-solid fa-dollar-sign',
  'users': 'fa-solid fa-users',
  'briefcase': 'fa-solid fa-briefcase',
  'academic-cap': 'fa-solid fa-graduation-cap',
  'building-library': 'fa-solid fa-building-columns',
  'globe-alt': 'fa-solid fa-globe',
  'heart': 'fa-solid fa-heart',
  'hand-raised': 'fa-solid fa-hand',
  'light-bulb': 'fa-solid fa-lightbulb',
  'star': 'fa-solid fa-star',
  'shield-check': 'fa-solid fa-shield-halved',
  'document-text': 'fa-solid fa-file-lines',
  'chart-bar': 'fa-solid fa-chart-column',
}

// Couleurs d'accent par carte (pricing-card style)
const cardColors = ['purple', 'red', 'green', 'blue'] as const

const activeCard = ref(0)

function onCardHover(index: number) {
  activeCard.value = index
}

function resolveIcon(icon: string): string {
  if (icon.startsWith('fa-')) return icon
  return iconMap[icon] || `fa-solid fa-${icon}`
}
</script>

<template>
  <section class="py-16 lg:py-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Section title -->
      <h2
        class="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white md:text-4xl rtl:text-right"
        :class="{ 'mb-20 lg:mb-24': isListarStyle }"
      >
        <span class="relative inline-block">
          {{ title }}
          <span class="absolute -bottom-2 left-0 h-1 w-1/3 rounded-full bg-gradient-to-r from-brand-blue-500 to-brand-blue-300" />
        </span>
      </h2>

      <!-- Listar style cards (engagement-examples) -->
      <div v-if="isListarStyle" class="listar-feature-items">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="listar-feature-item-wrapper"
        >
          <div class="listar-feature-item">
            <div class="listar-feature-item-inner">
              <div class="listar-feature-right-border" />

              <div class="listar-feature-block-content">
                <!-- Circular icon -->
                <div class="listar-feature-icon-wrapper">
                  <div class="listar-feature-icon-inner">
                    <div class="listar-icon-content">
                      <font-awesome-icon :icon="resolveIcon(item.icon)" class="listar-icon" />
                    </div>
                  </div>
                </div>

                <!-- Title with number -->
                <div class="listar-feature-content">
                  <div class="listar-feature-title">
                    <span class="listar-title-label">
                      <span class="listar-title-number">{{ String(index + 1).padStart(2, '0') }}</span>
                      {{ item.title }}
                    </span>
                  </div>

                  <!-- Description -->
                  <div class="listar-feature-excerpt">
                    {{ item.description }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Bottom circle with ripple -->
            <div class="listar-bottom-circle" />
          </div>
        </div>
      </div>

      <!-- Pricing-card style (contribution-benefits) -->
      <div v-else-if="isProductCardStyle" class="pricing-cards">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="pricing-card"
          :class="[
            `pricing-card--${cardColors[index % cardColors.length]}`,
            { active: activeCard === index },
          ]"
          @mouseover="onCardHover(index)"
        >
          <div class="pricing-card__outer">
            <div class="pricing-card__inner">
              <span class="pricing-card__icon">
                <font-awesome-icon :icon="resolveIcon(item.icon)" />
              </span>
              <p class="pricing-card__title">{{ item.title }}</p>
              <p class="pricing-card__desc">{{ item.description }}</p>
            </div>
            <span class="pricing-card__number">
              {{ String(index + 1).padStart(2, '0') }}
            </span>
          </div>
        </div>
      </div>

      <!-- Default style cards -->
      <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="group rounded-xl border border-gray-100 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 lg:p-8"
        >
          <!-- Icon -->
          <div class="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-blue-50 text-brand-blue-600 transition-transform duration-300 group-hover:scale-110 dark:bg-brand-blue-900/30 dark:text-brand-blue-400">
            <font-awesome-icon :icon="resolveIcon(item.icon)" class="h-6 w-6" />
          </div>

          <!-- Title -->
          <h3 class="mb-3 text-lg font-bold text-gray-900 dark:text-white rtl:text-right">
            {{ item.title }}
          </h3>

          <!-- Description -->
          <p class="text-sm leading-relaxed text-gray-600 dark:text-gray-400 rtl:text-right">
            {{ item.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ============================================================
   Pricing Card Style (contribution-benefits)
   ============================================================ */
.pricing-cards {
  margin-top: 2em;
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.pricing-card {
  width: 17.5rem;
  cursor: pointer;
}

.pricing-card__outer {
  background: #ebecee;
  position: relative;
  height: 23.438rem;
  border-radius: 0.625rem;
  display: flex;
  align-items: flex-end;
  padding: 1.25rem;
  transition: 0.3s ease-in-out;
}

:root.dark .pricing-card__outer {
  background: #374151;
}

.pricing-card__inner {
  background: #fff;
  position: absolute;
  bottom: 3.75rem;
  right: 1.25rem;
  width: 100%;
  height: 90%;
  border-radius: 0.625rem;
  padding: 1.875rem 2.188rem;
  display: flex;
  flex-direction: column;
}

:root.dark .pricing-card__inner {
  background: #1f2937;
}

.pricing-card__icon {
  display: flex;
  align-items: flex-start;
}

.pricing-card__icon svg,
.pricing-card__icon .svg-inline--fa {
  width: 2.188rem;
  height: 2.188rem;
  margin-left: -0.188em;
}

.pricing-card__title {
  text-transform: capitalize;
  font-weight: bold;
  font-size: 1.1rem;
  display: inline-block;
  margin-top: 0.5em;
  margin-bottom: 0.75em;
  line-height: 1.3;
}

:root.dark .pricing-card__title {
  color: #f3f4f6;
}

.pricing-card__desc {
  font-size: 0.875rem;
  line-height: 1.7;
  color: #666;
  margin: 0;
  flex: 1;
}

:root.dark .pricing-card__desc {
  color: #9ca3af;
}

.pricing-card__number {
  font-size: 3rem;
  font-weight: 600;
  display: inline-flex;
  align-items: flex-end;
  position: relative;
  z-index: 1;
  transition: color 0.3s ease-in-out;
}

/* ── Couleurs par variante ── */
.pricing-card--purple .pricing-card__icon,
.pricing-card--purple .pricing-card__title,
.pricing-card--purple .pricing-card__number {
  color: #1e5a96;
}

.pricing-card--red .pricing-card__icon,
.pricing-card--red .pricing-card__title,
.pricing-card--red .pricing-card__number {
  color: #c34a36;
}

.pricing-card--red .pricing-card__outer {
  height: 25.313rem;
}

.pricing-card--green .pricing-card__icon,
.pricing-card--green .pricing-card__title,
.pricing-card--green .pricing-card__number {
  color: #4ccda7;
}

.pricing-card--blue .pricing-card__icon,
.pricing-card--blue .pricing-card__title,
.pricing-card--blue .pricing-card__number {
  color: #008bc9;
}

/* ── État actif (hover) ── */
.pricing-card.active .pricing-card__number {
  color: #fff;
}

.pricing-card--purple.active .pricing-card__outer {
  background: #1e5a96;
  box-shadow: 5px 18px 13px rgba(30, 90, 150, 0.43);
}

.pricing-card--red.active .pricing-card__outer {
  background: #c34a36;
  box-shadow: 5px 18px 13px rgba(195, 74, 54, 0.43);
}

.pricing-card--green.active .pricing-card__outer {
  background: #4ccda7;
  box-shadow: 5px 18px 13px rgba(76, 205, 167, 0.43);
}

.pricing-card--blue.active .pricing-card__outer {
  background: #008bc9;
  box-shadow: 5px 18px 13px rgba(0, 139, 201, 0.43);
}

:root.dark .pricing-card.active .pricing-card__outer {
  box-shadow: 5px 18px 20px rgba(0, 0, 0, 0.4);
}

/* ============================================================
   Listar Feature Card Styles (engagement-examples)
   ============================================================ */
.listar-feature-items {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  text-align: center;
}

.listar-feature-item-wrapper {
  width: 100%;
  max-width: 400px;
  margin-bottom: 80px;
  padding-left: 27px;
  padding-right: 27px;
}

@media (min-width: 640px) {
  .listar-feature-item-wrapper {
    width: 50%;
  }
}

@media (min-width: 1024px) {
  .listar-feature-item-wrapper {
    width: 33.333%;
    max-width: none;
  }
}

.listar-feature-item {
  position: relative;
  height: calc(100% - 20px);
}

.listar-feature-item-inner {
  padding: 60px 30px;
  border-radius: 6px;
  z-index: 5;
  position: relative;
  height: 100%;
}

.listar-feature-item-inner::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
  box-shadow: 120px 0px 150px rgba(80, 80, 80, 0.15),
    10px 0px 10px rgba(80, 80, 80, 0.02);
  border-radius: 1000px;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0) 40%,
    rgba(255, 255, 255, 1) 100%
  );
}

:root.dark .listar-feature-item-inner::before {
  box-shadow: 120px 0px 150px rgba(0, 0, 0, 0.3),
    10px 0px 10px rgba(0, 0, 0, 0.1);
  background: linear-gradient(
    to right,
    rgba(31, 41, 55, 0) 0%,
    rgba(31, 41, 55, 0) 40%,
    rgba(31, 41, 55, 1) 100%
  );
}

/* Right border arc */
.listar-feature-right-border {
  position: absolute;
  width: calc(100% + 24px);
  height: calc(100% + 24px);
  top: -12px;
  left: 50%;
  overflow: hidden;
}

.listar-feature-right-border::before {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: -50%;
  border: 11px solid #1e5a96;
  border-radius: 800px;
}

:root.dark .listar-feature-right-border::before {
  border-color: #3b82f6;
}

/* Content wrapper */
.listar-feature-block-content {
  position: relative;
  display: block;
  margin: -30px;
  padding: 30px;
  height: calc(100% + 60px);
}

/* Icon wrapper - circular, floating above card */
.listar-feature-icon-wrapper {
  width: 148px;
  height: 148px;
  line-height: 148px;
  border-radius: 500px;
  position: relative;
  background-color: #fff;
  box-shadow: 8px 8px 30px rgba(0, 0, 0, 0.06);
  left: 50%;
  margin-left: -74px;
  top: -66px;
  margin-top: -74px;
}

:root.dark .listar-feature-icon-wrapper {
  background-color: #1f2937;
  box-shadow: 8px 8px 30px rgba(0, 0, 0, 0.2);
}

.listar-feature-icon-inner {
  width: 120px;
  height: 120px;
  line-height: 120px;
  border-radius: 500px;
  position: relative;
  display: inline-block;
  vertical-align: middle;
  box-shadow: 10px 10px 20px rgba(0, 0, 0, 0.14);
  background: #fff;
}

:root.dark .listar-feature-icon-inner {
  background: #374151;
  box-shadow: 10px 10px 20px rgba(0, 0, 0, 0.3);
}

.listar-icon-content {
  display: inline-block;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}

.listar-icon {
  font-size: 40px;
  color: #1e5a96;
  vertical-align: middle;
}

:root.dark .listar-icon {
  color: #60a5fa;
}

/* Title with number badge */
.listar-feature-content {
  position: relative;
  margin-top: -15px;
}

.listar-feature-title {
  margin: 0 0 30px;
  text-align: center;
  line-height: 1.5;
}

.listar-title-label {
  box-shadow: 15px 20px 30px rgba(80, 80, 80, 0.12),
    5px 0px 40px rgba(80, 80, 80, 0.1);
  padding: 10px 20px;
  display: inline-block;
  position: relative;
  background-color: #fff;
  border-radius: 0 50px 50px 0;
  margin-left: 25px;
  font-size: 18px;
  font-weight: 400;
  color: #252525;
}

:root.dark .listar-title-label {
  background-color: #374151;
  color: #e5e7eb;
  box-shadow: 15px 20px 30px rgba(0, 0, 0, 0.2),
    5px 0px 40px rgba(0, 0, 0, 0.15);
}

.listar-title-number {
  box-shadow: 15px 15px 30px rgba(80, 80, 80, 0.2),
    5px 0px 80px rgba(80, 80, 80, 0.15);
  padding: 10px 0;
  display: inline-block;
  width: 50px;
  height: 50px;
  line-height: 30px;
  white-space: nowrap;
  position: absolute;
  top: -3px;
  left: -40px;
  border-radius: 50px;
  background-color: #fff;
  font-size: 18px;
  color: #252525;
}

:root.dark .listar-title-number {
  background-color: #1f2937;
  color: #e5e7eb;
  box-shadow: 15px 15px 30px rgba(0, 0, 0, 0.3),
    5px 0px 80px rgba(0, 0, 0, 0.2);
}

/* Excerpt */
.listar-feature-excerpt {
  padding: 0 20px;
  color: #252525;
  text-align: center;
  position: relative;
  width: 100%;
  margin: 0 auto;
  line-height: 1.8;
  font-size: 14px;
  letter-spacing: 0.025em;
}

:root.dark .listar-feature-excerpt {
  color: #d1d5db;
}

/* Bottom circle with ripple */
.listar-bottom-circle {
  position: relative;
  display: block;
  width: 50px;
  height: 50px;
  margin: 0 auto;
  margin-top: -5px;
  border-radius: 50px;
  background-color: #fff;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23555' stroke-width='2'%3E%3Cpath d='M12 5v14M5 12h14'/%3E%3C/svg%3E");
  background-size: 40%;
  background-repeat: no-repeat;
  background-position: center;
  box-shadow: 10px 10px 40px rgba(80, 80, 80, 0.15),
    15px 15px 30px rgba(80, 80, 80, 0.05),
    0 0 120px rgba(80, 80, 80, 0.06);
  z-index: 6;
  animation: ripple 0.7s linear infinite;
}

:root.dark .listar-bottom-circle {
  background-color: #374151;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M12 5v14M5 12h14'/%3E%3C/svg%3E");
  box-shadow: 10px 10px 40px rgba(0, 0, 0, 0.3),
    15px 15px 30px rgba(0, 0, 0, 0.15),
    0 0 120px rgba(0, 0, 0, 0.1);
}

@keyframes ripple {
  0% {
    box-shadow: 0 0 0 0 rgba(163, 177, 198, 0.3),
      0 0 0 1em rgba(163, 177, 198, 0.3),
      0 0 0 3em rgba(163, 177, 198, 0.03),
      0 0 0 5em rgba(163, 177, 198, 0.01);
  }
  100% {
    box-shadow: 0 0 0 1em rgba(163, 177, 198, 0.3),
      0 0 0 3em rgba(163, 177, 198, 0.03),
      0 0 0 5em rgba(163, 177, 198, 0.03),
      0 0 0 8em rgba(163, 177, 198, 0.01);
  }
}
</style>
