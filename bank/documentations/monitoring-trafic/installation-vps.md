# Installation de la stack de monitoring en production (VPS)

Ce guide installe la stack Prometheus + Grafana sur le VPS de production de
l'Université Senghor, derrière Nginx + HTTPS Let's Encrypt, accessible
publiquement uniquement via `https://monitoring.<DOMAINE>`. Les exporters
(node-exporter, cAdvisor) et Prometheus lui-même restent **interdits**
d'accès depuis Internet (FR-010, SC-006).

Public visé : administrateur système avec accès SSH au VPS.

---

## 1. Pré-requis

- Accès SSH au VPS (`./deploy.sh connect` doit fonctionner).
- Le compose principal de production a été déployé au moins une fois
  (création du réseau Docker `usenghor_network`).
- Un nom de domaine racine fonctionnel (`usenghor-francophonie.org`) avec
  HTTPS valide en place.
- Capacité à modifier la zone DNS du domaine.

---

## 2. Configurer le DNS

Dans le panneau DNS du registrar (ou via l'API du fournisseur DNS),
ajouter un enregistrement A :

| Nom | Type | Valeur | TTL |
|---|---|---|---|
| `monitoring.usenghor-francophonie.org` | A | IP publique du VPS (`137.74.117.231`) | 3600 |

Vérifier la propagation :

```bash
dig +short monitoring.usenghor-francophonie.org
# doit retourner l'IP du VPS
```

---

## 3. Étendre le certificat Let's Encrypt

Le certificat existant couvre déjà `usenghor-francophonie.org` et
`www.usenghor-francophonie.org`. On l'étend avec un SAN supplémentaire :

```bash
./deploy.sh connect
# Une fois dans le VPS :
sudo certbot certonly --webroot -w /var/www/html \
  -d usenghor-francophonie.org \
  -d www.usenghor-francophonie.org \
  -d monitoring.usenghor-francophonie.org \
  --expand
```

Vérifier que le nouveau SAN est bien présent :

```bash
sudo openssl x509 -in /etc/letsencrypt/live/usenghor-francophonie.org/cert.pem -text | grep DNS:
# doit lister les 3 noms
```

Copier le certificat renouvelé vers le volume Nginx (si votre routine de
renouvellement ne le fait pas automatiquement) :

```bash
sudo cp /etc/letsencrypt/live/usenghor-francophonie.org/fullchain.pem \
        /opt/usenghor/nginx/ssl/
sudo cp /etc/letsencrypt/live/usenghor-francophonie.org/privkey.pem \
        /opt/usenghor/nginx/ssl/
```

---

## 4. Configurer le `.env` de production

Sur le VPS, dans `/opt/usenghor/.env`, ajouter (ou compléter) :

```dotenv
# Monitoring (spec 020)
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=<mot-de-passe-fort-genere-localement-puis-stocke-dans-Bitwarden>
MONITORING_DOMAIN=monitoring.usenghor-francophonie.org
PROMETHEUS_ENV=production
```

> **Sécurité** : générer le mot de passe avec `openssl rand -base64 24` sur
> votre poste, le sauvegarder dans le gestionnaire de secrets de l'équipe,
> puis le copier dans le `.env` du VPS via SSH. Ne jamais commiter ce
> fichier.

---

## 5. Déployer la configuration Nginx

La nouvelle `nginx/nginx.conf` contient les zones de rate limiting, le
upstream `grafana` et le server-block HTTPS dédié pour
`monitoring.usenghor-francophonie.org`.

```bash
# Depuis le poste local :
./deploy.sh deploy
# ou plus ciblé :
scp nginx/nginx.conf ubuntu@137.74.117.231:/opt/usenghor/nginx/
./deploy.sh restart nginx
```

Vérifier que Nginx a bien rechargé la config sans erreur :

```bash
./deploy.sh connect
docker exec usenghor_nginx nginx -t
docker logs --tail 50 usenghor_nginx
```

---

## 6. Lancer la stack de monitoring

Depuis le poste local, après avoir poussé la branche contenant
`usenghor_backend/docker-compose.monitoring.yml` et le dossier `monitoring/`
sur le dépôt git distant suivi par le VPS :

```bash
./deploy.sh deploy            # synchronise le code applicatif
./deploy.sh monitoring up     # synchronise + démarre la stack monitoring
```

La sous-commande `monitoring up` fait deux choses :
1. `scp` du fichier Compose et du dossier `monitoring/` vers
   `/opt/usenghor/usenghor_backend/`.
2. `docker compose -f docker-compose.monitoring.yml --env-file ../.env up -d`.

Vérifier l'état :

```bash
./deploy.sh monitoring status
```

Les 4 conteneurs (`prometheus`, `grafana`, `node-exporter`, `cadvisor`)
doivent apparaître en `Up`, et `prometheus` + `grafana` en `(healthy)`
après ~90 s.

---

## 7. Vérifier l'accès HTTPS

Depuis votre poste (hors VPS) :

```bash
# Redirection HTTP -> HTTPS
curl -I http://monitoring.usenghor-francophonie.org
# Attendu : HTTP/1.1 301 vers https://...

# Page d'accueil Grafana en HTTPS
curl -I https://monitoring.usenghor-francophonie.org
# Attendu : HTTP/2 302 ou 200, header Strict-Transport-Security présent
```

Ouvrir ensuite `https://monitoring.usenghor-francophonie.org` dans un
navigateur : la page de login Grafana doit apparaître sans avertissement de
certificat.

---

## 8. Vérifier l'isolation des ports

C'est le critère **SC-006 / FR-010** : Prometheus et les exporters ne
doivent pas être joignables depuis Internet.

Depuis votre poste (hors VPS) :

```bash
curl -m 5 http://137.74.117.231:9090   # doit échouer (timeout / refused)
curl -m 5 http://137.74.117.231:3000   # doit échouer (Grafana pas exposé direct)
curl -m 5 http://137.74.117.231:9100   # doit échouer (node-exporter)
curl -m 5 http://137.74.117.231:8080   # doit échouer (cAdvisor)
```

Si **n'importe lequel** de ces ports répond, vérifier :

- Le firewall UFW (`sudo ufw status` sur le VPS) doit autoriser uniquement
  22, 80, 443.
- Le compose `docker-compose.monitoring.yml` ne contient **pas** la section
  `ports:` pour ces services (les mappings publics sont dans le fichier
  `.override.yml` uniquement, et ce dernier n'est pas synchronisé en prod).

---

## 9. Vérifier le rate limiting

```bash
# Envoyer 35 requêtes en moins de 60 s sur la racine
for i in {1..35}; do
  curl -o /dev/null -s -w "%{http_code}\n" \
    https://monitoring.usenghor-francophonie.org/
done | sort | uniq -c
```

Attendu : au moins **5** réponses `429 Too Many Requests` (rate
30 req/min + burst 20).

---

## 10. Opération courante

| Action | Commande |
|---|---|
| Démarrer la stack | `./deploy.sh monitoring up` |
| Arrêter la stack | `./deploy.sh monitoring down` |
| Voir les logs | `./deploy.sh monitoring logs` |
| Voir l'état | `./deploy.sh monitoring status` |
| Sauvegarder les volumes | Voir [sauvegarde-restauration.md](./sauvegarde-restauration.md) |
| Mettre à jour une image Docker | Modifier la version dans `docker-compose.monitoring.yml`, commit/push, puis `./deploy.sh monitoring up` |

---

## 11. Dépannage

| Symptôme | Cause probable | Solution |
|---|---|---|
| `Connection refused` sur `monitoring.<DOMAINE>` | Nginx n'a pas chargé la nouvelle conf | `./deploy.sh restart nginx` |
| Erreur SSL `unable to verify` | Le certificat ne couvre pas le SAN | Réexécuter `certbot certonly --expand` (§3) |
| Grafana retourne `Bad Gateway` | Conteneur Grafana non démarré | `./deploy.sh monitoring status` puis `monitoring up` |
| Grafana boucle sur le login | `MONITORING_DOMAIN` incorrect dans `.env` | Vérifier que la valeur match l'URL servie |
| Aucun panneau ne charge | `usenghor_network` cassé après recréation du compose principal | `./deploy.sh monitoring down && ./deploy.sh monitoring up` |
| `prometheus_data` plein | Rétention 4.5 Go atteinte | Normal — Prometheus purge automatiquement les plus anciennes séries |

Pour des logs détaillés :

```bash
./deploy.sh monitoring logs
```
