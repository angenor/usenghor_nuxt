# Spec 2 — Instrumentation FastAPI : métriques par endpoint

## Pré-requis

La **Spec 1 (socle)** doit être déployée et fonctionnelle : Prometheus + Grafana opérationnels.

## Objectif

Instrumenter le backend FastAPI pour exposer des métriques applicatives détaillées : **requêtes par seconde, latence (p50/p95/p99), taux d'erreur, par endpoint**. C'est la donnée clé pour identifier les candidats à un découpage en microservices.

---

## Prompt à coller dans `/speckit.specify`

```
Instrumenter le backend FastAPI du projet Usenghor pour exposer des métriques Prometheus détaillées par endpoint. Le socle Prometheus + Grafana est déjà en place (cf. spec-1-socle). Cette spec ajoute la collecte applicative.

## Contexte

- Backend : FastAPI (Python 3.14), conteneur Docker `usenghor_backend`.
- Stack Prometheus + Grafana déjà opérationnelle dans le réseau Docker.
- Objectif métier : identifier les endpoints les plus consommateurs (CPU cumulé = latence × requêtes/s) afin de planifier un futur découpage en microservices.

## Périmètre fonctionnel

1. **Instrumentation FastAPI** via la bibliothèque `prometheus-fastapi-instrumentator` :
   - Métriques par endpoint, méthode HTTP et code de statut.
   - Histogramme de latence (buckets adaptés : 5ms, 10ms, 25ms, 50ms, 100ms, 250ms, 500ms, 1s, 2.5s, 5s, 10s).
   - Compteur de requêtes en cours.
   - Compteur d'exceptions par type.
2. **Endpoint `/metrics`** exposé par FastAPI :
   - Accessible uniquement depuis le réseau Docker interne.
   - NON exposé via Nginx public (refus 403/404 si requête externe).
   - Exclu du schéma OpenAPI (`include_in_schema=False`).
   - Pas d'authentification requise sur le réseau interne (Prometheus scrape directement).
3. **Job de scraping Prometheus** :
   - Nouveau job `fastapi-backend` dans `prometheus.yml`.
   - Target : `usenghor_backend:8000` (nom du conteneur sur le réseau Docker).
   - Intervalle de scraping : 15 secondes.
4. **Dashboard Grafana FastAPI** :
   - Importer le dashboard ID 14282 (prometheus-fastapi-instrumentator) via provisioning.
   - Ajuster les variables (datasource, job) pour correspondre au job `fastapi-backend`.
5. **Labels exclus** :
   - Exclure les endpoints à fort cardinalité ou peu utiles : `/api/docs`, `/api/openapi.json`, `/api/redoc`, `/metrics`, `/health`.
   - Grouper les paths paramétrés (`/api/admin/users/{id}` au lieu de générer une métrique par UUID).

## Contraintes techniques

- Ajouter `prometheus-fastapi-instrumentator` dans `usenghor_backend/requirements.txt` (version stable récente).
- Modification minimale de `usenghor_backend/app/main.py` (idéalement 2-3 lignes : import + appel `Instrumentator().instrument(app).expose(...)`).
- Aucun impact sur les performances : l'instrumentator doit ajouter < 1ms de latence par requête.
- Le `/metrics` doit fonctionner aussi en local (Docker Compose dev) sans nécessiter de configuration supplémentaire.
- Compatible avec les routers existants (admin, public, auth).

## Livrables attendus

1. Modification `usenghor_backend/requirements.txt` (ajout dépendance).
2. Modification `usenghor_backend/app/main.py` (instrumentation).
3. (Optionnel) `usenghor_backend/app/monitoring.py` si la configuration de l'instrumentator est non-triviale (groupement des paths, exclusions).
4. Modification `usenghor_backend/monitoring/prometheus/prometheus.yml` (ajout du job `fastapi-backend`).
5. `usenghor_backend/monitoring/grafana/provisioning/dashboards/fastapi.json` (dashboard 14282).
6. Vérification Nginx : confirmer que `/metrics` n'est PAS routé publiquement (ou ajouter une règle de refus explicite).
7. Mise à jour de la documentation française dans `usenghor_nuxt/bank/documentations/monitoring-trafic/` :
   - Comment vérifier que les métriques arrivent.
   - Comment lire le dashboard FastAPI.
   - Comment identifier un endpoint "candidat microservice" (top temps CPU cumulé).

## Critères d'acceptation

- [ ] `curl http://usenghor_backend:8000/metrics` depuis un conteneur du réseau Docker retourne du texte Prometheus avec des métriques `http_request_*`.
- [ ] `curl https://<DOMAINE_PUBLIC>/metrics` retourne 404 ou 403 (pas exposé publiquement).
- [ ] `/api/docs` (Swagger) ne liste PAS l'endpoint `/metrics`.
- [ ] Page `http://localhost:9090/targets` affiche le job `fastapi-backend` en état `UP`.
- [ ] Le dashboard FastAPI dans Grafana affiche au minimum 5 endpoints réels avec :
  - Taux de requêtes (req/s).
  - Latence p50, p95, p99.
  - Codes de statut HTTP.
- [ ] Après navigation dans l'application pendant 2 minutes, des données apparaissent dans les graphes.
- [ ] Aucune régression : tous les endpoints existants continuent de fonctionner normalement.
- [ ] La latence ajoutée par l'instrumentation est mesurable et < 1ms (vérifier sur un endpoint léger).

## Hors périmètre

- Métriques métier custom (nombre d'utilisateurs créés, etc.) — phase ultérieure si besoin.
- Tracing distribué — pas dans ce projet.
- Instrumentation du frontend Nuxt — pas pertinent à ce stade.
- Alertes sur taux d'erreur — spec 4.
```

---

## Workflow Spec Kit

```bash
/speckit.specify <coller le prompt ci-dessus>
/speckit.clarify
/speckit.plan
/speckit.tasks
/speckit.implement
```

## Snippet de référence (instrumentation FastAPI)

```python
# usenghor_backend/app/main.py
from prometheus_fastapi_instrumentator import Instrumentator

# ... création de l'app FastAPI ...

Instrumentator(
    should_group_status_codes=False,
    should_ignore_untemplated=True,
    should_group_untemplated=True,
    excluded_handlers=["/metrics", "/health", "/api/docs", "/api/openapi.json", "/api/redoc"],
).instrument(app).expose(app, endpoint="/metrics", include_in_schema=False)
```

## Lecture du dashboard pour préparer le découpage microservices

Critères à observer dans Grafana :

1. **Top 10 endpoints par `rate(http_request_duration_seconds_sum[5m])`** → temps CPU cumulé le plus élevé.
2. **Endpoints avec latence p95 > 500ms** → candidats à isolation.
3. **Endpoints avec pics de RAM corrélés** (croiser avec dashboard cAdvisor) → traitements lourds.
4. **Préfixes d'URL dominants** (`/api/admin/*` vs `/api/public/*` vs `/api/auth/*`) → frontières naturelles de découpage.
