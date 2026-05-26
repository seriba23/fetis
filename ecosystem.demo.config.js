// PM2 ecosystem para deploys de demo bajo subpath (ej. muebleria).
// Usa __dirname (la carpeta del clon) para que sea portable y el mismo
// archivo sirva para cualquier clone, sin paths absolutos hardcodeados.
// Levanta procesos con nombres prefijados por PM2_PREFIX (default 'demo')
// para no chocar con fetis-api / fetis-web que ya corren en el VPS.

const path = require('path');

const prefix = process.env.PM2_PREFIX || 'demo';
const root = __dirname;
const logDir = process.env.PM2_LOG_DIR || path.join(root, 'logs');
const webPort = process.env.WEB_PORT || '5000';

module.exports = {
  apps: [
    {
      name: `${prefix}-api`,
      cwd: path.join(root, 'apps/api'),
      script: 'dist/apps/api/src/main.js',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '500M',
      env: { NODE_ENV: 'production' },
      error_file: path.join(logDir, `${prefix}-api-err.log`),
      out_file: path.join(logDir, `${prefix}-api-out.log`),
      merge_logs: true,
      time: true,
    },
    {
      name: `${prefix}-web`,
      cwd: path.join(root, 'apps/web'),
      script: 'node_modules/next/dist/bin/next',
      args: `start -p ${webPort}`,
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '500M',
      env: { NODE_ENV: 'production', PORT: webPort },
      error_file: path.join(logDir, `${prefix}-web-err.log`),
      out_file: path.join(logDir, `${prefix}-web-out.log`),
      merge_logs: true,
      time: true,
    },
  ],
};
