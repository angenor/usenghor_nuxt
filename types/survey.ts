/**
 * Types Survey
 * =============
 *
 * Types TypeScript pour les campagnes de sondage.
 */

export type SurveyCampaignStatus = 'draft' | 'active' | 'paused' | 'closed'

export interface SurveyCampaign {
  id: string
  slug: string
  title_fr: string
  title_en: string | null
  title_ar: string | null
  description_fr: string | null
  description_en: string | null
  description_ar: string | null
  survey_json: Record<string, any>
  status: SurveyCampaignStatus
  confirmation_email_enabled: boolean
  closes_at: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface SurveyCampaignWithStats extends SurveyCampaign {
  response_count: number
  last_response_at: string | null
}

export interface SurveyResponse {
  id: string
  response_data: Record<string, any>
  submitted_at: string
}

export interface SurveyQuestionStats {
  name: string
  type: string
  title: string
  stats: {
    average?: number
    distribution: Record<string, number>
  }
}

export interface SurveyStatsResponse {
  total_responses: number
  first_response_at: string | null
  last_response_at: string | null
  questions: SurveyQuestionStats[]
}

export interface SurveyAssociation {
  id: string
  campaign_id: string
  entity_type: string
  entity_id: string
  created_at: string
}
