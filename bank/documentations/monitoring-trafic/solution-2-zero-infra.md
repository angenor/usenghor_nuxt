# Solution 2 : Monitoring zero-infra (recommandee)

## Resume

Systeme de surveillance du trafic **100% integre** dans l'application existante : un middleware FastAPI collecte les metriques en memoire, les flush periodiquement dans une table PostgreSQL, et un dashboard admin Nuxt les affiche avec AmCharts (deja installe). **Zero conteneur, zero dependance supplementaire.**

**Cout ressources estime : < 500 Ko RAM, 0 conteneur supplementaire**

---

## Architecture

```
Requete ──► TrafficMiddleware ──► Compteurs en memoire (dict Python)
                                        │
                                   flush toutes les 5 min
                                        │
                                        ▼
                                  Table: traffic_metrics (PostgreSQL)
                                        │
                                        ▼
                           Dashboard admin Nuxt (AmCharts 5)
                                        │
                                   Alertes email (aiosmtplib)
```

---

## Composant 1 : Base de donnees

### Table `traffic_metrics`

```sql
-- Fichier: usenghor_backend/documentation/modele_de_donnees/migrations/0XX_traffic_metrics.sql

CREATE TABLE traffic_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    period_start TIMESTAMPTZ NOT NULL,
    request_count INTEGER DEFAULT 0,
    avg_latency_ms FLOAT DEFAULT 0,
    max_latency_ms FLOAT DEFAULT 0,
    status_2xx INTEGER DEFAULT 0,
    status_3xx INTEGER DEFAULT 0,
    status_4xx INTEGER DEFAULT 0,
    status_5xx INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requetes dashboard
CREATE INDEX idx_traffic_period ON traffic_metrics(period_start DESC);
CREATE INDEX idx_traffic_endpoint ON traffic_metrics(endpoint, period_start DESC);
CREATE UNIQUE INDEX idx_traffic_unique ON traffic_metrics(endpoint, method, period_start);
```

### Nettoyage automatique (retention 90 jours)

```sql
-- A executer via un cron PostgreSQL ou une tache FastAPI periodique
DELETE FROM traffic_metrics WHERE period_start < NOW() - INTERVAL '90 days';
```

### Volume de donnees estime

| Parametre | Valeur |
|-----------|--------|
| Routes actives | ~60 |
| Tranches de 5 min / jour | 288 |
| Lignes / jour | ~17 000 |
| Taille / jour | ~50 Ko |
| Taille / mois | ~1.5 Mo |
| Taille / an | ~18 Mo |

---

## Composant 2 : Middleware FastAPI

### `app/middleware/traffic.py`

```python
import asyncio
import re
import time
from collections import defaultdict
from datetime import datetime, timezone

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request


class TrafficMiddleware(BaseHTTPMiddleware):
    """
    Middleware de collecte de metriques de trafic.
    Compteurs en memoire, flush periodique en base.
    """

    # Intervalle de flush en secondes
    FLUSH_INTERVAL = 300  # 5 minutes

    # Routes a ignorer (sante, metriques internes)
    IGNORED_PATHS = {"/api/health", "/", "/favicon.ico"}

    def __init__(self, app, db_session_factory=None):
        super().__init__(app)
        self.db_session_factory = db_session_factory
        self._metrics = defaultdict(lambda: {
            "request_count": 0,
            "total_latency_ms": 0.0,
            "max_latency_ms": 0.0,
            "status_2xx": 0,
            "status_3xx": 0,
            "status_4xx": 0,
            "status_5xx": 0,
        })
        self._current_period = self._get_period()
        self._lock = asyncio.Lock()
        self._flush_task = None

    @staticmethod
    def _get_period() -> datetime:
        """Retourne le debut de la tranche de 5 min courante."""
        now = datetime.now(timezone.utc)
        minute = (now.minute // 5) * 5
        return now.replace(minute=minute, second=0, microsecond=0)

    @staticmethod
    def _normalize_path(path: str) -> str:
        """Remplace les UUIDs et IDs numeriques par des placeholders."""
        path = re.sub(
            r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}",
            "{id}",
            path,
        )
        path = re.sub(r"/\d+", "/{id}", path)
        return path

    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        # Ignorer certaines routes
        if path in self.IGNORED_PATHS:
            return await call_next(request)

        method = request.method
        endpoint = self._normalize_path(path)
        start = time.perf_counter()

        try:
            response = await call_next(request)
            status_code = response.status_code
        except Exception:
            status_code = 500
            raise
        finally:
            latency_ms = (time.perf_counter() - start) * 1000
            await self._record(method, endpoint, status_code, latency_ms)

        return response

    async def _record(self, method: str, endpoint: str, status: int, latency_ms: float):
        """Enregistre une requete dans les compteurs en memoire."""
        current_period = self._get_period()

        async with self._lock:
            # Si on a change de periode, flush les anciennes metriques
            if current_period != self._current_period:
                old_metrics = dict(self._metrics)
                old_period = self._current_period
                self._metrics.clear()
                self._current_period = current_period
                # Flush en arriere-plan pour ne pas bloquer la requete
                asyncio.create_task(self._flush(old_metrics, old_period))

            key = f"{method}:{endpoint}"
            m = self._metrics[key]
            m["request_count"] += 1
            m["total_latency_ms"] += latency_ms
            m["max_latency_ms"] = max(m["max_latency_ms"], latency_ms)

            status_bucket = f"status_{status // 100}xx"
            if status_bucket in m:
                m[status_bucket] += 1

    async def _flush(self, metrics: dict, period: datetime):
        """Persiste les metriques en base de donnees."""
        if not metrics or not self.db_session_factory:
            return

        try:
            async with self.db_session_factory() as session:
                from sqlalchemy import text

                for key, m in metrics.items():
                    method, endpoint = key.split(":", 1)
                    avg_latency = (
                        m["total_latency_ms"] / m["request_count"]
                        if m["request_count"] > 0
                        else 0
                    )

                    await session.execute(
                        text("""
                            INSERT INTO traffic_metrics
                                (endpoint, method, period_start, request_count,
                                 avg_latency_ms, max_latency_ms,
                                 status_2xx, status_3xx, status_4xx, status_5xx)
                            VALUES
                                (:endpoint, :method, :period_start, :request_count,
                                 :avg_latency, :max_latency,
                                 :s2xx, :s3xx, :s4xx, :s5xx)
                            ON CONFLICT (endpoint, method, period_start)
                            DO UPDATE SET
                                request_count = traffic_metrics.request_count + :request_count,
                                avg_latency_ms = (
                                    traffic_metrics.avg_latency_ms * traffic_metrics.request_count
                                    + :avg_latency * :request_count
                                ) / (traffic_metrics.request_count + :request_count),
                                max_latency_ms = GREATEST(traffic_metrics.max_latency_ms, :max_latency),
                                status_2xx = traffic_metrics.status_2xx + :s2xx,
                                status_3xx = traffic_metrics.status_3xx + :s3xx,
                                status_4xx = traffic_metrics.status_4xx + :s4xx,
                                status_5xx = traffic_metrics.status_5xx + :s5xx
                        """),
                        {
                            "endpoint": endpoint,
                            "method": method,
                            "period_start": period,
                            "request_count": m["request_count"],
                            "avg_latency": avg_latency,
                            "max_latency": m["max_latency_ms"],
                            "s2xx": m["status_2xx"],
                            "s3xx": m["status_3xx"],
                            "s4xx": m["status_4xx"],
                            "s5xx": m["status_5xx"],
                        },
                    )

                await session.commit()
        except Exception as e:
            # Log mais ne pas crasher l'application
            import logging
            logging.getLogger("traffic").error(f"Flush metriques echoue: {e}")
```

### Integration dans `main.py`

```python
from app.middleware.traffic import TrafficMiddleware
from app.database import async_session_maker

# Ajouter AVANT les autres middlewares (pour mesurer la latence totale)
app.add_middleware(TrafficMiddleware, db_session_factory=async_session_maker)
```

---

## Composant 3 : Modele SQLAlchemy

### `app/models/traffic.py`

```python
from sqlalchemy import Column, String, Integer, Float, DateTime, Index
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base
import uuid
from datetime import datetime, timezone


class TrafficMetric(Base):
    __tablename__ = "traffic_metrics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    endpoint = Column(String(255), nullable=False)
    method = Column(String(10), nullable=False)
    period_start = Column(DateTime(timezone=True), nullable=False)
    request_count = Column(Integer, default=0)
    avg_latency_ms = Column(Float, default=0)
    max_latency_ms = Column(Float, default=0)
    status_2xx = Column(Integer, default=0)
    status_3xx = Column(Integer, default=0)
    status_4xx = Column(Integer, default=0)
    status_5xx = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index("idx_traffic_period", "period_start"),
        Index("idx_traffic_endpoint", "endpoint", "period_start"),
        Index("idx_traffic_unique", "endpoint", "method", "period_start", unique=True),
    )
```

---

## Composant 4 : Service et endpoints admin

### `app/services/traffic_service.py`

```python
from datetime import datetime, timedelta, timezone
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


class TrafficService:

    @staticmethod
    async def get_dashboard_summary(
        db: AsyncSession,
        hours: int = 24
    ) -> dict:
        """Resume du trafic sur les N dernieres heures."""
        since = datetime.now(timezone.utc) - timedelta(hours=hours)

        # Top endpoints par volume
        top_by_volume = await db.execute(text("""
            SELECT endpoint, method,
                   SUM(request_count) as total_requests,
                   AVG(avg_latency_ms) as avg_latency,
                   MAX(max_latency_ms) as max_latency,
                   SUM(status_5xx) as total_errors
            FROM traffic_metrics
            WHERE period_start >= :since
            GROUP BY endpoint, method
            ORDER BY total_requests DESC
            LIMIT 20
        """), {"since": since})

        # Trafic par tranche horaire
        hourly_traffic = await db.execute(text("""
            SELECT date_trunc('hour', period_start) as hour,
                   SUM(request_count) as requests,
                   AVG(avg_latency_ms) as avg_latency,
                   SUM(status_5xx) as errors
            FROM traffic_metrics
            WHERE period_start >= :since
            GROUP BY hour
            ORDER BY hour
        """), {"since": since})

        # Top endpoints par latence
        top_by_latency = await db.execute(text("""
            SELECT endpoint, method,
                   AVG(avg_latency_ms) as avg_latency,
                   MAX(max_latency_ms) as max_latency,
                   SUM(request_count) as total_requests
            FROM traffic_metrics
            WHERE period_start >= :since
            GROUP BY endpoint, method
            HAVING SUM(request_count) > 10
            ORDER BY avg_latency DESC
            LIMIT 20
        """), {"since": since})

        # Heatmap : trafic par heure du jour et jour de la semaine
        heatmap = await db.execute(text("""
            SELECT EXTRACT(DOW FROM period_start) as day_of_week,
                   EXTRACT(HOUR FROM period_start) as hour_of_day,
                   SUM(request_count) as requests
            FROM traffic_metrics
            WHERE period_start >= :since
            GROUP BY day_of_week, hour_of_day
            ORDER BY day_of_week, hour_of_day
        """), {"since": since})

        # Totaux globaux
        totals = await db.execute(text("""
            SELECT SUM(request_count) as total_requests,
                   AVG(avg_latency_ms) as avg_latency,
                   SUM(status_2xx) as total_2xx,
                   SUM(status_3xx) as total_3xx,
                   SUM(status_4xx) as total_4xx,
                   SUM(status_5xx) as total_5xx
            FROM traffic_metrics
            WHERE period_start >= :since
        """), {"since": since})

        return {
            "top_by_volume": [dict(r._mapping) for r in top_by_volume],
            "hourly_traffic": [dict(r._mapping) for r in hourly_traffic],
            "top_by_latency": [dict(r._mapping) for r in top_by_latency],
            "heatmap": [dict(r._mapping) for r in heatmap],
            "totals": dict(totals.first()._mapping) if totals else {},
        }

    @staticmethod
    async def get_endpoint_detail(
        db: AsyncSession,
        endpoint: str,
        days: int = 7
    ) -> dict:
        """Detail du trafic pour un endpoint specifique."""
        since = datetime.now(timezone.utc) - timedelta(days=days)

        timeline = await db.execute(text("""
            SELECT period_start,
                   request_count,
                   avg_latency_ms,
                   max_latency_ms,
                   status_2xx, status_3xx, status_4xx, status_5xx
            FROM traffic_metrics
            WHERE endpoint = :endpoint AND period_start >= :since
            ORDER BY period_start
        """), {"endpoint": endpoint, "since": since})

        return {
            "endpoint": endpoint,
            "timeline": [dict(r._mapping) for r in timeline],
        }

    @staticmethod
    async def get_scaling_candidates(db: AsyncSession) -> list:
        """
        Identifie les endpoints candidats au scaling.
        Criteres : volume eleve + latence elevee + tendance croissante.
        """
        result = await db.execute(text("""
            WITH recent AS (
                SELECT endpoint, method,
                       SUM(request_count) as recent_requests,
                       AVG(avg_latency_ms) as recent_latency,
                       SUM(status_5xx) as recent_errors
                FROM traffic_metrics
                WHERE period_start >= NOW() - INTERVAL '24 hours'
                GROUP BY endpoint, method
            ),
            previous AS (
                SELECT endpoint, method,
                       SUM(request_count) as prev_requests,
                       AVG(avg_latency_ms) as prev_latency
                FROM traffic_metrics
                WHERE period_start >= NOW() - INTERVAL '48 hours'
                  AND period_start < NOW() - INTERVAL '24 hours'
                GROUP BY endpoint, method
            )
            SELECT r.endpoint,
                   r.method,
                   r.recent_requests,
                   r.recent_latency,
                   r.recent_errors,
                   COALESCE(p.prev_requests, 0) as prev_requests,
                   COALESCE(p.prev_latency, 0) as prev_latency,
                   CASE WHEN COALESCE(p.prev_requests, 0) > 0
                        THEN ROUND((r.recent_requests::numeric / p.prev_requests - 1) * 100, 1)
                        ELSE NULL
                   END as growth_pct,
                   -- Score de priorite : combine volume, latence et croissance
                   (
                       (r.recent_requests::float / NULLIF((SELECT MAX(recent_requests) FROM recent), 0)) * 0.4
                       + (r.recent_latency / NULLIF((SELECT MAX(recent_latency) FROM recent), 0)) * 0.4
                       + (r.recent_errors::float / NULLIF(r.recent_requests, 0)) * 0.2
                   ) as scaling_score
            FROM recent r
            LEFT JOIN previous p ON r.endpoint = p.endpoint AND r.method = p.method
            WHERE r.recent_requests > 50
            ORDER BY scaling_score DESC
            LIMIT 15
        """))

        return [dict(r._mapping) for r in result]

    @staticmethod
    async def cleanup_old_metrics(db: AsyncSession, retention_days: int = 90):
        """Supprime les metriques plus anciennes que retention_days."""
        await db.execute(text("""
            DELETE FROM traffic_metrics
            WHERE period_start < NOW() - INTERVAL ':days days'
        """), {"days": retention_days})
        await db.commit()
```

### `app/routers/admin/traffic.py`

```python
from fastapi import APIRouter, Depends, Query
from app.core.dependencies import ActiveUser, DbSession
from app.services.traffic_service import TrafficService

router = APIRouter(prefix="/traffic", tags=["Traffic Monitoring"])


@router.get("/dashboard")
async def get_traffic_dashboard(
    hours: int = Query(24, ge=1, le=720),
    db: DbSession = Depends(),
    current_user: ActiveUser = Depends(),
):
    """Resume du trafic sur les N dernieres heures."""
    return await TrafficService.get_dashboard_summary(db, hours)


@router.get("/endpoint-detail")
async def get_endpoint_detail(
    endpoint: str,
    days: int = Query(7, ge=1, le=90),
    db: DbSession = Depends(),
    current_user: ActiveUser = Depends(),
):
    """Detail du trafic pour un endpoint specifique."""
    return await TrafficService.get_endpoint_detail(db, endpoint, days)


@router.get("/scaling-candidates")
async def get_scaling_candidates(
    db: DbSession = Depends(),
    current_user: ActiveUser = Depends(),
):
    """Endpoints candidats au scaling (volume + latence + tendance)."""
    return await TrafficService.get_scaling_candidates(db)
```

---

## Composant 5 : Alertes email

### Integration dans le flush du middleware

```python
async def _check_alerts(self, metrics: dict, period: datetime):
    """Verifie les seuils d'alerte apres chaque flush."""
    from app.services.email_service import EmailService

    alerts = []

    for key, m in metrics.items():
        method, endpoint = key.split(":", 1)
        avg_latency = m["total_latency_ms"] / max(m["request_count"], 1)
        error_rate = m["status_5xx"] / max(m["request_count"], 1)

        # Alerte latence elevee
        if avg_latency > 2000:  # > 2 secondes
            alerts.append(
                f"Latence elevee: {method} {endpoint} - "
                f"Moyenne: {avg_latency:.0f}ms ({m['request_count']} requetes)"
            )

        # Alerte taux d'erreurs
        if error_rate > 0.05 and m["request_count"] > 10:
            alerts.append(
                f"Taux erreurs 5xx: {method} {endpoint} - "
                f"{error_rate:.1%} ({m['status_5xx']}/{m['request_count']})"
            )

    if alerts:
        await EmailService.send_alert_email(
            subject=f"[Usenghor] {len(alerts)} alerte(s) trafic",
            alerts=alerts,
            period=period,
        )
```

---

## Composant 6 : Dashboard admin Nuxt

### Page : `pages/admin/monitoring/index.vue`

Utilise **AmCharts 5** (deja installe) pour afficher :

#### Panneau 1 : KPIs (cartes)
- Total requetes (24h)
- Latence moyenne
- Taux d'erreurs
- Endpoints actifs

#### Panneau 2 : Courbe temporelle
- Requetes/heure sur les 24 dernieres heures
- Superposition latence moyenne

#### Panneau 3 : Top endpoints (tableau interactif)
- Classement par volume, latence, erreurs
- Clic pour voir le detail d'un endpoint

#### Panneau 4 : Candidats au scaling
- Tableau avec score de priorite
- Indicateurs : volume, latence, croissance, erreurs
- Code couleur : rouge (urgent), orange (a surveiller), vert (ok)

#### Panneau 5 : Heatmap (optionnel)
- Trafic par heure/jour de la semaine
- Identifie les pics recurrents

### Composable : `composables/useTrafficApi.ts`

```typescript
export function useTrafficApi() {
  const { apiFetch } = useApi()

  return {
    getDashboard: (hours = 24) =>
      apiFetch(`/api/admin/traffic/dashboard?hours=${hours}`),

    getEndpointDetail: (endpoint: string, days = 7) =>
      apiFetch(`/api/admin/traffic/endpoint-detail?endpoint=${encodeURIComponent(endpoint)}&days=${days}`),

    getScalingCandidates: () =>
      apiFetch('/api/admin/traffic/scaling-candidates'),
  }
}
```

---

## Tache periodique : nettoyage

### Option A : via FastAPI lifespan

```python
# Dans main.py, ajouter au lifespan
async def cleanup_task():
    """Nettoyage quotidien des anciennes metriques."""
    while True:
        await asyncio.sleep(86400)  # 24 heures
        async with async_session_maker() as db:
            await TrafficService.cleanup_old_metrics(db)
```

### Option B : via cron systeme

```bash
# Crontab sur le VPS
0 3 * * * docker exec usenghor_backend python -c "
import asyncio
from app.database import async_session_maker
from app.services.traffic_service import TrafficService
asyncio.run(TrafficService.cleanup_old_metrics(async_session_maker()))
"
```

---

## Bilan des ressources

| Ressource | Impact |
|-----------|--------|
| **RAM** | < 500 Ko (compteurs en memoire) |
| **CPU** | ~0.1 ms/requete (increment compteur) |
| **PostgreSQL** | ~1.5 Mo/mois (~17k lignes/jour) |
| **Conteneurs** | 0 supplementaire |
| **Dependances** | 0 supplementaire |
| **Reseau** | 0 (tout est local) |

---

## Avantages

- **Zero impact sur les ressources** du serveur
- **Zero dependance** supplementaire (utilise PostgreSQL + AmCharts existants)
- **Zero conteneur** supplementaire
- Alertes email via l'infrastructure SMTP existante
- Score de scaling automatique pour identifier les priorites
- Dashboard integre dans l'admin existant (meme authentification)
- Maintenance minimale (nettoyage automatique)

## Inconvenients

- Dashboards moins riches que Grafana (mais suffisants pour l'usage)
- Pas de metriques systeme (CPU, RAM) — uniquement trafic applicatif
- Historique limite par la retention PostgreSQL choisie
- Requiert du developpement custom (vs configuration Grafana)

---

## Quand choisir cette solution ?

- VPS avec **ressources limitees** (< 4 Go RAM total)
- Equipe **petite** ne souhaitant pas maintenir de stack monitoring separee
- Besoin de **detecter les tendances** sans monitoring temps reel a la seconde
- L'objectif principal est d'**identifier les services a scaler**, pas le debugging en temps reel
- Preference pour une solution **integree** dans l'admin existant
