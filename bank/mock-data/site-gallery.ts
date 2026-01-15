// Types
export type MediaType = 'photo' | 'video'

export interface SiteGalleryItem {
  id: string
  type: MediaType
  title_fr: string
  title_en?: string
  title_ar?: string
  url: string
  thumbnail: string
  facility_id?: string
  date: string
  sort_order: number
}

// Données mock de la galerie média du siège d'Alexandrie
export const mockSiteGallery: SiteGalleryItem[] = [
  // Photos
  {
    id: 'gallery-1',
    type: 'photo',
    title_fr: 'Vue aérienne du campus',
    title_en: 'Aerial view of the campus',
    title_ar: 'منظر جوي للحرم الجامعي',
    url: 'https://picsum.photos/seed/senghor-aerial/1200/800',
    thumbnail: 'https://picsum.photos/seed/senghor-aerial/400/300',
    date: '2024-01-15',
    sort_order: 1
  },
  {
    id: 'gallery-2',
    type: 'photo',
    title_fr: 'Façade principale du bâtiment historique',
    title_en: 'Main facade of the historic building',
    title_ar: 'الواجهة الرئيسية للمبنى التاريخي',
    url: 'https://picsum.photos/seed/senghor-facade/1200/800',
    thumbnail: 'https://picsum.photos/seed/senghor-facade/400/300',
    date: '2024-01-10',
    sort_order: 2
  },
  {
    id: 'gallery-3',
    type: 'photo',
    title_fr: 'Hall d\'entrée',
    title_en: 'Entrance hall',
    title_ar: 'قاعة المدخل',
    url: 'https://picsum.photos/seed/senghor-hall/1200/800',
    thumbnail: 'https://picsum.photos/seed/senghor-hall/400/300',
    date: '2024-02-01',
    sort_order: 3
  },
  {
    id: 'gallery-4',
    type: 'photo',
    title_fr: 'Bibliothèque universitaire',
    title_en: 'University library',
    title_ar: 'المكتبة الجامعية',
    url: 'https://picsum.photos/seed/senghor-lib/1200/800',
    thumbnail: 'https://picsum.photos/seed/senghor-lib/400/300',
    facility_id: 'facility-library',
    date: '2024-02-15',
    sort_order: 4
  },
  {
    id: 'gallery-5',
    type: 'photo',
    title_fr: 'Salle de lecture',
    title_en: 'Reading room',
    title_ar: 'غرفة القراءة',
    url: 'https://picsum.photos/seed/senghor-reading/1200/800',
    thumbnail: 'https://picsum.photos/seed/senghor-reading/400/300',
    facility_id: 'facility-library',
    date: '2024-02-20',
    sort_order: 5
  },
  {
    id: 'gallery-6',
    type: 'photo',
    title_fr: 'Amphithéâtre principal',
    title_en: 'Main amphitheater',
    title_ar: 'المدرج الرئيسي',
    url: 'https://picsum.photos/seed/senghor-amphi/1200/800',
    thumbnail: 'https://picsum.photos/seed/senghor-amphi/400/300',
    facility_id: 'facility-conference',
    date: '2024-03-01',
    sort_order: 6
  },
  {
    id: 'gallery-7',
    type: 'photo',
    title_fr: 'Salle de conférence équipée',
    title_en: 'Equipped conference room',
    title_ar: 'قاعة مؤتمرات مجهزة',
    url: 'https://picsum.photos/seed/senghor-conf/1200/800',
    thumbnail: 'https://picsum.photos/seed/senghor-conf/400/300',
    facility_id: 'facility-conference',
    date: '2024-03-10',
    sort_order: 7
  },
  {
    id: 'gallery-8',
    type: 'photo',
    title_fr: 'Salle de cours moderne',
    title_en: 'Modern classroom',
    title_ar: 'فصل دراسي حديث',
    url: 'https://picsum.photos/seed/senghor-class/1200/800',
    thumbnail: 'https://picsum.photos/seed/senghor-class/400/300',
    facility_id: 'facility-academic',
    date: '2024-03-15',
    sort_order: 8
  },
  {
    id: 'gallery-9',
    type: 'photo',
    title_fr: 'Laboratoire informatique',
    title_en: 'Computer lab',
    title_ar: 'مختبر الحاسوب',
    url: 'https://picsum.photos/seed/senghor-lab/1200/800',
    thumbnail: 'https://picsum.photos/seed/senghor-lab/400/300',
    facility_id: 'facility-academic',
    date: '2024-03-20',
    sort_order: 9
  },
  {
    id: 'gallery-10',
    type: 'photo',
    title_fr: 'Résidence universitaire',
    title_en: 'University residence',
    title_ar: 'السكن الجامعي',
    url: 'https://picsum.photos/seed/senghor-dorm/1200/800',
    thumbnail: 'https://picsum.photos/seed/senghor-dorm/400/300',
    facility_id: 'facility-housing',
    date: '2024-04-01',
    sort_order: 10
  },
  {
    id: 'gallery-11',
    type: 'photo',
    title_fr: 'Chambre étudiante',
    title_en: 'Student room',
    title_ar: 'غرفة طالب',
    url: 'https://picsum.photos/seed/senghor-room/1200/800',
    thumbnail: 'https://picsum.photos/seed/senghor-room/400/300',
    facility_id: 'facility-housing',
    date: '2024-04-05',
    sort_order: 11
  },
  {
    id: 'gallery-12',
    type: 'photo',
    title_fr: 'Piscine du campus',
    title_en: 'Campus swimming pool',
    title_ar: 'مسبح الحرم الجامعي',
    url: 'https://picsum.photos/seed/senghor-swim/1200/800',
    thumbnail: 'https://picsum.photos/seed/senghor-swim/400/300',
    facility_id: 'facility-pool',
    date: '2024-04-15',
    sort_order: 12
  },
  {
    id: 'gallery-13',
    type: 'photo',
    title_fr: 'Terrain de sport',
    title_en: 'Sports field',
    title_ar: 'ملعب رياضي',
    url: 'https://picsum.photos/seed/senghor-field/1200/800',
    thumbnail: 'https://picsum.photos/seed/senghor-field/400/300',
    facility_id: 'facility-sports',
    date: '2024-05-01',
    sort_order: 13
  },
  {
    id: 'gallery-14',
    type: 'photo',
    title_fr: 'Vue sur la Méditerranée',
    title_en: 'Mediterranean view',
    title_ar: 'إطلالة على البحر المتوسط',
    url: 'https://picsum.photos/seed/senghor-sea/1200/800',
    thumbnail: 'https://picsum.photos/seed/senghor-sea/400/300',
    date: '2024-05-10',
    sort_order: 14
  },
  {
    id: 'gallery-15',
    type: 'photo',
    title_fr: 'Jardins du campus',
    title_en: 'Campus gardens',
    title_ar: 'حدائق الحرم الجامعي',
    url: 'https://picsum.photos/seed/senghor-garden/1200/800',
    thumbnail: 'https://picsum.photos/seed/senghor-garden/400/300',
    date: '2024-05-20',
    sort_order: 15
  },
  // Vidéos
  {
    id: 'gallery-video-1',
    type: 'video',
    title_fr: 'Visite virtuelle du campus',
    title_en: 'Virtual campus tour',
    title_ar: 'جولة افتراضية في الحرم الجامعي',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: 'https://picsum.photos/seed/senghor-vtour/400/300',
    date: '2024-01-20',
    sort_order: 16
  },
  {
    id: 'gallery-video-2',
    type: 'video',
    title_fr: 'Cérémonie de remise des diplômes 2024',
    title_en: 'Graduation ceremony 2024',
    title_ar: 'حفل تخرج 2024',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: 'https://picsum.photos/seed/senghor-grad/400/300',
    facility_id: 'facility-conference',
    date: '2024-06-15',
    sort_order: 17
  },
  {
    id: 'gallery-video-3',
    type: 'video',
    title_fr: 'Présentation de la bibliothèque',
    title_en: 'Library presentation',
    title_ar: 'عرض المكتبة',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: 'https://picsum.photos/seed/senghor-libvid/400/300',
    facility_id: 'facility-library',
    date: '2024-02-25',
    sort_order: 18
  },
  {
    id: 'gallery-video-4',
    type: 'video',
    title_fr: 'Vie étudiante à Alexandrie',
    title_en: 'Student life in Alexandria',
    title_ar: 'الحياة الطلابية في الإسكندرية',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: 'https://picsum.photos/seed/senghor-life/400/300',
    date: '2024-03-30',
    sort_order: 19
  }
]
