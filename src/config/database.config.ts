import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig = (): TypeOrmModuleOptions => {
  const isProd = process.env.NODE_ENV === 'production';
  
  // Déterminez si on utilise DATABASE_URL ou des variables séparées
  const databaseUrl = process.env.DATABASE_URL;
  
  let config: TypeOrmModuleOptions = {
    type: 'postgres',
    autoLoadEntities: true,
    synchronize: !isProd, // true en dev, false en prod
    logging: !isProd,
    migrationsRun: isProd,
  };

  if (databaseUrl) {
    // Utilisation de DATABASE_URL (pour Render, Railway, etc.)
    const url = new URL(databaseUrl);
    config = {
      ...config,
      url: databaseUrl,
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      username: url.username,
      password: url.password,
      database: url.pathname.substring(1),
      ssl: isProd ? { rejectUnauthorized: false } : false,
    };
  } else {
    // Variables séparées
    config = {
      ...config,
      host: process.env.DATABASE_HOST || 'localhost',
      port:  5432,
      username: process.env.DATABASE_USERNAME || 'postgres',
      password: process.env.DATABASE_PASSWORD || '',
      database: process.env.DATABASE_NAME || 'consultation_db',
      ssl: true, // Pas de SSL en local
    };
  }

  console.log('Database config:', {
    host: config.host,
    port: config.port,
    database: config.database,
    ssl: config.ssl,
    synchronize: config.synchronize
  });

  return config;
};