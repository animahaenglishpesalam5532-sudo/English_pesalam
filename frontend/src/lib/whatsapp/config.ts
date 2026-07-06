// WhatsApp Cloud API configuration, read from environment variables.
// Set these in .env.local (local) and in the Vercel project settings (prod).

export const whatsappConfig = {
  // The token you invent and paste into Meta's webhook "Verify token" field.
  verifyToken: process.env.WHATSAPP_VERIFY_TOKEN ?? '',
  // App Secret from Meta App Dashboard > App Settings > Basic. Used to
  // validate the X-Hub-Signature-256 header on incoming webhook POSTs.
  appSecret: process.env.WHATSAPP_APP_SECRET ?? '',
  // Permanent/System-user access token for calling the Graph API.
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN ?? '',
  // The Phone Number ID (not the phone number) from the WhatsApp setup.
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ?? '',
  // Graph API version to target.
  graphApiVersion: process.env.WHATSAPP_GRAPH_API_VERSION ?? 'v21.0',
}
