# Plan d'amelioration de la performance — Universite Senghor

## 1. Gains rapides (Quick Wins) — Impact immediat

### 1.1 Frontend : Supprimer le chargement global des librairies lourdes

| Librairie | Taille | Pages concernees | Action |
|-----------|--------|-----------------|--------|
| **amCharts 5** | ~2.5 MB | 2-3 pages admin | Supprimer le plugin global `amcharts.client.ts`, importer par composant avec `defineAsyncComponent` |
| **animate.css** | ~80 KB | Quelques animations | Remplacer par les classes Tailwind `animate-*` ou n'importer que les animations utilisees |
| **GSAP + Lenis** | ~150 KB | Toutes les pages (inutile sur admin) | Charger conditionnellement : seulement sur les pages publiques avec animations |
| **Leaflet** | ~200 KB | 1-2 pages | Lazy load via `defineAsyncComponent` |
| **SurveyJS** | ~300 KB | Pages sondages uniquement | Lazy load |
| **Toast UI Editor** | ~500 KB | Pages admin edition | Deja `.client`, verifier qu'il n'est pas bundle globalement |

### 1.2 Backend : Corrections immediates

- **Desactiver SQL echo en production** — `database.py` : log chaque requete SQL en console
- **Ajouter `max_age=600` au CORS** — evite les requetes preflight repetees
- **Wraper les I/O fichiers avec `asyncio.to_thread()`** — `media_service.py:258` bloque l'event loop
- **Auto-close des appels** : deplacer `auto_close_expired_calls()` dans une tache planifiee au lieu de l'executer a chaque `GET`

### 1.3 Index SQL manquants

```sql
CREATE INDEX idx_news_status ON news(status);
CREATE INDEX idx_news_visible_from ON news(visible_from);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_status_date ON events(status, start_date);
CREATE INDEX idx_application_calls_status ON application_calls(status);
```

---

## 2. Nouveau service : Redis (cache applicatif)

**Installation** : ajouter Redis au `docker-compose.prod.yml`

```yaml
redis:
  image: redis:7-alpine
  restart: unless-stopped
  volumes:
    - redis_data:/data
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
```

**Usages** :

| Donnee | TTL | Impact |
|--------|-----|--------|
| Listes publiques (tags, pays, secteurs) | 24h | Elimine des requetes repetees |
| Programmes vedettes | 1h | Endpoint tres sollicite |
| Statistiques dashboard | 15 min | 9+ requetes → 1 lecture cache |
| Sessions / token blacklist | Duree du token | Securite + perf |
| Reponses API publiques (news, events) | 5 min | Reduit la charge DB de ~60% |

**Librairie Python** : `redis[hiredis]` + `fastapi-cache2`

---

## 3. Optimisation images — `@nuxt/image` + variantes backend

### Frontend : Configurer `@nuxt/image`

```ts
// nuxt.config.ts
image: {
  provider: 'ipx',
  formats: ['webp', 'avif', 'jpeg'],
  screens: { xs: 320, sm: 640, md: 768, lg: 1024, xl: 1280 },
  presets: {
    thumbnail: { modifiers: { width: 300, height: 200, fit: 'cover' } },
    hero: { modifiers: { width: 1920, height: 800, fit: 'cover' } },
  }
}
```

Remplacer les `<img>` par `<NuxtImg>` avec `loading="lazy"` sur toutes les pages.

### Backend : Generation de variantes a l'upload

- Utiliser **Pillow** (deja dans les dependances) pour generer les variantes `low` (480px) et `medium` (1200px) **a l'upload** au lieu de servir l'original
- Convertir en **WebP** automatiquement
- Ajouter des headers `Cache-Control: public, max-age=2592000` sur `/api/public/media/*/download`

---

## 4. Nginx : Cache proxy + compression avancee

### Proxy cache pour les reponses API

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m;

location /api/public/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    proxy_cache_use_stale error timeout updating;
    add_header X-Cache-Status $upstream_cache_status;
    proxy_pass http://backend:8000;
}
```

### Compression Brotli (nouveau)

Installer le module `ngx_brotli` — compression ~20% meilleure que gzip pour les assets JS/CSS :

```nginx
brotli on;
brotli_types text/plain text/css application/javascript application/json image/svg+xml;
brotli_comp_level 6;
```

### Cache long terme pour les assets Nuxt

```nginx
location /_nuxt/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## 5. Optimisation des requetes backend

### 5.1 Resoudre les N+1 queries

- **News list** : utiliser `selectinload(News.tags)` au lieu de l'enrichissement applicatif (8+ requetes supplementaires par appel)
- **Events** : eager load `EventMediaLibrary`, `EventPartner`

### 5.2 Dashboard : requete unique

Remplacer les 9 requetes individuelles par une seule requete agregee avec `UNION ALL` ou des sous-requetes.

### 5.3 Anniversaires : calcul cote DB

Remplacer le chargement de TOUS les utilisateurs en memoire par :

```sql
WHERE EXTRACT(MONTH FROM birth_date) = EXTRACT(MONTH FROM CURRENT_DATE)
  AND EXTRACT(DAY FROM birth_date) BETWEEN EXTRACT(DAY FROM CURRENT_DATE)
  AND EXTRACT(DAY FROM CURRENT_DATE) + 7
```

---

## 6. Prerendu et SSR optimise

### Activer le prerendu pour les pages statiques

```ts
// nuxt.config.ts
nitro: {
  prerender: {
    crawlLinks: true,
    routes: ['/', '/a-propos', '/a-propos/histoire', '/formations']
  }
}
```

### Corriger les pages qui fetch en `onMounted()`

Certaines pages (ex: `/actualites/index.vue`) font du fetch client-side au lieu de `useAsyncData()`, causant un flash de contenu. Migrer vers `useAsyncData()` pour beneficier du SSR.

---

## 7. Nouveau service : Monitoring (Prometheus + Grafana)

**Pourquoi** : actuellement aucune visibilite sur les performances en production.

```yaml
# docker-compose.prod.yml
prometheus:
  image: prom/prometheus:latest
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
  ports:
    - "9090:9090"

grafana:
  image: grafana/grafana:latest
  ports:
    - "3001:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
```

**Librairie Python** : `prometheus-fastapi-instrumentator` — metriques automatiques par endpoint (latence, erreurs, requetes/s).

---

## 8. Docker : limites de ressources + tuning PostgreSQL

### Limites de ressources

```yaml
backend:
  deploy:
    resources:
      limits: { memory: 512M, cpus: '1.0' }
frontend:
  deploy:
    resources:
      limits: { memory: 256M, cpus: '0.5' }
db:
  command: >
    postgres
    -c shared_buffers=256MB
    -c effective_cache_size=1GB
    -c work_mem=64MB
    -c maintenance_work_mem=256MB
    -c random_page_cost=1.1
```

### Supprimer Adminer en production

Adminer est expose sur le port 8080 — risque securite et consommation de ressources inutile.

---

## 9. CDN (optionnel mais recommande)

**Cloudflare** (gratuit) devant le domaine :

- Cache automatique des assets statiques
- Protection DDoS
- Compression Brotli au edge
- Analytics de performance integres
- Reduction de ~40-60% de la bande passante

---

## Resume par impact estime

| Action | Effort | Impact perf | Priorite |
|--------|--------|-------------|----------|
| Lazy load amCharts/Leaflet/GSAP | 2h | -40% taille bundle | 1 |
| Index SQL manquants | 30 min | -30% latence requetes filtrees | 1 |
| Redis cache | 4h | -60% charge DB | 2 |
| Nginx proxy cache + Brotli | 2h | -50% temps de reponse API | 2 |
| `<NuxtImg>` + WebP | 4h | -60% poids images | 2 |
| Prerendu pages statiques | 1h | Temps de chargement ~0ms | 3 |
| Fix `onMounted` → `useAsyncData` | 2h | Supprime le flash de contenu | 3 |
| Resoudre N+1 queries | 3h | -70% latence endpoints listes | 3 |
| Monitoring Prometheus/Grafana | 3h | Visibilite continue | 4 |
| CDN Cloudflare | 1h | -40% bande passante | 4 |
