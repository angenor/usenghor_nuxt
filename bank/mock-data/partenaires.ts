/**
 * Mock Data: Partenaires
 * Table SQL: partenaires
 *
 * Deux catégories principales :
 * 1. Opérateurs et acteurs de la charte (OIF, APF, AUF, AIMF)
 * 2. Partenaires Campus (institutions partenaires)
 */

export type PartnerCategory = 'charter_operator' | 'campus_partner'
export type PartnerType = 'academique' | 'institutionnel' | 'recherche' | 'environnement' | 'culture'

export interface Partenaire {
  id: string
  slug: string
  category: PartnerCategory
  partner_type: PartnerType
  name_fr: string
  name_en?: string
  name_ar?: string
  description_fr?: string
  description_en?: string
  logo: string
  website?: string
  country?: string
  is_active: boolean
  sort_order: number
}

// === OPÉRATEURS ET ACTEURS DE LA CHARTE ===
// Les 4 opérateurs directs de la Francophonie
export const mockCharterOperators: Partenaire[] = [
  {
    id: 'charter-oif',
    slug: 'oif',
    category: 'charter_operator',
    partner_type: 'institutionnel',
    name_fr: 'Organisation Internationale de la Francophonie',
    name_en: 'International Organisation of La Francophonie',
    name_ar: 'المنظمة الدولية للفرنكوفونية',
    description_fr: 'L\'OIF est une institution fondée sur le partage d\'une langue, le français, et de valeurs communes.',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/01.jpg',
    website: 'https://www.francophonie.org',
    is_active: true,
    sort_order: 1
  },
  {
    id: 'charter-apf',
    slug: 'apf',
    category: 'charter_operator',
    partner_type: 'institutionnel',
    name_fr: 'Assemblée Parlementaire de la Francophonie',
    name_en: 'Parliamentary Assembly of the Francophonie',
    name_ar: 'الجمعية البرلمانية للفرنكوفونية',
    description_fr: 'L\'APF rassemble des parlementaires de l\'espace francophone.',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/02.png',
    website: 'https://apf-francophonie.org',
    is_active: true,
    sort_order: 2
  },
  {
    id: 'charter-auf',
    slug: 'auf',
    category: 'charter_operator',
    partner_type: 'academique',
    name_fr: 'Agence Universitaire de la Francophonie',
    name_en: 'Francophone University Agency',
    name_ar: 'الوكالة الجامعية للفرنكوفونية',
    description_fr: 'L\'AUF est un réseau mondial de plus de 1000 établissements d\'enseignement supérieur et de recherche.',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/03.png',
    website: 'https://www.auf.org',
    is_active: true,
    sort_order: 3
  },
  {
    id: 'charter-aimf',
    slug: 'aimf',
    category: 'charter_operator',
    partner_type: 'institutionnel',
    name_fr: 'Association Internationale des Maires Francophones',
    name_en: 'International Association of Francophone Mayors',
    name_ar: 'الرابطة الدولية لرؤساء البلديات الفرانكوفونيين',
    description_fr: 'L\'AIMF regroupe les maires des grandes villes francophones.',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/04.jpg',
    website: 'https://www.aimf.asso.fr',
    is_active: true,
    sort_order: 4
  }
]

// === PARTENAIRES CAMPUS ===
// Institutions partenaires académiques, de recherche, culturelles, etc.
export const mockCampusPartners: Partenaire[] = [
  // --- Institutions académiques ---
  {
    id: 'campus-enap',
    slug: 'enap-quebec',
    category: 'campus_partner',
    partner_type: 'academique',
    name_fr: 'ENAP Québec',
    name_en: 'National School of Public Administration',
    description_fr: 'École nationale d\'administration publique du Québec.',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/1.png',
    website: 'https://www.enap.ca',
    country: 'CA',
    is_active: true,
    sort_order: 10
  },
  {
    id: 'campus-luxembourg',
    slug: 'universite-luxembourg',
    category: 'campus_partner',
    partner_type: 'academique',
    name_fr: 'Université du Luxembourg',
    name_en: 'University of Luxembourg',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/2.png',
    website: 'https://www.uni.lu',
    country: 'LU',
    is_active: true,
    sort_order: 11
  },
  {
    id: 'campus-porto',
    slug: 'universite-porto',
    category: 'campus_partner',
    partner_type: 'academique',
    name_fr: 'Université de Porto',
    name_en: 'University of Porto',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/3.png',
    website: 'https://www.up.pt',
    country: 'PT',
    is_active: true,
    sort_order: 12
  },
  {
    id: 'campus-sciences-po',
    slug: 'sciences-po',
    category: 'campus_partner',
    partner_type: 'academique',
    name_fr: 'Sciences Po',
    name_en: 'Sciences Po Paris',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/12.png',
    website: 'https://www.sciencespo.fr',
    country: 'FR',
    is_active: true,
    sort_order: 13
  },
  {
    id: 'campus-rennes-sb',
    slug: 'rennes-school-business',
    category: 'campus_partner',
    partner_type: 'academique',
    name_fr: 'Rennes School of Business',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/13.png',
    website: 'https://www.rennes-sb.com',
    country: 'FR',
    is_active: true,
    sort_order: 14
  },
  {
    id: 'campus-emlyon',
    slug: 'em-lyon',
    category: 'campus_partner',
    partner_type: 'academique',
    name_fr: 'EM Lyon Business School',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/14.png',
    website: 'https://em-lyon.com',
    country: 'FR',
    is_active: true,
    sort_order: 15
  },
  {
    id: 'campus-szeged',
    slug: 'universite-szeged',
    category: 'campus_partner',
    partner_type: 'academique',
    name_fr: 'Université de Szeged',
    name_en: 'University of Szeged',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/20.png',
    website: 'https://u-szeged.hu',
    country: 'HU',
    is_active: true,
    sort_order: 16
  },
  {
    id: 'campus-ouaga2',
    slug: 'universite-ouagadougou-2',
    category: 'campus_partner',
    partner_type: 'academique',
    name_fr: 'Université Ouagadougou 2',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/26.jpg',
    website: 'https://www.univ-ouaga2.bf',
    country: 'BF',
    is_active: true,
    sort_order: 17
  },
  {
    id: 'campus-parakou',
    slug: 'universite-parakou',
    category: 'campus_partner',
    partner_type: 'academique',
    name_fr: 'Université de Parakou',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/35.png',
    website: 'https://www.univ-parakou.bj',
    country: 'BJ',
    is_active: true,
    sort_order: 18
  },
  {
    id: 'campus-abomey',
    slug: 'universite-abomey-calavi',
    category: 'campus_partner',
    partner_type: 'academique',
    name_fr: 'Université d\'Abomey-Calavi',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/47.jpg',
    website: 'https://www.uac.bj',
    country: 'BJ',
    is_active: true,
    sort_order: 19
  },
  {
    id: 'campus-conakry',
    slug: 'universite-conakry',
    category: 'campus_partner',
    partner_type: 'academique',
    name_fr: 'Université Gamal Abdel Nasser de Conakry',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/34.jpg',
    website: 'https://www.uganc.edu.gn',
    country: 'GN',
    is_active: true,
    sort_order: 20
  },
  {
    id: 'campus-oujda',
    slug: 'universite-oujda',
    category: 'campus_partner',
    partner_type: 'academique',
    name_fr: 'Université Mohammed Premier d\'Oujda',
    name_en: 'Mohammed First University of Oujda',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/21.png',
    website: 'https://www.ump.ma',
    country: 'MA',
    is_active: true,
    sort_order: 21
  },
  {
    id: 'campus-ucac',
    slug: 'ucac',
    category: 'campus_partner',
    partner_type: 'academique',
    name_fr: 'Université Catholique d\'Afrique Centrale',
    name_en: 'Catholic University of Central Africa',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/18.png',
    website: 'https://www.ucac-icy.net',
    country: 'CM',
    is_active: true,
    sort_order: 22
  },
  {
    id: 'campus-ucc',
    slug: 'universite-catholique-congo',
    category: 'campus_partner',
    partner_type: 'academique',
    name_fr: 'Université Catholique du Congo',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/19.jpg',
    website: 'https://www.ucc.cd',
    country: 'CD',
    is_active: true,
    sort_order: 23
  },
  {
    id: 'campus-pharos',
    slug: 'universite-pharos',
    category: 'campus_partner',
    partner_type: 'academique',
    name_fr: 'Université de Pharos',
    name_en: 'Pharos University',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/37.png',
    website: 'https://www.pua.edu.eg',
    country: 'EG',
    is_active: true,
    sort_order: 24
  },
  {
    id: 'campus-ichec',
    slug: 'ichec',
    category: 'campus_partner',
    partner_type: 'academique',
    name_fr: 'ICHEC Brussels Management School',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/8.png',
    website: 'https://www.ichec.be',
    country: 'BE',
    is_active: true,
    sort_order: 25
  },
  {
    id: 'campus-ifi',
    slug: 'institut-francophone-international',
    category: 'campus_partner',
    partner_type: 'academique',
    name_fr: 'Institut Francophone International',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/28.png',
    website: 'https://www.ifi.vn',
    country: 'VN',
    is_active: true,
    sort_order: 26
  },
  {
    id: 'campus-eamau',
    slug: 'eamau',
    category: 'campus_partner',
    partner_type: 'academique',
    name_fr: 'École Africaine des Métiers de l\'Architecture et de l\'Urbanisme',
    name_en: 'African School of Architecture and Urban Planning',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/32.png',
    website: 'https://www.eamau.org',
    country: 'TG',
    is_active: true,
    sort_order: 27
  },
  {
    id: 'campus-iscam',
    slug: 'iscam',
    category: 'campus_partner',
    partner_type: 'academique',
    name_fr: 'ISCAM Madagascar',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/41.png',
    website: 'https://www.iscam.mg',
    country: 'MG',
    is_active: true,
    sort_order: 28
  },
  {
    id: 'campus-madiba',
    slug: 'institut-madiba',
    category: 'campus_partner',
    partner_type: 'academique',
    name_fr: 'Institut Supérieur Madiba',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/42.jpg',
    website: 'https://www.institut-madiba.org',
    country: 'SN',
    is_active: true,
    sort_order: 29
  },
  {
    id: 'campus-mer',
    slug: 'universite-mer',
    category: 'campus_partner',
    partner_type: 'academique',
    name_fr: 'Université Internationale de la Mer',
    name_en: 'International University of the Sea',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/52.png',
    website: 'https://www.uimer.org',
    country: 'FR',
    is_active: true,
    sort_order: 30
  },
  {
    id: 'campus-ista-cemac',
    slug: 'ista-cemac',
    category: 'campus_partner',
    partner_type: 'academique',
    name_fr: 'ISTA CEMAC',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/48.png',
    website: 'https://www.ista-cemac.org',
    country: 'CM',
    is_active: true,
    sort_order: 31
  },

  // --- Institutions de recherche et culture ---
  {
    id: 'campus-ife',
    slug: 'institut-francais-egypte',
    category: 'campus_partner',
    partner_type: 'culture',
    name_fr: 'Institut Français d\'Égypte',
    name_en: 'French Institute of Egypt',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/5.png',
    website: 'https://www.institutfrancais-egypte.com',
    country: 'EG',
    is_active: true,
    sort_order: 40
  },
  {
    id: 'campus-ifao',
    slug: 'ifao',
    category: 'campus_partner',
    partner_type: 'recherche',
    name_fr: 'Institut Français d\'Archéologie Orientale',
    name_en: 'French Institute for Oriental Archaeology',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/22.gif',
    website: 'https://www.ifao.egnet.net',
    country: 'EG',
    is_active: true,
    sort_order: 41
  },
  {
    id: 'campus-cealex',
    slug: 'cealex',
    category: 'campus_partner',
    partner_type: 'recherche',
    name_fr: 'Centre d\'Études Alexandrines',
    name_en: 'Center for Alexandrian Studies',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/9.png',
    website: 'https://www.cealex.org',
    country: 'EG',
    is_active: true,
    sort_order: 42
  },
  {
    id: 'campus-enssib',
    slug: 'enssib',
    category: 'campus_partner',
    partner_type: 'academique',
    name_fr: 'Enssib',
    name_en: 'National School of Information Sciences and Libraries',
    description_fr: 'École nationale supérieure des sciences de l\'information et des bibliothèques.',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/15.png',
    website: 'https://www.enssib.fr',
    country: 'FR',
    is_active: true,
    sort_order: 43
  },
  {
    id: 'campus-enc',
    slug: 'ecole-nationale-chartes',
    category: 'campus_partner',
    partner_type: 'academique',
    name_fr: 'École Nationale des Chartes',
    name_en: 'National School of Charters',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/4.png',
    website: 'https://www.chartes.psl.eu',
    country: 'FR',
    is_active: true,
    sort_order: 44
  },
  {
    id: 'campus-ibdl',
    slug: 'ibdl',
    category: 'campus_partner',
    partner_type: 'culture',
    name_fr: 'IBDL - Institut de la Bibliothèque d\'Alexandrie',
    name_en: 'Library of Alexandria Institute',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/6.png',
    website: 'https://www.bibalex.org',
    country: 'EG',
    is_active: true,
    sort_order: 45
  },
  {
    id: 'campus-ina',
    slug: 'ina',
    category: 'campus_partner',
    partner_type: 'culture',
    name_fr: 'INA - Institut National de l\'Audiovisuel',
    name_en: 'National Audiovisual Institute',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/7.png',
    website: 'https://www.ina.fr',
    country: 'FR',
    is_active: true,
    sort_order: 46
  },

  // --- Organisations environnementales ---
  {
    id: 'campus-ramsar',
    slug: 'ramsar',
    category: 'campus_partner',
    partner_type: 'environnement',
    name_fr: 'Convention Ramsar',
    name_en: 'Ramsar Convention',
    description_fr: 'Convention relative aux zones humides d\'importance internationale.',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/10.png',
    website: 'https://www.ramsar.org',
    is_active: true,
    sort_order: 50
  },
  {
    id: 'campus-iucn',
    slug: 'uicn',
    category: 'campus_partner',
    partner_type: 'environnement',
    name_fr: 'UICN - Union Internationale pour la Conservation de la Nature',
    name_en: 'IUCN - International Union for Conservation of Nature',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/11.png',
    website: 'https://www.iucn.org',
    is_active: true,
    sort_order: 51
  },
  {
    id: 'campus-bioforce',
    slug: 'bioforce',
    category: 'campus_partner',
    partner_type: 'environnement',
    name_fr: 'Bioforce',
    description_fr: 'Formation aux métiers de l\'humanitaire.',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/43.png',
    website: 'https://www.bioforce.org',
    country: 'FR',
    is_active: true,
    sort_order: 52
  },

  // --- Organisations internationales ---
  {
    id: 'campus-unesco',
    slug: 'unesco',
    category: 'campus_partner',
    partner_type: 'institutionnel',
    name_fr: 'UNESCO',
    name_en: 'UNESCO',
    description_fr: 'Organisation des Nations Unies pour l\'éducation, la science et la culture.',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/55.png',
    website: 'https://www.unesco.org',
    is_active: true,
    sort_order: 60
  },
  {
    id: 'campus-fao',
    slug: 'fao',
    category: 'campus_partner',
    partner_type: 'institutionnel',
    name_fr: 'FAO',
    name_en: 'FAO - Food and Agriculture Organization',
    description_fr: 'Organisation des Nations Unies pour l\'alimentation et l\'agriculture.',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/54.png',
    website: 'https://www.fao.org',
    is_active: true,
    sort_order: 61
  },
  {
    id: 'campus-cames',
    slug: 'cames',
    category: 'campus_partner',
    partner_type: 'institutionnel',
    name_fr: 'CAMES - Conseil Africain et Malgache pour l\'Enseignement Supérieur',
    name_en: 'African and Malagasy Council for Higher Education',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/24.jpg',
    website: 'https://www.lecames.org',
    is_active: true,
    sort_order: 62
  },
  {
    id: 'campus-mae-egypte',
    slug: 'mae-egypte',
    category: 'campus_partner',
    partner_type: 'institutionnel',
    name_fr: 'Ministère Égyptien des Affaires Étrangères',
    name_en: 'Egyptian Ministry of Foreign Affairs',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/38.png',
    website: 'https://www.mfa.gov.eg',
    country: 'EG',
    is_active: true,
    sort_order: 63
  },
  {
    id: 'campus-cma',
    slug: 'cma',
    category: 'campus_partner',
    partner_type: 'institutionnel',
    name_fr: 'CMA - Conférence des Ministres Africains',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/17.png',
    website: 'https://www.cma.org',
    is_active: true,
    sort_order: 64
  },
  {
    id: 'campus-cci-ci',
    slug: 'cci-cote-ivoire',
    category: 'campus_partner',
    partner_type: 'institutionnel',
    name_fr: 'CCI Côte d\'Ivoire',
    name_en: 'Chamber of Commerce Ivory Coast',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/33.jpg',
    website: 'https://www.cci.ci',
    country: 'CI',
    is_active: true,
    sort_order: 65
  },
  {
    id: 'campus-cccpa',
    slug: 'cccpa',
    category: 'campus_partner',
    partner_type: 'institutionnel',
    name_fr: 'CCCPA - Cairo International Center for Conflict Resolution',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/36.jpg',
    website: 'https://www.cccpa.org',
    country: 'EG',
    is_active: true,
    sort_order: 66
  },

  // --- Autres institutions ---
  {
    id: 'campus-ena',
    slug: 'ena',
    category: 'campus_partner',
    partner_type: 'academique',
    name_fr: 'École Nationale d\'Administration',
    name_en: 'National School of Administration',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/27.png',
    website: 'https://www.ena.fr',
    country: 'FR',
    is_active: true,
    sort_order: 70
  },
  {
    id: 'campus-idg-dakar',
    slug: 'idg-dakar',
    category: 'campus_partner',
    partner_type: 'academique',
    name_fr: 'IDG Dakar',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/29.png',
    website: 'https://www.idg.sn',
    country: 'SN',
    is_active: true,
    sort_order: 71
  },
  {
    id: 'campus-trace',
    slug: 'trace',
    category: 'campus_partner',
    partner_type: 'culture',
    name_fr: 'Trace',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/31.jpg',
    website: 'https://www.trace.tv',
    is_active: true,
    sort_order: 72
  },
  {
    id: 'campus-makesense',
    slug: 'makesense-africa',
    category: 'campus_partner',
    partner_type: 'institutionnel',
    name_fr: 'Make Sense Africa',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/25.png',
    website: 'https://www.makesense.org',
    is_active: true,
    sort_order: 73
  },
  {
    id: 'campus-ipmd',
    slug: 'ipmd',
    category: 'campus_partner',
    partner_type: 'academique',
    name_fr: 'IPMD',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/40.png',
    website: 'https://www.ipmd.org',
    is_active: true,
    sort_order: 74
  },
  {
    id: 'campus-enaref',
    slug: 'enaref',
    category: 'campus_partner',
    partner_type: 'academique',
    name_fr: 'ENAREF',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/44.jpg',
    website: 'https://www.enaref.bf',
    country: 'BF',
    is_active: true,
    sort_order: 75
  },
  {
    id: 'campus-uglc-sc',
    slug: 'uglc-sc',
    category: 'campus_partner',
    partner_type: 'academique',
    name_fr: 'UGLC-SC',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/45.png',
    website: 'https://www.uglc-sc.org',
    is_active: true,
    sort_order: 76
  },
  {
    id: 'campus-inau',
    slug: 'inau',
    category: 'campus_partner',
    partner_type: 'academique',
    name_fr: 'Institut National d\'Assainissement et d\'Urbanisme',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/46.png',
    website: 'https://www.inau.ma',
    country: 'MA',
    is_active: true,
    sort_order: 77
  },
  {
    id: 'campus-cnftpa',
    slug: 'cnftpa',
    category: 'campus_partner',
    partner_type: 'academique',
    name_fr: 'Centre National de Formation des Techniciens des Pêches et de l\'Aquaculture',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/49.png',
    website: 'https://www.cnftpa.sn',
    country: 'SN',
    is_active: true,
    sort_order: 78
  },
  {
    id: 'campus-imdr',
    slug: 'imdr',
    category: 'campus_partner',
    partner_type: 'recherche',
    name_fr: 'IMDR - Institut pour la Maîtrise des Risques',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/50.jpg',
    website: 'https://www.imdr.eu',
    country: 'FR',
    is_active: true,
    sort_order: 79
  },
  {
    id: 'campus-codatu',
    slug: 'codatu',
    category: 'campus_partner',
    partner_type: 'institutionnel',
    name_fr: 'CODATU - Coopération pour le Développement et l\'Amélioration des Transports Urbains',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/51.jpg',
    website: 'https://www.codatu.org',
    country: 'FR',
    is_active: true,
    sort_order: 80
  },
  {
    id: 'campus-eaba',
    slug: 'eaba',
    category: 'campus_partner',
    partner_type: 'academique',
    name_fr: 'EABA - École Africaine des Affaires',
    logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/53.jpg',
    website: 'https://www.eaba.org',
    is_active: true,
    sort_order: 81
  }
]

// Combine all partners for backwards compatibility
export const mockPartenaires: Partenaire[] = [
  ...mockCharterOperators,
  ...mockCampusPartners
]
