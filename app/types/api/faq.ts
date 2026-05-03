// Types API FAQ — public + admin
// Spec : specs/019-faq-backoffice/contracts/

export interface FaqEntryPublic {
  id: string
  slug: string
  question_fr: string
  question_en: string
  question_ar: string
  answer_fr_html: string
  answer_en_html: string
  answer_ar_html: string
  display_order: number
  published_at: string
}

export interface FaqCategoryPublic {
  id: string
  code: string
  label_fr: string
  label_en: string
  label_ar: string
  description_fr: string | null
  description_en: string | null
  description_ar: string | null
  display_order: number
  entries: FaqEntryPublic[]
}

export interface FaqTreePublic {
  categories: FaqCategoryPublic[]
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export interface FaqCategoryAdmin {
  id: string
  code: string
  label_fr: string
  label_en: string | null
  label_ar: string | null
  description_fr: string | null
  description_en: string | null
  description_ar: string | null
  display_order: number
  is_active: boolean
  entry_count: number
  created_at: string
  updated_at: string
}

export interface FaqCategoryCreatePayload {
  code: string
  label_fr: string
  label_en?: string | null
  label_ar?: string | null
  description_fr?: string | null
  description_en?: string | null
  description_ar?: string | null
  is_active?: boolean
}

export interface FaqCategoryUpdatePayload {
  label_fr?: string
  label_en?: string | null
  label_ar?: string | null
  description_fr?: string | null
  description_en?: string | null
  description_ar?: string | null
  is_active?: boolean
}

export interface FaqEntryAdminListItem {
  id: string
  category_id: string
  category_code: string
  slug: string
  question_fr: string
  question_en: string | null
  question_ar: string | null
  is_published: boolean
  published_at: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export interface FaqEntryAdminFull extends FaqEntryAdminListItem {
  answer_fr_md: string
  answer_fr_html: string
  answer_en_md: string | null
  answer_en_html: string | null
  answer_ar_md: string | null
  answer_ar_html: string | null
  created_by: string | null
  updated_by: string | null
}

export interface FaqEntryCreatePayload {
  category_id: string
  slug?: string | null
  question_fr: string
  question_en?: string | null
  question_ar?: string | null
  answer_fr_md: string
  answer_fr_html: string
  answer_en_md?: string | null
  answer_en_html?: string | null
  answer_ar_md?: string | null
  answer_ar_html?: string | null
}

export interface FaqEntryUpdatePayload {
  category_id?: string
  slug?: string
  question_fr?: string
  question_en?: string | null
  question_ar?: string | null
  answer_fr_md?: string
  answer_fr_html?: string
  answer_en_md?: string | null
  answer_en_html?: string | null
  answer_ar_md?: string | null
  answer_ar_html?: string | null
}

export interface ReorderItem {
  id: string
  display_order: number
}

export interface CategoriesReorderRequest {
  items: ReorderItem[]
}

export interface EntriesReorderRequest {
  category_id: string
  items: ReorderItem[]
}

export interface PublishRequest {
  is_published: boolean
}

export interface FaqEntriesAdminPage {
  items: FaqEntryAdminListItem[]
  total: number
  page: number
  page_size: number
}
