import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),

  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),

  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow(''),

  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRES: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES: Joi.string().default('7d'),

  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_CALLBACK_URL: Joi.string().uri().required(),

  SMS_IR_API_KEY: Joi.string().required(),
  SMS_IR_TEMPLATE_OTP: Joi.string().required(),
  SMS_IR_TEMPLATE_ORDER_SHIPPED: Joi.string().required(),
  SMS_IR_TEMPLATE_BAN_NOTIFICATION: Joi.string().required(),

  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().default(587),
  SMTP_USER: Joi.string().required(),
  SMTP_PASS: Joi.string().required(),
  EMAIL_FROM: Joi.string().email().required(),

  ZARINPAL_MERCHANT_ID: Joi.string().required(),
  ZARINPAL_CALLBACK_URL: Joi.string().uri().required(),
  ZARINPAL_SANDBOX: Joi.boolean().default(true),

  PASARGAD_MERCHANT_ID: Joi.string().required(),
  PASARGAD_CALLBACK_URL: Joi.string().uri().required(),
  PASARGAD_SANDBOX: Joi.boolean().default(true),

  MAX_WALLET_BALANCE_CUSTOMER: Joi.number().default(200000000),
  WITHDRAWAL_FEE_THRESHOLD: Joi.number().default(1000000000),
  WITHDRAWAL_FEE_LOW: Joi.number().default(20),
  WITHDRAWAL_FEE_HIGH: Joi.number().default(10),

  WITHDRAWAL_TTL_DAYS: Joi.number().default(30),

  THROTTLE_TTL: Joi.number().default(60),
  THROTTLE_LIMIT: Joi.number().default(10),

  MAX_FILE_SIZE_MB: Joi.number().default(5),
  ALLOWED_MIME_TYPES: Joi.string().default('image/jpeg,image/png,image/webp'),

  OTP_EXPIRY_SECONDS: Joi.number().default(120),
  OTP_LENGTH: Joi.number().default(6),
});