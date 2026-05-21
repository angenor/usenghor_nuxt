# Accès et lecture des dashboards de monitoring

Ce guide explique comment se connecter à Grafana, naviguer entre les deux
dashboards livrés (Node Exporter Full et Docker / cAdvisor), et lire les
panneaux clés. Public visé : administrateur ou développeur qui consulte
l'observabilité, sans connaissance préalable de Grafana.

---

## 1. URL et identifiants

| Environnement | URL | Identifiants |
|---|---|---|
| Local | `http://127.0.0.1:3001` | `GRAFANA_ADMIN_USER` / `GRAFANA_ADMIN_PASSWORD` du `usenghor_backend/.env` |
| Production | `https://monitoring.usenghor-francophonie.org` | `GRAFANA_ADMIN_USER` / `GRAFANA_ADMIN_PASSWORD` du `/opt/usenghor/.env` (stockés dans le gestionnaire de secrets de l'équipe) |

> L'inscription publique et l'accès anonyme sont **désactivés** (SC-018) :
> seul le compte admin issu du `.env` peut se connecter. Pour ajouter un
> utilisateur supplémentaire, voir la documentation Grafana
> `Administration → Users → Add user`.

---

## 2. Navigation

À la connexion, deux dashboards sont visibles dans le menu **Dashboards** :

- **Node Exporter Full** — métriques du VPS (ou du poste local).
- **Docker / cAdvisor** — métriques par conteneur Docker.

Raccourcis clavier utiles :

| Touche | Action |
|---|---|
| `g` puis `h` | Aller à l'accueil |
| `g` puis `d` | Lister les dashboards |
| `d` puis `k` | Mode plein écran (cacher la navigation) |
| `t` puis `z` | Zoomer sur la période sélectionnée |
| `Esc` | Sortir d'un panneau plein écran |

---

## 3. Choisir la période et la fréquence de rafraîchissement

En haut à droite de chaque dashboard :

- **Sélecteur de période** : « Last 5 minutes », « Last 1 hour »,
  « Last 24 hours », « Last 7 days », ou personnalisé. Pour valider une
  collecte temps réel, utiliser « Last 5 minutes ».
- **Sélecteur de refresh** : `30s` (valeur par défaut imposée), `1m`,
  `5m`, etc.
- **Bouton de rafraîchissement manuel** : icône flèche circulaire.

> Plus la période est longue, plus Grafana agrège les points (downsampling
> côté requête PromQL). Les pics très brefs peuvent disparaître à l'échelle
> de la semaine ; passer en « Last 1 hour » pour les retrouver.

---

## 4. Lecture du dashboard « Node Exporter Full »

Ce dashboard vise le critère **US1** : voir l'état système du VPS.

| Section | Panneau clé | Lecture |
|---|---|---|
| **CPU** | « CPU Busy » | Pourcentage de CPU non-idle. Vert < 60 %, jaune 60-80 %, rouge > 80 %. Soutenu > 80 % pendant > 10 min = saturation. |
| **CPU** | « CPU Basic » | Décomposition user/system/iowait. Un `iowait` élevé indique un goulot d'étranglement disque. |
| **Memory** | « RAM Used » | RAM utilisée hors cache. Si > 90 % et que swap monte, le VPS est sous-dimensionné. |
| **Memory** | « SWAP Used » | Doit rester à 0 ou très bas. Swap > 50 % = situation critique. |
| **Disk** | « Disk Space Used Basic » | Pourcentage occupé par partition. Sur le VPS, surveiller `/` et `/var`. > 85 % = nettoyer / agrandir. |
| **Disk** | « Disk IOps » | Lectures et écritures par seconde. Un pic prolongé peut indiquer une migration de DB ou un backup en cours. |
| **Network** | « Network Traffic Basic » | Trafic entrant et sortant en bits/s. Le pic du soir correspond aux visiteurs. |
| **System Load** | « Sys Load » | Charge à 1/5/15 min. Sur 2 vCPU, > 4 = saturation. |

Filtres en haut du dashboard :
- **datasource** : forcé à `prometheus` (provisioning).
- **job** : `node-exporter`.
- **instance** : sélectionner la machine (un seul hôte en l'état).

---

## 5. Lecture du dashboard « Docker / cAdvisor »

Ce dashboard vise le critère **US2** : identifier le conteneur Docker qui
consomme.

| Section | Panneau clé | Lecture |
|---|---|---|
| **Containers** | Liste des conteneurs actifs avec leur état | Vue d'ensemble — combien de conteneurs tournent. |
| **CPU** | « CPU Usage by container » | Top consommateurs CPU. Si un conteneur dépasse régulièrement 50 %, profiler son code. |
| **Memory** | « Memory Usage by container » | RAM en octets par conteneur. Comparer à la `mem_limit` Compose pour voir la marge. |
| **Network** | « Network rx/tx by container » | Trafic réseau par conteneur. Le frontend Nuxt et le backend FastAPI dominent en général. |
| **I/O** | « Filesystem reads/writes by container » | Lectures et écritures par conteneur. PostgreSQL doit dominer en écritures. |

Filtres :
- **container** ou **name** : filtrer pour ne voir qu'un seul conteneur.
  Pour comparer `usenghor_backend` à `usenghor_frontend`, sélectionner les
  deux dans le multi-select.

> **Astuce** : pour reproduire un incident de consommation, ouvrir le
> dashboard sur « Last 24 hours », sélectionner le conteneur suspect dans le
> filtre, puis brosser (drag sélection horizontale) sur la zone du pic
> visible — Grafana zoome sur cette fenêtre.

---

## 6. Comprendre les unités

| Unité affichée | Signification |
|---|---|
| `B`, `KiB`, `MiB`, `GiB` | Octets binaires (1 KiB = 1024 B). Standard Prometheus. |
| `%` | Pourcentage. Attention : certains panneaux affichent `0-1` au lieu de `0-100`. |
| `bps`, `Bps` | Bits ou Bytes par seconde. Le réseau est typiquement en bps. |
| `ops` | Opérations par seconde (I/O disque). |
| `short` | Nombre sans unité (compteurs). |

---

## 7. Cas d'usage typiques

### Le site est lent ce matin
1. Ouvrir « Node Exporter Full » sur « Last 1 hour ».
2. Vérifier `CPU Busy` (saturation ?), `RAM Used` (swap actif ?),
   `Disk IOps` (goulot ?).
3. Si système OK, passer à « Docker / cAdvisor » et chercher un conteneur
   qui consomme anormalement.

### Vérifier qu'une nouvelle release n'a pas dégradé la perf
1. Avant le déploiement, noter mentalement les valeurs moyennes.
2. Déployer.
3. Attendre 30 min, comparer sur « Last 1 hour » CPU et RAM des conteneurs
   touchés.
4. Si dégradation > 30 %, suspecter une régression — rollback ou profiler.

### Diagnostiquer un OOM (Out Of Memory)
1. Si un conteneur a été tué par OOM (`docker logs <nom>` montre `killed`),
   ouvrir « Docker / cAdvisor » sur « Last 24 hours ».
2. Filtrer sur ce conteneur.
3. Observer la courbe RAM : si elle monte régulièrement = fuite mémoire.
4. Si elle a un pic soudain = requête anormale (logs applicatifs à
   corréler).

---

## 8. Aller plus loin

- Documentation officielle Grafana : `https://grafana.com/docs/grafana/latest/`
- Liste complète des métriques exposées par node-exporter :
  `https://github.com/prometheus/node_exporter#collectors`
- Liste des métriques cAdvisor :
  `https://github.com/google/cadvisor/blob/master/docs/storage/prometheus.md`
