import { spawnSync } from 'node:child_process';
const services = [
  'api-gateway',
  'auth-service',
  'users-service',
  'reports-service',
  'geo-service',
  'evidence-service',
  'notifications-service',
  'analytics-service',
];
function run(script, args) {
  const result = spawnSync(process.execPath, [script, ...args], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
for (const service of services) run('node_modules/@nestjs/cli/bin/nest.js', ['build', service]);
if (!process.argv.includes('--backend')) {
  run('node_modules/typescript/bin/tsc', ['--project', 'apps/frontend/tsconfig.json']);
  run('node_modules/vite/bin/vite.js', ['build', '--config', 'apps/frontend/vite.config.ts']);
}
