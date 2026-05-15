# Spec 4 — Alertmanager : notifications email

## Pré-requis

Les **Specs 1, 2 et 3** doivent être déployées et fonctionnelles. Le SMTP du projet (configuré pour les emails transactionnels, cf. spec 005) doit être opérationnel.

## Objectif

Ajouter un **système d'alertes proactives** par email pour être notifié en cas d'anomalie : saturation ressources, pannes de service, pics d'erreurs HTTP. Cette spec rend le monitoring opérationnel 24/7 sans surveillance manuelle.

---

## Prompt à coller dans `/speckit.specify`

```
Ajouter un système d'alertes Prometheus + Alertmanager au monitoring du projet Usenghor pour recevoir des notifications email en cas d'anomalie. Les specs 1 (socle), 2 (FastAPI) et 3 (Nginx + PostgreSQL) sont déployées et le SMTP du projet est opérationnel.

## Contexte

- SMTP déjà configuré pour les emails transactionnels (variables `SMTP_*` dans `.env`).
- Email de réception des alertes : variable d'environnement `ALERT_RECIPIENT_EMAIL` (ex. ops@usenghor.org).
- Stack monitoring complète : Prometheus, Grafana, node-exporter, cAdvisor, fastapi instrumentator, nginx-exporter, postgres-exporter.

## Périmètre fonctionnel

1. **Conteneur Alertmanager** :
   - Image officielle `prom/alertmanager`.
   - Rejoint le réseau Docker existant.
   - Volume persistant pour l'historique des alertes.
   - Configuration via `alertmanager.yml` (provisioning).
2. **Configuration SMTP Alertmanager** :
   - Réutilise les variables SMTP existantes (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`).
   - Destinataire des alertes : `ALERT_RECIPIENT_EMAIL`.
   - Format des emails : sujet clair (`[CRITICAL] CPU > 90% sur usenghor_backend`), corps avec contexte (valeur, durée, lien Grafana).
3. **Règles d'alerte Prometheus** dans `prometheus/rules/alerts.yml` :

   **Niveau CRITICAL (notification immédiate)**
   - VPS down (Prometheus ne scrape plus node-exporter pendant 2 min).
   - CPU > 90% pendant 10 min.
   - RAM > 90% pendant 5 min.
   - Disque > 85% (alerte) ou > 95% (critique).
   - Conteneur Docker redémarré plus de 3 fois en 15 min.
   - Backend FastAPI down (job `fastapi-backend` en état DOWN > 2 min).
   - PostgreSQL down (job `postgres` en état DOWN > 2 min).
   - Nginx down.

   **Niveau WARNING (notification groupée)**
   - Taux d'erreur 5xx > 5% sur 5 min (par endpoint).
   - Latence p95 > 2 secondes sur 10 min (par endpoint).
   - Connexions PostgreSQL > 80% du max_connections.
   - Disque > 75%.
   - RAM > 80% pendant 15 min.

4. **Groupement et déduplication** :
   - Grouper les alertes par `alertname` et `severity`.
   - Délai de groupement : 30 secondes.
   - Intervalle de répétition (si non résolue) : 4 heures.
5. **Inhibition** :
   - Si une alerte CRITICAL "service down" est active, supprimer les alertes WARNING liées au même service.
6. **Visualisation dans Grafana** :
   - Ajouter Alertmanager comme datasource secondaire.
   - Dashboard d'aperçu des alertes actives.

## Contraintes techniques

- Toutes les règles d'alerte testables avec `promtool check rules`.
- Pas d'alerte "bruyante" : seuils calibrés pour éviter le faux positif (durée minimale avant déclenchement).
- Templates d'emails en HTML simple et lisible (en français).
- Variables d'environnement pour tous les seuils sensibles (permet ajustement sans rebuild).
- Documentation des seuils et de leur justification.

## Livrables attendus

1. Modification `usenghor_backend/docker-compose.monitoring.yml` : ajout du service `alertmanager`.
2. `usenghor_backend/monitoring/alertmanager/alertmanager.yml` : configuration SMTP + routing.
3. `usenghor_backend/monitoring/alertmanager/templates/email.tmpl` : template HTML des emails (français).
4. `usenghor_backend/monitoring/prometheus/rules/alerts.yml` : règles d'alerte.
5. Modification `usenghor_backend/monitoring/prometheus/prometheus.yml` :
   - Section `alerting` pointant vers `alertmanager:9093`.
   - Section `rule_files` incluant `/etc/prometheus/rules/*.yml`.
6. Mise à jour `.env.example` :
   - `ALERT_RECIPIENT_EMAIL`
   - `ALERT_THRESHOLD_CPU_PCT=90`
   - `ALERT_THRESHOLD_RAM_PCT=90`
   - `ALERT_THRESHOLD_DISK_PCT=85`
   - `ALERT_THRESHOLD_ERROR_RATE_PCT=5`
7. Modification du `deploy.sh` : intégrer Alertmanager dans la commande `monitoring`.
8. Mise à jour de la documentation française dans `usenghor_nuxt/bank/documentations/monitoring-trafic/` :
   - Liste exhaustive des alertes et leur justification.
   - Procédure de test des alertes (déclencher artificiellement).
   - Procédure de silencing temporaire (maintenance).
   - Runbook : que faire quand telle alerte se déclenche.

## Critères d'acceptation

- [ ] `docker compose --profile monitoring up -d` démarre Alertmanager sans erreur.
- [ ] Page `http://localhost:9093` (Alertmanager UI) accessible en local.
- [ ] `promtool check rules /etc/prometheus/rules/alerts.yml` retourne `SUCCESS`.
- [ ] Page `http://localhost:9090/alerts` (Prometheus) liste toutes les règles en état `inactive` ou `firing`.
- [ ] Test manuel : forcer une alerte (ex. `stress` sur CPU pendant 11 min) déclenche un email reçu sur `ALERT_RECIPIENT_EMAIL`.
- [ ] Test manuel : arrêter `usenghor_backend` déclenche l'alerte "Backend down" en moins de 3 min.
- [ ] Les alertes WARNING ne déclenchent PAS d'email si une CRITICAL liée est déjà active.
- [ ] Le dashboard Grafana "Alerts overview" affiche les alertes actives.
- [ ] Aucune fausse alerte pendant 24h d'observation en conditions normales.
- [ ] Documentation runbook claire pour chaque alerte (action recommandée à l'opérateur).

## Hors périmètre

- Notifications Slack / Discord / Telegram — possible évolution ultérieure.
- Alertes métier (nombre de candidatures, erreurs spécifiques) — pas dans ce projet.
- Escalade automatique (PagerDuty, OpsGenie) — pas dans ce projet.
- Auto-remediation (redémarrage automatique de service) — risqué, hors périmètre.
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

## Exemple de règle d'alerte (référence)

```yaml
# prometheus/rules/alerts.yml
groups:
  - name: system
    interval: 30s
    rules:
      - alert: HighCPU
        expr: 100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 90
        for: 10m
        labels:
          severity: critical
        annotations:
          summary: "CPU > 90% sur {{ $labels.instance }}"
          description: "CPU à {{ $value | humanize }}% depuis 10 minutes."

  - name: application
    rules:
      - alert: BackendDown
        expr: up{job="fastapi-backend"} == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Backend FastAPI indisponible"
          description: "Prometheus ne peut plus scraper le backend depuis 2 minutes."
```

## Conseil opérationnel

Démarrer avec **uniquement les alertes CRITICAL** la première semaine. Observer les déclenchements, ajuster les seuils, puis activer les WARNING progressivement. Une alerte qui se déclenche trop souvent finit ignorée.
