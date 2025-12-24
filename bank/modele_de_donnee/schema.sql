-- =============================================================================
-- SCHEMA SQL POSTGRESQL - UNIVERSITÉ SENGHOR
-- =============================================================================
-- Généré depuis le MCD du projet usenghor
-- Compatible PostgreSQL 14+
-- =============================================================================

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Extension pour recherche full-text
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- =============================================================================
-- TYPES ÉNUMÉRÉS
-- =============================================================================

CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'editor', 'author', 'viewer');
CREATE TYPE page_type AS ENUM ('static', 'listing', 'detail');
CREATE TYPE section_type AS ENUM (
    'editor_js', 'hero', 'text_image', 'gallery', 'cards_grid',
    'accordion', 'tabs', 'timeline', 'team_grid', 'partners_logos',
    'cta_banner', 'stats', 'testimonials', 'contact_form', 'map',
    'documents_list', 'video_embed', 'custom'
);
CREATE TYPE section_background AS ENUM ('white', 'gray', 'primary', 'dark', 'image');
CREATE TYPE section_padding AS ENUM ('none', 'small', 'medium', 'large');
CREATE TYPE section_visibility AS ENUM ('all', 'desktop', 'mobile');
CREATE TYPE formation_type AS ENUM ('doctorat', 'master', 'du', 'certifiante');
CREATE TYPE campus_type AS ENUM ('alexandrie', 'externalise', 'en_ligne');
CREATE TYPE staff_type AS ENUM ('direction', 'enseignant', 'administratif', 'technique');
CREATE TYPE civility AS ENUM ('M.', 'Mme', 'Dr', 'Pr', 'S.E.');
CREATE TYPE service_category AS ENUM ('rectorat', 'academique', 'administratif');
CREATE TYPE ca_role AS ENUM ('president', 'vice_president', 'membre', 'observateur');
CREATE TYPE partner_type AS ENUM ('academique', 'institutionnel', 'entreprise', 'ong');
CREATE TYPE project_status AS ENUM ('en_cours', 'termine', 'a_venir');
CREATE TYPE article_type AS ENUM ('article', 'communique', 'annonce');
CREATE TYPE appel_type AS ENUM ('formation', 'bourse', 'stage', 'recrutement', 'autre');
CREATE TYPE appel_status AS ENUM ('brouillon', 'ouvert', 'clos');
CREATE TYPE event_type AS ENUM ('conference', 'seminaire', 'workshop', 'ceremonie', 'culturel', 'autre');
CREATE TYPE event_status AS ENUM ('a_venir', 'en_cours', 'termine', 'annule');
CREATE TYPE location_type AS ENUM ('presentiel', 'en_ligne', 'hybride');
CREATE TYPE facility_type AS ENUM ('logement', 'bibliotheque', 'conference', 'academique', 'sport', 'restauration', 'hotel', 'autre');
CREATE TYPE document_category AS ENUM ('texte_fondateur', 'charte', 'rapport', 'guide', 'formulaire', 'autre');
CREATE TYPE media_type AS ENUM ('image', 'video', 'audio');
CREATE TYPE menu_location AS ENUM ('main', 'footer', 'mobile');
CREATE TYPE menu_item_type AS ENUM ('page', 'custom', 'submenu');
CREATE TYPE link_target AS ENUM ('_self', '_blank');
CREATE TYPE social_platform AS ENUM ('facebook', 'twitter', 'linkedin', 'youtube', 'instagram');
CREATE TYPE language_code AS ENUM ('fr', 'en', 'ar', 'multi');

-- =============================================================================
-- TABLES SYSTÈME
-- =============================================================================

-- Utilisateurs CMS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    display_name VARCHAR(255) NOT NULL,
    photo_url TEXT,
    role user_role NOT NULL DEFAULT 'viewer',
    permissions TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configuration globale (singleton)
CREATE TABLE settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'global',
    site_name_fr VARCHAR(255) NOT NULL,
    site_name_en VARCHAR(255),
    site_name_ar VARCHAR(255),
    site_description_fr TEXT,
    site_description_en TEXT,
    site_description_ar TEXT,
    logo TEXT,
    logo_dark TEXT,
    favicon TEXT,
    contact_address_fr TEXT,
    contact_address_en TEXT,
    contact_address_ar TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    contact_fax VARCHAR(50),
    social_links JSONB DEFAULT '[]',
    default_og_image TEXT,
    google_analytics_id VARCHAR(50),
    maintenance_mode BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TABLES ORGANISATION
-- =============================================================================

-- Départements
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name_fr VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    name_ar VARCHAR(255),
    description_fr TEXT,
    description_en TEXT,
    description_ar TEXT,
    icon VARCHAR(100),
    color VARCHAR(7),
    head_id UUID,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    category service_category NOT NULL,
    name_fr VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    name_ar VARCHAR(255),
    description_fr TEXT,
    description_en TEXT,
    description_ar TEXT,
    icon VARCHAR(100),
    head_id UUID,
    email VARCHAR(255),
    phone VARCHAR(50),
    location VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personnel
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    staff_type staff_type NOT NULL,
    civility civility,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    title_fr VARCHAR(255),
    title_en VARCHAR(255),
    title_ar VARCHAR(255),
    bio_fr TEXT,
    bio_en TEXT,
    bio_ar TEXT,
    photo TEXT,
    email VARCHAR(255),
    phone VARCHAR(50),
    office VARCHAR(100),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    linkedin VARCHAR(255),
    research_gate VARCHAR(255),
    orcid VARCHAR(50),
    publications JSONB DEFAULT '[]',
    is_published BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ajout des FK pour head_id
ALTER TABLE departments ADD CONSTRAINT fk_departments_head FOREIGN KEY (head_id) REFERENCES staff(id) ON DELETE SET NULL;
ALTER TABLE services ADD CONSTRAINT fk_services_head FOREIGN KEY (head_id) REFERENCES staff(id) ON DELETE SET NULL;

-- Conseil d'Administration
CREATE TABLE conseil_administration (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    civility civility,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    title_fr VARCHAR(255),
    title_en VARCHAR(255),
    title_ar VARCHAR(255),
    ca_role ca_role NOT NULL DEFAULT 'membre',
    representing_fr VARCHAR(255),
    representing_en VARCHAR(255),
    representing_ar VARCHAR(255),
    country_code CHAR(2),
    photo TEXT,
    bio_fr TEXT,
    bio_en TEXT,
    bio_ar TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    mandate_start DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pays Bailleurs
CREATE TABLE pays_bailleurs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_fr VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    name_ar VARCHAR(100),
    code CHAR(2) UNIQUE NOT NULL,
    flag TEXT,
    contribution_type_fr VARCHAR(255),
    contribution_type_en VARCHAR(255),
    contribution_type_ar VARCHAR(255),
    member_since INTEGER,
    website VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partenaires
CREATE TABLE partenaires (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    partner_type partner_type NOT NULL,
    name_fr VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    name_ar VARCHAR(255),
    description_fr TEXT,
    description_en TEXT,
    description_ar TEXT,
    logo TEXT NOT NULL,
    website VARCHAR(255),
    country CHAR(2),
    partnership_type_fr VARCHAR(255),
    partnership_type_en VARCHAR(255),
    partnership_type_ar VARCHAR(255),
    is_strategic BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TABLES FORMATIONS
-- =============================================================================

-- Campus Externalisés
CREATE TABLE campus_externalises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name_fr VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    name_ar VARCHAR(255),
    country CHAR(2) NOT NULL,
    city_fr VARCHAR(100) NOT NULL,
    city_en VARCHAR(100),
    city_ar VARCHAR(100),
    address_fr TEXT,
    address_en TEXT,
    address_ar TEXT,
    description_fr TEXT,
    description_en TEXT,
    description_ar TEXT,
    image TEXT,
    logo TEXT,
    website VARCHAR(255),
    contact_email VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Formations
CREATE TABLE formations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    formation_type formation_type NOT NULL,
    title_fr VARCHAR(255) NOT NULL,
    title_en VARCHAR(255),
    title_ar VARCHAR(255),
    short_description_fr TEXT,
    short_description_en TEXT,
    short_description_ar TEXT,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    campus campus_type NOT NULL DEFAULT 'alexandrie',
    campus_externalise_id UUID REFERENCES campus_externalises(id) ON DELETE SET NULL,
    duration_fr VARCHAR(100),
    duration_en VARCHAR(100),
    duration_ar VARCHAR(100),
    credits INTEGER,
    diploma_fr VARCHAR(255),
    diploma_en VARCHAR(255),
    diploma_ar VARCHAR(255),
    admission_requirements JSONB DEFAULT '[]',
    program_content JSONB DEFAULT '[]',
    career_opportunities JSONB DEFAULT '[]',
    application_url VARCHAR(255),
    brochure_url TEXT,
    image TEXT,
    gallery TEXT[] DEFAULT '{}',
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    application_open BOOLEAN DEFAULT FALSE,
    application_deadline TIMESTAMPTZ,
    start_date TIMESTAMPTZ,
    meta_title_fr VARCHAR(255),
    meta_title_en VARCHAR(255),
    meta_title_ar VARCHAR(255),
    meta_description_fr TEXT,
    meta_description_en TEXT,
    meta_description_ar TEXT,
    og_image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TABLES PROJETS
-- =============================================================================

-- Projets
CREATE TABLE projets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    title_fr VARCHAR(255) NOT NULL,
    title_en VARCHAR(255),
    title_ar VARCHAR(255),
    short_description_fr TEXT,
    short_description_en TEXT,
    short_description_ar TEXT,
    logo TEXT,
    cover_image TEXT NOT NULL,
    project_status project_status DEFAULT 'en_cours',
    start_date DATE,
    end_date DATE,
    budget VARCHAR(100),
    website VARCHAR(255),
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    meta_title_fr VARCHAR(255),
    meta_title_en VARCHAR(255),
    meta_title_ar VARCHAR(255),
    meta_description_fr TEXT,
    meta_description_en TEXT,
    meta_description_ar TEXT,
    og_image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table de liaison Projets-Partenaires
CREATE TABLE projets_partenaires (
    projet_id UUID REFERENCES projets(id) ON DELETE CASCADE,
    partenaire_id UUID REFERENCES partenaires(id) ON DELETE CASCADE,
    PRIMARY KEY (projet_id, partenaire_id)
);

-- =============================================================================
-- TABLES ACTUALITÉS
-- =============================================================================

-- Catégories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name_fr VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    name_ar VARCHAR(100),
    description_fr TEXT,
    description_en TEXT,
    description_ar TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    color VARCHAR(7),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Actualités / Articles
CREATE TABLE actualites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    article_type article_type NOT NULL DEFAULT 'article',
    title_fr VARCHAR(255) NOT NULL,
    title_en VARCHAR(255),
    title_ar VARCHAR(255),
    excerpt_fr TEXT,
    excerpt_en TEXT,
    excerpt_ar TEXT,
    cover_image TEXT NOT NULL,
    content JSONB DEFAULT '[]',
    tags TEXT[] DEFAULT '{}',
    author_id UUID REFERENCES staff(id) ON DELETE SET NULL,
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    meta_title_fr VARCHAR(255),
    meta_title_en VARCHAR(255),
    meta_title_ar VARCHAR(255),
    meta_description_fr TEXT,
    meta_description_en TEXT,
    meta_description_ar TEXT,
    og_image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table de liaison Actualités-Catégories
CREATE TABLE actualites_categories (
    actualite_id UUID REFERENCES actualites(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (actualite_id, category_id)
);

-- Appels à Candidatures
CREATE TABLE appels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    appel_type appel_type NOT NULL,
    title_fr VARCHAR(255) NOT NULL,
    title_en VARCHAR(255),
    title_ar VARCHAR(255),
    excerpt_fr TEXT,
    excerpt_en TEXT,
    excerpt_ar TEXT,
    cover_image TEXT,
    content JSONB DEFAULT '[]',
    formation_id UUID REFERENCES formations(id) ON DELETE SET NULL,
    requirements JSONB DEFAULT '[]',
    documents_required JSONB DEFAULT '[]',
    application_url VARCHAR(255),
    application_email VARCHAR(255),
    documents JSONB DEFAULT '[]',
    appel_status appel_status NOT NULL DEFAULT 'brouillon',
    open_date TIMESTAMPTZ,
    close_date TIMESTAMPTZ,
    results_date TIMESTAMPTZ,
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    meta_title_fr VARCHAR(255),
    meta_title_en VARCHAR(255),
    meta_title_ar VARCHAR(255),
    meta_description_fr TEXT,
    meta_description_en TEXT,
    meta_description_ar TEXT,
    og_image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Événements
CREATE TABLE evenements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    event_type event_type NOT NULL,
    title_fr VARCHAR(255) NOT NULL,
    title_en VARCHAR(255),
    title_ar VARCHAR(255),
    excerpt_fr TEXT,
    excerpt_en TEXT,
    excerpt_ar TEXT,
    cover_image TEXT NOT NULL,
    content JSONB DEFAULT '[]',
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ,
    timezone VARCHAR(50) DEFAULT 'Africa/Cairo',
    location_type location_type NOT NULL DEFAULT 'presentiel',
    venue_name_fr VARCHAR(255),
    venue_name_en VARCHAR(255),
    venue_name_ar VARCHAR(255),
    address_fr TEXT,
    address_en TEXT,
    address_ar TEXT,
    city_fr VARCHAR(100),
    city_en VARCHAR(100),
    city_ar VARCHAR(100),
    country CHAR(2),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    online_url VARCHAR(255),
    registration_required BOOLEAN DEFAULT FALSE,
    registration_url VARCHAR(255),
    registration_deadline TIMESTAMPTZ,
    max_participants INTEGER,
    is_free BOOLEAN DEFAULT TRUE,
    price VARCHAR(100),
    speakers JSONB DEFAULT '[]',
    program JSONB DEFAULT '[]',
    gallery TEXT[] DEFAULT '{}',
    video_url VARCHAR(255),
    event_status event_status NOT NULL DEFAULT 'a_venir',
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    meta_title_fr VARCHAR(255),
    meta_title_en VARCHAR(255),
    meta_title_ar VARCHAR(255),
    meta_description_fr TEXT,
    meta_description_en TEXT,
    meta_description_ar TEXT,
    og_image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TABLES ALUMNI
-- =============================================================================

-- Alumni
CREATE TABLE alumni (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    civility civility,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    photo TEXT,
    promotion VARCHAR(10) NOT NULL,
    formation_id UUID REFERENCES formations(id) ON DELETE SET NULL,
    current_position_fr VARCHAR(255),
    current_position_en VARCHAR(255),
    current_position_ar VARCHAR(255),
    current_organization VARCHAR(255),
    country CHAR(2),
    testimonial_fr TEXT,
    testimonial_en TEXT,
    testimonial_ar TEXT,
    linkedin VARCHAR(255),
    email VARCHAR(255),
    is_ambassador BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT FALSE,
    consent_given BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TABLES CAMPUS / INFRASTRUCTURES
-- =============================================================================

-- Installations Campus
CREATE TABLE campus_facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    facility_type facility_type NOT NULL,
    name_fr VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    name_ar VARCHAR(255),
    description_fr TEXT,
    description_en TEXT,
    description_ar TEXT,
    features_fr TEXT[] DEFAULT '{}',
    features_en TEXT[] DEFAULT '{}',
    features_ar TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    capacity VARCHAR(100),
    opening_hours_fr TEXT,
    opening_hours_en TEXT,
    opening_hours_ar TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    booking_url VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TABLES DOCUMENTS ET MÉDIAS
-- =============================================================================

-- Documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_category document_category NOT NULL,
    title_fr VARCHAR(255) NOT NULL,
    title_en VARCHAR(255),
    title_ar VARCHAR(255),
    description_fr TEXT,
    description_en TEXT,
    description_ar TEXT,
    file_url TEXT NOT NULL,
    file_type VARCHAR(20),
    file_size BIGINT,
    language language_code NOT NULL DEFAULT 'fr',
    year INTEGER,
    is_public BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Médias
CREATE TABLE medias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    media_type media_type NOT NULL,
    title_fr VARCHAR(255),
    title_en VARCHAR(255),
    title_ar VARCHAR(255),
    alt_fr VARCHAR(255),
    alt_en VARCHAR(255),
    alt_ar VARCHAR(255),
    description_fr TEXT,
    description_en TEXT,
    description_ar TEXT,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    mime_type VARCHAR(100),
    file_size BIGINT,
    width INTEGER,
    height INTEGER,
    duration INTEGER,
    tags TEXT[] DEFAULT '{}',
    folder VARCHAR(255),
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TABLES PAGES ET SECTIONS DYNAMIQUES
-- =============================================================================

-- Pages
CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) NOT NULL,
    page_type page_type NOT NULL DEFAULT 'static',
    template VARCHAR(100),
    parent_id UUID REFERENCES pages(id) ON DELETE SET NULL,
    title_fr VARCHAR(255) NOT NULL,
    title_en VARCHAR(255),
    title_ar VARCHAR(255),
    meta_title_fr VARCHAR(255),
    meta_title_en VARCHAR(255),
    meta_title_ar VARCHAR(255),
    meta_description_fr TEXT,
    meta_description_en TEXT,
    meta_description_ar TEXT,
    og_image TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    sort_order INTEGER DEFAULT 0,
    show_in_nav BOOLEAN DEFAULT TRUE,
    nav_label_fr VARCHAR(100),
    nav_label_en VARCHAR(100),
    nav_label_ar VARCHAR(100),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(slug, parent_id)
);

-- Sections de Page
CREATE TABLE page_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    section_type section_type NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    anchor VARCHAR(50),
    title_fr VARCHAR(255),
    title_en VARCHAR(255),
    title_ar VARCHAR(255),
    subtitle_fr TEXT,
    subtitle_en TEXT,
    subtitle_ar TEXT,
    background section_background DEFAULT 'white',
    background_image TEXT,
    padding section_padding DEFAULT 'medium',
    content JSONB NOT NULL DEFAULT '{}',
    visibility section_visibility DEFAULT 'all',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sections de Formation (réutilisation du système de sections)
CREATE TABLE formation_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    formation_id UUID NOT NULL REFERENCES formations(id) ON DELETE CASCADE,
    section_type section_type NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    anchor VARCHAR(50),
    title_fr VARCHAR(255),
    title_en VARCHAR(255),
    title_ar VARCHAR(255),
    subtitle_fr TEXT,
    subtitle_en TEXT,
    subtitle_ar TEXT,
    background section_background DEFAULT 'white',
    background_image TEXT,
    padding section_padding DEFAULT 'medium',
    content JSONB NOT NULL DEFAULT '{}',
    visibility section_visibility DEFAULT 'all',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sections de Projet
CREATE TABLE projet_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    projet_id UUID NOT NULL REFERENCES projets(id) ON DELETE CASCADE,
    section_type section_type NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    anchor VARCHAR(50),
    title_fr VARCHAR(255),
    title_en VARCHAR(255),
    title_ar VARCHAR(255),
    subtitle_fr TEXT,
    subtitle_en TEXT,
    subtitle_ar TEXT,
    background section_background DEFAULT 'white',
    background_image TEXT,
    padding section_padding DEFAULT 'medium',
    content JSONB NOT NULL DEFAULT '{}',
    visibility section_visibility DEFAULT 'all',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TABLES NAVIGATION
-- =============================================================================

-- Menus
CREATE TABLE menus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location menu_location NOT NULL UNIQUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Items de Menu
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    item_type menu_item_type NOT NULL,
    label_fr VARCHAR(100) NOT NULL,
    label_en VARCHAR(100),
    label_ar VARCHAR(100),
    page_id UUID REFERENCES pages(id) ON DELETE SET NULL,
    url VARCHAR(255),
    target link_target DEFAULT '_self',
    icon VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEX
-- =============================================================================

-- Index pour les recherches fréquentes
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_published ON pages(is_published, published_at);
CREATE INDEX idx_pages_parent ON pages(parent_id);

CREATE INDEX idx_formations_type ON formations(formation_type);
CREATE INDEX idx_formations_campus ON formations(campus);
CREATE INDEX idx_formations_published ON formations(is_published);
CREATE INDEX idx_formations_department ON formations(department_id);
CREATE INDEX idx_formations_featured ON formations(is_featured) WHERE is_featured = TRUE;

CREATE INDEX idx_staff_type ON staff(staff_type);
CREATE INDEX idx_staff_department ON staff(department_id);
CREATE INDEX idx_staff_service ON staff(service_id);
CREATE INDEX idx_staff_published ON staff(is_published);

CREATE INDEX idx_actualites_type ON actualites(article_type);
CREATE INDEX idx_actualites_published ON actualites(is_published, published_at DESC);
CREATE INDEX idx_actualites_featured ON actualites(is_featured) WHERE is_featured = TRUE;

CREATE INDEX idx_appels_status ON appels(appel_status);
CREATE INDEX idx_appels_type ON appels(appel_type);
CREATE INDEX idx_appels_dates ON appels(open_date, close_date);
CREATE INDEX idx_appels_published ON appels(is_published);

CREATE INDEX idx_evenements_status ON evenements(event_status);
CREATE INDEX idx_evenements_dates ON evenements(start_datetime);
CREATE INDEX idx_evenements_published ON evenements(is_published);
CREATE INDEX idx_evenements_featured ON evenements(is_featured) WHERE is_featured = TRUE;

CREATE INDEX idx_alumni_promotion ON alumni(promotion);
CREATE INDEX idx_alumni_formation ON alumni(formation_id);
CREATE INDEX idx_alumni_published ON alumni(is_published);

CREATE INDEX idx_page_sections_page ON page_sections(page_id);
CREATE INDEX idx_page_sections_order ON page_sections(page_id, sort_order);
CREATE INDEX idx_page_sections_active ON page_sections(page_id, is_active);

CREATE INDEX idx_formation_sections_formation ON formation_sections(formation_id);
CREATE INDEX idx_projet_sections_projet ON projet_sections(projet_id);

CREATE INDEX idx_menu_items_menu ON menu_items(menu_id);
CREATE INDEX idx_menu_items_parent ON menu_items(parent_id);

CREATE INDEX idx_medias_type ON medias(media_type);
CREATE INDEX idx_medias_folder ON medias(folder);

-- Index full-text pour recherche
CREATE INDEX idx_formations_search ON formations USING gin(to_tsvector('french', coalesce(title_fr, '') || ' ' || coalesce(short_description_fr, '')));
CREATE INDEX idx_actualites_search ON actualites USING gin(to_tsvector('french', coalesce(title_fr, '') || ' ' || coalesce(excerpt_fr, '')));
CREATE INDEX idx_evenements_search ON evenements USING gin(to_tsvector('french', coalesce(title_fr, '') || ' ' || coalesce(excerpt_fr, '')));

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Application des triggers sur toutes les tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conseil_administration_updated_at BEFORE UPDATE ON conseil_administration FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pays_bailleurs_updated_at BEFORE UPDATE ON pays_bailleurs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partenaires_updated_at BEFORE UPDATE ON partenaires FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campus_externalises_updated_at BEFORE UPDATE ON campus_externalises FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_formations_updated_at BEFORE UPDATE ON formations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projets_updated_at BEFORE UPDATE ON projets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_actualites_updated_at BEFORE UPDATE ON actualites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appels_updated_at BEFORE UPDATE ON appels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_evenements_updated_at BEFORE UPDATE ON evenements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alumni_updated_at BEFORE UPDATE ON alumni FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campus_facilities_updated_at BEFORE UPDATE ON campus_facilities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medias_updated_at BEFORE UPDATE ON medias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_page_sections_updated_at BEFORE UPDATE ON page_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_formation_sections_updated_at BEFORE UPDATE ON formation_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projet_sections_updated_at BEFORE UPDATE ON projet_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menus_updated_at BEFORE UPDATE ON menus FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- DONNÉES INITIALES
-- =============================================================================

-- Insertion des menus par défaut
INSERT INTO menus (location) VALUES ('main'), ('footer'), ('mobile');

-- Insertion de la configuration globale
INSERT INTO settings (
    id,
    site_name_fr,
    site_name_en,
    site_name_ar,
    site_description_fr,
    contact_email
) VALUES (
    'global',
    'Université Senghor',
    'Senghor University',
    'جامعة سنغور',
    'Université internationale de langue française au service du développement africain',
    'contact@usenghor.org'
);

-- =============================================================================
-- VUES UTILES
-- =============================================================================

-- Vue des formations publiées avec département
CREATE VIEW v_formations_published AS
SELECT
    f.*,
    d.name_fr AS department_name_fr,
    d.name_en AS department_name_en,
    d.name_ar AS department_name_ar,
    ce.name_fr AS campus_ext_name_fr
FROM formations f
LEFT JOIN departments d ON f.department_id = d.id
LEFT JOIN campus_externalises ce ON f.campus_externalise_id = ce.id
WHERE f.is_published = TRUE;

-- Vue des événements à venir
CREATE VIEW v_evenements_upcoming AS
SELECT *
FROM evenements
WHERE is_published = TRUE
  AND event_status IN ('a_venir', 'en_cours')
  AND start_datetime >= NOW()
ORDER BY start_datetime ASC;

-- Vue des appels ouverts
CREATE VIEW v_appels_open AS
SELECT
    a.*,
    f.title_fr AS formation_title_fr
FROM appels a
LEFT JOIN formations f ON a.formation_id = f.id
WHERE a.is_published = TRUE
  AND a.appel_status = 'ouvert'
  AND (a.close_date IS NULL OR a.close_date >= NOW())
ORDER BY a.close_date ASC NULLS LAST;

-- Vue du personnel par service
CREATE VIEW v_staff_by_service AS
SELECT
    s.*,
    sv.name_fr AS service_name_fr,
    sv.category AS service_category,
    d.name_fr AS department_name_fr
FROM staff s
LEFT JOIN services sv ON s.service_id = sv.id
LEFT JOIN departments d ON s.department_id = d.id
WHERE s.is_published = TRUE
ORDER BY sv.sort_order, s.sort_order;
