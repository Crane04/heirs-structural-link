type EnvKey =
  | 'MONGODB_URI'
  | 'REDIS_URL'
  | 'WEB_APP_URL'
  | 'AI_SERVICE_URL'
  | 'TWILIO_ACCOUNT_SID'
  | 'TWILIO_AUTH_TOKEN'
  | 'TWILIO_WHATSAPP_FROM'
  | 'PORT'
  | 'GROQ_API_KEY'
  | 'GROQ_MODEL';

function getRequiredEnv(key: EnvKey): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`[Env] Missing required env var: ${key}`);
  }
  return value;
}

function getOptionalEnv(key: EnvKey): string | undefined {
  const value = process.env[key];
  return value || undefined;
}

export const env = {
  MONGODB_URI: getRequiredEnv('MONGODB_URI'),
  REDIS_URL: getRequiredEnv('REDIS_URL'),
  WEB_APP_URL: getRequiredEnv('WEB_APP_URL'),
  AI_SERVICE_URL: getRequiredEnv('AI_SERVICE_URL'),
  TWILIO_ACCOUNT_SID: getRequiredEnv('TWILIO_ACCOUNT_SID'),
  TWILIO_AUTH_TOKEN: getRequiredEnv('TWILIO_AUTH_TOKEN'),
  TWILIO_WHATSAPP_FROM: getRequiredEnv('TWILIO_WHATSAPP_FROM'),
  PORT: Number(process.env.PORT || 3001),
  GROQ_API_KEY: getOptionalEnv('GROQ_API_KEY'),
  GROQ_MODEL: getOptionalEnv('GROQ_MODEL') || 'llama-3.1-8b-instant',
};
