import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'prizma',
  password: process.env.DB_PASSWORD || 'prizma',
  database: process.env.DB_NAME || 'pistis',
  autoLoadEntities: true,
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  migrations: [__dirname + '/../migrations/*.{ts,js}'],
  migrationsRun: process.env.DB_MIGRATIONS_RUN === 'true',
  ssl: process.env.NODE_ENV === 'PROD' ? { rejectUnauthorized: false } : false,
};
