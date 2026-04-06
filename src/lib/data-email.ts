/** 
 * @author Naveen Chauhan (https://github.com/ncrkindia) 
 * @project Link-Wise Analytics 
 */
import { query } from './db';
import { EmailAccount, EmailTemplate, EmailCampaign, CampaignSend } from './definitions';

export async function getEmailAccounts(userId: string): Promise<EmailAccount[]> {
  const accounts = await query<any[]>(
    'SELECT id, user_id as userId, provider, host, port, username, sender_name as senderName, is_active as isActive, created_at as createdAt FROM email_accounts WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return accounts as EmailAccount[];
}

export async function getEmailTemplates(userId: string): Promise<EmailTemplate[]> {
  const templates = await query<any[]>(
    'SELECT id, user_id as userId, name, subject, html_content as htmlContent, text_content as textContent, created_at as createdAt FROM email_templates WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return templates as EmailTemplate[];
}

export async function getEmailCampaigns(userId: string): Promise<EmailCampaign[]> {
  const campaigns = await query<any[]>(
    `SELECT 
      c.id, 
      c.user_id as userId, 
      c.name, 
      c.template_id as templateId, 
      c.account_id as accountId, 
      c.recipients, 
      c.status, 
      c.is_active as isActive,
      c.is_deleted as isDeleted,
      c.created_at as createdAt,
      t.name as templateName,
      a.username as accountName,
      (SELECT COUNT(*) FROM campaign_sends WHERE campaign_id = c.id) as sendsCount,
      (SELECT COUNT(DISTINCT pixel_id) FROM clicks cl JOIN campaign_sends cs ON cl.link_id = cs.pixel_id WHERE cs.campaign_id = c.id) as opensCount
    FROM email_campaigns c
    LEFT JOIN email_templates t ON c.template_id = t.id
    LEFT JOIN email_accounts a ON c.account_id = a.id
    WHERE c.user_id = ? AND c.is_deleted = FALSE
    ORDER BY c.created_at DESC`,
    [userId]
  );
  return campaigns as EmailCampaign[];
}

export async function getCampaignSends(campaignId: string): Promise<CampaignSend[]> {
  const sends = await query<any[]>(
    `SELECT 
      s.id,
      s.campaign_id as campaignId,
      s.recipient,
      s.pixel_id as pixelId,
      s.sent_at as sentAt,
      cl.clicked_at as openedAt,
      cl.ip_address as ipAddress,
      cl.country_code as countryCode
    FROM campaign_sends s
    LEFT JOIN clicks cl ON s.pixel_id = cl.link_id
    WHERE s.campaign_id = ?
    ORDER BY s.sent_at DESC`,
    [campaignId]
  );
  return sends as CampaignSend[];
}
export async function getAllEmailCampaigns(): Promise<(EmailCampaign & { userEmail: string })[]> {
  const campaigns = await query<any[]>(
    `SELECT 
      c.id, 
      c.user_id as userId, 
      c.name, 
      c.template_id as templateId, 
      c.account_id as accountId, 
      c.recipients, 
      c.status, 
      c.is_active as isActive,
      c.is_deleted as isDeleted,
      c.created_at as createdAt,
      t.name as templateName,
      a.username as accountName,
      u.id as userEmail,
      (SELECT COUNT(*) FROM campaign_sends WHERE campaign_id = c.id) as sendsCount,
      (SELECT COUNT(DISTINCT pixel_id) FROM clicks cl JOIN campaign_sends cs ON cl.link_id = cs.pixel_id WHERE cs.campaign_id = c.id) as opensCount
    FROM email_campaigns c
    LEFT JOIN email_templates t ON c.template_id = t.id
    LEFT JOIN email_accounts a ON c.account_id = a.id
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.is_deleted = FALSE
    ORDER BY c.created_at DESC`
  );
  return campaigns as (EmailCampaign & { userEmail: string })[];
}
