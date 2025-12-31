# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

USenghor is a multilingual website built with Nuxt 4 for Université Senghor (Alexandria, Egypt). The site supports French (default), English, and Arabic (RTL).

## Commands

```bash
pnpm dev          # Start dev server on http://localhost:3000
pnpm build        # Build for production
pnpm preview      # Preview production build locally
pnpm generate     # Generate static site
```

## Architecture

**Directory Structure (Nuxt 4 convention - app/ directory):**
- `app/` - Main application code
  - `components/` - Vue components (auto-imported)
  - `composables/` - Vue composables (auto-imported): `useDarkMode`, `useScrollAnimation`
  - `pages/` - File-based routing: `index.vue`, `about.vue`
  - `plugins/` - Nuxt plugins: Font Awesome setup
  - `stores/` - Pinia stores
  - `assets/css/` - Tailwind CSS: `main.css` imports `base.css`
- `i18n/locales/` - Translation files organized by language folder (`fr/`, `en/`, `ar/`), each containing thematic JSON files (`common.json`, `nav.json`, `hero.json`, `history.json`, `mission.json`, `campus.json`, `governance.json`, `footer.json`, `search.json`, `courses.json`) merged via `index.ts`
- `public/images/` - Static images (bg, gallery, logos)
- `bank/` - Project documentation/specs

**Key Modules (configured in nuxt.config.ts):**
- `@nuxt/content` - Content management
- `@nuxtjs/tailwindcss` - Styling with dark mode (`class` strategy)
- `@pinia/nuxt` - State management
- `@nuxtjs/i18n` - Internationalization (strategy: `prefix_except_default`)
- `@nuxt/image` - Image optimization

**i18n Behavior:**
- French URLs: `/`, `/about`
- English URLs: `/en`, `/en/about`
- Arabic URLs: `/ar`, `/ar/about` (RTL direction applied automatically)
- Browser language detection with cookie persistence
- **French: toujours utiliser les accents** (é, è, ê, à, ç, etc.)

**Component Structure:**
- `app.vue` handles global layout, RTL switching, and includes `AppNavBar` + `AppFooter`
- Section components: `HeroSection`, `MissionSection`, `HistorySection`, `GovernanceSection`, `CampusSection`
- Uses Font Awesome icons via `@fortawesome/vue-fontawesome`

**Styling:**
- Tailwind CSS with Inter Variable font
- Dark mode via `dark:` variants (toggled by `useDarkMode` composable)
- Custom amber color palette defined in `tailwind.config.ts`
- Animate.css for animations

## Mock Data

For development without a database, use the `useMockData` composable:

```ts
const { departments, staff, formations, getFlagEmoji } = useMockData()
```

Mock data files are in `bank/mock-data/` and mirror the PostgreSQL schema in `bank/modele_de_donnee/schema.sql`.

## Placeholder Images & Avatars

For development and mockups, use these placeholder services:

### Random Images (Picsum Photos)
```
https://picsum.photos/{width}/{height}
```
**Examples:**
- `https://picsum.photos/400/300` - 400x300 image
- `https://picsum.photos/800/600` - 800x600 image
- `https://picsum.photos/1920/1080` - Full HD image
- `https://picsum.photos/seed/{unique-id}/400/300` - Seeded (consistent) image

### Random Avatars (Pravatar)
```
https://i.pravatar.cc/{size}
```
**Examples:**
- `https://i.pravatar.cc/150` - 150x150 avatar
- `https://i.pravatar.cc/64` - 64x64 avatar (small)
- `https://i.pravatar.cc/300` - 300x300 avatar (large)
- `https://i.pravatar.cc/150?u={unique-id}` - Consistent avatar for same ID
