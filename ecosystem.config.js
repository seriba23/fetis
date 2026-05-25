// PM2 ecosystem para Fetis Muebles
// Levanta 2 procesos: API (NestJS) en puerto 4001 y Web (Next.js) en 4000
// La carga de .env la hace `dotenv` desde main.ts en el API,
// y Next.js la lee de apps/web/.env automáticamente (deben existir symlinks
// al .env de la raíz; ver docs/deploy.md).

module.exports = {
  apps: [
    {
      name: 'fetis-api',
      cwd: '/home/fetis.mx/fetis/apps/api',
      script: 'dist/apps/api/src/main.js',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
      },
      error_file: '/home/fetis.mx/logs/pm2-api-err.log',
      out_file: '/home/fetis.mx/logs/pm2-api-out.log',
      merge_logs: true,
      time: true,
    },
    {
      name: 'fetis-web',
      cwd: '/home/fetis.mx/fetis/apps/web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 4000',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: '4000',
      },
      error_file: '/home/fetis.mx/logs/pm2-web-err.log',
      out_file: '/home/fetis.mx/logs/pm2-web-out.log',
      merge_logs: true,
      time: true,
    },
  ],
};
