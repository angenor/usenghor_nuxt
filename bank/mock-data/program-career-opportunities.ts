/**
 * Mock Data: Débouchés par programme (Program Career Opportunities)
 * Table SQL: program_career_opportunities
 * Référence: 01-formations-debouches.md
 */

export interface ProgramCareerOpportunity {
  id: string
  program_id: string
  title: string
  description?: string
  display_order: number
}

export const mockProgramCareerOpportunities: ProgramCareerOpportunity[] = [
  // =============================================
  // Master Gestion du Patrimoine Culturel
  // =============================================
  {
    id: 'career-patrimoine-001',
    program_id: 'form-master-patrimoine-culturel',
    title: 'Conservateur de musée',
    description: 'Direction et gestion de musées nationaux, régionaux ou privés. Responsabilité des collections, des acquisitions et de la politique scientifique de l\'institution.',
    display_order: 1
  },
  {
    id: 'career-patrimoine-002',
    program_id: 'form-master-patrimoine-culturel',
    title: 'Responsable des archives',
    description: 'Gestion des fonds d\'archives publiques ou privées. Organisation, conservation et valorisation des documents historiques.',
    display_order: 2
  },
  {
    id: 'career-patrimoine-003',
    program_id: 'form-master-patrimoine-culturel',
    title: 'Chef de projet patrimoine',
    description: 'Pilotage de projets de restauration, de valorisation ou de numérisation du patrimoine culturel.',
    display_order: 3
  },
  {
    id: 'career-patrimoine-004',
    program_id: 'form-master-patrimoine-culturel',
    title: 'Directeur de bibliothèque',
    description: 'Direction d\'établissements de lecture publique ou de bibliothèques spécialisées. Politique documentaire et médiation culturelle.',
    display_order: 4
  },
  {
    id: 'career-patrimoine-005',
    program_id: 'form-master-patrimoine-culturel',
    title: 'Consultant en tourisme culturel',
    description: 'Accompagnement des territoires dans la valorisation touristique de leur patrimoine. Conception de circuits et d\'offres culturelles.',
    display_order: 5
  },
  {
    id: 'career-patrimoine-006',
    program_id: 'form-master-patrimoine-culturel',
    title: 'Expert auprès de l\'UNESCO',
    description: 'Expertise internationale sur les questions de patrimoine mondial, conventions internationales et coopération culturelle.',
    display_order: 6
  },

  // =============================================
  // Master Entreprises Culturelles
  // =============================================
  {
    id: 'career-entreprises-001',
    program_id: 'form-master-entreprises-culturelles',
    title: 'Directeur de festival',
    description: 'Conception, organisation et direction artistique de festivals culturels. Gestion des partenariats et de la programmation.',
    display_order: 1
  },
  {
    id: 'career-entreprises-002',
    program_id: 'form-master-entreprises-culturelles',
    title: 'Producteur audiovisuel',
    description: 'Production de contenus cinématographiques, télévisuels ou numériques. Montage financier et gestion de projets de création.',
    display_order: 2
  },
  {
    id: 'career-entreprises-003',
    program_id: 'form-master-entreprises-culturelles',
    title: 'Directeur de centre culturel',
    description: 'Direction d\'espaces culturels (centres culturels français, instituts, maisons de la culture). Programmation et médiation.',
    display_order: 3
  },
  {
    id: 'career-entreprises-004',
    program_id: 'form-master-entreprises-culturelles',
    title: 'Responsable mécénat et partenariats',
    description: 'Développement des ressources propres des institutions culturelles. Stratégie de mécénat et relations avec les entreprises.',
    display_order: 4
  },
  {
    id: 'career-entreprises-005',
    program_id: 'form-master-entreprises-culturelles',
    title: 'Manager d\'artistes',
    description: 'Accompagnement de carrières artistiques. Négociation de contrats, promotion et développement de projets artistiques.',
    display_order: 5
  },
  {
    id: 'career-entreprises-006',
    program_id: 'form-master-entreprises-culturelles',
    title: 'Entrepreneur culturel',
    description: 'Création et direction d\'entreprises dans le secteur culturel : agences, labels, maisons d\'édition, structures de production.',
    display_order: 6
  },

  // =============================================
  // Master Aires Protégées
  // =============================================
  {
    id: 'career-aires-001',
    program_id: 'form-master-aires-protegees',
    title: 'Directeur de parc national',
    description: 'Direction et gestion d\'aires protégées. Mise en œuvre des plans de gestion et coordination des équipes de terrain.',
    display_order: 1
  },
  {
    id: 'career-aires-002',
    program_id: 'form-master-aires-protegees',
    title: 'Responsable conservation ONG',
    description: 'Direction de programmes de conservation au sein d\'ONG internationales (WWF, UICN, WCS, African Parks).',
    display_order: 2
  },
  {
    id: 'career-aires-003',
    program_id: 'form-master-aires-protegees',
    title: 'Expert biodiversité',
    description: 'Expertise technique sur les enjeux de biodiversité pour les gouvernements, organisations internationales ou bureaux d\'études.',
    display_order: 3
  },
  {
    id: 'career-aires-004',
    program_id: 'form-master-aires-protegees',
    title: 'Chargé de suivi écologique',
    description: 'Mise en place et coordination des programmes de suivi de la faune et de la flore. Analyse des données et reporting.',
    display_order: 4
  },
  {
    id: 'career-aires-005',
    program_id: 'form-master-aires-protegees',
    title: 'Consultant écotourisme',
    description: 'Développement de l\'offre touristique durable dans et autour des aires protégées. Études de faisabilité et plans d\'affaires.',
    display_order: 5
  },

  // =============================================
  // Master Gestion de l'Environnement
  // =============================================
  {
    id: 'career-env-001',
    program_id: 'form-master-gestion-environnement',
    title: 'Responsable environnement entreprise',
    description: 'Direction des services environnement, hygiène et sécurité (HSE) au sein de grandes entreprises ou industries.',
    display_order: 1
  },
  {
    id: 'career-env-002',
    program_id: 'form-master-gestion-environnement',
    title: 'Chargé d\'études environnementales',
    description: 'Réalisation d\'études d\'impact environnemental et social (EIES), audits environnementaux et plans de gestion.',
    display_order: 2
  },
  {
    id: 'career-env-003',
    program_id: 'form-master-gestion-environnement',
    title: 'Directeur des services techniques municipaux',
    description: 'Gestion des services d\'assainissement, de gestion des déchets et d\'environnement au niveau des collectivités locales.',
    display_order: 3
  },
  {
    id: 'career-env-004',
    program_id: 'form-master-gestion-environnement',
    title: 'Expert changement climatique',
    description: 'Expertise sur les politiques d\'adaptation et d\'atténuation du changement climatique pour les gouvernements et organisations internationales.',
    display_order: 4
  },
  {
    id: 'career-env-005',
    program_id: 'form-master-gestion-environnement',
    title: 'Consultant développement durable',
    description: 'Accompagnement des organisations dans leur transition écologique et leur stratégie RSE.',
    display_order: 5
  },

  // =============================================
  // Master Gouvernance et Administration Publique
  // =============================================
  {
    id: 'career-gouv-001',
    program_id: 'form-master-gouvernance-public',
    title: 'Haut fonctionnaire',
    description: 'Postes de direction dans les ministères et administrations centrales. Élaboration et mise en œuvre des politiques publiques.',
    display_order: 1
  },
  {
    id: 'career-gouv-002',
    program_id: 'form-master-gouvernance-public',
    title: 'Directeur d\'établissement public',
    description: 'Direction d\'agences publiques, d\'établissements publics administratifs ou d\'offices nationaux.',
    display_order: 2
  },
  {
    id: 'career-gouv-003',
    program_id: 'form-master-gouvernance-public',
    title: 'Expert en gouvernance',
    description: 'Expertise pour les organisations internationales (Banque mondiale, BAD, PNUD) sur les questions de gouvernance et de réforme de l\'État.',
    display_order: 3
  },
  {
    id: 'career-gouv-004',
    program_id: 'form-master-gouvernance-public',
    title: 'Secrétaire général de collectivité',
    description: 'Direction des services administratifs des collectivités territoriales (régions, communes, départements).',
    display_order: 4
  },
  {
    id: 'career-gouv-005',
    program_id: 'form-master-gouvernance-public',
    title: 'Consultant en modernisation de l\'État',
    description: 'Accompagnement des administrations dans leurs projets de transformation et d\'e-gouvernance.',
    display_order: 5
  },

  // =============================================
  // Master Management de Projets
  // =============================================
  {
    id: 'career-mgt-001',
    program_id: 'form-master-management-projets',
    title: 'Chef de projet développement',
    description: 'Pilotage de projets de développement pour les agences de coopération, ONG ou organisations internationales.',
    display_order: 1
  },
  {
    id: 'career-mgt-002',
    program_id: 'form-master-management-projets',
    title: 'Coordinateur programmes',
    description: 'Coordination de portefeuilles de projets au sein d\'organisations de développement. Suivi stratégique et reporting aux bailleurs.',
    display_order: 2
  },
  {
    id: 'career-mgt-003',
    program_id: 'form-master-management-projets',
    title: 'Responsable suivi-évaluation',
    description: 'Conception et mise en œuvre de systèmes de suivi-évaluation. Évaluation de l\'impact des programmes.',
    display_order: 3
  },
  {
    id: 'career-mgt-004',
    program_id: 'form-master-management-projets',
    title: 'Consultant en gestion de projet',
    description: 'Expertise indépendante en montage, gestion et évaluation de projets pour différents clients.',
    display_order: 4
  },
  {
    id: 'career-mgt-005',
    program_id: 'form-master-management-projets',
    title: 'Directeur pays ONG',
    description: 'Direction des opérations d\'une ONG internationale au niveau national. Gestion des équipes et des programmes.',
    display_order: 5
  },
  {
    id: 'career-mgt-006',
    program_id: 'form-master-management-projets',
    title: 'Chargé de mission bailleur',
    description: 'Gestion de portefeuilles de projets pour les agences de développement (AFD, GIZ, USAID, UE).',
    display_order: 6
  },

  // =============================================
  // Master Santé Publique
  // =============================================
  {
    id: 'career-sante-001',
    program_id: 'form-master-sante-publique',
    title: 'Directeur de district sanitaire',
    description: 'Direction des services de santé au niveau décentralisé. Coordination des structures de soins et des programmes de santé.',
    display_order: 1
  },
  {
    id: 'career-sante-002',
    program_id: 'form-master-sante-publique',
    title: 'Responsable programmes OMS',
    description: 'Coordination de programmes de santé publique pour l\'OMS ou les agences des Nations Unies (UNICEF, UNFPA).',
    display_order: 2
  },
  {
    id: 'career-sante-003',
    program_id: 'form-master-sante-publique',
    title: 'Épidémiologiste',
    description: 'Surveillance épidémiologique, investigation d\'épidémies et analyse des données de santé.',
    display_order: 3
  },
  {
    id: 'career-sante-004',
    program_id: 'form-master-sante-publique',
    title: 'Directeur d\'hôpital',
    description: 'Direction d\'établissements hospitaliers publics ou privés. Gestion administrative, financière et des ressources humaines.',
    display_order: 4
  },
  {
    id: 'career-sante-005',
    program_id: 'form-master-sante-publique',
    title: 'Consultant santé internationale',
    description: 'Expertise pour les organisations internationales et les gouvernements sur les politiques et systèmes de santé.',
    display_order: 5
  },

  // =============================================
  // Master Nutrition et Sécurité Alimentaire
  // =============================================
  {
    id: 'career-nutrition-001',
    program_id: 'form-master-nutrition',
    title: 'Responsable nutrition ONG humanitaire',
    description: 'Direction des programmes de nutrition au sein d\'ONG (ACF, MSF, ALIMA). Gestion des urgences nutritionnelles.',
    display_order: 1
  },
  {
    id: 'career-nutrition-002',
    program_id: 'form-master-nutrition',
    title: 'Chargé de programme PAM/FAO',
    description: 'Coordination de programmes de sécurité alimentaire pour les agences des Nations Unies.',
    display_order: 2
  },
  {
    id: 'career-nutrition-003',
    program_id: 'form-master-nutrition',
    title: 'Expert sécurité alimentaire',
    description: 'Expertise technique sur les systèmes alimentaires, les chaînes de valeur et les politiques agricoles.',
    display_order: 3
  },
  {
    id: 'career-nutrition-004',
    program_id: 'form-master-nutrition',
    title: 'Directeur nutrition ministère de la Santé',
    description: 'Direction des services de nutrition au niveau national. Élaboration des politiques et normes nutritionnelles.',
    display_order: 4
  },
  {
    id: 'career-nutrition-005',
    program_id: 'form-master-nutrition',
    title: 'Responsable qualité agroalimentaire',
    description: 'Gestion de la qualité et de la sécurité sanitaire des aliments dans l\'industrie agroalimentaire.',
    display_order: 5
  },

  // =============================================
  // Master GGRC (Gestion Globale des Risques et des Crises)
  // =============================================
  {
    id: 'career-ggrc-001',
    program_id: 'form-master-ggrc',
    title: 'Coordinateur urgences humanitaires',
    description: 'Coordination des opérations d\'urgence pour les organisations humanitaires (OCHA, CICR, ONG).',
    display_order: 1
  },
  {
    id: 'career-ggrc-002',
    program_id: 'form-master-ggrc',
    title: 'Responsable réduction des risques de catastrophes',
    description: 'Direction des programmes de prévention et de préparation aux catastrophes au niveau national ou régional.',
    display_order: 2
  },
  {
    id: 'career-ggrc-003',
    program_id: 'form-master-ggrc',
    title: 'Analyste risques sécuritaires',
    description: 'Analyse des risques et des menaces sécuritaires pour les organisations internationales ou les entreprises.',
    display_order: 3
  },
  {
    id: 'career-ggrc-004',
    program_id: 'form-master-ggrc',
    title: 'Directeur protection civile',
    description: 'Direction des services de protection civile et de gestion des catastrophes au niveau étatique.',
    display_order: 4
  },
  {
    id: 'career-ggrc-005',
    program_id: 'form-master-ggrc',
    title: 'Consultant gestion de crise',
    description: 'Accompagnement des organisations dans la préparation et la réponse aux situations de crise.',
    display_order: 5
  },
  {
    id: 'career-ggrc-006',
    program_id: 'form-master-ggrc',
    title: 'Expert résilience communautaire',
    description: 'Développement de programmes de renforcement de la résilience des communautés face aux chocs et aux crises.',
    display_order: 6
  }
]

// Utilitaire pour générer un nouvel ID
export const generateCareerOpportunityId = () => `career-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
