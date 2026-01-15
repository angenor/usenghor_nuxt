/**
 * Mock Data: Projets de l'Université Senghor
 */

export interface ProjectPartner {
  name: string
  logo?: string
  website?: string
}

export interface ProjectCountry {
  name: string
  code: string // ISO 3166-1 alpha-2
}

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
  partners: ProjectPartner[]
  countries: ProjectCountry[]
  website?: string
  budget?: string
  beneficiaries?: string
}

// Helper function to get flag emoji from country code
export function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

export const mockProjects: Project[] = [
  {
    id: 'project-transformaction-africa',
    slug: 'transformaction-africa',
    title_fr: 'Transform\'Action Africa',
    title_en: 'Transform\'Action Africa',
    title_ar: 'ترانسفورم أكشن أفريكا',
    description_fr: 'Transform\'Action Africa est un parcours pédagogique, collectif et créatif, conçu pour les leaders qui conduisent des dynamiques de transformation structurelle au sein des organisations publiques africaines, au service de la transition sociale et écologique.',
    description_en: 'Transform\'Action Africa is a pedagogical, collective and creative pathway designed for leaders driving structural transformation dynamics within African public organizations, in service of social and ecological transition.',
    description_ar: 'ترانسفورم أكشن أفريكا هو مسار تعليمي جماعي وإبداعي، مصمم للقادة الذين يقودون ديناميكيات التحول الهيكلي داخل المنظمات العامة الأفريقية، في خدمة التحول الاجتماعي والبيئي.',
    content_fr: `**Transform'Action Africa** est un parcours pédagogique, collectif et créatif, conçu pour les leaders qui conduisent des dynamiques de transformation structurelle au sein des organisations publiques africaines, au service de la transition sociale et écologique.

## Notre mission

Former les cadres publics qui transforment l'Afrique en renforçant les compétences managériales et de leadership des cadres du secteur public en Afrique francophone, pour améliorer leurs pratiques professionnelles et la performance de leurs organisations.

## Format du programme

- **Durée** : 30 jours répartis sur 6 mois
- **Modalités** : 3 semaines de sessions résidentielles en présentiel combinées à des modules de formation à distance
- **Adaptation** : Programme personnalisé pour refléter les spécificités culturelles et contextuelles des organisations africaines

## Approche pédagogique

Transform'Action Africa propose une pédagogie innovante qui combine :

- **Apprentissage par l'action** : Les participants travaillent sur des projets concrets de transformation de leurs organisations
- **Intelligence collective** : Échanges entre pairs et co-construction de solutions
- **Créativité** : Méthodes de design thinking et d'innovation sociale
- **Résolution collective de problèmes** : Méthodologies créatives adaptées au contexte africain

## Bénéficiaires

Cadres et managers du secteur public des organisations africaines francophones cherchant à améliorer la transformation organisationnelle et la prestation de services.

## Les Transform'acteurs

À l'issue du programme, les participants deviennent des « Transform'acteurs » dotés de capacités renforcées pour conduire le changement organisationnel au sein de leurs institutions.`,
    content_en: `**Transform'Action Africa** is a pedagogical, collective and creative pathway designed for leaders driving structural transformation dynamics within African public organizations, in service of social and ecological transition.

## Our mission

Training the public managers who transform Africa by strengthening the managerial and leadership skills of public sector executives in francophone Africa, to improve their professional practices and organizational performance.

## Program format

- **Duration**: 30 days spread over 6 months
- **Format**: 3 weeks of in-person residential sessions combined with distance learning modules
- **Adaptation**: Customized program reflecting the cultural and contextual specificities of African organizations

## Pedagogical approach

Transform'Action Africa offers an innovative pedagogy that combines:

- **Learning by doing**: Participants work on concrete transformation projects within their organizations
- **Collective intelligence**: Peer exchanges and co-construction of solutions
- **Creativity**: Design thinking and social innovation methods
- **Collective problem-solving**: Creative methodologies adapted to the African context

## Beneficiaries

Public sector executives and managers from francophone African organizations seeking to improve organizational transformation and service delivery.

## The Transform'actors

Upon completion of the program, participants become "Transform'actors" equipped with enhanced capabilities to lead organizational change within their institutions.`,
    content_ar: `**ترانسفورم أكشن أفريكا** هو مسار تعليمي جماعي وإبداعي، مصمم للقادة الذين يقودون ديناميكيات التحول الهيكلي داخل المنظمات العامة الأفريقية، في خدمة التحول الاجتماعي والبيئي.

## مهمتنا

تدريب المديرين العموميين الذين يحولون أفريقيا من خلال تعزيز المهارات الإدارية والقيادية لكوادر القطاع العام في أفريقيا الناطقة بالفرنسية، لتحسين ممارساتهم المهنية وأداء منظماتهم.

## شكل البرنامج

- **المدة**: 30 يوماً موزعة على 6 أشهر
- **الصيغة**: 3 أسابيع من الجلسات الحضورية مع وحدات التعلم عن بعد
- **التكيف**: برنامج مخصص يعكس الخصوصيات الثقافية والسياقية للمنظمات الأفريقية

## النهج التربوي

يقدم ترانسفورم أكشن أفريكا منهجية تعليمية مبتكرة تجمع بين:

- **التعلم بالممارسة**: يعمل المشاركون على مشاريع تحول ملموسة داخل منظماتهم
- **الذكاء الجماعي**: تبادل الخبرات بين الأقران وبناء الحلول المشتركة
- **الإبداع**: أساليب التفكير التصميمي والابتكار الاجتماعي
- **حل المشكلات الجماعي**: منهجيات إبداعية مكيفة مع السياق الأفريقي

## المستفيدون

كوادر ومديرو القطاع العام من المنظمات الأفريقية الناطقة بالفرنسية الساعين إلى تحسين التحول التنظيمي وتقديم الخدمات.

## المحولون

عند الانتهاء من البرنامج، يصبح المشاركون "محولين" مجهزين بقدرات معززة لقيادة التغيير التنظيمي داخل مؤسساتهم.`,
    image: 'https://picsum.photos/seed/transformaction-africa/1200/600',
    gallery: [
      'https://picsum.photos/seed/transformaction-africa-1/800/600',
      'https://picsum.photos/seed/transformaction-africa-2/800/600',
      'https://picsum.photos/seed/transformaction-africa-3/800/600'
    ],
    category: 'education',
    status: 'active',
    featured: true,
    start_date: '2022-01-15',
    partners: [
      { name: 'Agence Française de Développement (AFD)', website: 'https://www.afd.fr' },
      { name: 'Makesense', logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/25.png', website: 'https://makesense.org' }
    ],
    countries: [
      { name: 'Côte d\'Ivoire', code: 'CI' },
      { name: 'Sénégal', code: 'SN' },
      { name: 'Cameroun', code: 'CM' },
      { name: 'Bénin', code: 'BJ' },
      { name: 'Togo', code: 'TG' },
      { name: 'Mali', code: 'ML' },
      { name: 'Burkina Faso', code: 'BF' },
      { name: 'Niger', code: 'NE' },
      { name: 'Guinée', code: 'GN' },
      { name: 'RDC', code: 'CD' },
      { name: 'Madagascar', code: 'MG' },
      { name: 'Mauritanie', code: 'MR' }
    ],
    website: 'https://usenghor-francophonie.org/transformaction/',
    budget: '5 millions EUR',
    beneficiaries: 'Cadres dirigeants des organisations publiques africaines'
  },
  {
    id: 'project-kreafrika',
    slug: 'kreafrika',
    title_fr: 'KreAfrika',
    title_en: 'KreAfrika',
    title_ar: 'كري أفريكا',
    description_fr: 'KreAfrika est un projet mis en œuvre par l\'Université Senghor, le groupe médiatique TRACE et le Campus Groupe AFD, qui vise à renforcer les compétences des professionnels des Industries Culturelles et Créatives en Afrique. À travers des formations en ligne, des séminaires en présentiel et un réseau professionnel, KreAfrika favorise l\'échange des pratiques et savoir-faire dans le domaine des ICC.',
    description_en: 'KreAfrika is a project implemented by Senghor University, TRACE media group and Campus Groupe AFD, aimed at strengthening the skills of professionals in Cultural and Creative Industries in Africa. Through online training, in-person seminars and a professional network, KreAfrika promotes the exchange of practices and know-how in the CCI field.',
    description_ar: 'كري أفريكا هو مشروع ينفذه جامعة سنغور ومجموعة TRACE الإعلامية وCampus Groupe AFD، يهدف إلى تعزيز مهارات المهنيين في الصناعات الثقافية والإبداعية في أفريقيا. من خلال التدريب عبر الإنترنت والندوات الحضورية والشبكة المهنية، يعزز كري أفريكا تبادل الممارسات والخبرات في مجال الصناعات الثقافية والإبداعية.',
    content_fr: `**KreAfrika** est un projet mis en œuvre par l'Université Senghor, le groupe médiatique TRACE et le Campus Groupe AFD, qui vise à renforcer les compétences des professionnels des Industries Culturelles et Créatives (ICC) en Afrique.

## Objectifs

- Renforcer les compétences des professionnels des ICC en Afrique
- Réduire les inégalités de genre dans les industries culturelles et créatives africaines grâce à des parcours de formation adaptés
- Favoriser l'échange des pratiques et savoir-faire dans le domaine des industries créatives

## Approche

KreAfrika combine trois modalités complémentaires :

### Formation en ligne
- Modules de e-learning accessibles à distance
- Contenus développés par des experts du secteur
- Parcours personnalisés selon les profils

### Séminaires régionaux

Cinq séminaires régionaux organisés entre 2021 et 2025 abordant les grands défis du secteur :

- **Dakar** : Politiques publiques dans les ICC
- **Kinshasa & Nairobi** : Gestion des équipements culturels
- **Abidjan & Alexandrie-Le Caire** : Entrepreneuriat et financement

### Réseautage professionnel
- Mise en relation entre professionnels du secteur
- Événements de networking (ex: Bootcamp Marseille 2025)
- Plateforme d'échange et de collaboration

## Secteurs couverts

- Musique et arts du spectacle
- Audiovisuel et cinéma
- Mode et design
- Arts visuels et artisanat d'art
- Édition et contenus numériques

## Partenaires

- **Université Senghor** : Expertise académique et pédagogique
- **TRACE** : Groupe médiatique et connaissance du secteur créatif africain
- **Campus Groupe AFD** : Expertise en formation professionnelle et développement

## Contact

kreafrika@usenghor.org`,
    content_en: `**KreAfrika** is a project implemented by Senghor University, TRACE media group, and Campus Groupe AFD, aimed at strengthening the skills of professionals in Cultural and Creative Industries (CCI) in Africa.

## Objectives

- Strengthen the skills of CCI professionals in Africa
- Reduce gender inequality in African cultural and creative industries through adapted training pathways
- Promote the exchange of practices and know-how in the creative industries field

## Approach

KreAfrika combines three complementary modalities:

### Online training
- E-learning modules accessible remotely
- Content developed by industry experts
- Personalized pathways according to profiles

### Regional seminars

Five regional seminars organized between 2021 and 2025 addressing major sector challenges:

- **Dakar**: Public policies in CCI
- **Kinshasa & Nairobi**: Cultural facility management
- **Abidjan & Alexandria-Cairo**: Entrepreneurship and financing

### Professional networking
- Connecting professionals in the sector
- Networking events (e.g., Marseille Bootcamp 2025)
- Exchange and collaboration platform

## Sectors covered

- Music and performing arts
- Audiovisual and cinema
- Fashion and design
- Visual arts and crafts
- Publishing and digital content

## Partners

- **Senghor University**: Academic and pedagogical expertise
- **TRACE**: Media group and knowledge of the African creative sector
- **Campus Groupe AFD**: Expertise in professional training and development

## Contact

kreafrika@usenghor.org`,
    content_ar: `**كري أفريكا** هو مشروع ينفذه جامعة سنغور ومجموعة TRACE الإعلامية وCampus Groupe AFD، يهدف إلى تعزيز مهارات المهنيين في الصناعات الثقافية والإبداعية في أفريقيا.

## الأهداف

- تعزيز مهارات المهنيين في الصناعات الثقافية والإبداعية في أفريقيا
- الحد من عدم المساواة بين الجنسين في الصناعات الثقافية والإبداعية الأفريقية من خلال مسارات تدريبية مكيفة
- تعزيز تبادل الممارسات والخبرات في مجال الصناعات الإبداعية

## النهج

يجمع كري أفريكا بين ثلاث طرق متكاملة:

### التدريب عبر الإنترنت
- وحدات التعلم الإلكتروني عن بعد
- محتوى طوره خبراء الصناعة
- مسارات مخصصة حسب الملفات الشخصية

### الندوات الإقليمية

خمس ندوات إقليمية نُظمت بين 2021 و2025 تتناول التحديات الكبرى للقطاع:

- **داكار**: السياسات العامة في الصناعات الثقافية والإبداعية
- **كينشاسا ونيروبي**: إدارة المرافق الثقافية
- **أبيدجان والإسكندرية-القاهرة**: ريادة الأعمال والتمويل

### التواصل المهني
- ربط المهنيين في القطاع
- فعاليات التواصل (مثل: معسكر مرسيليا 2025)
- منصة للتبادل والتعاون

## القطاعات المشمولة

- الموسيقى وفنون الأداء
- السمعي البصري والسينما
- الموضة والتصميم
- الفنون البصرية والحرف اليدوية
- النشر والمحتوى الرقمي

## للتواصل

kreafrika@usenghor.org`,
    image: 'https://picsum.photos/seed/kreafrika/1200/600',
    gallery: [
      'https://picsum.photos/seed/kreafrika-1/800/600',
      'https://picsum.photos/seed/kreafrika-2/800/600',
      'https://picsum.photos/seed/kreafrika-3/800/600'
    ],
    category: 'culture',
    status: 'active',
    featured: true,
    start_date: '2021-01-01',
    partners: [
      { name: 'TRACE', logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/31.jpg', website: 'https://trace.tv' },
      { name: 'Campus Groupe AFD', website: 'https://campus.afd.fr' }
    ],
    countries: [
      { name: 'Sénégal', code: 'SN' },
      { name: 'RDC', code: 'CD' },
      { name: 'Kenya', code: 'KE' },
      { name: 'Côte d\'Ivoire', code: 'CI' },
      { name: 'Égypte', code: 'EG' }
    ],
    website: 'https://sites.google.com/usenghor.org/kreafrika/accueil',
    budget: '2,5 millions EUR',
    beneficiaries: 'Professionnels des Industries Culturelles et Créatives'
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
    partners: [
      { name: 'Alumni Senghor' },
      { name: 'Fondations partenaires' }
    ],
    countries: [
      { name: 'International', code: 'UN' }
    ],
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
    partners: [
      { name: 'OIF', logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/01.jpg', website: 'https://www.francophonie.org' },
      { name: 'Pays bailleurs' },
      { name: 'Fondations partenaires' }
    ],
    countries: [
      { name: '35 pays francophones', code: 'UN' }
    ],
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
    partners: [
      { name: 'AUF', logo: 'https://usenghor-francophonie.org/wp-content/uploads/2023/09/03.png', website: 'https://www.auf.org' },
      { name: 'CNRS', website: 'https://www.cnrs.fr' },
      { name: 'IRD', website: 'https://www.ird.fr' },
      { name: 'Universités partenaires' }
    ],
    countries: [
      { name: '25 pays', code: 'UN' }
    ],
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
    partners: [
      { name: 'Google', website: 'https://www.google.com' },
      { name: 'Microsoft', website: 'https://www.microsoft.com' },
      { name: 'Orange Digital Center', website: 'https://www.orangedigitalcenter.com' }
    ],
    countries: [
      { name: 'Afrique francophone', code: 'UN' }
    ],
    beneficiaries: '50 leaders/an'
  }
]
