# 03 - Page Gouvernance `/a-propos/gouvernance`

> Route: `/a-propos/gouvernance`
> Fichier: `app/pages/a-propos/gouvernance.vue`

---

## Objectif

Présenter la gouvernance institutionnelle: textes fondateurs, pays bailleurs et membres du Conseil d'Administration.

---

## Structure de la page

```
┌─────────────────────────────────────────────────────┐
│                    HERO SECTION                      │
│  - Titre: "Notre gouvernance"                       │
│  - Sous-titre: "Une université multilatérale"      │
│  - Breadcrumb                                       │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│         SECTION TEXTES FONDATEURS                    │
│                                                     │
│  Introduction sur le cadre juridique               │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ 📄 Convention portant création (1989)    [⬇] │  │
│  │ 📄 Statuts de l'Université               [⬇] │  │
│  │ 📄 Règlement intérieur                   [⬇] │  │
│  │ 📄 Charte de l'étudiant                  [⬇] │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│            SECTION PAYS BAILLEURS                    │
│                                                     │
│  Introduction sur le financement multilatéral      │
│                                                     │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐      │
│  │ 🇫🇷     │ │ 🇸🇳     │ │ 🇪🇬     │ │ 🇨🇲     │      │
│  │ France │ │Sénégal │ │ Égypte │ │Cameroun│      │
│  │ 1989   │ │ 1989   │ │ 1989   │ │ 1990   │      │
│  └────────┘ └────────┘ └────────┘ └────────┘      │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐      │
│  │ 🇨🇮     │ │ 🇬🇦     │ │ 🇲🇦     │ │ 🇹🇳     │      │
│  │  ...   │ │  ...   │ │  ...   │ │  ...   │      │
│  └────────┘ └────────┘ └────────┘ └────────┘      │
│                                                     │
│  ... (tous les 15 pays)                            │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│        SECTION CONSEIL D'ADMINISTRATION              │
│                                                     │
│  Introduction sur le rôle du CA                    │
│                                                     │
│  ── Présidence ──                                  │
│  ┌──────────────────────────────────────────────┐  │
│  │ [Photo]  S.E. Nom Prénom                     │  │
│  │          Président du Conseil                │  │
│  │          Représentant du [Pays]              │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ── Membres ──                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │
│  │   [Photo]   │ │   [Photo]   │ │   [Photo]   │  │
│  │    Nom      │ │    Nom      │ │    Nom      │  │
│  │   Titre     │ │   Titre     │ │   Titre     │  │
│  │   Pays      │ │   Pays      │ │   Pays      │  │
│  └─────────────┘ └─────────────┘ └─────────────┘  │
│  ... (grille de tous les membres)                  │
└─────────────────────────────────────────────────────┘
```

---

## Tables SQL utilisées

### 1. Documents (textes fondateurs)

```sql
-- Récupérer les textes fondateurs
SELECT
  id, title_fr, title_en, title_ar,
  description_fr, file_url, file_type, file_size
FROM documents
WHERE document_category = 'texte_fondateur'
  AND is_public = TRUE
ORDER BY sort_order;
```

### 2. Pays Bailleurs

```sql
-- Récupérer les pays bailleurs actifs
SELECT
  id, name_fr, name_en, name_ar,
  code, -- Pour résoudre le drapeau côté frontend
  contribution_type_fr, member_since, website
FROM pays_bailleurs
WHERE is_active = TRUE
ORDER BY sort_order, member_since;
```

### 3. Conseil d'Administration

```sql
-- Récupérer les membres du CA
SELECT
  id, civility, first_name, last_name,
  title_fr, title_en, title_ar,
  ca_role, representing_fr, country_code,
  photo, bio_fr
FROM conseil_administration
WHERE is_active = TRUE
ORDER BY
  CASE ca_role
    WHEN 'president' THEN 1
    WHEN 'vice_president' THEN 2
    WHEN 'membre' THEN 3
    WHEN 'observateur' THEN 4
  END,
  sort_order;
```

---

## Composants nécessaires

### 1. DocumentsList

```vue
<template>
  <ul class="documents-list">
    <li v-for="doc in documents" :key="doc.id" class="document-item">
      <div class="document-icon">
        <Icon :name="getFileIcon(doc.file_type)" />
      </div>
      <div class="document-info">
        <h4>{{ getLocalizedField(doc, 'title') }}</h4>
        <p v-if="doc.description_fr">{{ getLocalizedField(doc, 'description') }}</p>
        <span class="document-meta">{{ doc.file_type?.toUpperCase() }} • {{ formatFileSize(doc.file_size) }}</span>
      </div>
      <a :href="doc.file_url" download class="document-download">
        <Icon name="download" />
      </a>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { Document } from '~/types/database'

defineProps<{
  documents: Document[]
}>()

function getFileIcon(type: string) {
  const icons: Record<string, string> = {
    pdf: 'file-pdf',
    doc: 'file-word',
    xls: 'file-excel',
  }
  return icons[type] || 'file'
}

function formatFileSize(bytes: number) {
  if (!bytes) return ''
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(1)} MB`
}
</script>
```

### 2. CardCountry

```vue
<template>
  <div class="card-country">
    <div class="card-country__flag">
      <span class="fi" :class="`fi-${code.toLowerCase()}`"></span>
      <!-- ou emoji: {{ getFlagEmoji(code) }} -->
    </div>
    <div class="card-country__info">
      <h4>{{ name }}</h4>
      <p v-if="memberSince">{{ $t('governance.member_since') }} {{ memberSince }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  code: string
  name: string
  memberSince?: number
}>()

// Utilitaire pour emoji drapeau
function getFlagEmoji(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}
</script>
```

### 3. CardCAMember

```vue
<template>
  <div class="card-ca-member" :class="{ 'card-ca-member--president': role === 'president' }">
    <div class="card-ca-member__photo">
      <NuxtImg
        v-if="photo"
        :src="photo"
        :alt="`${civility} ${firstName} ${lastName}`"
        width="200"
        height="200"
        fit="cover"
      />
      <div v-else class="card-ca-member__placeholder">
        <Icon name="user" />
      </div>
    </div>
    <div class="card-ca-member__info">
      <span class="card-ca-member__role">{{ getRoleLabel(role) }}</span>
      <h4>{{ civility }} {{ firstName }} {{ lastName }}</h4>
      <p class="card-ca-member__title">{{ title }}</p>
      <p class="card-ca-member__country">
        <span class="fi" :class="`fi-${countryCode?.toLowerCase()}`"></span>
        {{ representing }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  civility?: string
  firstName: string
  lastName: string
  title?: string
  role: 'president' | 'vice_president' | 'membre' | 'observateur'
  representing?: string
  countryCode?: string
  photo?: string
}>()

const { t } = useI18n()

function getRoleLabel(role: string) {
  return t(`governance.ca.roles.${role}`)
}
</script>
```

---

## Fichier i18n: `governance.json`

```json
{
  "hero": {
    "title": "Notre gouvernance",
    "subtitle": "Une université multilatérale au service de l'Afrique"
  },
  "founding_texts": {
    "title": "Textes fondateurs",
    "intro": "L'Université Senghor a été créée par la Conférence des chefs d'État et de gouvernement des pays ayant le français en partage..."
  },
  "donor_countries": {
    "title": "Pays bailleurs",
    "intro": "L'Université est financée par 15 États membres de la Francophonie...",
    "member_since": "Membre depuis"
  },
  "ca": {
    "title": "Conseil d'Administration",
    "intro": "Le Conseil d'Administration est l'organe suprême de l'Université...",
    "roles": {
      "president": "Président",
      "vice_president": "Vice-Président",
      "membre": "Membre",
      "observateur": "Observateur"
    }
  }
}
```

---

## Utilitaire drapeaux

```ts
// utils/flags.ts
export const FLAG_EMOJI: Record<string, string> = {
  FR: '🇫🇷',
  SN: '🇸🇳',
  EG: '🇪🇬',
  CM: '🇨🇲',
  CI: '🇨🇮',
  GA: '🇬🇦',
  MA: '🇲🇦',
  TN: '🇹🇳',
  BJ: '🇧🇯',
  BF: '🇧🇫',
  TD: '🇹🇩',
  CG: '🇨🇬',
  MG: '🇲🇬',
  NE: '🇳🇪',
  TG: '🇹🇬',
  // Ajouter les autres pays
}

export function getFlagEmoji(code: string): string {
  return FLAG_EMOJI[code.toUpperCase()] || code
}

// Alternative: utiliser flag-icons CSS
// npm install flag-icons
// <span class="fi fi-fr"></span>
```

---

## API / Composables

```ts
// composables/useGovernance.ts
export function useGovernance() {
  const { locale } = useI18n()

  // Documents fondateurs
  const { data: documents } = await useFetch('/api/documents', {
    query: { category: 'texte_fondateur' }
  })

  // Pays bailleurs
  const { data: countries } = await useFetch('/api/pays-bailleurs')

  // Conseil d'Administration
  const { data: caMembers } = await useFetch('/api/conseil-administration')

  // Grouper les membres par rôle
  const president = computed(() =>
    caMembers.value?.find(m => m.ca_role === 'president')
  )

  const otherMembers = computed(() =>
    caMembers.value?.filter(m => m.ca_role !== 'president')
  )

  return {
    documents,
    countries,
    president,
    otherMembers
  }
}
```

---

## Fichiers à créer

```
app/
├── pages/
│   └── a-propos/
│       └── gouvernance.vue
├── components/
│   ├── documents/
│   │   └── DocumentsList.vue
│   └── cards/
│       ├── CardCountry.vue
│       └── CardCAMember.vue
├── composables/
│   └── useGovernance.ts
├── server/api/
│   ├── documents.get.ts
│   ├── pays-bailleurs.get.ts
│   └── conseil-administration.get.ts
├── utils/
│   └── flags.ts
i18n/locales/
├── fr/governance.json (compléter)
├── en/governance.json
└── ar/governance.json
```
