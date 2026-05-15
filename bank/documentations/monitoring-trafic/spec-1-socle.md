# Spec 1 — Socle monitoring : Prometheus + Grafana + node-exporter + cAdvisor

## Objectif

Mettre en place la **fondation** de l'observabilité technique : collecter et visualiser les métriques système du VPS (CPU, RAM, disque, réseau) et les métriques par conteneur Docker, **sans toucher au code applicatif**.

À la fin de cette spec, on doit voir dans Grafana les performances du VPS et la consommation de chaque conteneur (`usenghor_nginx`, `usenghor_frontend`, `usenghor_backend`, `usenghor_db`).

---

## Prompt à coller dans `/speckit.specify`

```
Mettre en place le socle d'une stack de monitoring technique pour le projet Usenghor (monorepo Nuxt 4 + FastAPI + PostgreSQL 16 + Nginx, déployé via Docker Compose sur un VPS). Cette première itération couvre uniquement la collecte des métriques système et conteneurs, sans instrumentation applicative.

## Périmètre fonctionnel

1. **Stack Docker Compose dédiée** (`docker-compose.monitoring.yml` à la racine du backend, ou profil `monitoring` dans le compose existant).
2. **Prometheus** : stockage time-series, rétention 30 jours, volume Docker persistant.
3. **Grafana** : visualisation, authentification activée, volume persistant.
4. **node-exporter** : métriques du VPS (CPU, RAM, disque, réseau, load average).
5. **cAdvisor** : métriques par conteneur Docker (CPU, RAM, I/O, réseau).
6. **Provisioning Grafana automatique** :
   - Datasource Prometheus (YAML).
   - Dashboard "Node Exporter Full" (ID 1860).
   - Dashboard "Docker / cAdvisor" (ID 193 ou équivalent récent).
7. **Sécurité** :
   - Prometheus, node-exporter, cAdvisor : réseau Docker interne uniquement, AUCUN port publié vers l'hôte ou Internet.
   - Grafana : authentification admin obligatoire (user + password via variables d'environnement, jamais en clair).
   - Accès Grafana en production via `https://monitoring.<DOMAINE>` derrière le Nginx existant + Let's Encrypt.
   - En local : Grafana accessible sur `http://localhost:3001`.

## Contraintes techniques

- Tous les conteneurs rejoignent le réseau Docker existant pour permettre le scraping ultérieur des services applicatifs.
- Configuration Prometheus : `prometheus.yml` avec jobs pour `node-exporter` et `cadvisor` uniquement (les autres jobs viendront dans les specs suivantes).
- Rétention configurée explicitement : `--storage.tsdb.retention.time=30d`.
- Cible RAM maximale : Prometheus ~300 MB, Grafana ~150 MB, node-exporter ~30 MB, cAdvisor ~100 MB (~600 MB total).
- Compatible avec le `deploy.sh` existant : ajouter une commande `./deploy.sh monitoring up|down|logs|status`.
- Aucune modification du code applicatif (Nuxt, FastAPI) à ce stade.

## Livrables attendus

1. `usenghor_backend/docker-compose.monitoring.yml` (ou modification du compose existant avec profil).
2. `usenghor_backend/monitoring/prometheus/prometheus.yml`.
3. `usenghor_backend/monitoring/grafana/provisioning/datasources/prometheus.yml`.
4. `usenghor_backend/monitoring/grafana/provisioning/dashboards/dashboards.yml` (config loader).
5. `usenghor_backend/monitoring/grafana/provisioning/dashboards/node-exporter-full.json` (ID 1860).
6. `usenghor_backend/monitoring/grafana/provisioning/dashboards/docker-cadvisor.json` (ID 193).
7. Configuration Nginx pour reverse proxy `monitoring.<DOMAINE>` → Grafana.
8. Mise à jour du `deploy.sh` (commandes `monitoring up|down|logs|status`).
9. Mise à jour `.env.example` avec :
   - `GRAFANA_ADMIN_USER`
   - `GRAFANA_ADMIN_PASSWORD`
   - `MONITORING_DOMAIN`
10. Documentation française dans `usenghor_nuxt/bank/documentations/monitoring-trafic/` :
    - Installation locale (étape par étape).
    - Installation VPS (étape par étape).
    - Procédure d'accès aux dashboards.
    - Procédure de sauvegarde/restauration des volumes Prometheus et Grafana.

## Critères d'acceptation

- [ ] `docker compose --profile monitoring up -d` démarre 4 conteneurs sans erreur : `prometheus`, `grafana`, `node-exporter`, `cadvisor`.
- [ ] Page `http://localhost:9090/targets` affiche les 2 targets en état `UP`.
- [ ] Grafana est accessible sur `http://localhost:3001` et exige une authentification.
- [ ] Les 2 dashboards préfaits s'affichent automatiquement après login, avec données réelles (CPU, RAM, conteneurs).
- [ ] Le port Prometheus (9090) n'est PAS exposé en production (ufw/iptables ou simplement pas de mapping `ports:`).
- [ ] En production, `https://monitoring.<DOMAINE>` fonctionne avec certificat valide.
- [ ] Le script `./deploy.sh monitoring up` lance la stack ; `./deploy.sh monitoring status` affiche l'état.
- [ ] La documentation permet à un nouveau développeur de relancer la stack en moins de 15 minutes.

## Hors périmètre (specs suivantes)

- Instrumentation FastAPI (spec 2).
- Exporters Nginx et PostgreSQL (spec 3).
- Alertmanager / notifications email (spec 4).
- Logs centralisés (Loki) — pas dans ce projet.
- Tracing distribué (Jaeger) — pas dans ce projet.
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

## Notes pratiques

- Les dashboards Grafana sont téléchargeables depuis [grafana.com/grafana/dashboards](https://grafana.com/grafana/dashboards/).
- cAdvisor nécessite des montages spécifiques (`/var/run/docker.sock`, `/sys`, `/var/lib/docker/`) en lecture seule.
- Sur macOS local, cAdvisor peut nécessiter des ajustements (limites Docker Desktop) — documenter le cas échéant.
