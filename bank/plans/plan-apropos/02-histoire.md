# 02 - Page Histoire `/a-propos/histoire`

> Route: `/a-propos/histoire`
> Fichier: `app/pages/a-propos/histoire.vue`
> Statut: **À implémenter**

---

## Objectif

Raconter l'histoire de l'Université Senghor depuis sa création jusqu'à aujourd'hui, avec une timeline interactive et du contenu multimédia.

---

## Sections de la page

1. **Hero** - Titre, sous-titre, breadcrumb
2. **Introduction** - Texte éditorial sur la genèse du projet (EditorJS ou i18n)
3. **Projet Senghor** - Portrait de Léopold Sédar Senghor, biographie, citation
4. **Timeline** - Chronologie interactive (1989 → aujourd'hui) avec images
5. **Galerie** - Photos historiques avec lightbox
6. **Vidéo** - Vidéo institutionnelle (YouTube embed)

---

## Composants à créer

| Composant | Fichier | Description |
|-----------|---------|-------------|
| `TimelineHistory` | `components/timeline/TimelineHistory.vue` | Chronologie verticale interactive |
| `SectionSenghor` | `components/section/SectionSenghor.vue` | Portrait + bio + citation |
| `GalleryGrid` | `components/gallery/GalleryGrid.vue` | Grille photos avec lightbox |
| `VideoEmbed` | `components/media/VideoEmbed.vue` | Lecteur vidéo YouTube/Vimeo |

---

## Données

**Option A - i18n (recommandé pour contenu stable):**
Les événements timeline stockés dans `history.json`

**Option B - Base de données:**
Via `page_sections` type `timeline` pour modification CMS

---

## i18n

Fichier existant à compléter: `i18n/locales/{fr,en,ar}/history.json`

Clés à ajouter:
- `history.hero.title` / `history.hero.subtitle`
- `history.intro.title` / `history.intro.content`
- `history.senghor.title` / `history.senghor.bio` / `history.senghor.quote`
- `history.timeline[]` (tableau d'événements)
- `history.gallery.title`
- `history.video.title`

---

## Animations

- Timeline: apparition progressive au scroll (Intersection Observer)
- Galerie: fade-in au scroll
- Utiliser le composable existant `useScrollAnimation`
