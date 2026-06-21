/**
 * One-shot schema synchronize script for pistis DB.
 * Uses compiled dist entities with TypeORM synchronize:true.
 */
'use strict';

// Register path alias @/ -> dist/ before loading any entities
const path = require('path');
const Module = require('module');
const originalResolveFilename = Module._resolveFilename.bind(Module);
const distPath = path.join(__dirname, 'dist');

Module._resolveFilename = function (request, parent, isMain, options) {
  if (request.startsWith('@/')) {
    request = path.join(distPath, request.slice(2));
  } else if (request.startsWith('src/')) {
    request = path.join(distPath, request.slice(4));
  }
  return originalResolveFilename(request, parent, isMain, options);
};

require('reflect-metadata');

const { DataSource } = require('typeorm');

// Load compiled entities
const { User } = require('./dist/user/entities/user.entity');
const { Subscription } = require('./dist/user/entities/subscription.entity');
const { Profile } = require('./dist/profile/entities/profile.entity');
const { Client } = require('./dist/client/entities/client.entity');
const { Transaction } = require('./dist/transaction/entities/transaction.entity');
const { PaymentSource } = require('./dist/common/entities/payment-source.entity');

const PW = process.env.DB_PASSWORD || '';

const ds = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || '35.222.129.2',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'pistisuser',
  password: PW,
  database: process.env.DB_NAME || 'pistis',
  entities: [User, Subscription, Profile, Client, Transaction, PaymentSource],
  synchronize: true,
  ssl: false,
  logging: true,
});

async function main() {
  console.log('[sync] Connecting to DB...');
  await ds.initialize();
  console.log('[sync] Schema synchronized successfully.');
  await ds.destroy();
  console.log('[sync] Done.');
}

main().catch((err) => {
  console.error('[sync] ERROR:', err);
  process.exit(1);
});
