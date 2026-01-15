/**
 * Mock Data: Projets de l'Université Senghor
 */

export interface Project {
  id: string
  slug: string
  title_fr: string
  title_en: string
  title_ar: string
  description_fr: string
  description_en: string
  description_ar: string
  content_fr: string
  content_en: string
  content_ar: string
  image: string
  gallery?: string[]
  category: 'education' | 'culture' | 'entrepreneuriat' | 'recherche' | 'numerique'
  status: 'active' | 'completed' | 'upcoming'
  featured: boolean
  start_date: string
  end_date?: string
  partners: string[]
  countries: string[]
  website?: string
  budget?: string
  beneficiaries?: string
}

export const mockProjects: Project[] = [
  {
    id: 'project-transformaction',
    slug: 'transformaction',
    title_fr: 'TransformAction',
    title_en: 'TransformAction',
    title_ar: 'ترانسفورم أكشن',
    description_fr: 'Programme phare de transformation digitale et de renforcement des capacités des jeunes africains francophones.',
    description_en: 'Flagship digital transformation and capacity building program for young French-speaking Africans.',
    description_ar: 'برنامج رائد للتحول الرقمي وبناء قدرات الشباب الأفريقي الناطق بالفرنسية.',
    content_fr: `TransformAction est le programme phare de l'Université Senghor, conçu pour accompagner la transformation digitale en Afrique francophone.

## Objectifs

- Former 10 000 jeunes aux compétences numériques d'ici 2027
- Accompagner 500 startups dans leur développement digital
- Créer un réseau de 200 formateurs certifiés dans 15 pays

## Approche

Le programme combine formations en ligne, ateliers présentiels et accompagnement personnalisé. Les participants bénéficient d'un accès à une plateforme d'apprentissage innovante et à un réseau d'experts internationaux.

## Impact

Depuis son lancement, TransformAction a déjà formé plus de 3 000 jeunes et accompagné 150 startups dans leur transformation digitale.`,
    content_en: `TransformAction is Senghor University's flagship program, designed to support digital transformation in French-speaking Africa.

## Objectives

- Train 10,000 young people in digital skills by 2027
- Support 500 startups in their digital development
- Create a network of 200 certified trainers in 15 countries

## Approach

The program combines online training, in-person workshops, and personalized support. Participants benefit from access to an innovative learning platform and a network of international experts.

## Impact

Since its launch, TransformAction has already trained over 3,000 young people and supported 150 startups in their digital transformation.`,
    content_ar: `ترانسفورم أكشن هو البرنامج الرائد لجامعة سنغور، المصمم لدعم التحول الرقمي في أفريقيا الناطقة بالفرنسية.

## الأهداف

- تدريب 10,000 شاب على المهارات الرقمية بحلول عام 2027
- دعم 500 شركة ناشئة في تطويرها الرقمي
- إنشاء شبكة من 200 مدرب معتمد في 15 دولة

## النهج

يجمع البرنامج بين التدريب عبر الإنترنت وورش العمل الحضورية والدعم الشخصي.

## التأثير

منذ إطلاقه، قام ترانسفورم أكشن بتدريب أكثر من 3,000 شاب ودعم 150 شركة ناشئة في تحولها الرقمي.`,
    image: 'https://picsum.photos/seed/transformaction/1200/600',
    gallery: [
      'https://picsum.photos/seed/transformaction-1/800/600',
      'https://picsum.photos/seed/transformaction-2/800/600',
      'https://picsum.photos/seed/transformaction-3/800/600'
    ],
    category: 'numerique',
    status: 'active',
    featured: true,
    start_date: '2022-01-15',
    partners: ['OIF', 'AFD', 'Union Européenne', 'BAD'],
    countries: ['Sénégal', 'Côte d\'Ivoire', 'Cameroun', 'Bénin', 'Togo', 'Mali', 'Burkina Faso', 'Niger', 'Guinée', 'RDC'],
    website: 'https://transformaction.usenghor.org',
    budget: '5 millions EUR',
    beneficiaries: '10 000 jeunes'
  },
  {
    id: 'project-kreafrika',
    slug: 'kreafrika',
    title_fr: 'KreAfrika',
    title_en: 'KreAfrika',
    title_ar: 'كري أفريكا',
    description_fr: 'Initiative de promotion de l\'entrepreneuriat culturel et créatif en Afrique francophone.',
    description_en: 'Initiative promoting cultural and creative entrepreneurship in French-speaking Africa.',
    description_ar: 'مبادرة لتعزيز ريادة الأعمال الثقافية والإبداعية في أفريقيا الناطقة بالفرنسية.',
    content_fr: `KreAfrika est une initiative ambitieuse visant à structurer et développer les industries culturelles et créatives en Afrique francophone.

## Mission

Accompagner les entrepreneurs culturels dans le développement de leurs projets, de l'idéation à la mise sur le marché.

## Domaines d'intervention

- Arts visuels et arts du spectacle
- Musique et audiovisuel
- Mode et design
- Patrimoine et tourisme culturel
- Édition et littérature

## Résultats attendus

- 200 entrepreneurs accompagnés
- 50 entreprises créées
- 1000 emplois générés dans le secteur culturel`,
    content_en: `KreAfrika is an ambitious initiative aimed at structuring and developing cultural and creative industries in French-speaking Africa.

## Mission

Supporting cultural entrepreneurs in developing their projects, from ideation to market launch.

## Areas of intervention

- Visual and performing arts
- Music and audiovisual
- Fashion and design
- Heritage and cultural tourism
- Publishing and literature

## Expected results

- 200 entrepreneurs supported
- 50 companies created
- 1000 jobs generated in the cultural sector`,
    content_ar: `كري أفريكا هي مبادرة طموحة تهدف إلى هيكلة وتطوير الصناعات الثقافية والإبداعية في أفريقيا الناطقة بالفرنسية.

## المهمة

دعم رواد الأعمال الثقافيين في تطوير مشاريعهم، من الفكرة إلى السوق.

## مجالات التدخل

- الفنون البصرية وفنون الأداء
- الموسيقى والسمعي البصري
- الموضة والتصميم
- التراث والسياحة الثقافية

## النتائج المتوقعة

- 200 رائد أعمال مدعوم
- 50 شركة منشأة
- 1000 وظيفة في القطاع الثقافي`,
    image: 'https://picsum.photos/seed/kreafrika/1200/600',
    gallery: [
      'https://picsum.photos/seed/kreafrika-1/800/600',
      'https://picsum.photos/seed/kreafrika-2/800/600'
    ],
    category: 'culture',
    status: 'active',
    featured: true,
    start_date: '2023-06-01',
    partners: ['UNESCO', 'OIF', 'Institut français'],
    countries: ['Côte d\'Ivoire', 'Sénégal', 'Cameroun', 'Maroc', 'Tunisie'],
    website: 'https://kreafrika.usenghor.org',
    budget: '2 millions EUR',
    beneficiaries: '200 entrepreneurs'
  },
  {
    id: 'project-levee-fonds',
    slug: 'levee-de-fonds',
    title_fr: 'Campagne de levée de fonds',
    title_en: 'Fundraising Campaign',
    title_ar: 'حملة جمع التبرعات',
    description_fr: 'Campagne de mobilisation de ressources pour soutenir les bourses d\'excellence et les projets d\'innovation.',
    description_en: 'Resource mobilization campaign to support excellence scholarships and innovation projects.',
    description_ar: 'حملة تعبئة الموارد لدعم منح التميز ومشاريع الابتكار.',
    content_fr: `La campagne de levée de fonds de l'Université Senghor vise à mobiliser des ressources pour soutenir ses missions fondamentales.

## Objectifs de la campagne

- Financer 100 bourses d'excellence par an
- Soutenir les projets de recherche innovants
- Moderniser les infrastructures numériques
- Développer de nouveaux programmes de formation

## Comment contribuer

Les dons peuvent être effectués en ligne ou par virement bancaire. Chaque contribution, quelle que soit son montant, fait la différence.

## Avantages pour les donateurs

- Déductions fiscales selon la législation applicable
- Reconnaissance dans les publications de l'université
- Invitation aux événements exclusifs`,
    content_en: `Senghor University's fundraising campaign aims to mobilize resources to support its core missions.

## Campaign objectives

- Fund 100 excellence scholarships per year
- Support innovative research projects
- Modernize digital infrastructure
- Develop new training programs

## How to contribute

Donations can be made online or by bank transfer. Every contribution, regardless of amount, makes a difference.

## Benefits for donors

- Tax deductions according to applicable legislation
- Recognition in university publications
- Invitation to exclusive events`,
    content_ar: `تهدف حملة جمع التبرعات لجامعة سنغور إلى تعبئة الموارد لدعم مهامها الأساسية.

## أهداف الحملة

- تمويل 100 منحة تميز سنوياً
- دعم مشاريع البحث المبتكرة
- تحديث البنية التحتية الرقمية
- تطوير برامج تدريبية جديدة

## كيفية المساهمة

يمكن تقديم التبرعات عبر الإنترنت أو عن طريق التحويل المصرفي.`,
    image: 'https://picsum.photos/seed/levee-fonds/1200/600',
    category: 'education',
    status: 'active',
    featured: false,
    start_date: '2024-01-01',
    partners: ['Alumni Senghor', 'Fondations partenaires'],
    countries: ['International'],
    budget: 'Objectif : 1 million EUR',
    beneficiaries: '100 boursiers/an'
  },
  {
    id: 'project-bourses-excellence',
    slug: 'bourses-excellence',
    title_fr: 'Programme de bourses d\'excellence',
    title_en: 'Excellence Scholarship Program',
    title_ar: 'برنامج منح التميز',
    description_fr: 'Programme de bourses destiné aux étudiants les plus méritants de l\'espace francophone africain.',
    description_en: 'Scholarship program for the most deserving students from the African French-speaking world.',
    description_ar: 'برنامج منح للطلاب الأكثر استحقاقاً من العالم الأفريقي الناطق بالفرنسية.',
    content_fr: `Le programme de bourses d'excellence de l'Université Senghor permet chaque année à des étudiants talentueux de poursuivre leurs études.

## Critères d'éligibilité

- Excellence académique
- Projet professionnel cohérent
- Engagement citoyen démontré
- Potentiel de leadership

## Types de bourses

- Bourses complètes (frais de scolarité + hébergement)
- Bourses partielles (frais de scolarité)
- Bourses de mobilité

## Processus de sélection

Les candidatures sont évaluées par un comité indépendant selon des critères stricts d'excellence et d'équité.`,
    content_en: `Senghor University's excellence scholarship program allows talented students to pursue their studies each year.

## Eligibility criteria

- Academic excellence
- Coherent professional project
- Demonstrated civic engagement
- Leadership potential

## Types of scholarships

- Full scholarships (tuition + accommodation)
- Partial scholarships (tuition)
- Mobility scholarships

## Selection process

Applications are evaluated by an independent committee based on strict criteria of excellence and equity.`,
    content_ar: `يتيح برنامج منح التميز بجامعة سنغور للطلاب الموهوبين متابعة دراستهم كل عام.

## معايير الأهلية

- التميز الأكاديمي
- مشروع مهني متسق
- الالتزام المدني المثبت
- إمكانات القيادة

## أنواع المنح

- منح كاملة (رسوم التعليم + السكن)
- منح جزئية (رسوم التعليم)
- منح التنقل`,
    image: 'https://picsum.photos/seed/bourses-excellence/1200/600',
    category: 'education',
    status: 'active',
    featured: false,
    start_date: '2020-09-01',
    partners: ['OIF', 'Pays bailleurs', 'Fondations partenaires'],
    countries: ['35 pays francophones'],
    beneficiaries: '200 boursiers actuels'
  },
  {
    id: 'project-recherche-francophone',
    slug: 'recherche-francophone',
    title_fr: 'Réseau de recherche francophone',
    title_en: 'Francophone Research Network',
    title_ar: 'شبكة البحث الفرنكوفونية',
    description_fr: 'Réseau collaboratif de recherche sur les grands défis du développement en Afrique francophone.',
    description_en: 'Collaborative research network on major development challenges in French-speaking Africa.',
    description_ar: 'شبكة بحثية تعاونية حول تحديات التنمية الكبرى في أفريقيا الناطقة بالفرنسية.',
    content_fr: `Le Réseau de recherche francophone rassemble des chercheurs de l'espace francophone autour de thématiques communes.

## Axes de recherche

- Gouvernance et développement
- Santé publique et systèmes de santé
- Environnement et changement climatique
- Industries culturelles et créatives
- Transformation digitale

## Activités

- Programmes de recherche collaborative
- Publications scientifiques
- Colloques et séminaires
- Encadrement doctoral

## Partenaires académiques

Plus de 50 universités partenaires dans 25 pays.`,
    content_en: `The Francophone Research Network brings together researchers from the French-speaking world around common themes.

## Research areas

- Governance and development
- Public health and health systems
- Environment and climate change
- Cultural and creative industries
- Digital transformation

## Activities

- Collaborative research programs
- Scientific publications
- Conferences and seminars
- Doctoral supervision

## Academic partners

More than 50 partner universities in 25 countries.`,
    content_ar: `تجمع شبكة البحث الفرنكوفونية الباحثين من العالم الناطق بالفرنسية حول موضوعات مشتركة.

## محاور البحث

- الحوكمة والتنمية
- الصحة العامة وأنظمة الصحة
- البيئة وتغير المناخ
- الصناعات الثقافية والإبداعية
- التحول الرقمي`,
    image: 'https://picsum.photos/seed/recherche-francophone/1200/600',
    category: 'recherche',
    status: 'active',
    featured: false,
    start_date: '2018-01-01',
    partners: ['AUF', 'CNRS', 'IRD', 'Universités partenaires'],
    countries: ['25 pays'],
    beneficiaries: '150 chercheurs'
  },
  {
    id: 'project-africa-digital',
    slug: 'africa-digital-leaders',
    title_fr: 'Africa Digital Leaders',
    title_en: 'Africa Digital Leaders',
    title_ar: 'قادة أفريقيا الرقميين',
    description_fr: 'Programme de formation des futurs leaders du numérique en Afrique.',
    description_en: 'Training program for future digital leaders in Africa.',
    description_ar: 'برنامج تدريب قادة المستقبل الرقميين في أفريقيا.',
    content_fr: `Africa Digital Leaders est un programme intensif de formation au leadership numérique.

## Programme

- 6 mois de formation intensive
- Modules en ligne et présentiels
- Mentorat par des leaders du secteur
- Projet d'entreprise accompagné

## Compétences développées

- Leadership et management
- Stratégie digitale
- Intelligence artificielle
- Cybersécurité
- Entrepreneuriat tech

## Promotion 2025

Ouverture des candidatures en mars 2025.`,
    content_en: `Africa Digital Leaders is an intensive digital leadership training program.

## Program

- 6 months of intensive training
- Online and in-person modules
- Mentoring by industry leaders
- Supported business project

## Skills developed

- Leadership and management
- Digital strategy
- Artificial intelligence
- Cybersecurity
- Tech entrepreneurship

## 2025 cohort

Applications open in March 2025.`,
    content_ar: `برنامج قادة أفريقيا الرقميين هو برنامج تدريب مكثف على القيادة الرقمية.

## البرنامج

- 6 أشهر من التدريب المكثف
- وحدات عبر الإنترنت وحضورية
- إرشاد من قادة الصناعة

## المهارات المطورة

- القيادة والإدارة
- الاستراتيجية الرقمية
- الذكاء الاصطناعي`,
    image: 'https://picsum.photos/seed/africa-digital/1200/600',
    category: 'numerique',
    status: 'upcoming',
    featured: false,
    start_date: '2025-06-01',
    partners: ['Google', 'Microsoft', 'Orange Digital Center'],
    countries: ['Afrique francophone'],
    beneficiaries: '50 leaders/an'
  }
]
