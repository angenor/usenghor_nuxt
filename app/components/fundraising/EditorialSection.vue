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
        class="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl rtl:text-right"
        :class="{ 'mb-20 lg:mb-24': isListarStyle }"
      >
        {{ title }}
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
/* === Listar Feature Card Styles === */
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
