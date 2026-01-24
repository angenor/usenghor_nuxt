// ============================================================================
// MOCK DATA - MENTIONS LÉGALES (EDITORIAL LEGAL)
// ============================================================================
// Basé sur le schéma SQL: 12_editorial.sql
// Tables: editorial_categories, editorial_contents, editorial_contents_history
// ============================================================================

import type { EditorialValueType } from './editorial-statistics'

// Types de pages légales
export type LegalPageKey = 'legal_notice' | 'privacy_policy' | 'terms_of_use' | 'cookie_policy'

// Page légale
export interface LegalPage {
  id: string
  key: LegalPageKey
  title: string
  content: string
  value_type: EditorialValueType
  category_id: string
  updated_at: string
  created_at: string
}

// Historique des modifications
export interface LegalPageHistory {
  id: string
  content_id: string
  old_value: string
  new_value: string
  modified_by_external_id: string | null
  modified_by_name?: string
  modified_at: string
}

// Labels pour les pages légales
export const legalPageLabels: Record<LegalPageKey, string> = {
  legal_notice: 'Mentions légales',
  privacy_policy: 'Politique de confidentialité',
  terms_of_use: 'Conditions générales d\'utilisation',
  cookie_policy: 'Politique de cookies'
}

// Descriptions pour les pages légales
export const legalPageDescriptions: Record<LegalPageKey, string> = {
  legal_notice: 'Informations sur l\'éditeur du site, l\'hébergeur et le directeur de publication',
  privacy_policy: 'Politique de protection des données personnelles (RGPD)',
  terms_of_use: 'Conditions d\'utilisation du site et des services',
  cookie_policy: 'Gestion des cookies et traceurs'
}

// Icônes pour les pages légales
export const legalPageIcons: Record<LegalPageKey, string[]> = {
  legal_notice: ['fas', 'gavel'],
  privacy_policy: ['fas', 'shield-alt'],
  terms_of_use: ['fas', 'file-contract'],
  cookie_policy: ['fas', 'cookie-bite']
}

// Couleurs pour les pages légales
export const legalPageColors: Record<LegalPageKey, string> = {
  legal_notice: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  privacy_policy: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  terms_of_use: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  cookie_policy: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
}

// ============================================================================
// DONNÉES MOCK - CATÉGORIE LÉGALE
// ============================================================================

export const mockLegalCategory = {
  id: 'cat_legal',
  code: 'legal',
  name: 'Pages légales',
  description: 'Contenus juridiques obligatoires du site',
  created_at: '2024-01-01T00:00:00Z'
}

// ============================================================================
// DONNÉES MOCK - PAGES LÉGALES
// ============================================================================

export const mockLegalPages: LegalPage[] = [
  {
    id: 'legal_001',
    key: 'legal_notice',
    title: 'Mentions légales',
    content: `<h2>Éditeur du site</h2>
<p><strong>Université Senghor</strong><br>
1 Place Ahmed Orabi<br>
El Mancheya, Alexandrie<br>
Égypte</p>

<p><strong>Téléphone :</strong> +20 3 484 6155<br>
<strong>Email :</strong> info@usenghor.org</p>

<h2>Directeur de la publication</h2>
<p>Le Recteur de l'Université Senghor</p>

<h2>Hébergeur</h2>
<p><strong>Firebase Hosting</strong><br>
Google LLC<br>
1600 Amphitheatre Parkway<br>
Mountain View, CA 94043<br>
États-Unis</p>

<h2>Propriété intellectuelle</h2>
<p>L'ensemble des contenus (textes, images, vidéos, etc.) présents sur ce site sont la propriété exclusive de l'Université Senghor ou de ses partenaires. Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable.</p>

<h2>Crédits</h2>
<p>Conception et développement : Équipe informatique de l'Université Senghor</p>`,
    value_type: 'html',
    category_id: 'cat_legal',
    updated_at: '2024-11-15T10:30:00Z',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'legal_002',
    key: 'privacy_policy',
    title: 'Politique de confidentialité',
    content: `<h2>Introduction</h2>
<p>L'Université Senghor s'engage à protéger la vie privée des utilisateurs de son site internet. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos données personnelles.</p>

<h2>Données collectées</h2>
<p>Nous collectons les données suivantes :</p>
<ul>
<li><strong>Données d'identification :</strong> nom, prénom, adresse email</li>
<li><strong>Données de connexion :</strong> adresse IP, logs de connexion</li>
<li><strong>Données de navigation :</strong> pages visitées, durée des visites</li>
</ul>

<h2>Finalités du traitement</h2>
<p>Vos données sont utilisées pour :</p>
<ul>
<li>Répondre à vos demandes de contact</li>
<li>Vous envoyer notre newsletter (avec votre consentement)</li>
<li>Améliorer nos services</li>
<li>Établir des statistiques de fréquentation</li>
</ul>

<h2>Base légale</h2>
<p>Le traitement de vos données repose sur :</p>
<ul>
<li>Votre consentement</li>
<li>L'exécution d'un contrat</li>
<li>Nos intérêts légitimes</li>
</ul>

<h2>Durée de conservation</h2>
<p>Vos données sont conservées pendant une durée de 3 ans à compter de votre dernière interaction avec nous, sauf obligation légale contraire.</p>

<h2>Vos droits</h2>
<p>Conformément au RGPD, vous disposez des droits suivants :</p>
<ul>
<li>Droit d'accès à vos données</li>
<li>Droit de rectification</li>
<li>Droit à l'effacement</li>
<li>Droit à la limitation du traitement</li>
<li>Droit à la portabilité</li>
<li>Droit d'opposition</li>
</ul>

<h2>Contact DPO</h2>
<p>Pour exercer vos droits ou pour toute question relative à la protection de vos données, contactez notre Délégué à la Protection des Données :</p>
<p><strong>Email :</strong> dpo@usenghor.org</p>`,
    value_type: 'html',
    category_id: 'cat_legal',
    updated_at: '2024-10-20T14:00:00Z',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'legal_003',
    key: 'terms_of_use',
    title: 'Conditions générales d\'utilisation',
    content: `<h2>Article 1 - Objet</h2>
<p>Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation du site internet de l'Université Senghor.</p>

<h2>Article 2 - Accès au site</h2>
<p>Le site est accessible gratuitement à tout utilisateur disposant d'un accès à Internet. L'Université Senghor met en œuvre tous les moyens raisonnables à sa disposition pour assurer un accès de qualité au site.</p>

<h2>Article 3 - Propriété intellectuelle</h2>
<p>L'ensemble des éléments constituant le site (textes, graphismes, logiciels, photographies, images, sons, plans, logos, marques, créations, etc.) sont protégés par le droit de la propriété intellectuelle.</p>

<h2>Article 4 - Responsabilités</h2>
<p>L'Université Senghor ne saurait être tenue responsable :</p>
<ul>
<li>Des interruptions momentanées du site</li>
<li>De la présence de virus informatiques</li>
<li>Des dommages résultant de l'utilisation du site</li>
</ul>

<h2>Article 5 - Liens hypertextes</h2>
<p>Le site peut contenir des liens vers d'autres sites. L'Université Senghor n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.</p>

<h2>Article 6 - Modification des CGU</h2>
<p>L'Université Senghor se réserve le droit de modifier à tout moment les présentes CGU. Les utilisateurs seront informés de ces modifications par la mise en ligne des CGU actualisées.</p>

<h2>Article 7 - Droit applicable</h2>
<p>Les présentes CGU sont soumises au droit français. Tout litige relatif à l'interprétation ou à l'exécution des présentes sera soumis aux tribunaux compétents.</p>`,
    value_type: 'html',
    category_id: 'cat_legal',
    updated_at: '2024-09-01T09:00:00Z',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'legal_004',
    key: 'cookie_policy',
    title: 'Politique de cookies',
    content: `<h2>Qu'est-ce qu'un cookie ?</h2>
<p>Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette, smartphone) lors de la visite d'un site web. Il permet au site de mémoriser des informations sur votre visite.</p>

<h2>Types de cookies utilisés</h2>

<h3>Cookies essentiels</h3>
<p>Ces cookies sont nécessaires au fonctionnement du site. Ils permettent d'utiliser les principales fonctionnalités du site (session, préférences linguistiques, etc.).</p>

<h3>Cookies analytiques</h3>
<p>Ces cookies nous permettent de mesurer l'audience du site et d'analyser les comportements de navigation pour améliorer nos services. Nous utilisons Google Analytics.</p>

<h3>Cookies marketing</h3>
<p>Ces cookies sont utilisés pour vous proposer des contenus personnalisés. Ils peuvent être déposés par nos partenaires publicitaires.</p>

<h2>Gestion des cookies</h2>
<p>Vous pouvez à tout moment gérer vos préférences en matière de cookies :</p>
<ul>
<li>Via le bandeau de consentement affiché lors de votre première visite</li>
<li>Via les paramètres de votre navigateur</li>
</ul>

<h2>Durée de conservation</h2>
<p>Les cookies sont conservés pour une durée maximale de 13 mois.</p>

<h2>Liste des cookies utilisés</h2>
<table>
<tr><th>Nom</th><th>Finalité</th><th>Durée</th></tr>
<tr><td>_ga</td><td>Google Analytics - Statistiques</td><td>2 ans</td></tr>
<tr><td>_gid</td><td>Google Analytics - Statistiques</td><td>24h</td></tr>
<tr><td>consent</td><td>Mémorisation du consentement</td><td>1 an</td></tr>
</table>

<h2>Plus d'informations</h2>
<p>Pour en savoir plus sur les cookies, vous pouvez consulter le site de la CNIL : <a href="https://www.cnil.fr/fr/cookies-et-autres-traceurs" target="_blank">www.cnil.fr</a></p>`,
    value_type: 'html',
    category_id: 'cat_legal',
    updated_at: '2024-08-15T16:30:00Z',
    created_at: '2024-01-01T00:00:00Z'
  }
]

// ============================================================================
// DONNÉES MOCK - HISTORIQUE DES MODIFICATIONS
// ============================================================================

export const mockLegalPageHistory: LegalPageHistory[] = [
  // Historique mentions légales
  {
    id: 'legal_hist_001',
    content_id: 'legal_001',
    old_value: '... ancien contenu mentions légales ...',
    new_value: '... nouveau contenu mentions légales ...',
    modified_by_external_id: 'user_admin_001',
    modified_by_name: 'Jean Dupont',
    modified_at: '2024-11-15T10:30:00Z'
  },
  {
    id: 'legal_hist_002',
    content_id: 'legal_001',
    old_value: '... contenu initial ...',
    new_value: '... ancien contenu mentions légales ...',
    modified_by_external_id: 'user_admin_002',
    modified_by_name: 'Marie Martin',
    modified_at: '2024-06-01T09:00:00Z'
  },
  // Historique politique de confidentialité
  {
    id: 'legal_hist_003',
    content_id: 'legal_002',
    old_value: '... ancien contenu RGPD ...',
    new_value: '... nouveau contenu RGPD ...',
    modified_by_external_id: 'user_admin_001',
    modified_by_name: 'Jean Dupont',
    modified_at: '2024-10-20T14:00:00Z'
  },
  {
    id: 'legal_hist_004',
    content_id: 'legal_002',
    old_value: '... contenu initial ...',
    new_value: '... ancien contenu RGPD ...',
    modified_by_external_id: 'user_admin_002',
    modified_by_name: 'Marie Martin',
    modified_at: '2024-03-15T11:30:00Z'
  },
  // Historique CGU
  {
    id: 'legal_hist_005',
    content_id: 'legal_003',
    old_value: '... ancien contenu CGU ...',
    new_value: '... nouveau contenu CGU ...',
    modified_by_external_id: 'user_admin_001',
    modified_by_name: 'Jean Dupont',
    modified_at: '2024-09-01T09:00:00Z'
  },
  // Historique cookies
  {
    id: 'legal_hist_006',
    content_id: 'legal_004',
    old_value: '... ancien contenu cookies ...',
    new_value: '... nouveau contenu cookies ...',
    modified_by_external_id: 'user_admin_002',
    modified_by_name: 'Marie Martin',
    modified_at: '2024-08-15T16:30:00Z'
  }
]

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

// Générer un ID unique pour l'historique
export const generateLegalHistoryId = (): string => {
  return `legal_hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Récupérer toutes les pages légales
export const getAllLegalPages = (): LegalPage[] => {
  return [...mockLegalPages].sort((a, b) => {
    const order: LegalPageKey[] = ['legal_notice', 'privacy_policy', 'terms_of_use', 'cookie_policy']
    return order.indexOf(a.key) - order.indexOf(b.key)
  })
}

// Récupérer une page légale par clé
export const getLegalPageByKey = (key: LegalPageKey): LegalPage | undefined => {
  return mockLegalPages.find(p => p.key === key)
}

// Récupérer une page légale par ID
export const getLegalPageById = (id: string): LegalPage | undefined => {
  return mockLegalPages.find(p => p.id === id)
}

// Récupérer l'historique d'une page légale
export const getLegalPageHistory = (contentId: string): LegalPageHistory[] => {
  return mockLegalPageHistory
    .filter(h => h.content_id === contentId)
    .sort((a, b) => new Date(b.modified_at).getTime() - new Date(a.modified_at).getTime())
}

// Statistiques globales des pages légales
export interface LegalPagesStats {
  total_pages: number
  last_updated: string | null
  last_updated_page: LegalPageKey | null
  history_count: number
}

export const getLegalPagesStats = (): LegalPagesStats => {
  const pages = mockLegalPages

  // Trouver la dernière mise à jour
  let lastUpdated: string | null = null
  let lastUpdatedPage: LegalPageKey | null = null

  pages.forEach(p => {
    if (!lastUpdated || new Date(p.updated_at) > new Date(lastUpdated)) {
      lastUpdated = p.updated_at
      lastUpdatedPage = p.key
    }
  })

  return {
    total_pages: pages.length,
    last_updated: lastUpdated,
    last_updated_page: lastUpdatedPage,
    history_count: mockLegalPageHistory.length
  }
}

// Vérifier si une page peut être modifiée
export const canEditLegalPage = (): boolean => {
  // Toutes les pages légales sont modifiables par les admins avec la permission editorial.edit
  return true
}

// Liste ordonnée des clés de pages légales
export const legalPageKeys: LegalPageKey[] = ['legal_notice', 'privacy_policy', 'terms_of_use', 'cookie_policy']
