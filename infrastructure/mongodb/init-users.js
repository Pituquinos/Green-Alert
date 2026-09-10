/* Executed only when the MongoDB data volume is empty. */
const services = ['auth', 'users', 'reports', 'geo', 'evidence', 'notifications', 'analytics'];
for (const service of services) {
  const password = process.env['MONGO_' + service.toUpperCase() + '_PASSWORD'];
  if (!password) throw new Error('Missing database password for ' + service);
  const database = db.getSiblingDB('greenalert_' + service);
  database.createUser({
    user: 'greenalert_' + service,
    pwd: password,
    roles: [{ role: 'readWrite', db: database.getName() }],
  });
}
