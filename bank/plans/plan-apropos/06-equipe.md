# 06 - Page Équipe `/a-propos/equipe`

> Route: `/a-propos/equipe`
> Fichier: `app/pages/a-propos/equipe.vue`

---

## Objectif

Trombinoscope du personnel de l'Université avec filtres par service/département et recherche.

---

## Structure de la page

```
┌─────────────────────────────────────────────────────┐
│                    HERO SECTION                      │
│  - Titre: "Notre équipe"                            │
│  - Sous-titre: "Les femmes et hommes de Senghor"   │
│  - Breadcrumb                                       │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│                 FILTRES & RECHERCHE                  │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ 🔍 Rechercher un membre...                  │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Filtrer par:                                      │
│  ┌──────────────┐ ┌──────────────┐                │
│  │ Type      ▼  │ │ Service   ▼  │                │
│  │ Tous         │ │ Tous         │                │
│  └──────────────┘ └──────────────┘                │
│                                                     │
│  ┌──────────────┐                                  │
│  │ Département▼ │                                  │
│  │ Tous         │                                  │
│  └──────────────┘                                  │
│                                                     │
│  Résultats: 45 membres                             │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│                  GRILLE ÉQUIPE                       │
│                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │
│  │   [Photo]   │ │   [Photo]   │ │   [Photo]   │  │
│  │  Dr. Nom    │ │  Mme Nom    │ │  M. Nom     │  │
│  │  Fonction   │ │  Fonction   │ │  Fonction   │  │
│  │  Service    │ │  Service    │ │  Service    │  │
│  │  📧 ✉️      │ │  📧 ✉️      │ │  📧 ✉️      │  │
│  └─────────────┘ └─────────────┘ └─────────────┘  │
│                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │
│  │   [Photo]   │ │   [Photo]   │ │   [Photo]   │  │
│  │     ...     │ │     ...     │ │     ...     │  │
│  └─────────────┘ └─────────────┘ └─────────────┘  │
│                                                     │
│  ... (grille responsive 2-4 colonnes)              │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│                   PAGINATION                         │
│                                                     │
│         [←] [1] [2] [3] ... [10] [→]               │
│                                                     │
│  ou Infinite Scroll                                │
└─────────────────────────────────────────────────────┘
```

---

## Table SQL utilisée

### Staff avec filtres

```sql
-- Récupérer le personnel avec filtres
SELECT
  s.id, s.slug, s.staff_type, s.civility,
  s.first_name, s.last_name,
  s.title_fr, s.title_en, s.title_ar,
  s.photo, s.email, s.phone, s.office,
  s.linkedin,
  d.id as department_id,
  d.name_fr as department_name,
  sv.id as service_id,
  sv.name_fr as service_name,
  sv.category as service_category
FROM staff s
LEFT JOIN departments d ON s.department_id = d.id
LEFT JOIN services sv ON s.service_id = sv.id
WHERE s.is_published = TRUE
  AND (
    :staff_type IS NULL
    OR s.staff_type = :staff_type
  )
  AND (
    :department_id IS NULL
    OR s.department_id = :department_id
  )
  AND (
    :service_id IS NULL
    OR s.service_id = :service_id
  )
  AND (
    :search IS NULL
    OR s.first_name ILIKE '%' || :search || '%'
    OR s.last_name ILIKE '%' || :search || '%'
    OR s.title_fr ILIKE '%' || :search || '%'
  )
ORDER BY s.sort_order, s.last_name, s.first_name
LIMIT :limit OFFSET :offset;
```

---

## Composants nécessaires

### 1. StaffFilters

```vue
<template>
  <div class="staff-filters">
    <!-- Recherche -->
    <div class="staff-filters__search">
      <Icon name="search" />
      <input
        v-model="search"
        type="text"
        :placeholder="$t('team.search_placeholder')"
        @input="debouncedSearch"
      />
      <button v-if="search" @click="clearSearch">
        <Icon name="x" />
      </button>
    </div>

    <!-- Filtres -->
    <div class="staff-filters__selects">
      <div class="staff-filters__select">
        <label>{{ $t('team.filters.type') }}</label>
        <select v-model="filters.type" @change="emitFilters">
          <option value="">{{ $t('common.all') }}</option>
          <option value="direction">{{ $t('team.types.direction') }}</option>
          <option value="enseignant">{{ $t('team.types.teacher') }}</option>
          <option value="administratif">{{ $t('team.types.admin') }}</option>
          <option value="technique">{{ $t('team.types.technical') }}</option>
        </select>
      </div>

      <div class="staff-filters__select">
        <label>{{ $t('team.filters.service') }}</label>
        <select v-model="filters.serviceId" @change="emitFilters">
          <option value="">{{ $t('common.all') }}</option>
          <option
            v-for="service in services"
            :key="service.id"
            :value="service.id"
          >
            {{ getLocalizedField(service, 'name') }}
          </option>
        </select>
      </div>

      <div class="staff-filters__select">
        <label>{{ $t('team.filters.department') }}</label>
        <select v-model="filters.departmentId" @change="emitFilters">
          <option value="">{{ $t('common.all') }}</option>
          <option
            v-for="dept in departments"
            :key="dept.id"
            :value="dept.id"
          >
            {{ getLocalizedField(dept, 'name') }}
          </option>
        </select>
      </div>
    </div>

    <!-- Résultats count -->
    <div class="staff-filters__count">
      {{ $t('team.results_count', { count: totalCount }) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

interface Filters {
  type: string
  serviceId: string
  departmentId: string
  search: string
}

const props = defineProps<{
  services: any[]
  departments: any[]
  totalCount: number
}>()

const emit = defineEmits<{
  filter: [filters: Filters]
}>()

const search = ref('')
const filters = reactive({
  type: '',
  serviceId: '',
  departmentId: '',
  search: ''
})

// Récupérer les filtres depuis l'URL
const route = useRoute()
onMounted(() => {
  if (route.query.department) {
    filters.departmentId = route.query.department as string
  }
  if (route.query.service) {
    filters.serviceId = route.query.service as string
  }
})

const debouncedSearch = useDebounceFn(() => {
  filters.search = search.value
  emitFilters()
}, 300)

function clearSearch() {
  search.value = ''
  filters.search = ''
  emitFilters()
}

function emitFilters() {
  emit('filter', { ...filters })
}
</script>
```

### 2. StaffGrid

```vue
<template>
  <div class="staff-grid">
    <TransitionGroup name="grid">
      <CardStaff
        v-for="member in staff"
        :key="member.id"
        :member="member"
        @click="openProfile(member)"
      />
    </TransitionGroup>

    <!-- État vide -->
    <div v-if="!staff?.length && !loading" class="staff-grid__empty">
      <Icon name="users" />
      <p>{{ $t('team.no_results') }}</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="staff-grid__loading">
      <Spinner />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Staff } from '~/types/database'

defineProps<{
  staff: Staff[]
  loading?: boolean
}>()

const emit = defineEmits<{
  select: [member: Staff]
}>()

function openProfile(member: Staff) {
  emit('select', member)
}
</script>

<style scoped>
.staff-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

/* Animation */
.grid-enter-active,
.grid-leave-active {
  transition: all 0.3s ease;
}

.grid-enter-from,
.grid-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
```

### 3. CardStaff

```vue
<template>
  <article class="card-staff" @click="$emit('click')">
    <div class="card-staff__photo">
      <NuxtImg
        v-if="member.photo"
        :src="member.photo"
        :alt="`${member.first_name} ${member.last_name}`"
        width="200"
        height="200"
        fit="cover"
        loading="lazy"
      />
      <div v-else class="card-staff__placeholder">
        <Icon name="user" />
      </div>
    </div>

    <div class="card-staff__content">
      <h3 class="card-staff__name">
        {{ member.civility }} {{ member.first_name }} {{ member.last_name }}
      </h3>

      <p class="card-staff__title">
        {{ getLocalizedField(member, 'title') }}
      </p>

      <p v-if="member.service_name || member.department_name" class="card-staff__unit">
        {{ member.service_name || member.department_name }}
      </p>

      <div class="card-staff__actions">
        <a
          v-if="member.email"
          :href="`mailto:${member.email}`"
          class="card-staff__action"
          @click.stop
        >
          <Icon name="mail" />
        </a>
        <a
          v-if="member.linkedin"
          :href="member.linkedin"
          target="_blank"
          class="card-staff__action"
          @click.stop
        >
          <Icon name="linkedin" />
        </a>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Staff } from '~/types/database'

defineProps<{
  member: Staff & {
    service_name?: string
    department_name?: string
  }
}>()

defineEmits<{
  click: []
}>()
</script>

<style scoped>
.card-staff {
  background: var(--color-surface);
  border-radius: 0.5rem;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card-staff:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.card-staff__photo {
  aspect-ratio: 1;
  overflow: hidden;
}

.card-staff__photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-staff__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-muted);
  font-size: 3rem;
  color: var(--color-text-muted);
}

.card-staff__content {
  padding: 1rem;
}

.card-staff__name {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
}

.card-staff__title {
  font-size: 0.875rem;
  color: var(--color-primary);
  margin: 0 0 0.25rem;
}

.card-staff__unit {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin: 0 0 0.5rem;
}

.card-staff__actions {
  display: flex;
  gap: 0.5rem;
}

.card-staff__action {
  padding: 0.25rem;
  color: var(--color-text-muted);
  transition: color 0.2s;
}

.card-staff__action:hover {
  color: var(--color-primary);
}
</style>
```

### 4. StaffModal (détails profil)

```vue
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click.self="close">
        <div class="modal-content staff-modal">
          <button class="modal-close" @click="close">
            <Icon name="x" />
          </button>

          <div class="staff-modal__header">
            <div class="staff-modal__photo">
              <NuxtImg
                v-if="member?.photo"
                :src="member.photo"
                width="150"
                height="150"
              />
            </div>
            <div class="staff-modal__info">
              <h2>{{ member?.civility }} {{ member?.first_name }} {{ member?.last_name }}</h2>
              <p class="staff-modal__title">{{ getLocalizedField(member, 'title') }}</p>
              <p class="staff-modal__unit">{{ member?.service_name || member?.department_name }}</p>
            </div>
          </div>

          <div v-if="member?.bio_fr" class="staff-modal__bio">
            <h3>{{ $t('team.biography') }}</h3>
            <p>{{ getLocalizedField(member, 'bio') }}</p>
          </div>

          <div class="staff-modal__contact">
            <h3>{{ $t('team.contact') }}</h3>
            <ul>
              <li v-if="member?.email">
                <Icon name="mail" />
                <a :href="`mailto:${member.email}`">{{ member.email }}</a>
              </li>
              <li v-if="member?.phone">
                <Icon name="phone" />
                <a :href="`tel:${member.phone}`">{{ member.phone }}</a>
              </li>
              <li v-if="member?.office">
                <Icon name="map-pin" />
                <span>{{ member.office }}</span>
              </li>
            </ul>
          </div>

          <div v-if="member?.publications?.length" class="staff-modal__publications">
            <h3>{{ $t('team.publications') }}</h3>
            <ul>
              <li v-for="pub in member.publications" :key="pub.title">
                <a v-if="pub.url" :href="pub.url" target="_blank">{{ pub.title }}</a>
                <span v-else>{{ pub.title }}</span>
                <span class="year">({{ pub.year }})</span>
              </li>
            </ul>
          </div>

          <div class="staff-modal__links">
            <a v-if="member?.linkedin" :href="member.linkedin" target="_blank" class="btn">
              <Icon name="linkedin" /> LinkedIn
            </a>
            <a v-if="member?.research_gate" :href="member.research_gate" target="_blank" class="btn">
              ResearchGate
            </a>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Staff } from '~/types/database'

const props = defineProps<{
  member: Staff | null
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

function close() {
  emit('close')
}

// Fermer avec Escape
onKeyStroke('Escape', close)
</script>
```

---

## Fichier i18n: `team.json`

```json
{
  "hero": {
    "title": "Notre équipe",
    "subtitle": "Les femmes et les hommes qui font Senghor"
  },
  "search_placeholder": "Rechercher un membre...",
  "filters": {
    "type": "Type",
    "service": "Service",
    "department": "Département"
  },
  "types": {
    "direction": "Direction",
    "teacher": "Enseignant",
    "admin": "Administratif",
    "technical": "Technique"
  },
  "results_count": "{count} membre(s) trouvé(s)",
  "no_results": "Aucun membre ne correspond à votre recherche",
  "biography": "Biographie",
  "contact": "Contact",
  "publications": "Publications",
  "view_profile": "Voir le profil"
}
```

---

## API / Composables

```ts
// composables/useStaff.ts
interface StaffFilters {
  type?: string
  serviceId?: string
  departmentId?: string
  search?: string
  page?: number
  limit?: number
}

export function useStaff(initialFilters: StaffFilters = {}) {
  const filters = reactive({
    type: '',
    serviceId: '',
    departmentId: '',
    search: '',
    page: 1,
    limit: 12,
    ...initialFilters
  })

  const { data, pending, refresh } = await useFetch('/api/staff', {
    query: filters,
    watch: [filters]
  })

  const staff = computed(() => data.value?.items || [])
  const total = computed(() => data.value?.total || 0)
  const totalPages = computed(() => Math.ceil(total.value / filters.limit))

  function setFilters(newFilters: Partial<StaffFilters>) {
    Object.assign(filters, newFilters)
    filters.page = 1 // Reset page on filter change
  }

  function nextPage() {
    if (filters.page < totalPages.value) {
      filters.page++
    }
  }

  function prevPage() {
    if (filters.page > 1) {
      filters.page--
    }
  }

  return {
    staff,
    total,
    totalPages,
    currentPage: toRef(filters, 'page'),
    loading: pending,
    setFilters,
    nextPage,
    prevPage,
    refresh
  }
}
```

---

## Server API

```ts
// server/api/staff.get.ts
import { db } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const {
    type,
    serviceId,
    departmentId,
    search,
    page = 1,
    limit = 12
  } = query

  const offset = (Number(page) - 1) * Number(limit)

  // Construction de la requête avec filtres
  let whereClause = 'WHERE s.is_published = TRUE'
  const params: any[] = []

  if (type) {
    params.push(type)
    whereClause += ` AND s.staff_type = $${params.length}`
  }

  if (serviceId) {
    params.push(serviceId)
    whereClause += ` AND s.service_id = $${params.length}`
  }

  if (departmentId) {
    params.push(departmentId)
    whereClause += ` AND s.department_id = $${params.length}`
  }

  if (search) {
    params.push(`%${search}%`)
    whereClause += ` AND (
      s.first_name ILIKE $${params.length}
      OR s.last_name ILIKE $${params.length}
      OR s.title_fr ILIKE $${params.length}
    )`
  }

  // Count total
  const countResult = await db.query(`
    SELECT COUNT(*) as total
    FROM staff s
    ${whereClause}
  `, params)

  // Get paginated items
  params.push(limit, offset)
  const itemsResult = await db.query(`
    SELECT
      s.*,
      d.name_fr as department_name,
      sv.name_fr as service_name
    FROM staff s
    LEFT JOIN departments d ON s.department_id = d.id
    LEFT JOIN services sv ON s.service_id = sv.id
    ${whereClause}
    ORDER BY s.sort_order, s.last_name
    LIMIT $${params.length - 1} OFFSET $${params.length}
  `, params)

  return {
    items: itemsResult.rows,
    total: parseInt(countResult.rows[0].total),
    page: Number(page),
    limit: Number(limit)
  }
})
```

---

## Fichiers à créer

```
app/
├── pages/
│   └── a-propos/
│       └── equipe.vue
├── components/
│   └── staff/
│       ├── StaffFilters.vue
│       ├── StaffGrid.vue
│       ├── CardStaff.vue
│       └── StaffModal.vue
├── composables/
│   └── useStaff.ts
├── server/api/
│   └── staff.get.ts
i18n/locales/
├── fr/team.json
├── en/team.json
└── ar/team.json
```
