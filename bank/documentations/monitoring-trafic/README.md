# Monitoring trafic — Documentation

## Objectif global

Mettre en place une **observabilité technique** complète du projet Usenghor (Nuxt 4 + FastAPI + PostgreSQL 16 + Nginx, déployés via Docker Compose) afin de :

- Mesurer la consommation CPU/RAM/réseau du VPS et de chaque conteneur.
- Mesurer les requêtes/s, latence (p50/p95/p99) et erreurs par endpoint FastAPI.
- Mesurer le débit Nginx et la santé PostgreSQL.
- Préparer un **découpage en microservices** en identifiant les modules gourmands.

## Approche : 4 specs incrémentales

Le périmètre est trop large pour une seule spec Spec Kit. Il est découpé en 4 livraisons indépendantes et testables :

| Ordre | Spec | Objectif | Durée estimée |
|-------|------|----------|---------------|
| 1 | [`spec-1-socle.md`](./spec-1-socle.md) | Socle Prometheus + Grafana + node-exporter + cAdvisor | 1-2h |
| 2 | [`spec-2-fastapi.md`](./spec-2-fastapi.md) | Instrumentation FastAPI (métriques par endpoint) | 30-45 min |
| 3 | [`spec-3-nginx-postgres.md`](./spec-3-nginx-postgres.md) | Exporters Nginx + PostgreSQL | 1h |
| 4 | [`spec-4-alertmanager.md`](./spec-4-alertmanager.md) | Alertes email (CPU, RAM, disque, 5xx) | 1h |

> **Recommandation** : exécuter les specs dans l'ordre. Chaque spec est mergeable indépendamment et le système est fonctionnel dès la fin de la Spec 1.

## Workflow Spec Kit (à répéter pour chaque spec)

```bash
/speckit.specify <coller le prompt de la spec>
/speckit.clarify        # 5 questions max
/speckit.plan
/speckit.tasks
/speckit.analyze        # optionnel : vérifier cohérence
/speckit.implement
```

## Document de référence

[`solution-1-prometheus-grafana.md`](./solution-1-prometheus-grafana.md) — analyse initiale et choix de stack (conservé pour référence).
