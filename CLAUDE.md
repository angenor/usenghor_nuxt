# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

USenghor is a multilingual website for Université Senghor (Alexandria, Egypt), built with Nuxt 4. The site supports French (default), English, and Arabic (RTL).

## Commands

```bash
pnpm dev          # Start dev server on http://localhost:3000
pnpm build        # Build for production
pnpm preview      # Preview production build locally
pnpm generate     # Generate static site
pnpm lint         # Run ESLint

# Deployment (Firebase Hosting)
firebase deploy   # Deploy to Firebase (requires firebase-tools)
```

## Architecture

**Directory Structure (Nuxt 4 convention - app/ directory):**
- `app/` - Main application code
  - `components/` - Vue components (auto-imported), organized by feature: `campus/`, `governance/`, `partners/`, `strategy/`, `team/`, `careers/`, `actualites/`, `projets/`, etc.
  - `composables/` - Vue composables (auto-imported): `useDarkMode`, `useScrollAnimation`, `useMockData`, `useEditorJS`, `useCountryDrawer`, `usePaysBailleursData`, `useScrollytellingMap`
  - `pages/` - File-based routing with nested routes: `index.vue`, `about.vue`, `a-propos/`, `formations/`, `actualites/`, `projets/`, `alumni/`, `site/`
  - `plugins/` - Nuxt plugins: Font Awesome setup
  - `stores/` - Pinia stores
  - `assets/css/` - `main.css` (Tailwind), `timeline.css` (timeline components)
- `i18n/locales/` - Translation files by language (`fr/`, `en/`, `ar/`), each with thematic JSON files merged via `index.ts`
- `bank/` - Project documentation, specs, and mock data
  - `mock-data/` - TypeScript mock data files mirroring the PostgreSQL schema
  - `modele_de_donnee/` - Database schema (`schema.sql`) and MCD
- `public/images/` - Static images

**Path Aliases:**
- `@bank` → `./bank` (configured in nuxt.config.ts)

**Key Modules (nuxt.config.ts):**
- `@nuxtjs/tailwindcss` - Styling with dark mode (`class` strategy)
- `@pinia/nuxt` - State management
- `@nuxtjs/i18n` - Internationalization (strategy: `prefix_except_default`)
- `@nuxt/image` - Image optimization
- `@nuxt/eslint` - Linting
- `@nuxt/test-utils/module` - Testing utilities

**i18n Behavior:**
- French URLs: `/`, `/a-propos/histoire`
- English URLs: `/en`, `/en/a-propos/histoire`
- Arabic URLs: `/ar`, `/ar/a-propos/histoire` (RTL direction applied via `app.vue` watcher)
- Browser language detection with cookie persistence
- **French: toujours utiliser les accents** (é, è, ê, à, ç, etc.)

**Styling:**
- Tailwind CSS with Inter Variable font
- Dark mode via `dark:` variants (toggled by `useDarkMode` composable)
- Custom brand colors: `brand-blue-*` and `brand-red-*` palettes in `tailwind.config.ts`
- `tailwindcss-hero-patterns` for section backgrounds: `heropattern-{pattern}-{color}-{shade}`
- Animate.css for animations
- GSAP + Lenis for smooth scrolling and advanced animations
- Leaflet for interactive maps

All fields are trilingual (`*_fr`, `*_en`, `*_ar`).

## Mock Data

For development without a database, use the `useMockData` composable:

```ts
const {
  departments, formations, staff, projects, alumni,
  getCampusBySlug, getFormationBySlug, getAllNews, getFeaturedEvents
} = useMockData()
```

## EditorJS Integration

Rich text content uses EditorJS:
- `EditorJS.vue` - Editor component with configured tools (header, list, quote, embed, image, table, etc.)
- `EditorJSRenderer.vue` - Renders EditorJS JSON blocks to HTML
- `useEditorJS` composable for programmatic control

## Admin Rich Text Editor

Pour tous les champs de texte riche dans l'espace admin, utiliser le composant `AdminRichTextEditor` (`app/components/admin/RichTextEditor.vue`). Ce composant encapsule EditorJS avec support multilingue (FR, EN, AR) et styling admin.

**Utilisation basique (une seule langue) :**
```vue
<AdminRichTextEditor
  v-model="content"
  title="Contenu"
  description="Rédigez le contenu..."
  placeholder="Commencez à écrire..."
  :min-height="400"
  required
/>
```

**Utilisation multilingue (3 langues avec tabs) :**
```vue
<AdminRichTextEditor
  v-model="contentFr"
  v-model:model-value-en="contentEn"
  v-model:model-value-ar="contentAr"
  title="Contenu détaillé"
  description="Rédigez le contenu complet..."
  icon="fa-solid fa-file-lines"
  icon-color="text-indigo-500"
  placeholder="Commencez à écrire..."
  placeholder-en="Start writing..."
  placeholder-ar="ابدأ في كتابة..."
  :min-height="400"
  @change="onContentChange"
/>
```

## Placeholder Images

For development mockups:
- **Images**: `https://picsum.photos/{width}/{height}` or `https://picsum.photos/seed/{id}/{w}/{h}` for consistent images
- **Avatars**: `https://i.pravatar.cc/{size}` or `https://i.pravatar.cc/{size}?u={id}` for consistent avatars
