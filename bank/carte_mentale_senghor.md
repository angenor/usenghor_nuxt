# MENU - STRUCTURE DU SITE

> **Légende:**
> - **PAGE** = Route principale (`/slug`)
> - **SOUS-PAGE** = Route imbriquée (`/parent/slug`)
> - **SECTION** = Bloc affiché sur une page parente (ancre `#section`)
> - **LISTING** = Page de liste avec filtres/pagination
> - **CARD** = Élément affiché dans un listing
> - **DYNAMIQUE** = Contenu venant d'un CMS/API

---

## 1. Nous connaître — PAGE `/a-propos`

### 1.1. Notre mission — SECTION `#mission`
- **Notre histoire** — SOUS-PAGE `/a-propos/histoire`
  - Projet Senghor — SECTION
- **Notre gouvernance** — SOUS-PAGE `/a-propos/gouvernance`
  - Textes fondateurs — SECTION + Documents PDF
  - Pays bailleurs — SECTION + CARDs pays
  - Conseil d'Administration — SECTION + CARDs membres
- Accompagner la transformation de l'Afrique — SECTION texte

### 1.2. Notre stratégie — SOUS-PAGE `/a-propos/strategie`
- Plan stratégique — SECTION + Document téléchargeable
- Levée de fonds — SECTION

### 1.3. Nos engagements — SOUS-PAGE `#engagements`
- Nos valeurs — SECTION
- Notre charte éthique — SECTION + Document PDF

### 1.4. Notre organisation — SOUS-PAGE `/a-propos/organisation`

#### 1.4.1. Organigramme — SECTION `#organigramme` (composant interactif)

**Rectorat** — CARD groupe
- Cabinet
- Service communication
- Direction des campus
- Direction du développement et de l'entrepreneuriat
- Direction des relations extérieures
- Programme alumni

**Départements** — CARD groupe
- Culture
- Environnement
- Management
- Santé
- École doctorale

**Services académiques** — CARD groupe
- Centre d'ingénierie de formations et d'innovation pédagogique
- Bibliothèque
- Service de scolarité
- Service informatique
- Service audiovisuel

**Services administratifs** — CARD groupe
- Service de la comptabilité
- Service du personnel et des achats
- Service de l'assurance qualité et du suivi évaluation
- Bureau voyage
- Service intérieur

**Le personnel** — SOUS-PAGE `/a-propos/equipe`
- Trombinoscope — LISTING + CARDs membres (filtrable par service)

#### 1.4.2. Services — SECTION `#services`

### 1.5. Nos partenaires — SOUS-PAGE `/a-propos/partenaires`
- Campus externalisés — SECTION + CARDs campus
- Partenaires stratégiques — SECTION + CARDs logos

### 1.6. Nous rejoindre — PAGE `/carrieres`
- Faire carrière chez nous — SECTION intro
- En tant que professeur — SOUS-PAGE `/carrieres/enseignants`
- En tant qu'étudiant — SECTION lien vers /formations
- Partenaire stratégique — SECTION formulaire contact

---

## 2. Se former — PAGE `/formations`

### 2.1. Doctorat — SOUS-PAGE `/formations/doctorat`
- LISTING des programmes doctoraux

### 2.2. Master — SOUS-PAGE `/formations/master`
- Campus d'Alexandrie — SECTION + LISTING programmes
- Campus externalisés — SECTION + LISTING programmes
- En ligne — SECTION + LISTING programmes
- Chaque programme — SOUS-PAGE `/formations/master/[slug]` DYNAMIQUE

### 2.3. Diplôme d'université — SOUS-PAGE `/formations/diplomes-universitaires`
- LISTING des DU

### 2.4. Formations certifiantes — SOUS-PAGE `/formations/certifiantes`
- LISTING des certifications

---

## 3. Nos projets — PAGE `/projets`

- Transform'Action Africa — SOUS-PAGE `/projets/transform-action-africa`
- Kreafrika — SOUS-PAGE `/projets/kreafrika`
- Levée de fonds — SOUS-PAGE `/projets/levee-de-fonds`

---

## 4. Notre actualité — PAGE `/actualites`

### 4.1. Appels à candidatures — SOUS-PAGE `/actualites/appels`
- Appels en cours — LISTING filtre statut=ouvert
- Appels clos — LISTING filtre statut=clos
- Recrutements — SOUS-PAGE `/actualites/recrutements` ou filtre
- Chaque appel — SOUS-PAGE `/actualites/appels/[slug]` DYNAMIQUE

### 4.2. Événements — SOUS-PAGE `/actualites/evenements`
- Événement en cours — LISTING filtre à venir
- Événements terminés — LISTING filtre passés
- Chaque événement — SOUS-PAGE `/actualites/evenements/[slug]` DYNAMIQUE

---

## 5. Nos alumni — PAGE `/alumni`
- Présentation programme — SECTION
- Annuaire/témoignages — LISTING + CARDs alumni
- Rejoindre le réseau — SECTION

---

## 6. Siège de Borg el Arab — PAGE `/campus`

- Logements — SECTION `#logements`
- Bibliothèque — SECTION `#bibliotheque`
- Salle de conférences — SECTION `#conferences`
- Espaces académiques — SECTION `#academique`
- Piscine — SECTION `#piscine`
- Sports — SECTION `#sports`
- Hôtel — SECTION `#hotel`

---

## Pages additionnelles suggérées

- PAGE `/` — Accueil (Hero + sections clés)
- PAGE `/contact` — Formulaire + coordonnées
- PAGE `/mentions-legales`
- PAGE `/politique-confidentialite`
- PAGE `/plan-du-site`
- PAGE `/recherche` — Résultats de recherche
