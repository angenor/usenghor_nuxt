# Installation locale de la stack de monitoring

Ce guide installe la stack Prometheus + Grafana sur un poste développeur,
en local, en moins de 15 minutes. Il s'adresse à un développeur de l'équipe
qui découvre la stack pour la première fois (FR-018, FR-019, SC-009).

---

## 1. Pré-requis

| Élément | Version | Vérification |
|---|---|---|
| Docker Engine | ≥ 24 | `docker --version` |
| Docker Compose plugin | ≥ 2.20 | `docker compose version` |
| Réseau Docker `usenghor_network` | Présent | `docker network ls \| grep usenghor_network` |
| Ports `3001` et `9090` libres sur `127.0.0.1` | — | `lsof -i :3001 -i :9090` |
| Repo `usenghor` cloné | Branche `020-monitoring-stack` ou `main` après merge | — |

Si le réseau `usenghor_network` n'existe pas, démarrez d'abord le compose
principal :

```bash
cd usenghor_backend
docker compose up -d
```

---

## 2. Configurer les variables d'environnement

Ouvrez `usenghor_backend/.env` (le créer à partir de `.env.example` si
absent) et ajoutez les trois variables Grafana en bas du fichier :

```dotenv
# Monitoring (spec 020)
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=changez-moi-en-mot-de-passe-fort
MONITORING_DOMAIN=localhost
```

> **Important** : sans `GRAFANA_ADMIN_PASSWORD`, le `docker compose up`
> échouera immédiatement avec un message explicite (sécurité D-15/D-16). Ce
> n'est pas un bug, c'est le garde-fou.

---

## 3. Démarrer la stack

```bash
cd usenghor_backend
docker compose -f docker-compose.monitoring.yml up -d
```

Compose charge automatiquement le fichier
`docker-compose.monitoring.override.yml` qui expose Prometheus sur
`127.0.0.1:9090` et Grafana sur `127.0.0.1:3001` (décision D-05 : pas
d'exposition publique, mais accessible en local).

---

## 4. Vérifier le démarrage

### 4.1 État des conteneurs

```bash
docker compose -f docker-compose.monitoring.yml ps
```

Attendu après ~90 s (durée des healthchecks) :

```
NAME                                STATUS
usenghor_monitoring_prometheus      Up (healthy)
usenghor_monitoring_grafana         Up (healthy)
usenghor_monitoring_node_exporter   Up
usenghor_monitoring_cadvisor        Up
```

### 4.2 Healthchecks HTTP

```bash
curl -sf http://127.0.0.1:9090/-/ready && echo "Prometheus OK"
curl -sf http://127.0.0.1:3001/api/health && echo "Grafana OK"
```

### 4.3 Cibles Prometheus

Ouvrir `http://127.0.0.1:9090/targets` dans le navigateur. Les deux jobs
`node-exporter` et `cadvisor` doivent être à l'état **UP**.

---

## 5. Accéder à Grafana

Ouvrir `http://127.0.0.1:3001` et se connecter avec les identifiants du
`.env`. À la première connexion, deux dashboards sont déjà disponibles
(provisionnés automatiquement) :

- **Node Exporter Full** — CPU, RAM, disque, réseau, load du poste
- **Docker / cAdvisor** — métriques par conteneur Docker

> Si vous ne voyez aucune donnée dans les graphiques, attendez 30 secondes
> (un cycle complet de scrape) puis rafraîchissez. La période par défaut
> est « Last 6 hours » : passez-la sur « Last 5 minutes » pour valider la
> collecte temps réel.

---

## 6. Arrêter la stack

```bash
docker compose -f docker-compose.monitoring.yml down
```

Les volumes `usenghor_monitoring_prometheus_data` et
`usenghor_monitoring_grafana_data` sont **préservés** : au prochain `up`,
vous retrouvez tous l'historique et les préférences.

Pour supprimer aussi les volumes (réinitialisation totale) :

```bash
docker compose -f docker-compose.monitoring.yml down -v
```

---

## 7. Dépannage rapide

| Symptôme | Cause probable | Solution |
|---|---|---|
| `error: GRAFANA_ADMIN_PASSWORD doit etre defini` | Variable absente du `.env` | Ajouter la variable, relancer |
| `network usenghor_network ... could not be found` | Compose principal jamais lancé | `docker compose up -d` dans `usenghor_backend/` |
| Port `3001` ou `9090` déjà occupé | Une autre stack tourne | `lsof -i :3001` puis arrêter le processus |
| Cibles `DOWN` sur `/targets` | cAdvisor pas prêt | Attendre 30 s, refresh |
| Grafana boucle sur la page de login | Cookies SSL bloqués en local | Vérifier que l'override a bien `GF_SECURITY_COOKIE_SECURE=false` |
| Aucune donnée dans les dashboards | Période trop ancienne | Régler la période sur « Last 5 minutes » |
| Conteneurs en `Restarting` | Mémoire insuffisante (Docker Desktop) | Augmenter la RAM allouée à Docker (≥ 4 Go) |

Pour des logs détaillés :

```bash
docker compose -f docker-compose.monitoring.yml logs -f prometheus
docker compose -f docker-compose.monitoring.yml logs -f grafana
```

---

## 8. Aller plus loin

- [acces-dashboards.md](./acces-dashboards.md) — naviguer dans les
  dashboards, interpréter les panneaux.
- [installation-vps.md](./installation-vps.md) — déployer la stack en
  production derrière Nginx + HTTPS.
- [sauvegarde-restauration.md](./sauvegarde-restauration.md) — sauvegarder
  et restaurer les volumes Prometheus et Grafana.
