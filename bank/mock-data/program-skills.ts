/**
 * Mock Data: Compétences par programme (Program Skills)
 * Table SQL: program_skills
 * Référence: 01-formations-competences.md
 */

export interface ProgramSkill {
  id: string
  program_id: string
  title: string
  description?: string
  display_order: number
}

export const mockProgramSkills: ProgramSkill[] = [
  // =============================================
  // Master Gestion du Patrimoine Culturel
  // =============================================
  {
    id: 'skill-patrimoine-001',
    program_id: 'form-master-patrimoine-culturel',
    title: 'Maîtriser les techniques d\'inventaire et de catalogage du patrimoine',
    description: 'Capacité à réaliser des inventaires exhaustifs du patrimoine matériel et immatériel selon les normes internationales.',
    display_order: 1
  },
  {
    id: 'skill-patrimoine-002',
    program_id: 'form-master-patrimoine-culturel',
    title: 'Concevoir des projets de conservation et de restauration',
    description: 'Élaborer des plans de conservation préventive et curative adaptés aux différents types de patrimoine.',
    display_order: 2
  },
  {
    id: 'skill-patrimoine-003',
    program_id: 'form-master-patrimoine-culturel',
    title: 'Gérer des institutions patrimoniales (musées, archives, bibliothèques)',
    description: 'Administrer efficacement les structures dédiées à la préservation du patrimoine culturel.',
    display_order: 3
  },
  {
    id: 'skill-patrimoine-004',
    program_id: 'form-master-patrimoine-culturel',
    title: 'Valoriser le patrimoine par des stratégies de médiation culturelle',
    description: 'Développer des actions de médiation pour rendre le patrimoine accessible à tous les publics.',
    display_order: 4
  },
  {
    id: 'skill-patrimoine-005',
    program_id: 'form-master-patrimoine-culturel',
    title: 'Appliquer le cadre juridique de protection du patrimoine',
    description: 'Maîtriser les conventions internationales et législations nationales relatives au patrimoine.',
    display_order: 5
  },

  // =============================================
  // Master Entreprises Culturelles
  // =============================================
  {
    id: 'skill-entreprises-001',
    program_id: 'form-master-entreprises-culturelles',
    title: 'Élaborer des stratégies de développement pour les industries culturelles',
    description: 'Concevoir des modèles économiques viables pour les entreprises du secteur culturel.',
    display_order: 1
  },
  {
    id: 'skill-entreprises-002',
    program_id: 'form-master-entreprises-culturelles',
    title: 'Piloter la production et la diffusion de contenus culturels',
    description: 'Gérer l\'ensemble de la chaîne de production, de la création à la distribution.',
    display_order: 2
  },
  {
    id: 'skill-entreprises-003',
    program_id: 'form-master-entreprises-culturelles',
    title: 'Négocier des droits et des partenariats culturels',
    description: 'Maîtriser les négociations commerciales et les accords de coproduction.',
    display_order: 3
  },
  {
    id: 'skill-entreprises-004',
    program_id: 'form-master-entreprises-culturelles',
    title: 'Manager des équipes créatives et artistiques',
    description: 'Animer et coordonner des équipes pluridisciplinaires dans un contexte créatif.',
    display_order: 4
  },
  {
    id: 'skill-entreprises-005',
    program_id: 'form-master-entreprises-culturelles',
    title: 'Exploiter les outils numériques pour la création et la diffusion',
    description: 'Intégrer les technologies numériques dans les processus de création et de distribution.',
    display_order: 5
  },

  // =============================================
  // Master Aires Protégées
  // =============================================
  {
    id: 'skill-aires-001',
    program_id: 'form-master-aires-protegees',
    title: 'Planifier et gérer des aires protégées',
    description: 'Élaborer des plans de gestion conformes aux standards UICN.',
    display_order: 1
  },
  {
    id: 'skill-aires-002',
    program_id: 'form-master-aires-protegees',
    title: 'Réaliser des études d\'impact environnemental',
    description: 'Conduire des évaluations environnementales selon les méthodologies reconnues.',
    display_order: 2
  },
  {
    id: 'skill-aires-003',
    program_id: 'form-master-aires-protegees',
    title: 'Gérer les conflits homme-faune',
    description: 'Développer des stratégies de cohabitation entre populations locales et faune sauvage.',
    display_order: 3
  },
  {
    id: 'skill-aires-004',
    program_id: 'form-master-aires-protegees',
    title: 'Mobiliser des financements pour la conservation',
    description: 'Identifier et solliciter les sources de financement pour les projets de conservation.',
    display_order: 4
  },
  {
    id: 'skill-aires-005',
    program_id: 'form-master-aires-protegees',
    title: 'Impliquer les communautés locales dans la gestion des ressources naturelles',
    description: 'Concevoir et mettre en œuvre des approches participatives de conservation.',
    display_order: 5
  },

  // =============================================
  // Master Gestion de l'Environnement
  // =============================================
  {
    id: 'skill-env-001',
    program_id: 'form-master-gestion-environnement',
    title: 'Concevoir des politiques environnementales',
    description: 'Élaborer des stratégies et des plans d\'action en matière d\'environnement.',
    display_order: 1
  },
  {
    id: 'skill-env-002',
    program_id: 'form-master-gestion-environnement',
    title: 'Mettre en œuvre des systèmes de management environnemental',
    description: 'Implémenter les normes ISO 14001 et autres référentiels environnementaux.',
    display_order: 2
  },
  {
    id: 'skill-env-003',
    program_id: 'form-master-gestion-environnement',
    title: 'Analyser les risques environnementaux',
    description: 'Identifier, évaluer et hiérarchiser les risques liés à l\'environnement.',
    display_order: 3
  },
  {
    id: 'skill-env-004',
    program_id: 'form-master-gestion-environnement',
    title: 'Piloter des projets de développement durable',
    description: 'Gérer des projets intégrant les dimensions économiques, sociales et environnementales.',
    display_order: 4
  },
  {
    id: 'skill-env-005',
    program_id: 'form-master-gestion-environnement',
    title: 'Communiquer sur les enjeux environnementaux',
    description: 'Sensibiliser et mobiliser les parties prenantes sur les questions environnementales.',
    display_order: 5
  },

  // =============================================
  // Master Gouvernance et Administration Publique
  // =============================================
  {
    id: 'skill-gouv-001',
    program_id: 'form-master-gouvernance-public',
    title: 'Analyser les politiques publiques',
    description: 'Évaluer l\'efficacité et l\'impact des politiques gouvernementales.',
    display_order: 1
  },
  {
    id: 'skill-gouv-002',
    program_id: 'form-master-gouvernance-public',
    title: 'Gérer les finances publiques',
    description: 'Maîtriser les processus budgétaires et la comptabilité publique.',
    display_order: 2
  },
  {
    id: 'skill-gouv-003',
    program_id: 'form-master-gouvernance-public',
    title: 'Piloter des réformes administratives',
    description: 'Conduire des projets de modernisation de l\'administration publique.',
    display_order: 3
  },
  {
    id: 'skill-gouv-004',
    program_id: 'form-master-gouvernance-public',
    title: 'Promouvoir la transparence et la redevabilité',
    description: 'Mettre en place des mécanismes de gouvernance ouverte et participative.',
    display_order: 4
  },
  {
    id: 'skill-gouv-005',
    program_id: 'form-master-gouvernance-public',
    title: 'Négocier avec les partenaires institutionnels',
    description: 'Conduire des négociations avec les organisations internationales et les bailleurs.',
    display_order: 5
  },

  // =============================================
  // Master Management des Projets
  // =============================================
  {
    id: 'skill-mgt-001',
    program_id: 'form-master-management-projets',
    title: 'Planifier et structurer des projets de développement',
    description: 'Appliquer les méthodologies de gestion de projet (cadre logique, PRINCE2, PMI).',
    display_order: 1
  },
  {
    id: 'skill-mgt-002',
    program_id: 'form-master-management-projets',
    title: 'Gérer les ressources humaines et financières des projets',
    description: 'Optimiser l\'allocation des ressources et le pilotage budgétaire.',
    display_order: 2
  },
  {
    id: 'skill-mgt-003',
    program_id: 'form-master-management-projets',
    title: 'Suivre et évaluer les projets',
    description: 'Mettre en place des systèmes de monitoring et réaliser des évaluations.',
    display_order: 3
  },
  {
    id: 'skill-mgt-004',
    program_id: 'form-master-management-projets',
    title: 'Gérer les risques et les parties prenantes',
    description: 'Identifier les risques et coordonner les acteurs impliqués dans les projets.',
    display_order: 4
  },
  {
    id: 'skill-mgt-005',
    program_id: 'form-master-management-projets',
    title: 'Rédiger des propositions de financement',
    description: 'Élaborer des documents de projet conformes aux exigences des bailleurs.',
    display_order: 5
  },

  // =============================================
  // Master Santé Publique
  // =============================================
  {
    id: 'skill-sante-001',
    program_id: 'form-master-sante-publique',
    title: 'Analyser les déterminants de la santé',
    description: 'Identifier les facteurs sociaux, économiques et environnementaux influençant la santé.',
    display_order: 1
  },
  {
    id: 'skill-sante-002',
    program_id: 'form-master-sante-publique',
    title: 'Concevoir des programmes de santé publique',
    description: 'Élaborer des interventions de prévention et de promotion de la santé.',
    display_order: 2
  },
  {
    id: 'skill-sante-003',
    program_id: 'form-master-sante-publique',
    title: 'Gérer des systèmes de santé',
    description: 'Organiser et piloter les structures de soins et les ressources sanitaires.',
    display_order: 3
  },
  {
    id: 'skill-sante-004',
    program_id: 'form-master-sante-publique',
    title: 'Mener des études épidémiologiques',
    description: 'Appliquer les méthodes épidémiologiques pour surveiller et analyser les maladies.',
    display_order: 4
  },
  {
    id: 'skill-sante-005',
    program_id: 'form-master-sante-publique',
    title: 'Évaluer l\'efficacité des interventions sanitaires',
    description: 'Mesurer l\'impact des actions de santé publique sur les populations.',
    display_order: 5
  },

  // =============================================
  // Master Nutrition et Sécurité Alimentaire
  // =============================================
  {
    id: 'skill-nutrition-001',
    program_id: 'form-master-nutrition',
    title: 'Évaluer l\'état nutritionnel des populations',
    description: 'Réaliser des enquêtes nutritionnelles et interpréter les indicateurs.',
    display_order: 1
  },
  {
    id: 'skill-nutrition-002',
    program_id: 'form-master-nutrition',
    title: 'Concevoir des programmes de lutte contre la malnutrition',
    description: 'Élaborer des interventions ciblées pour les populations vulnérables.',
    display_order: 2
  },
  {
    id: 'skill-nutrition-003',
    program_id: 'form-master-nutrition',
    title: 'Analyser les systèmes alimentaires',
    description: 'Comprendre les chaînes de valeur alimentaire et les politiques agricoles.',
    display_order: 3
  },
  {
    id: 'skill-nutrition-004',
    program_id: 'form-master-nutrition',
    title: 'Gérer les crises alimentaires et nutritionnelles',
    description: 'Coordonner les réponses d\'urgence en situation de crise.',
    display_order: 4
  },
  {
    id: 'skill-nutrition-005',
    program_id: 'form-master-nutrition',
    title: 'Promouvoir une alimentation saine et durable',
    description: 'Développer des programmes d\'éducation nutritionnelle adaptés aux contextes locaux.',
    display_order: 5
  },

  // =============================================
  // Master GGRC (Gestion Globale des Risques et des Crises)
  // =============================================
  {
    id: 'skill-ggrc-001',
    program_id: 'form-master-ggrc',
    title: 'Cartographier et analyser les risques multisectoriels',
    description: 'Identifier et évaluer les risques naturels, sanitaires, sécuritaires et environnementaux.',
    display_order: 1
  },
  {
    id: 'skill-ggrc-002',
    program_id: 'form-master-ggrc',
    title: 'Élaborer des plans de prévention et de réponse aux crises',
    description: 'Concevoir des dispositifs de préparation et de gestion des urgences.',
    display_order: 2
  },
  {
    id: 'skill-ggrc-003',
    program_id: 'form-master-ggrc',
    title: 'Coordonner les acteurs humanitaires et institutionnels',
    description: 'Organiser la collaboration entre les différentes parties prenantes en situation de crise.',
    display_order: 3
  },
  {
    id: 'skill-ggrc-004',
    program_id: 'form-master-ggrc',
    title: 'Communiquer en situation de crise',
    description: 'Maîtriser les techniques de communication stratégique et de gestion de l\'information.',
    display_order: 4
  },
  {
    id: 'skill-ggrc-005',
    program_id: 'form-master-ggrc',
    title: 'Piloter la résilience et le relèvement post-crise',
    description: 'Accompagner les communautés dans la reconstruction et le renforcement des capacités.',
    display_order: 5
  }
]

// Utilitaire pour générer un nouvel ID
export const generateSkillId = () => `skill-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
