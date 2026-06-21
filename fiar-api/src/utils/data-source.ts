import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

import { PaymentSource } from '../common/entities/payment-source.entity';
import { Client } from '../client/entities/client.entity';
import { Profile } from '../profile/entities/profile.entity';
import { Transaction } from '../transaction/entities/transaction.entity';
import { Subscription } from '../user/entities/subscription.entity';
import { User } from '../user/entities/user.entity';

dotenv.config();

/**
 * DataSource standalone para herramientas fuera del ciclo de vida de NestJS:
 * scripts one-off de migración de datos, backfills y la CLI de TypeORM.
 *
 * Refleja `typeOrmConfig` (utils/typeorm.config.ts) que usa el AppModule, con
 * dos diferencias deliberadas:
 *  - `synchronize` SIEMPRE en false: un script nunca debe alterar el schema.
 *  - Entidades enumeradas explícitamente (no hay contenedor Nest que haga
 *    `autoLoadEntities`).
 *
 * Los scripts deben usar SOLO este DataSource y cerrarlo en un `finally`.
 */
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'prizma',
  password: process.env.DB_PASSWORD || 'prizma',
  database: process.env.DB_NAME || 'pistis',
  synchronize: false,
  entities: [PaymentSource, Client, Profile, Transaction, Subscription, User],
  migrations: [__dirname + '/../migrations/*.{ts,js}'],
  // En PROD se exige TLS. Por defecto se VERIFICA el certificado (fail-closed).
  // Solo si el proveedor usa un CA self-signed/managed sin cadena pública
  // (algunos setups de Neon/Cloud Run) se puede relajar con
  // DB_SSL_REJECT_UNAUTHORIZED=false — explícito y auditable, nunca por defecto.
  ssl:
    process.env.NODE_ENV === 'PROD'
      ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' }
      : false,
};

export const AppDataSource = new DataSource(dataSourceOptions);
