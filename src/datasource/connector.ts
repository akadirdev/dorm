import { Client } from 'pg';
import { DATABASE_CONNECTION_CONFIG } from './datasource.settings';

export const client = new Client({
  host: DATABASE_CONNECTION_CONFIG.host,
  port: DATABASE_CONNECTION_CONFIG.port,
  user: DATABASE_CONNECTION_CONFIG.username,
  password: DATABASE_CONNECTION_CONFIG.password,
  database: DATABASE_CONNECTION_CONFIG.database,
});
