# Spec 3 — Exporters Nginx et PostgreSQL

## Pré-requis

Les **Specs 1 (socle) et 2 (FastAPI)** doivent être déployées et fonctionnelles.

## Objectif

Ajouter la visibilité sur les **deux couches d'infrastructure restantes** : Nginx (point d'entrée HTTP) et PostgreSQL (base de données). Ces métriques complètent la vue 360° pour identifier les goulots d'étranglement réseau et data.

---

## Prompt à coller dans `/speckit.specify`

```
Ajouter deux exporters Prometheus au monitoring du projet Usenghor pour collecter les métriques Nginx et PostgreSQL. Le socle Prometheus + Grafana + node-exporter + cAdvisor (spec 1) et l'instrumentation FastAPI (spec 2) sont déjà en place.

## Contexte

- Nginx : conteneur `usenghor_nginx`, reverse proxy public.
- PostgreSQL : conteneur `usenghor_db` (prod) / `usenghor_postgres` (local), version 16.
- Stack monitoring déjà opérationnelle dans le réseau Docker.

## Périmètre fonctionnel

### Partie 1 — Nginx

1. **Activation du module `stub_status` Nginx** :
   - Ajouter un bloc `location /nginx_status` dans la configuration Nginx.
   - Accessible uniquement depuis le réseau Docker interne (`allow 172.0.0.0/8; deny all;` ou équivalent).
   - PAS exposé publiquement via le domaine principal.
2. **Conteneur `nginx-prometheus-exporter`** :
   - Image officielle `nginx/nginx-prometheus-exporter`.
   - Configuration via flag `-nginx.scrape-uri=http://usenghor_nginx/nginx_status`.
   - Rejoint le réseau Docker existant.
3. **Job Prometheus `nginx`** :
   - Target : `nginx-exporter:9113`.
   - Intervalle de scraping : 15 secondes.
4. **Dashboard Grafana Nginx** :
   - Importer le dashboard ID 12708 (Nginx exporter).
   - Provisionnement automatique.

### Partie 2 — PostgreSQL

1. **Conteneur `postgres-exporter`** :
   - Image officielle `prometheuscommunity/postgres-exporter`.
   - Connexion via DSN : variable d'environnement `POSTGRES_EXPORTER_DSN`.
   - Utilisateur PostgreSQL dédié `monitoring_user` avec permissions minimales (lecture seule des vues `pg_stat_*`).
2. **Création de l'utilisateur PostgreSQL** :
   - Migration SQL dans `usenghor_backend/documentation/modele_de_données/migrations/` (numérotée selon convention).
   - Permissions : `CONNECT`, `SELECT` sur les vues système Prometheus a besoin.
   - Mot de passe via variable d'environnement, jamais en clair.
3. **Job Prometheus `postgres`** :
   - Target : `postgres-exporter:9187`.
   - Intervalle de scraping : 30 secondes (BDD moins critique en temps réel).
4. **Dashboard Grafana PostgreSQL** :
   - Importer le dashboard ID 9628 (PostgreSQL Database).
   - Provisionnement automatique.

## Contraintes techniques

- Aucune exposition publique des endpoints `/metrics` ou `/nginx_status`.
- Utilisateur PostgreSQL `monitoring_user` créé via migration SQL versionnée (pas de modification manuelle).
- Les deux exporters rejoignent le réseau Docker existant.
- Compatible avec l'environnement local (`usenghor_postgres`) ET la production (`usenghor_db`) — DSN paramétré.
- Ressources cibles : nginx-exporter ~20 MB RAM, postgres-exporter ~50 MB RAM.

## Livrables attendus

1. Modification de la configuration Nginx (`usenghor_backend/nginx/` ou équivalent) pour activer `stub_status` en interne uniquement.
2. Modification `usenghor_backend/docker-compose.monitoring.yml` : ajout des services `nginx-exporter` et `postgres-exporter`.
3. Modification `usenghor_backend/monitoring/prometheus/prometheus.yml` : ajout des jobs `nginx` et `postgres`.
4. `usenghor_backend/monitoring/grafana/provisioning/dashboards/nginx.json` (ID 12708).
5. `usenghor_backend/monitoring/grafana/provisioning/dashboards/postgresql.json` (ID 9628).
6. Migration SQL `usenghor_backend/documentation/modele_de_données/migrations/0XX_monitoring_user.sql` :
   - Création du rôle `monitoring_user`.
   - Grants minimaux requis par `postgres-exporter`.
7. Mise à jour `.env.example` :
   - `POSTGRES_EXPORTER_USER=monitoring_user`
   - `POSTGRES_EXPORTER_PASSWORD=<placeholder>`
   - `POSTGRES_EXPORTER_DSN=postgresql://monitoring_user:<password>@usenghor_db:5432/usenghor?sslmode=disable`
8. Mise à jour de la documentation française dans `usenghor_nuxt/bank/documentations/monitoring-trafic/` :
   - Procédure d'application de la migration `monitoring_user`.
   - Lecture des dashboards Nginx et PostgreSQL.
   - Indicateurs clés à surveiller (connexions actives, requêtes lentes, codes HTTP).

## Critères d'acceptation

- [ ] `curl http://usenghor_nginx/nginx_status` depuis un conteneur interne retourne les stats Nginx.
- [ ] `curl https://<DOMAINE_PUBLIC>/nginx_status` retourne 403 ou 404.
- [ ] Page `http://localhost:9090/targets` affiche les jobs `nginx` et `postgres` en état `UP`.
- [ ] Le dashboard Nginx affiche : requêtes/s, connexions actives, requêtes en cours.
- [ ] Le dashboard PostgreSQL affiche : connexions actives, transactions/s, taille de la BDD, top requêtes (si `pg_stat_statements` activé).
- [ ] La migration SQL s'applique sans erreur sur une base vierge ET sur une base existante.
- [ ] L'utilisateur `monitoring_user` ne peut PAS modifier ni lire de données métier (test : `SELECT * FROM users` doit échouer).
- [ ] Aucune régression : Nginx continue de servir le site normalement, PostgreSQL reste performant.

## Hors périmètre

- Alertes sur connexions PostgreSQL ou erreurs Nginx — spec 4.
- Slow query log PostgreSQL — peut être ajouté en option si pertinent.
- Métriques Redis / cache — pas dans ce projet.
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

## Snippets de référence

### Bloc Nginx `stub_status` (interne uniquement)

```nginx
server {
    listen 80;
    server_name _;

    location /nginx_status {
        stub_status on;
        access_log off;
        allow 172.16.0.0/12;   # réseau Docker
        allow 127.0.0.1;
        deny all;
    }
}
```

### Permissions minimales `monitoring_user`

```sql
CREATE ROLE monitoring_user WITH LOGIN PASSWORD '<from_env>';
GRANT pg_monitor TO monitoring_user;
GRANT CONNECT ON DATABASE usenghor TO monitoring_user;
```

Le rôle système `pg_monitor` donne accès aux vues `pg_stat_*` sans exposer les données métier.
