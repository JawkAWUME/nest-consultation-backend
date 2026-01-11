// src/config/configuration.ts
import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  // Application
  nodeEnv: process.env.NODE_ENV || 'development',
  port: 8080,

  // Database
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DATABASE_HOST || 'localhost',
    port: 5432,
    name: process.env.DATABASE_NAME || 'consultation_db',
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || '',
    synchronize: process.env.NODE_ENV !== 'production', // true en dev, false en prod
    logging: process.env.NODE_ENV === 'development',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    expiration: process.env.JWT_EXPIRATION || '3600s', // 1 heure
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d', // 7 jours
  },

  // Mail
  mail: {
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: 587,
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
    from: process.env.MAIL_FROM || 'noreply@consultation.sn',
    secure: false, // TLS
  },

  // Paytech
  paytech: {
    apiUrl: process.env.PAYTECH_API_URL,
    apiKey: process.env.PAYTECH_API_KEY,
    apiSecret: process.env.PAYTECH_API_SECRET,
    callbackUrl: process.env.PAYTECH_CALLBACK_URL,
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
}));