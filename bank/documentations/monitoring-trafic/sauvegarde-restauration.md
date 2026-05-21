# Sauvegarde et restauration de la stack de monitoring

Ce document décrit la procédure opérationnelle pour sauvegarder et restaurer
les données persistées par la stack Prometheus + Grafana de l'Université
Senghor (spec 020). Il est conforme aux exigences FR-016, FR-018 et à la
décision D-07 (sauvegardes manuelles, déclenchées par l'administrateur).

---

## 1. Quels volumes sauvegarder

La stack utilise **deux volumes Docker nommés** qui contiennent la totalité
des données persistantes :

| Volume Docker | Rôle | Taille typique | Criticité |
|---|---|---|---|
| `usenghor_monitoring_prometheus_data` | Base TSDB Prometheus : toutes les séries temporelles (CPU, RAM, disque, réseau, conteneurs) collectées depuis le démarrage de la stack, dans la limite de la rétention configurée (30 jours / 4.5 GB). | 500 Mo à 4.5 Go selon le remplissage | Moyenne — si perdu, on perd l'historique récent mais la collecte reprend immédiatement |
| `usenghor_monitoring_grafana_data` | Base SQLite interne de Grafana : utilisateurs, sessions, préférences UI, annotations, snapshots, organisations, dashboards UI-créés. **Les dashboards provisionnés par fichier (Node Exporter Full, Docker / cAdvisor) ne sont PAS stockés ici** — ils sont reconstruits depuis `monitoring/grafana/provisioning/` à chaque démarrage. | 10 Mo à 100 Mo | Faible — la majorité du contenu est reconstructible depuis le dépôt Git |

> **Important** : la configuration (`docker-compose.monitoring.yml`,
> `monitoring/prometheus/prometheus.yml`, fichiers de provisioning Grafana,
> dashboards JSON) **n'est pas** dans ces volumes. Elle est versionnée dans
> Git, donc déjà sauvegardée par ailleurs. Cette procédure ne couvre que la
> partie runtime (TSDB + base Grafana).

---

## 2. Procédure de sauvegarde

### 2.1 Sauvegarde Prometheus (à froid, recommandée)

Prometheus utilise une TSDB sur disque avec WAL. Pour garantir un snapshot
cohérent, on arrête le service pendant la copie. L'arrêt est court (quelques
secondes pour `tar`) et la collecte reprend dès le redémarrage — les
métriques manquées sont simplement absentes pendant la fenêtre.

```bash
# Depuis le répertoire qui contient docker-compose.monitoring.yml
cd /opt/usenghor/usenghor_backend   # ou usenghor_backend/ en local

# Arrêt propre de Prometheus uniquement
docker compose -f docker-compose.monitoring.yml stop prometheus

# Création du tar.gz dans /var/backups/monitoring/
BACKUP_DIR=/var/backups/monitoring
sudo mkdir -p "$BACKUP_DIR"
TS=$(date +%Y%m%d_%H%M%S)
docker run --rm \
  -v usenghor_monitoring_prometheus_data:/data:ro \
  -v "$BACKUP_DIR":/backup \
  busybox \
  tar czf "/backup/prometheus_data_${TS}.tar.gz" -C /data .

# Redémarrage de Prometheus
docker compose -f docker-compose.monitoring.yml start prometheus
```

### 2.2 Sauvegarde Grafana (à chaud, acceptable)

Grafana utilise SQLite en mode WAL : un `tar` à chaud reste cohérent dans
99 % des cas (les écritures sont rares). On peut donc sauvegarder sans
arrêter Grafana, ce qui évite une coupure d'accès aux dashboards.

```bash
TS=$(date +%Y%m%d_%H%M%S)
docker run --rm \
  -v usenghor_monitoring_grafana_data:/data:ro \
  -v /var/backups/monitoring:/backup \
  busybox \
  tar czf "/backup/grafana_data_${TS}.tar.gz" -C /data .
```

> **Variante stricte** : si vous voulez la garantie absolue (par exemple
> avant une mise à jour majeure de Grafana), arrêtez d'abord Grafana
> (`docker compose -f docker-compose.monitoring.yml stop grafana`), faites
> le `tar`, puis redémarrez.

### 2.3 Cadence recommandée

| Environnement | Cadence | Rétention des archives |
|---|---|---|
| Production VPS | Hebdomadaire (dimanche 03:00, après la rotation des logs) | 4 semaines glissantes |
| Local / développement | À la demande, avant une opération destructive | Aucune (jetable) |

Pour automatiser en production : ajoutez un cron `0 3 * * 0` qui exécute un
script reprenant les commandes ci-dessus, puis envoie les `.tar.gz` vers un
stockage hors-VPS (S3, scp vers une machine de sauvegarde, etc.). Sans
externalisation, la sauvegarde est inutile si le VPS est perdu.

---

## 3. Procédure de restauration

La restauration est destructive : elle écrase le volume cible. Vérifiez
toujours que l'archive est saine (`tar tzf fichier.tar.gz | head`) avant de
lancer l'opération.

```bash
cd /opt/usenghor/usenghor_backend

# 1. Arrêter les deux services qui utilisent les volumes
docker compose -f docker-compose.monitoring.yml stop prometheus grafana

# 2. Restaurer Prometheus
docker run --rm \
  -v usenghor_monitoring_prometheus_data:/data \
  -v /var/backups/monitoring:/backup \
  busybox \
  sh -c "rm -rf /data/* /data/..?* /data/.[!.]* && \
         tar xzf /backup/prometheus_data_YYYYMMDD_HHMMSS.tar.gz -C /data"

# 3. Restaurer Grafana
docker run --rm \
  -v usenghor_monitoring_grafana_data:/data \
  -v /var/backups/monitoring:/backup \
  busybox \
  sh -c "rm -rf /data/* /data/..?* /data/.[!.]* && \
         tar xzf /backup/grafana_data_YYYYMMDD_HHMMSS.tar.gz -C /data"

# 4. Redémarrer la stack
docker compose -f docker-compose.monitoring.yml up -d
```

> Si vous ne disposez que d'une seule des deux archives, ne restaurez que
> celle-là — les volumes sont indépendants. Grafana peut redémarrer avec un
> volume vide (il sera reprovisonné par les fichiers) ; Prometheus aussi
> (il recommencera à collecter depuis zéro).

---

## 4. Vérification après restauration

Après le redémarrage, ouvrez Grafana :

1. Connexion avec les identifiants admin (issus du `.env`).
2. Naviguer vers le dashboard **« Node Exporter Full »**.
3. Forcer la fenêtre de visualisation sur **« Last 24 hours »** ou plus.
4. Confirmer que des points de mesure existent **avant** l'heure de la
   restauration (preuve que les anciennes séries ont bien été retrouvées).
5. Vérifier de la même façon le dashboard **« Docker / cAdvisor »**.
6. Vérifier que les préférences utilisateur (thème, timezone, accueil par
   défaut) sont conservées — confirmation que Grafana a bien recouvré sa
   base.

Si l'historique est vide ou si les préférences ont disparu, l'archive
utilisée était corrompue ou la commande `tar xzf` n'a pas écrit dans le bon
volume. Consultez `docker volume inspect <nom>` pour vérifier le chemin
physique du volume puis recommencez la restauration en pointant
explicitement sur ce chemin.

---

## 5. Que sauvegarder en plus du volume

Même si le volume runtime est sauvegardé, vous avez besoin **du code de
configuration** pour reconstruire la stack identique. Les éléments suivants
ne sont pas dans les volumes :

| Élément | Emplacement | Sauvegarde |
|---|---|---|
| Compose monitoring | `usenghor_backend/docker-compose.monitoring.yml` | Versionné Git |
| Override local | `usenghor_backend/docker-compose.monitoring.override.yml` | Versionné Git |
| Config Prometheus | `usenghor_backend/monitoring/prometheus/prometheus.yml` | Versionné Git |
| Provisioning Grafana | `usenghor_backend/monitoring/grafana/provisioning/` | Versionné Git |
| Dashboards JSON | `usenghor_backend/monitoring/grafana/provisioning/dashboards/*.json` | Versionné Git |
| Variables runtime (`GRAFANA_ADMIN_USER`, `GRAFANA_ADMIN_PASSWORD`, `MONITORING_DOMAIN`) | `.env` (local) et `.env` (prod, `/opt/usenghor/.env`) | **À sauvegarder séparément** dans un gestionnaire de secrets (Bitwarden, 1Password, Vault) — **ne jamais** mettre `.env` dans une archive non chiffrée |

> Conseil : si vous chiffrez l'archive `tar.gz` du volume Grafana avec
> `gpg` ou `age`, vous pouvez aussi y inclure une copie de `.env` (qui
> contient l'admin password). Sans chiffrement, ne mélangez jamais les deux.

---

## 6. Test de la procédure (recommandé tous les trimestres)

Une sauvegarde non testée est une sauvegarde inutile. Tous les 3 mois :

1. Sauvegarder selon §2.
2. Sur un environnement de staging (ou en local), reproduire la stack vide.
3. Restaurer selon §3.
4. Vérifier selon §4.
5. Documenter dans le journal d'exploitation : date, durée totale, anomalie
   éventuelle.

Cette procédure couvre le critère **SC-010** : « la procédure de
sauvegarde/restauration est testée et permet de retrouver l'état après une
suppression accidentelle des volumes ».
