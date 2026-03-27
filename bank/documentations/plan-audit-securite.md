# Plan d'audit de securite — Universite Senghor

## Phase 1 — Vulnerabilites critiques (immediat)

| # | Probleme | Severite | Localisation |
|---|----------|----------|-------------|
| 1 | **XSS via `v-html`** — 9 usages sans sanitisation (DOMPurify absent) | CRITIQUE | `app/components/RichTextRenderer.vue`, `app/components/projet/ProjetPresentation.vue`, `app/pages/admin/editorial/mentions-legales/index.vue`, `app/pages/levees-de-fonds/[slug].vue` |
| 2 | **`.env` avec credentials commites** (`ADMIN_PASSWORD=Admin123!`) | CRITIQUE | `usenghor_backend/.env` |
| 3 | **Pas de rate limiting** sur login/auth (brute force possible) | HAUTE | `usenghor_backend/app/routers/auth.py` |
| 4 | **CORS trop permissif** (`allow_methods=["*"]`, `allow_headers=["*"]`) | HAUTE | `usenghor_backend/app/main.py` |
| 5 | **Pas de Content Security Policy (CSP)** | HAUTE | Config Nginx/Nuxt |

### Actions

- Installer `dompurify` et creer un utilitaire `sanitizeHtml()` pour tous les `v-html`
- Retirer `.env` du repo, regenerer tous les secrets, renforcer `.gitignore`
- Ajouter `slowapi` pour le rate limiting sur les endpoints d'authentification
- Restreindre CORS aux methodes/headers necessaires
- Ajouter les headers CSP dans Nginx

---

## Phase 2 — Renforcement authentification et sessions (semaine 1-2)

| # | Probleme | Action |
|---|----------|--------|
| 6 | JWT non revocables au logout | Implementer un token blacklist (Redis ou table DB) |
| 7 | Cookie `SameSite: lax` au lieu de `strict` | Passer a `strict` dans `app/stores/auth.ts` |
| 8 | Refresh token expiry 30 jours (long) | Reduire a 7-14 jours |
| 9 | Challenge token anti-spam deterministe | Utiliser `crypto.getRandomValues()` cote client |
| 10 | Pas de validation honeypot sur tous les formulaires | Etendre a `app/components/fundraising/PostulerForm.vue` |

---

## Phase 3 — Securite infrastructure (semaine 2-3)

| # | Probleme | Action |
|---|----------|--------|
| 11 | Adminer expose sur port 8080 (prod) | Retirer du `docker-compose.prod.yml` ou proteger par auth |
| 12 | IP serveur en clair dans `deploy.sh` | Utiliser une variable d'environnement |
| 13 | Backups non chiffres | Chiffrer les dumps SQL (GPG ou age) |
| 14 | Secrets affiches en console au deploiement | Ecrire dans un fichier protege ou un gestionnaire de secrets |
| 15 | Pas de rotation planifiee des secrets | Mettre en place une rotation trimestrielle |

---

## Phase 4 — Hardening headers et protection (semaine 3-4)

### Headers Nginx deja en place

- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `HSTS` avec 2 ans d'expiration
- Rate limiting API : 10 req/s, general : 30 req/s

### A ajouter

- `Content-Security-Policy` restrictif
- `Permissions-Policy` (desactiver camera, micro, geolocalisation inutiles)
- Subresource Integrity (SRI) pour les dependances CDN
- Connexion SSL vers PostgreSQL

---

## Phase 5 — Tests de penetration (semaine 4+)

| Test | Outil suggere |
|------|--------------|
| Scan de vulnerabilites web | OWASP ZAP |
| Test d'injection SQL | sqlmap (sur environnement de test) |
| Audit des dependances | `pip audit` (backend), `pnpm audit` (frontend) |
| Scan SSL/TLS | testssl.sh ou SSL Labs |
| Scan Docker | Trivy |

---

## Points positifs deja en place

- Hachage bcrypt solide
- JWT dual token (access + refresh) avec invalidation au changement de mot de passe
- RBAC complet avec permissions
- SQLAlchemy parametrise (pas d'injection SQL)
- Audit logging complet avec masquage des champs sensibles
- Conteneurs Docker non-root
- TLS 1.2/1.3 uniquement avec HSTS
- Upload fichiers valide (MIME, taille, UUID)
- Documentation API desactivee en production
- Multi-stage Docker builds
- Network isolation entre conteneurs

---

## Details techniques par couche

### Backend (FastAPI)

**Authentification :**
- JWT avec `python-jose` + `cryptography`
- Access tokens : 30 min, refresh tokens : 7 jours
- Validation : signature, expiration, type de token, statut utilisateur
- Invalidation des sessions au changement de mot de passe via `password_changed_at`
- Rate limiting applicatif sur reset password : 5 tokens/heure/utilisateur

**Hachage mot de passe :**
- `passlib[bcrypt]>=1.7.4` avec generation de sel
- Mots de passe temporaires : `secrets.token_urlsafe(12)`

**RBAC :**
- Modeles Role et Permission
- `PermissionChecker` en dependency injection
- Super admin bypass individuel

**Validation des entrees :**
- Pydantic v2 sur tous les schemas
- `@field_validator` pour sanitisation des chaines
- `EmailStr` pour emails
- Contraintes numeriques (jour 1-31, mois 1-12)
- Types Literal pour les parametres de requete

**Upload fichiers :**
- Whitelist MIME type
- Limite 50 Mo
- Noms de fichiers UUID (prevention path traversal)
- Fichiers servis via endpoint API (pas d'acces direct)

**SQL :**
- SQLAlchemy async (v2.0+) exclusivement
- Un seul usage raw SQL (audit middleware) avec whitelist de tables
- Pool : size=10, max_overflow=20, pool_pre_ping=True

**Audit :**
- Middleware automatique sur toutes les operations d'ecriture
- Capture : utilisateur, action, table, anciennes/nouvelles valeurs, IP, user-agent
- Champs sensibles masques (`***`)

### Frontend (Nuxt 4)

**Stockage des tokens :**
- `useCookie()` avec `sameSite: 'lax'`
- `auth_token` : 7 jours, `auth_refresh_token` : 30 jours
- Cache utilisateur minimal (ID seulement)

**v-html (9 instances a risque) :**
- `RichTextRenderer.vue` : traite les liens externes mais ne sanitise pas le HTML
- `ProjetPresentation.vue` : conversion markdown sans echappement HTML
- `[slug].vue` (levees-de-fonds) : donnees API rendues sans sanitisation
- `mentions-legales/index.vue` : 5 usages avec contenu admin libre

**Anti-spam :**
- Honeypot sur `InterestForm.vue` et `SurveyRenderer.vue`
- `challenge_token` base sur timestamp (deterministe, pas cryptographique)
- Absent sur `PostulerForm.vue`

**Donnees sensibles :**
- Pas de cles API exposees cote client
- URLs API via variables d'environnement publiques
- `NUXT_INTERNAL_API_BASE` prive (SSR uniquement)

### Infrastructure

**Nginx :**
- TLS 1.2/1.3 uniquement
- Certificats Let's Encrypt avec renouvellement automatique
- Session tickets desactives
- HSTS 2 ans
- Rate limiting : API 10 req/s (burst 20), general 30 req/s (burst 50)
- Proxy headers corrects (X-Real-IP, X-Forwarded-For, X-Forwarded-Proto)

**Docker :**
- Multi-stage builds (builder -> production)
- Utilisateurs non-root (`appuser`)
- Health checks sur tous les services
- Network bridge dedie
- PostgreSQL non expose en production

**Deploiement :**
- Secrets generes via `openssl rand -hex` (256 bits)
- SSH pour execution distante
- Nettoyage des images Docker apres deploiement
