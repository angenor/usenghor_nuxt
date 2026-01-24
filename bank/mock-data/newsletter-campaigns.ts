/**
 * Mock data pour les campagnes newsletter (admin)
 * Aligné avec le schéma SQL: newsletter_campaigns, newsletter_sends (11_newsletter.sql)
 */

import { mockNewsletterSubscribers } from './newsletter-subscribers'

// Types alignés avec le schéma SQL
export type CampaignStatus = 'draft' | 'scheduled' | 'sent'
export type SendStatus = 'sent' | 'opened' | 'clicked' | 'error'

export interface NewsletterCampaign {
  id: string
  title: string
  subject: string
  html_content: string
  text_content: string
  status: CampaignStatus
  scheduled_send_at: string | null
  sent_at: string | null
  recipient_count: number
  open_count: number
  click_count: number
  created_by_external_id: string | null
  created_at: string
  updated_at: string
}

export interface NewsletterCampaignWithStats extends NewsletterCampaign {
  open_rate: number
  click_rate: number
}

export interface NewsletterSend {
  id: string
  campaign_id: string
  subscriber_id: string
  email: string
  status: SendStatus
  sent_at: string
  opened_at: string | null
  clicked_at: string | null
  error_message: string | null
}

export interface CampaignFilters {
  search?: string
  status?: CampaignStatus | 'all'
  date_from?: string
  date_to?: string
  sort_by?: 'title' | 'created_at' | 'sent_at' | 'recipient_count'
  sort_order?: 'asc' | 'desc'
}

export interface CampaignStats {
  recipient_count: number
  sent_count: number
  error_count: number
  open_count: number
  unique_opens: number
  click_count: number
  unique_clicks: number
  open_rate: number
  click_rate: number
  by_day: Array<{ date: string; opens: number; clicks: number }>
}

export interface CampaignRecipient {
  id: string
  email: string
  subscriber_name: string | null
  status: SendStatus
  sent_at: string
  opened_at: string | null
  clicked_at: string | null
}

// Labels pour les statuts
export const campaignStatusLabels: Record<CampaignStatus, string> = {
  draft: 'Brouillon',
  scheduled: 'Programmée',
  sent: 'Envoyée'
}

// Couleurs pour les statuts
export const campaignStatusColors: Record<CampaignStatus, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  sent: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
}

// Labels pour les statuts d'envoi
export const sendStatusLabels: Record<SendStatus, string> = {
  sent: 'Envoyé',
  opened: 'Ouvert',
  clicked: 'Cliqué',
  error: 'Erreur'
}

// Couleurs pour les statuts d'envoi
export const sendStatusColors: Record<SendStatus, string> = {
  sent: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  opened: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  clicked: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
}

// Générer un ID unique
export const generateCampaignId = (): string => {
  return `camp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// Générer un ID d'envoi
export const generateSendId = (): string => {
  return `send_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// Template HTML par défaut
export const defaultHtmlTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1e3a5f; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #ffffff; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .unsubscribe { color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Université Senghor</h1>
    </div>
    <div class="content">
      <p>Bonjour {{first_name}},</p>
      <p>Votre contenu ici...</p>
    </div>
    <div class="footer">
      <p>Université Senghor - 1 Place Ahmed Orabi, El Mancheya, Alexandrie, Égypte</p>
      <p class="unsubscribe"><a href="{{unsubscribe_link}}">Se désabonner</a></p>
    </div>
  </div>
</body>
</html>`

// Mock data - Campagnes newsletter
export const mockNewsletterCampaigns: NewsletterCampaign[] = [
  // Campagnes envoyées
  {
    id: 'camp_001',
    title: 'Newsletter Janvier 2025',
    subject: 'Les actualités de l\'Université Senghor - Janvier 2025',
    html_content: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;line-height:1.6;}</style></head>
<body>
  <div style="max-width:600px;margin:0 auto;">
    <div style="background:#1e3a5f;color:white;padding:20px;text-align:center;">
      <h1>Newsletter Janvier 2025</h1>
    </div>
    <div style="padding:20px;">
      <p>Bonjour {{first_name}},</p>
      <h2>Bonne année 2025 !</h2>
      <p>L'équipe de l'Université Senghor vous souhaite une excellente année 2025.</p>
      <h3>Les temps forts de ce mois</h3>
      <ul>
        <li>Ouverture des inscriptions pour la rentrée 2025-2026</li>
        <li>Nouveau partenariat avec l'Université de Dakar</li>
        <li>Conférence sur le développement durable le 25 janvier</li>
      </ul>
      <p><a href="#">En savoir plus</a></p>
    </div>
    <div style="padding:20px;text-align:center;font-size:12px;color:#666;">
      <p>Université Senghor - Alexandrie, Égypte</p>
      <p><a href="{{unsubscribe_link}}">Se désabonner</a></p>
    </div>
  </div>
</body>
</html>`,
    text_content: `Bonjour {{first_name}},\n\nBonne année 2025 !\n\nL'équipe de l'Université Senghor vous souhaite une excellente année 2025.\n\nLes temps forts de ce mois :\n- Ouverture des inscriptions pour la rentrée 2025-2026\n- Nouveau partenariat avec l'Université de Dakar\n- Conférence sur le développement durable le 25 janvier\n\nPour vous désabonner : {{unsubscribe_link}}`,
    status: 'sent',
    scheduled_send_at: null,
    sent_at: '2025-01-15T09:00:00Z',
    recipient_count: 28,
    open_count: 18,
    click_count: 5,
    created_by_external_id: 'user_admin_001',
    created_at: '2025-01-10T14:00:00Z',
    updated_at: '2025-01-15T09:00:00Z'
  },
  {
    id: 'camp_002',
    title: 'Voeux de fin d\'année 2024',
    subject: 'Joyeuses fêtes de la part de l\'Université Senghor',
    html_content: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>
  <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
    <div style="background:#c41e3a;color:white;padding:30px;text-align:center;">
      <h1>Joyeuses Fêtes !</h1>
    </div>
    <div style="padding:20px;">
      <p>Cher(e) {{first_name}},</p>
      <p>Toute l'équipe de l'Université Senghor vous souhaite de joyeuses fêtes de fin d'année et vous donne rendez-vous en 2025 pour de nouveaux projets.</p>
      <p>Merci pour votre fidélité.</p>
    </div>
    <div style="padding:20px;text-align:center;font-size:12px;color:#666;">
      <p><a href="{{unsubscribe_link}}">Se désabonner</a></p>
    </div>
  </div>
</body>
</html>`,
    text_content: `Cher(e) {{first_name}},\n\nToute l'équipe de l'Université Senghor vous souhaite de joyeuses fêtes de fin d'année et vous donne rendez-vous en 2025 pour de nouveaux projets.\n\nMerci pour votre fidélité.\n\nPour vous désabonner : {{unsubscribe_link}}`,
    status: 'sent',
    scheduled_send_at: null,
    sent_at: '2024-12-23T10:00:00Z',
    recipient_count: 26,
    open_count: 20,
    click_count: 3,
    created_by_external_id: 'user_admin_001',
    created_at: '2024-12-20T11:00:00Z',
    updated_at: '2024-12-23T10:00:00Z'
  },
  {
    id: 'camp_003',
    title: 'Newsletter Décembre 2024',
    subject: 'Actualités Université Senghor - Décembre 2024',
    html_content: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>
  <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
    <div style="background:#1e3a5f;color:white;padding:20px;text-align:center;">
      <h1>Newsletter Décembre 2024</h1>
    </div>
    <div style="padding:20px;">
      <p>Bonjour {{first_name}},</p>
      <h3>Retour sur la conférence internationale</h3>
      <p>Plus de 200 participants ont assisté à notre conférence sur "L'Afrique et les défis climatiques".</p>
      <h3>Remise des diplômes</h3>
      <p>Félicitations à nos 85 diplômés de la promotion 2024 !</p>
    </div>
    <div style="padding:20px;text-align:center;font-size:12px;color:#666;">
      <p><a href="{{unsubscribe_link}}">Se désabonner</a></p>
    </div>
  </div>
</body>
</html>`,
    text_content: `Bonjour {{first_name}},\n\nRetour sur la conférence internationale\nPlus de 200 participants ont assisté à notre conférence sur "L'Afrique et les défis climatiques".\n\nRemise des diplômes\nFélicitations à nos 85 diplômés de la promotion 2024 !\n\nPour vous désabonner : {{unsubscribe_link}}`,
    status: 'sent',
    scheduled_send_at: null,
    sent_at: '2024-12-10T09:00:00Z',
    recipient_count: 24,
    open_count: 14,
    click_count: 6,
    created_by_external_id: 'user_admin_001',
    created_at: '2024-12-05T15:00:00Z',
    updated_at: '2024-12-10T09:00:00Z'
  },
  {
    id: 'camp_004',
    title: 'Invitation Conférence Climat',
    subject: 'Invitation : Conférence "L\'Afrique face aux défis climatiques"',
    html_content: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>
  <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
    <div style="background:#2d5016;color:white;padding:20px;text-align:center;">
      <h1>Conférence Internationale</h1>
      <h2>L'Afrique face aux défis climatiques</h2>
    </div>
    <div style="padding:20px;">
      <p>Cher(e) {{first_name}},</p>
      <p>L'Université Senghor a le plaisir de vous inviter à sa conférence internationale.</p>
      <p><strong>Date :</strong> 5 décembre 2024<br>
      <strong>Lieu :</strong> Auditorium de l'Université Senghor, Alexandrie<br>
      <strong>Thème :</strong> L'Afrique face aux défis climatiques</p>
      <p><a href="#" style="background:#2d5016;color:white;padding:10px 20px;text-decoration:none;display:inline-block;">S'inscrire</a></p>
    </div>
    <div style="padding:20px;text-align:center;font-size:12px;color:#666;">
      <p><a href="{{unsubscribe_link}}">Se désabonner</a></p>
    </div>
  </div>
</body>
</html>`,
    text_content: `Cher(e) {{first_name}},\n\nL'Université Senghor a le plaisir de vous inviter à sa conférence internationale.\n\nDate : 5 décembre 2024\nLieu : Auditorium de l'Université Senghor, Alexandrie\nThème : L'Afrique face aux défis climatiques\n\nPour vous désabonner : {{unsubscribe_link}}`,
    status: 'sent',
    scheduled_send_at: null,
    sent_at: '2024-11-20T08:00:00Z',
    recipient_count: 22,
    open_count: 16,
    click_count: 8,
    created_by_external_id: 'user_admin_002',
    created_at: '2024-11-15T10:00:00Z',
    updated_at: '2024-11-20T08:00:00Z'
  },
  {
    id: 'camp_005',
    title: 'Newsletter Novembre 2024',
    subject: 'Actualités Université Senghor - Novembre 2024',
    html_content: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>
  <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
    <div style="background:#1e3a5f;color:white;padding:20px;text-align:center;">
      <h1>Newsletter Novembre 2024</h1>
    </div>
    <div style="padding:20px;">
      <p>Bonjour {{first_name}},</p>
      <p>Découvrez les actualités de ce mois...</p>
    </div>
    <div style="padding:20px;text-align:center;font-size:12px;color:#666;">
      <p><a href="{{unsubscribe_link}}">Se désabonner</a></p>
    </div>
  </div>
</body>
</html>`,
    text_content: `Bonjour {{first_name}},\n\nDécouvrez les actualités de ce mois...\n\nPour vous désabonner : {{unsubscribe_link}}`,
    status: 'sent',
    scheduled_send_at: null,
    sent_at: '2024-11-10T09:00:00Z',
    recipient_count: 20,
    open_count: 10,
    click_count: 2,
    created_by_external_id: 'user_admin_001',
    created_at: '2024-11-05T14:00:00Z',
    updated_at: '2024-11-10T09:00:00Z'
  },
  // Campagne programmée
  {
    id: 'camp_006',
    title: 'Newsletter Février 2025',
    subject: 'Les actualités de l\'Université Senghor - Février 2025',
    html_content: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>
  <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
    <div style="background:#1e3a5f;color:white;padding:20px;text-align:center;">
      <h1>Newsletter Février 2025</h1>
    </div>
    <div style="padding:20px;">
      <p>Bonjour {{first_name}},</p>
      <p>Découvrez nos actualités de février...</p>
      <h3>Ouverture des inscriptions</h3>
      <p>Les inscriptions pour le Master en Gestion du Patrimoine Culturel sont ouvertes jusqu'au 28 février.</p>
    </div>
    <div style="padding:20px;text-align:center;font-size:12px;color:#666;">
      <p><a href="{{unsubscribe_link}}">Se désabonner</a></p>
    </div>
  </div>
</body>
</html>`,
    text_content: `Bonjour {{first_name}},\n\nDécouvrez nos actualités de février...\n\nOuverture des inscriptions\nLes inscriptions pour le Master en Gestion du Patrimoine Culturel sont ouvertes jusqu'au 28 février.\n\nPour vous désabonner : {{unsubscribe_link}}`,
    status: 'scheduled',
    scheduled_send_at: '2025-02-01T09:00:00Z',
    sent_at: null,
    recipient_count: 0,
    open_count: 0,
    click_count: 0,
    created_by_external_id: 'user_admin_001',
    created_at: '2025-01-20T16:00:00Z',
    updated_at: '2025-01-22T10:00:00Z'
  },
  {
    id: 'camp_007',
    title: 'Annonce Journée Portes Ouvertes',
    subject: 'Journée Portes Ouvertes - 15 mars 2025',
    html_content: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>
  <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
    <div style="background:#f59e0b;color:white;padding:20px;text-align:center;">
      <h1>Journée Portes Ouvertes</h1>
      <h2>15 mars 2025</h2>
    </div>
    <div style="padding:20px;">
      <p>Bonjour {{first_name}},</p>
      <p>Venez découvrir l'Université Senghor lors de notre journée portes ouvertes !</p>
      <ul>
        <li>Visite du campus</li>
        <li>Rencontre avec les enseignants</li>
        <li>Présentation des formations</li>
        <li>Témoignages d'anciens étudiants</li>
      </ul>
    </div>
    <div style="padding:20px;text-align:center;font-size:12px;color:#666;">
      <p><a href="{{unsubscribe_link}}">Se désabonner</a></p>
    </div>
  </div>
</body>
</html>`,
    text_content: `Bonjour {{first_name}},\n\nVenez découvrir l'Université Senghor lors de notre journée portes ouvertes !\n\n- Visite du campus\n- Rencontre avec les enseignants\n- Présentation des formations\n- Témoignages d'anciens étudiants\n\nPour vous désabonner : {{unsubscribe_link}}`,
    status: 'scheduled',
    scheduled_send_at: '2025-03-01T08:00:00Z',
    sent_at: null,
    recipient_count: 0,
    open_count: 0,
    click_count: 0,
    created_by_external_id: 'user_admin_002',
    created_at: '2025-01-18T11:00:00Z',
    updated_at: '2025-01-18T11:00:00Z'
  },
  // Brouillons
  {
    id: 'camp_008',
    title: 'Lancement nouveau Master',
    subject: 'Nouveau : Master en Intelligence Artificielle et Développement',
    html_content: defaultHtmlTemplate,
    text_content: 'Bonjour {{first_name}},\n\nNous avons le plaisir de vous annoncer le lancement de notre nouveau Master...',
    status: 'draft',
    scheduled_send_at: null,
    sent_at: null,
    recipient_count: 0,
    open_count: 0,
    click_count: 0,
    created_by_external_id: 'user_admin_001',
    created_at: '2025-01-22T14:00:00Z',
    updated_at: '2025-01-22T14:00:00Z'
  },
  {
    id: 'camp_009',
    title: 'Appel à candidatures bourses',
    subject: 'Bourses d\'études 2025-2026 : Postulez maintenant !',
    html_content: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>
  <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
    <div style="background:#7c3aed;color:white;padding:20px;text-align:center;">
      <h1>Bourses d'études 2025-2026</h1>
    </div>
    <div style="padding:20px;">
      <p>Bonjour {{first_name}},</p>
      <p>L'Université Senghor lance son appel à candidatures pour les bourses d'études...</p>
    </div>
    <div style="padding:20px;text-align:center;font-size:12px;color:#666;">
      <p><a href="{{unsubscribe_link}}">Se désabonner</a></p>
    </div>
  </div>
</body>
</html>`,
    text_content: `Bonjour {{first_name}},\n\nL'Université Senghor lance son appel à candidatures pour les bourses d'études...\n\nPour vous désabonner : {{unsubscribe_link}}`,
    status: 'draft',
    scheduled_send_at: null,
    sent_at: null,
    recipient_count: 0,
    open_count: 0,
    click_count: 0,
    created_by_external_id: 'user_admin_001',
    created_at: '2025-01-21T09:00:00Z',
    updated_at: '2025-01-23T11:30:00Z'
  },
  {
    id: 'camp_010',
    title: 'Test template vide',
    subject: 'Test',
    html_content: defaultHtmlTemplate,
    text_content: 'Contenu test',
    status: 'draft',
    scheduled_send_at: null,
    sent_at: null,
    recipient_count: 0,
    open_count: 0,
    click_count: 0,
    created_by_external_id: 'user_admin_001',
    created_at: '2025-01-23T16:00:00Z',
    updated_at: '2025-01-23T16:00:00Z'
  }
]

// Mock data - Envois de newsletter (pour les campagnes envoyées)
export const mockNewsletterSends: NewsletterSend[] = (() => {
  const sends: NewsletterSend[] = []
  const activeSubscribers = mockNewsletterSubscribers.filter(s => s.active)

  // Générer les envois pour la campagne camp_001 (Newsletter Janvier 2025)
  const camp001Subscribers = activeSubscribers.slice(0, 28)
  camp001Subscribers.forEach((sub, index) => {
    const wasOpened = index < 18 // 18 ouvertures
    const wasClicked = index < 5 // 5 clics
    sends.push({
      id: `send_001_${index}`,
      campaign_id: 'camp_001',
      subscriber_id: sub.id,
      email: sub.email,
      status: wasClicked ? 'clicked' : wasOpened ? 'opened' : 'sent',
      sent_at: '2025-01-15T09:00:00Z',
      opened_at: wasOpened ? '2025-01-15T10:30:00Z' : null,
      clicked_at: wasClicked ? '2025-01-15T10:35:00Z' : null,
      error_message: null
    })
  })

  // Générer les envois pour la campagne camp_002 (Voeux fin d'année)
  const camp002Subscribers = activeSubscribers.slice(0, 26)
  camp002Subscribers.forEach((sub, index) => {
    const wasOpened = index < 20
    const wasClicked = index < 3
    sends.push({
      id: `send_002_${index}`,
      campaign_id: 'camp_002',
      subscriber_id: sub.id,
      email: sub.email,
      status: wasClicked ? 'clicked' : wasOpened ? 'opened' : 'sent',
      sent_at: '2024-12-23T10:00:00Z',
      opened_at: wasOpened ? '2024-12-23T11:00:00Z' : null,
      clicked_at: wasClicked ? '2024-12-23T11:05:00Z' : null,
      error_message: null
    })
  })

  // Générer les envois pour la campagne camp_003
  const camp003Subscribers = activeSubscribers.slice(0, 24)
  camp003Subscribers.forEach((sub, index) => {
    const wasOpened = index < 14
    const wasClicked = index < 6
    sends.push({
      id: `send_003_${index}`,
      campaign_id: 'camp_003',
      subscriber_id: sub.id,
      email: sub.email,
      status: wasClicked ? 'clicked' : wasOpened ? 'opened' : 'sent',
      sent_at: '2024-12-10T09:00:00Z',
      opened_at: wasOpened ? '2024-12-10T10:00:00Z' : null,
      clicked_at: wasClicked ? '2024-12-10T10:10:00Z' : null,
      error_message: null
    })
  })

  // Générer les envois pour la campagne camp_004 (Conférence Climat)
  const camp004Subscribers = activeSubscribers.slice(0, 22)
  camp004Subscribers.forEach((sub, index) => {
    const wasOpened = index < 16
    const wasClicked = index < 8
    sends.push({
      id: `send_004_${index}`,
      campaign_id: 'camp_004',
      subscriber_id: sub.id,
      email: sub.email,
      status: wasClicked ? 'clicked' : wasOpened ? 'opened' : 'sent',
      sent_at: '2024-11-20T08:00:00Z',
      opened_at: wasOpened ? '2024-11-20T09:00:00Z' : null,
      clicked_at: wasClicked ? '2024-11-20T09:15:00Z' : null,
      error_message: null
    })
  })

  // Générer les envois pour la campagne camp_005
  const camp005Subscribers = activeSubscribers.slice(0, 20)
  camp005Subscribers.forEach((sub, index) => {
    const wasOpened = index < 10
    const wasClicked = index < 2
    sends.push({
      id: `send_005_${index}`,
      campaign_id: 'camp_005',
      subscriber_id: sub.id,
      email: sub.email,
      status: wasClicked ? 'clicked' : wasOpened ? 'opened' : 'sent',
      sent_at: '2024-11-10T09:00:00Z',
      opened_at: wasOpened ? '2024-11-10T10:00:00Z' : null,
      clicked_at: wasClicked ? '2024-11-10T10:30:00Z' : null,
      error_message: null
    })
  })

  return sends
})()

// === FONCTIONS UTILITAIRES ===

// Récupérer toutes les campagnes avec stats calculées
export const getAllCampaigns = (filters?: CampaignFilters): NewsletterCampaignWithStats[] => {
  let result = mockNewsletterCampaigns.map(c => ({
    ...c,
    open_rate: c.recipient_count > 0 ? Math.round((c.open_count / c.recipient_count) * 100 * 10) / 10 : 0,
    click_rate: c.recipient_count > 0 ? Math.round((c.click_count / c.recipient_count) * 100 * 10) / 10 : 0
  }))

  if (filters) {
    // Filtre par recherche
    if (filters.search) {
      const query = filters.search.toLowerCase()
      result = result.filter(c =>
        c.title.toLowerCase().includes(query) ||
        c.subject.toLowerCase().includes(query)
      )
    }

    // Filtre par statut
    if (filters.status && filters.status !== 'all') {
      result = result.filter(c => c.status === filters.status)
    }

    // Filtre par date de début
    if (filters.date_from) {
      const fromDate = new Date(filters.date_from)
      result = result.filter(c => {
        const date = c.sent_at ? new Date(c.sent_at) : new Date(c.created_at)
        return date >= fromDate
      })
    }

    // Filtre par date de fin
    if (filters.date_to) {
      const toDate = new Date(filters.date_to)
      toDate.setHours(23, 59, 59, 999)
      result = result.filter(c => {
        const date = c.sent_at ? new Date(c.sent_at) : new Date(c.created_at)
        return date <= toDate
      })
    }

    // Tri
    if (filters.sort_by) {
      result.sort((a, b) => {
        let comparison = 0
        switch (filters.sort_by) {
          case 'title':
            comparison = a.title.localeCompare(b.title)
            break
          case 'created_at':
            comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            break
          case 'sent_at':
            const aDate = a.sent_at ? new Date(a.sent_at).getTime() : 0
            const bDate = b.sent_at ? new Date(b.sent_at).getTime() : 0
            comparison = aDate - bDate
            break
          case 'recipient_count':
            comparison = a.recipient_count - b.recipient_count
            break
        }
        return filters.sort_order === 'desc' ? -comparison : comparison
      })
    } else {
      // Tri par défaut: date de création décroissante
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }
  } else {
    // Tri par défaut
    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  return result
}

// Récupérer une campagne par ID
export const getCampaignById = (id: string): NewsletterCampaignWithStats | undefined => {
  const campaign = mockNewsletterCampaigns.find(c => c.id === id)
  if (!campaign) return undefined

  return {
    ...campaign,
    open_rate: campaign.recipient_count > 0 ? Math.round((campaign.open_count / campaign.recipient_count) * 100 * 10) / 10 : 0,
    click_rate: campaign.recipient_count > 0 ? Math.round((campaign.click_count / campaign.recipient_count) * 100 * 10) / 10 : 0
  }
}

// Récupérer les statistiques détaillées d'une campagne
export const getCampaignStats = (campaignId: string): CampaignStats | undefined => {
  const campaign = mockNewsletterCampaigns.find(c => c.id === campaignId)
  if (!campaign) return undefined

  const sends = mockNewsletterSends.filter(s => s.campaign_id === campaignId)

  const sentCount = sends.filter(s => s.status !== 'error').length
  const errorCount = sends.filter(s => s.status === 'error').length
  const openedSends = sends.filter(s => s.opened_at !== null)
  const clickedSends = sends.filter(s => s.clicked_at !== null)

  // Statistiques par jour (simulées)
  const byDay: Array<{ date: string; opens: number; clicks: number }> = []
  if (campaign.sent_at) {
    const sentDate = new Date(campaign.sent_at)
    for (let i = 0; i < 5; i++) {
      const date = new Date(sentDate)
      date.setDate(date.getDate() + i)
      byDay.push({
        date: date.toISOString().split('T')[0],
        opens: Math.max(0, Math.floor(campaign.open_count * (0.6 - i * 0.15))),
        clicks: Math.max(0, Math.floor(campaign.click_count * (0.5 - i * 0.12)))
      })
    }
  }

  return {
    recipient_count: campaign.recipient_count,
    sent_count: sentCount,
    error_count: errorCount,
    open_count: campaign.open_count,
    unique_opens: openedSends.length,
    click_count: campaign.click_count,
    unique_clicks: clickedSends.length,
    open_rate: campaign.recipient_count > 0 ? Math.round((campaign.open_count / campaign.recipient_count) * 100 * 10) / 10 : 0,
    click_rate: campaign.recipient_count > 0 ? Math.round((campaign.click_count / campaign.recipient_count) * 100 * 10) / 10 : 0,
    by_day: byDay
  }
}

// Récupérer les destinataires d'une campagne
export const getCampaignRecipients = (
  campaignId: string,
  filters?: { status?: SendStatus | 'all'; search?: string }
): CampaignRecipient[] => {
  let sends = mockNewsletterSends.filter(s => s.campaign_id === campaignId)

  if (filters) {
    if (filters.status && filters.status !== 'all') {
      sends = sends.filter(s => s.status === filters.status)
    }
    if (filters.search) {
      const query = filters.search.toLowerCase()
      sends = sends.filter(s => s.email.toLowerCase().includes(query))
    }
  }

  return sends.map(s => {
    const subscriber = mockNewsletterSubscribers.find(sub => sub.id === s.subscriber_id)
    return {
      id: s.id,
      email: s.email,
      subscriber_name: subscriber
        ? [subscriber.first_name, subscriber.last_name].filter(Boolean).join(' ') || null
        : null,
      status: s.status,
      sent_at: s.sent_at,
      opened_at: s.opened_at,
      clicked_at: s.clicked_at
    }
  })
}

// Récupérer les statistiques globales des campagnes
export const getCampaignGlobalStats = () => {
  const campaigns = mockNewsletterCampaigns
  const sentCampaigns = campaigns.filter(c => c.status === 'sent')

  const totalSent = sentCampaigns.reduce((sum, c) => sum + c.recipient_count, 0)
  const totalOpens = sentCampaigns.reduce((sum, c) => sum + c.open_count, 0)
  const totalClicks = sentCampaigns.reduce((sum, c) => sum + c.click_count, 0)

  return {
    total_campaigns: campaigns.length,
    sent_campaigns: sentCampaigns.length,
    scheduled_campaigns: campaigns.filter(c => c.status === 'scheduled').length,
    draft_campaigns: campaigns.filter(c => c.status === 'draft').length,
    total_emails_sent: totalSent,
    average_open_rate: totalSent > 0 ? Math.round((totalOpens / totalSent) * 100 * 10) / 10 : 0,
    average_click_rate: totalSent > 0 ? Math.round((totalClicks / totalSent) * 100 * 10) / 10 : 0
  }
}

// Vérifier si une campagne peut être modifiée
export const canEditCampaign = (campaign: NewsletterCampaign): boolean => {
  return campaign.status === 'draft'
}

// Vérifier si une campagne peut être supprimée
export const canDeleteCampaign = (campaign: NewsletterCampaign): boolean => {
  return campaign.status === 'draft'
}

// Vérifier si une campagne peut être envoyée
export const canSendCampaign = (campaign: NewsletterCampaign): boolean => {
  return campaign.status === 'draft' && campaign.html_content.length > 0 && campaign.subject.length > 0
}

// Vérifier si une campagne peut être programmée
export const canScheduleCampaign = (campaign: NewsletterCampaign): boolean => {
  return campaign.status === 'draft' && campaign.html_content.length > 0 && campaign.subject.length > 0
}

// Vérifier si une campagne peut être déprogrammée
export const canUnscheduleCampaign = (campaign: NewsletterCampaign): boolean => {
  return campaign.status === 'scheduled'
}

// Dupliquer une campagne
export const duplicateCampaign = (campaignId: string): NewsletterCampaign | undefined => {
  const original = mockNewsletterCampaigns.find(c => c.id === campaignId)
  if (!original) return undefined

  const now = new Date().toISOString()
  return {
    id: generateCampaignId(),
    title: `${original.title} (copie)`,
    subject: original.subject,
    html_content: original.html_content,
    text_content: original.text_content,
    status: 'draft',
    scheduled_send_at: null,
    sent_at: null,
    recipient_count: 0,
    open_count: 0,
    click_count: 0,
    created_by_external_id: original.created_by_external_id,
    created_at: now,
    updated_at: now
  }
}

// Nombre d'abonnés actifs (pour l'envoi)
export const getActiveSubscribersCount = (): number => {
  return mockNewsletterSubscribers.filter(s => s.active).length
}

// Variables disponibles pour les templates
export const templateVariables = [
  { name: 'first_name', description: 'Prénom de l\'abonné', example: 'Jean' },
  { name: 'last_name', description: 'Nom de l\'abonné', example: 'Dupont' },
  { name: 'email', description: 'Email de l\'abonné', example: 'jean.dupont@email.com' },
  { name: 'unsubscribe_link', description: 'Lien de désinscription (obligatoire)', example: 'https://...' }
]
