# Plan d'implémentation - Étiquettes (Tags)

> **Route**: `/admin/contenus/etiquettes`
> **Permission**: `news.edit`
> **Service SQL**: `09_content`
> **Table**: `tags`

---

## Fonctionnalités

### 1. Liste des étiquettes

- **Tableau simple**
  - Colonnes : Nom, Slug, Icône, Nombre d'actualités, Actions
  - Tri par nom ou par utilisation
  - Recherche textuelle

### 2. Création d'une étiquette

- **Formulaire simple**
  - Nom* (ex: "Recherche", "Événement", "Partenariat")
  - Slug* (auto-généré depuis le nom)
  - Icône (sélecteur d'icône Lucide)
  - Description (optionnel)

### 3. Modification d'une étiquette

- Modification du nom, icône, description
- Le slug ne devrait pas être modifié (URLs cassées)
- Avertissement si le tag est utilisé

### 4. Suppression d'une étiquette

- Confirmation requise
- Affiche le nombre d'actualités utilisant ce tag
- Dissociation automatique (pas de suppression en cascade des actualités)

### 5. Fusion de tags (optionnel)

- Permet de fusionner deux tags similaires
- Transfère toutes les associations au tag cible
- Supprime le tag source

### 6. Vue des actualités par tag

- Lien vers la liste des actualités filtrée par ce tag

---

## Endpoints FastAPI

### Liste des étiquettes

```
GET /api/admin/tags
```
**Paramètres**:
- `page`, `limit` (optionnels, peut être sans pagination)
- `search`
- `sort_by`: name | usage_count
- `sort_order`: asc | desc

**Réponse**:
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Recherche",
      "slug": "recherche",
      "icon": "microscope",
      "description": "Articles liés à la recherche",
      "news_count": 25
    }
  ],
  "total": 15
}
```

### Détail d'une étiquette

```
GET /api/admin/tags/{id}
```

### Création

```
POST /api/admin/tags
```
**Body**:
```json
{
  "name": "Innovation",
  "slug": "innovation",
  "icon": "lightbulb",
  "description": "Actualités sur l'innovation"
}
```
**Permission**: `news.edit`

### Modification

```
PUT /api/admin/tags/{id}
```
**Permission**: `news.edit`

### Suppression

```
DELETE /api/admin/tags/{id}
```
**Permission**: `news.edit`
**Note**: Retourne une erreur si le tag est utilisé, sauf si `force=true`

### Vérification avant suppression

```
GET /api/admin/tags/{id}/usage
```
**Réponse**:
```json
{
  "news_count": 12,
  "can_delete": true,
  "news_sample": [
    { "id": "uuid", "title": "Titre de l'actualité" }
  ]
}
```

### Fusion de tags

```
POST /api/admin/tags/{source_id}/merge/{target_id}
```
**Permission**: `news.edit`
**Réponse**: Tag cible mis à jour avec compteur actualisé

### Actualités d'un tag

```
GET /api/admin/tags/{id}/news
```
**Paramètres**: `page`, `limit`
**Réponse**: Liste paginée des actualités ayant ce tag

---

## Notes d'implémentation

- Le slug est unique et généré automatiquement (slugify)
- Les icônes proviennent de la bibliothèque Lucide
- Prévoir un sélecteur d'icônes visuel
- Le compteur d'utilisation est calculé dynamiquement ou stocké/mis à jour
- La création de tags peut aussi se faire inline depuis le formulaire d'actualité
- Limiter le nombre de tags par actualité (recommandé : 3-5 max)
- Les tags peuvent être utilisés pour le filtrage public sur le site
