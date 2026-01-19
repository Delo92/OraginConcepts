import { google } from 'googleapis';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-mail',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Gmail not connected');
  }
  return accessToken;
}

async function getGmailClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

function createEmailMessage(to: string, subject: string, htmlBody: string): string {
  const messageParts = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    htmlBody
  ];
  const message = messageParts.join('\n');
  return Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export interface EmailOptions {
  to: string;
  subject: string;
  htmlBody: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const gmail = await getGmailClient();
    const rawMessage = createEmailMessage(options.to, options.subject, options.htmlBody);
    
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: rawMessage
      }
    });
    
    console.log(`Email sent successfully to ${options.to}`);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

export function replaceTemplateVariables(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
}

export async function sendBookingConfirmationEmail(
  clientEmail: string,
  clientName: string,
  services: string,
  bookingDate: string,
  bookingTime: string,
  totalPrice: string,
  template: { subject: string; body: string }
): Promise<boolean> {
  const variables = {
    clientName,
    services,
    bookingDate,
    bookingTime,
    totalPrice,
    businessName: 'Oraginal Concepts'
  };

  const subject = replaceTemplateVariables(template.subject, variables);
  const htmlBody = replaceTemplateVariables(template.body, variables);

  return sendEmail({
    to: clientEmail,
    subject,
    htmlBody
  });
}

export async function sendAdminNotificationEmail(
  adminEmail: string,
  clientName: string,
  clientEmail: string,
  clientPhone: string,
  services: string,
  bookingDate: string,
  bookingTime: string,
  totalPrice: string,
  notes: string,
  template: { subject: string; body: string }
): Promise<boolean> {
  const variables = {
    clientName,
    clientEmail,
    clientPhone,
    services,
    bookingDate,
    bookingTime,
    totalPrice,
    notes: notes || 'None',
    businessName: 'Oraginal Concepts'
  };

  const subject = replaceTemplateVariables(template.subject, variables);
  const htmlBody = replaceTemplateVariables(template.body, variables);

  return sendEmail({
    to: adminEmail,
    subject,
    htmlBody
  });
}
