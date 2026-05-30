export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),

  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    name: process.env.DB_NAME ?? 'marketplace_db',
  },

  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD ?? '',
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET!,
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    accessExpires: process.env.JWT_ACCESS_EXPIRES ?? '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES ?? '7d',
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL!,
  },

  sms: {
    apiKey: process.env.SMS_IR_API_KEY!,
    templates: {
      otp: process.env.SMS_IR_TEMPLATE_OTP!,
      orderShipped: process.env.SMS_IR_TEMPLATE_ORDER_SHIPPED!,
      banNotification: process.env.SMS_IR_TEMPLATE_BAN_NOTIFICATION!,
    },
  },

  email: {
    host: process.env.SMTP_HOST!,
    port: parseInt(process.env.SMTP_PORT ?? '587', 10),
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
    from: process.env.EMAIL_FROM!,
  },

  payment: {
    zarinpal: {
      merchantId: process.env.ZARINPAL_MERCHANT_ID!,
      callbackUrl: process.env.ZARINPAL_CALLBACK_URL!,
      sandbox: process.env.ZARINPAL_SANDBOX === 'true',
    },
    pasargad: {
      merchantId: process.env.PASARGAD_MERCHANT_ID!,
      callbackUrl: process.env.PASARGAD_CALLBACK_URL!,
      sandbox: process.env.PASARGAD_SANDBOX === 'true',
    },
  },

  wallet: {
    maxBalanceCustomer: parseInt(process.env.MAX_WALLET_BALANCE_CUSTOMER ?? '200000000', 10),
    withdrawalFeeThreshold: parseInt(process.env.WITHDRAWAL_FEE_THRESHOLD ?? '1000000000', 10),
    withdrawalFeeLow: parseInt(process.env.WITHDRAWAL_FEE_LOW ?? '20', 10),
    withdrawalFeeHigh: parseInt(process.env.WITHDRAWAL_FEE_HIGH ?? '10', 10),
  },

  withdrawalTtlDays: parseInt(process.env.WITHDRAWAL_TTL_DAYS ?? '30', 10),

  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL ?? '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT ?? '10', 10),
  },

  fileUpload: {
    maxSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB ?? '5', 10),
    allowedMimeTypes: (process.env.ALLOWED_MIME_TYPES ?? 'image/jpeg,image/png,image/webp').split(','),
  },

  otp: {
    expirySeconds: parseInt(process.env.OTP_EXPIRY_SECONDS ?? '120', 10),
    length: parseInt(process.env.OTP_LENGTH ?? '6', 10),
  },
});