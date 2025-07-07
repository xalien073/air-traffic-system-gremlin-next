import { driver } from 'gremlin';
import 'dotenv/config';

const authenticator = new driver.auth.PlainTextSaslAuthenticator(
  `/dbs/${process.env.COSMOS_DB_NAME}/colls/${process.env.COSMOS_COLLECTION}`,
  process.env.GREMLIN_PK
);

export const client = new driver.Client(process.env.GREMLIN_ENDPOINT, {
  authenticator,
  traversalsource: 'g',
  rejectUnauthorized: true,
  mimeType: 'application/vnd.gremlin-v2.0+json'
});
