import { readFile, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
const target = new URL('../.env', import.meta.url);
let exists = false;
try {
  await readFile(target);
  exists = true;
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
if (exists) {
  console.log('.env already exists; preserved. Configure it manually if required.');
} else {
  let content = await readFile(new URL('../.env.example', import.meta.url), 'utf8');
  const secrets = [
    'MONGO_ROOT_PASSWORD',
    'RABBITMQ_PASSWORD',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    ...['AUTH', 'USERS', 'REPORTS', 'GEO', 'EVIDENCE', 'NOTIFICATIONS', 'ANALYTICS'].map(
      (name) => 'MONGO_' + name + '_PASSWORD',
    ),
  ];
  const generated = Object.fromEntries(
    secrets.map((key) => [key, randomBytes(32).toString('hex')]),
  );
  for (const [key, value] of Object.entries(generated))
    content = content.replace(key + '=CHANGE_ME', key + '=' + value);
  content = content.replace(
    'amqp://greenalert:CHANGE_ME',
    'amqp://greenalert:' + generated.RABBITMQ_PASSWORD,
  );
  for (const service of [
    'auth',
    'users',
    'reports',
    'geo',
    'evidence',
    'notifications',
    'analytics',
  ]) {
    content = content.replace(
      'mongodb://greenalert_' + service + ':CHANGE_ME',
      'mongodb://greenalert_' +
        service +
        ':' +
        generated['MONGO_' + service.toUpperCase() + '_PASSWORD'],
    );
  }
  await writeFile(target, content, { flag: 'wx', mode: 0o600 });
  console.log('Created .env with unique local secrets; keep it out of Git.');
}
