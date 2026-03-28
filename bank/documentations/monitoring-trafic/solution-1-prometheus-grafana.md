# Solution 1 : Prometheus + Grafana (Stack complète)

## Resume

Stack de monitoring classique basee sur Prometheus (collecte de metriques) et Grafana (visualisation/alertes), deployee en conteneurs Docker aux cotes de l'application existante.

**Cout ressources estime : ~400-500 Mo RAM, 2 conteneurs supplementaires**

---

## Architecture

```
                    ┌─────────────┐
   Requetes ──────►│    Nginx     │── access logs ──► Promtail (optionnel)
                    └──────┬──────┘                      │
                           │                             ▼
                    ┌──────┴──────┐               ┌──────────┐
                    │   Nuxt SSR  │               │   Loki   │ (optionnel)
                    └──────┬──────┘               └────┬─────┘
                           │                          │
                    ┌──────┴──────┐               ┌───▼──────┐
                    │   FastAPI   │──── metrics ──►│Prometheus│
                    │ (middleware)│               └────┬─────┘
                    └─────────────┘                    │
                                                 ┌────▼─────┐
                                                 │ Grafana  │
                                                 │Dashboard │
                                                 └──────────┘
```

---

## Composants

### 1. Middleware FastAPI (`TrafficMiddleware`)

Middleware Starlette qui instrumente chaque requete entrante et expose les metriques au format Prometheus.

**Metriques collectees :**

| Metrique | Type Prometheus | Labels | Description |
|----------|----------------|--------|-------------|
| `http_requests_total` | Counter | method, endpoint, status | Nombre total de requetes |
| `http_request_duration_seconds` | Histogram | method, endpoint | Latence par requete (buckets: 0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10) |
| `http_requests_in_progress` | Gauge | method | Requetes en cours de traitement |
| `http_request_size_bytes` | Summary | method, endpoint | Taille des requetes entrantes |
| `http_response_size_bytes` | Summary | method, endpoint | Taille des reponses |

**Dependance Python :** `prometheus-client` (~50 Ko)

**Endpoint expose :** `GET /metrics` (format texte Prometheus)

**Code estimatif du middleware :**

```python
# app/middleware/traffic.py

import time
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

REQUEST_COUNT = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["method", "endpoint", "status"]
)

REQUEST_LATENCY = Histogram(
    "http_request_duration_seconds",
    "HTTP request latency",
    ["method", "endpoint"],
    buckets=[0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0]
)

REQUESTS_IN_PROGRESS = Gauge(
    "http_requests_in_progress",
    "HTTP requests currently in progress",
    ["method"]
)


class TrafficMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.path == "/metrics":
            return Response(
                generate_latest(),
                media_type=CONTENT_TYPE_LATEST
            )

        method = request.method
        # Normaliser les endpoints (remplacer les UUIDs par {id})
        endpoint = self._normalize_path(request.url.path)

        REQUESTS_IN_PROGRESS.labels(method=method).inc()
        start_time = time.perf_counter()

        try:
            response = await call_next(request)
            status = str(response.status_code)
        except Exception:
            status = "500"
            raise
        finally:
            duration = time.perf_counter() - start_time
            REQUEST_COUNT.labels(method=method, endpoint=endpoint, status=status).inc()
            REQUEST_LATENCY.labels(method=method, endpoint=endpoint).observe(duration)
            REQUESTS_IN_PROGRESS.labels(method=method).dec()

        return response

    @staticmethod
    def _normalize_path(path: str) -> str:
        """Remplace les UUIDs et IDs numeriques par des placeholders."""
        import re
        path = re.sub(
            r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}",
            "{id}",
            path
        )
        path = re.sub(r"/\d+", "/{id}", path)
        return path
```

**Integration dans `main.py` :**

```python
from app.middleware.traffic import TrafficMiddleware

app.add_middleware(TrafficMiddleware)
```

---

### 2. Prometheus (conteneur Docker)

**Image :** `prom/prometheus:latest` (~200 Mo RAM)

**Configuration (`prometheus/prometheus.yml`) :**

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: "fastapi"
    static_configs:
      - targets: ["backend:8000"]
    metrics_path: "/metrics"
    scrape_interval: 15s

  # Optionnel : metriques systeme via node_exporter
  # - job_name: "node"
  #   static_configs:
  #     - targets: ["node-exporter:9100"]

rule_files:
  - "alerts.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets: [] # Configurer si Alertmanager est deploye
```

**Regles d'alerte (`prometheus/alerts.yml`) :**

```yaml
groups:
  - name: usenghor_alerts
    rules:
      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Latence elevee sur {{ $labels.endpoint }}"
          description: "P95 > 2s pendant 5 min sur {{ $labels.endpoint }}"

      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Taux d'erreurs 5xx > 5% sur {{ $labels.endpoint }}"

      - alert: TrafficSpike
        expr: rate(http_requests_total[5m]) > 2 * rate(http_requests_total[5m] offset 1d)
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Pic de trafic detecte (x2 vs hier)"
```

---

### 3. Grafana (conteneur Docker)

**Image :** `grafana/grafana:latest` (~200 Mo RAM)

**Dashboards preconfigures :**

#### Dashboard 1 : Vue d'ensemble du trafic

- **Requetes/seconde** : courbe temporelle, groupee par endpoint (top 10)
- **Latence P50/P95/P99** : courbes par endpoint
- **Taux d'erreurs** : pourcentage 4xx et 5xx dans le temps
- **Requetes en cours** : jauge temps reel

#### Dashboard 2 : Analyse de scaling

- **Top 10 endpoints par volume** (table triee)
- **Top 10 endpoints par latence** (table triee)
- **Heatmap trafic** par heure/jour de la semaine
- **Ratio requetes/latence** : identifier les endpoints a forte charge ET lents (candidats prioritaires au scaling)

#### Dashboard 3 : Sante du systeme (optionnel, necessite node_exporter)

- CPU, RAM, disque du VPS
- Connexions PostgreSQL actives
- I/O disque

---

### 4. Ajouts Docker Compose

```yaml
# A ajouter dans docker-compose.prod.yml

  prometheus:
    image: prom/prometheus:latest
    container_name: usenghor_prometheus
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - ./prometheus/alerts.yml:/etc/prometheus/alerts.yml
      - prometheus_data:/prometheus
    command:
      - "--config.file=/etc/prometheus/prometheus.yml"
      - "--storage.tsdb.retention.time=90d"
      - "--storage.tsdb.retention.size=1GB"
    networks:
      - usenghor_network
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    container_name: usenghor_grafana
    environment:
      - GF_SECURITY_ADMIN_USER=${GRAFANA_USER:-admin}
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
      - GF_SERVER_ROOT_URL=https://usenghor.org/grafana/
    volumes:
      - grafana_data:/var/lib/grafana
    depends_on:
      - prometheus
    networks:
      - usenghor_network
    restart: unless-stopped

volumes:
  prometheus_data:
  grafana_data:
```

**Nginx (ajout pour Grafana) :**

```nginx
location /grafana/ {
    # Acces restreint par IP ou auth basique
    # allow 1.2.3.4;
    # deny all;
    proxy_pass http://grafana:3000/;
    proxy_set_header Host $host;
}
```

---

## Phase optionnelle : Logs structures (Promtail + Loki)

### Nginx access log en JSON

```nginx
log_format json_combined escape=json
    '{'
        '"time":"$time_iso8601",'
        '"remote_addr":"$remote_addr",'
        '"method":"$request_method",'
        '"uri":"$request_uri",'
        '"status":$status,'
        '"body_bytes_sent":$body_bytes_sent,'
        '"request_time":$request_time,'
        '"upstream_response_time":"$upstream_response_time",'
        '"user_agent":"$http_user_agent",'
        '"referer":"$http_referer"'
    '}';

access_log /var/log/nginx/access.log json_combined;
```

### Promtail + Loki (conteneurs supplementaires)

- **Promtail** : lit les logs Nginx, les pousse vers Loki
- **Loki** : stockage et indexation des logs
- **Grafana** : exploration des logs (deja present)

**Cout supplementaire : ~150-200 Mo RAM**

---

## Bilan des ressources

| Composant | RAM | CPU | Disque/mois |
|-----------|-----|-----|-------------|
| Middleware Python | < 5 Mo | ~0.1 ms/req | 0 |
| Prometheus | ~150-200 Mo | Faible | ~100 Mo |
| Grafana | ~150-200 Mo | Faible | ~50 Mo |
| *Promtail + Loki (optionnel)* | *~150-200 Mo* | *Faible* | *~200 Mo* |
| **Total (sans Loki)** | **~300-400 Mo** | **Negligeable** | **~150 Mo** |
| **Total (avec Loki)** | **~500-600 Mo** | **Negligeable** | **~350 Mo** |

---

## Avantages

- Stack standard de l'industrie, documentation abondante
- Dashboards puissants et personnalisables (Grafana)
- Systeme d'alertes mature (regles PromQL)
- Historique long terme avec retention configurable
- Communaute active, nombreux dashboards preconfigures
- Extensible (ajout de node_exporter, cAdvisor, etc.)

## Inconvenients

- **Consommation RAM significative** (~400 Mo minimum)
- 2 conteneurs supplementaires a maintenir
- Configuration initiale plus complexe
- Necessite d'exposer Grafana (securisation supplementaire)
- Peut etre surdimensionne pour un VPS avec peu de trafic

---

## Quand choisir cette solution ?

- Le VPS a **2 Go+ de RAM disponible** au-dela des services actuels
- Besoin de dashboards **tres personnalises** et interactifs
- Equipe familiere avec Prometheus/Grafana
- Prevision de scaling vers **plusieurs serveurs** (Prometheus supporte nativement le multi-target)
- Besoin d'un historique de metriques **longue duree** (> 90 jours)
