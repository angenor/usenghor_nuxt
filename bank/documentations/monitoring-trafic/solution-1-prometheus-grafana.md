# Solution 1 — Monitoring technique avec Prometheus + Grafana

## Objectif

Mettre en place une observabilité technique complète du site Usenghor (FastAPI + Nuxt + PostgreSQL + Nginx, déployés en Docker) afin de :

1. Mesurer la consommation CPU/RAM/réseau du VPS et de chaque conteneur Docker.
2. Mesurer les requêtes par seconde, la latence (p50/p95/p99) et le taux d'erreur **par endpoint FastAPI**.
3. Mesurer les requêtes Nginx (codes HTTP, débit, latence).
4. Identifier les goulots d'étranglement applicatifs afin de préparer un futur **découpage en microservices** (quel module consomme le plus de CPU/RAM/temps cumulé, quels endpoints sont candidats à extraction).

---

## Prompt à coller dans GitHub Spec Kit (`/speckit.specify`)

> Copier-coller le bloc ci-dessous tel quel dans la commande `/speckit.specify` pour générer la spec, puis enchaîner avec `/speckit.clarify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement`.

```
Mettre en place une stack de monitoring technique pour le projet Usenghor (monorepo Nuxt 4 + FastAPI + PostgreSQL 16 + Nginx, déployé via Docker Compose sur un VPS). L'objectif est de collecter, stocker et visualiser des métriques techniques afin d'identifier les goulots d'étranglement et de préparer un futur découpage en microservices.

## Périmètre fonctionnel

1. **Collecte de métriques système (VPS)** : CPU, RAM, disque, réseau, charge moyenne, via `node-exporter`.
2. **Collecte de métriques par conteneur Docker** : CPU, RAM, I/O, réseau par conteneur (`usenghor_nginx`, `usenghor_frontend`, `usenghor_backend`, `usenghor_db`), via `cAdvisor`.
3. **Collecte de métriques applicatives FastAPI** :
   - Requêtes par seconde par endpoint et par méthode HTTP.
   - Latence (histogramme : p50, p95, p99) par endpoint.
   - Taux d'erreurs (codes 4xx / 5xx) par endpoint.
   - Nombre de requêtes en cours.
   - Utiliser `prometheus-fastapi-instrumentator` (intégration en quelques lignes dans `usenghor_backend/app/main.py`).
   - Exposer l'endpoint `/metrics` sur le backend (protégé : accessible uniquement depuis le réseau Docker interne, pas publié vers l'extérieur).
4. **Collecte de métriques Nginx** : requêtes/s, codes HTTP, connexions actives, via `nginx-prometheus-exporter` (nécessite l'activation du module `stub_status` dans la configuration Nginx).
5. **Collecte de métriques PostgreSQL** : connexions actives, transactions/s, taille de la base, requêtes lentes, via `postgres-exporter`.
6. **Stockage** : `Prometheus` (rétention 30 jours, volume Docker dédié).
7. **Visualisation** : `Grafana` avec dashboards préfaits importés automatiquement au démarrage (provisioning) :
   - Dashboard Node Exporter Full (ID 1860)
   - Dashboard cAdvisor / Docker monitoring (ID 193 ou 14282)
   - Dashboard FastAPI (ID 14282 pour `prometheus-fastapi-instrumentator`)
   - Dashboard Nginx (ID 12708)
   - Dashboard PostgreSQL (ID 9628)
8. **Sécurité** :
   - Grafana protégé par authentification (admin + mot de passe via variables d'environnement, jamais en clair).
   - Prometheus et exporters non exposés publiquement (réseau Docker interne uniquement).
   - Accès Grafana via `https://monitoring.usenghor.<domaine>` derrière le Nginx existant + Let's Encrypt.
9. **Alertes (optionnel, phase 2)** : Alertmanager pour notifications email lorsque CPU > 90% pendant 5 min, RAM > 90%, disque > 85%, ou taux d'erreur 5xx > 5%.

## Contraintes techniques

- Utiliser Docker Compose, fichier dédié `docker-compose.monitoring.yml` (ou intégration dans le `docker-compose.yml` existant via profil `monitoring`).
- Tous les conteneurs doivent rejoindre le réseau Docker existant du projet pour scraper les services.
- Volumes Docker persistants pour les données Prometheus et Grafana.
- Provisioning Grafana en YAML : datasource Prometheus + dashboards JSON importés automatiquement.
- Ressources cibles maximales : Prometheus ~300 MB RAM, Grafana ~150 MB RAM, exporters ~50 MB chacun (~700 MB RAM au total).
- Compatible avec le script `deploy.sh` existant (ajouter une commande `./deploy.sh monitoring up|down|logs`).
- Documentation à jour dans `usenghor_nuxt/bank/documentations/monitoring-trafic/` :
  - Architecture (schéma des conteneurs et flux de scraping).
  - Procédure d'installation locale et VPS.
  - Procédure d'accès aux dashboards.
  - Procédure de sauvegarde/restauration des données Prometheus et Grafana.

## Livrables attendus

1. `usenghor_backend/docker-compose.monitoring.yml` (ou modification du compose existant).
2. `usenghor_backend/monitoring/prometheus/prometheus.yml` (configuration de scraping).
3. `usenghor_backend/monitoring/grafana/provisioning/datasources/prometheus.yml`.
4. `usenghor_backend/monitoring/grafana/provisioning/dashboards/*.json` (dashboards importés).
5. Modification de `usenghor_backend/app/main.py` pour ajouter `prometheus-fastapi-instrumentator`.
6. Mise à jour `usenghor_backend/requirements.txt` (ajout `prometheus-fastapi-instrumentator`).
7. Modification de la configuration Nginx pour activer `stub_status` (interne uniquement).
8. Modification du `deploy.sh` (commande `monitoring`).
9. Documentation complète en français dans `usenghor_nuxt/bank/documentations/monitoring-trafic/`.
10. Variables d'environnement documentées dans `.env.example` :
    - `GRAFANA_ADMIN_USER`
    - `GRAFANA_ADMIN_PASSWORD`
    - `POSTGRES_EXPORTER_DSN`
    - `MONITORING_DOMAIN` (ex. `monitoring.usenghor.org`)

## Critères d'acceptation

- [ ] Après `docker compose --profile monitoring up -d`, tous les conteneurs (`prometheus`, `grafana`, `node-exporter`, `cadvisor`, `nginx-exporter`, `postgres-exporter`) démarrent sans erreur.
- [ ] Prometheus affiche tous les targets en état `UP` sur `http://localhost:9090/targets`.
- [ ] Grafana est accessible sur `http://localhost:3001` (local) avec authentification.
- [ ] Les 5 dashboards préfaits s'affichent automatiquement et présentent des données réelles.
- [ ] Le dashboard FastAPI affiche au moins 3 endpoints réels avec des métriques de latence et de taux de requêtes.
- [ ] L'endpoint `/metrics` du backend FastAPI n'est PAS accessible depuis Internet public.
- [ ] La documentation permet à un nouveau développeur de relancer la stack en moins de 15 minutes.
- [ ] La rétention Prometheus de 30 jours est validée par configuration explicite (`--storage.tsdb.retention.time=30d`).

## Hors périmètre (à exclure de cette spec)

- Monitoring du trafic visiteurs (Umami / Plausible) — fera l'objet d'une autre spec.
- Logs centralisés (Loki, ELK) — fera l'objet d'une autre spec.
- Tracing distribué (Jaeger, Tempo) — pertinent après le découpage en microservices.
- Alertmanager (phase 2, à spécifier séparément après stabilisation).
```

---

## Workflow Spec Kit recommandé

```bash
# 1. Générer la spécification
/speckit.specify <coller le prompt ci-dessus>

# 2. Lever les ambiguïtés (5 questions max)
/speckit.clarify

# 3. Générer le plan technique
/speckit.plan

# 4. Découper en tâches ordonnées
/speckit.tasks

# 5. (Optionnel) Vérifier la cohérence
/speckit.analyze

# 6. Exécuter l'implémentation
/speckit.implement
```

---

## Notes pratiques

- Les IDs Grafana mentionnés (1860, 193, 14282, 12708, 9628) sont publics et téléchargeables depuis [grafana.com/grafana/dashboards](https://grafana.com/grafana/dashboards/).
- L'instrumentation FastAPI se résume à :
  ```python
  from prometheus_fastapi_instrumentator import Instrumentator
  Instrumentator().instrument(app).expose(app, endpoint="/metrics", include_in_schema=False)
  ```
- Pour le découpage en microservices à venir, surveiller particulièrement dans Grafana :
  - **Top 10 des endpoints par temps CPU cumulé** (latence × requêtes/s) → candidats à extraction.
  - **Corrélation pics RAM ↔ endpoint** → identifier les modules gourmands.
  - **Latence p95 par préfixe d'URL** (`/api/admin/*`, `/api/public/*`, `/api/auth/*`) → mesurer l'impact relatif de chaque domaine fonctionnel.
