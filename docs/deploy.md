# Guía de deployment en VPS — Fetis Muebles

Esta guía cubre el despliegue del sistema completo (landing + admin + API) en un VPS con Ubuntu/Debian, Nginx, PM2, MySQL/MariaDB y certificado SSL gratuito de Let's Encrypt.

## Requisitos del VPS

- Ubuntu 22.04 LTS o Debian 12 (4GB RAM mínimo recomendado)
- Acceso root o sudo
- Dominio apuntando al VPS (registro A en DNS)

## 1. Preparar el servidor

```bash
# Actualizar paquetes
sudo apt update && sudo apt upgrade -y

# Instalar utilidades base
sudo apt install -y curl git build-essential ufw

# Configurar firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 2. Instalar Node.js 20+

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # >= 20
npm --version
```

## 3. Instalar y configurar MariaDB

```bash
sudo apt install -y mariadb-server
sudo mysql_secure_installation
# - Set root password
# - Remove anonymous users: Y
# - Disallow root login remotely: Y
# - Remove test database: Y
# - Reload privilege tables: Y

# Crear base de datos y usuario
sudo mysql <<EOF
CREATE DATABASE fetis_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'fetis'@'localhost' IDENTIFIED BY 'CAMBIA_ESTA_PASSWORD_FUERTE';
GRANT ALL PRIVILEGES ON fetis_db.* TO 'fetis'@'localhost';
FLUSH PRIVILEGES;
EOF
```

## 4. Instalar Nginx y Certbot

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

## 5. Clonar el proyecto

```bash
sudo mkdir -p /var/www
sudo chown $USER:$USER /var/www
cd /var/www
git clone <TU_REPO> fetis
cd fetis
```

## 6. Configurar variables de entorno

```bash
cp .env.example .env
nano .env
```

Configura mínimo:
```env
DATABASE_URL="mysql://fetis:LA_PASSWORD_DEL_PASO_3@localhost:3306/fetis_db"
API_PORT=4001
JWT_SECRET="<genera con: openssl rand -hex 32>"
JWT_REFRESH_SECRET="<genera otro distinto: openssl rand -hex 32>"
WEB_PORT=4000
NEXT_PUBLIC_API_URL="https://tu-dominio.com/api"
NEXT_PUBLIC_UPLOADS_URL="https://tu-dominio.com"
NEXT_PUBLIC_SITE_URL="https://tu-dominio.com"
SEED_ADMIN_EMAIL="admin@fetis.mx"
SEED_ADMIN_PASSWORD="<password segura para el primer admin>"
BUSINESS_WHATSAPP="521XXXXXXXXXX"
```

## 7. Instalar dependencias y preparar build

```bash
npm install
npm run db:migrate -- --schema=./prisma/schema.prisma
npm run db:seed
```

## 8. Build de producción

```bash
# Build de la web (Next.js)
cd apps/web
npm run build
cd ../..

# La API se ejecuta con tsx/ts-node directamente (no requiere build estricto)
```

## 9. Configurar PM2 para procesos persistentes

```bash
sudo npm install -g pm2
```

Crear `ecosystem.config.js` en la raíz del proyecto:
```js
module.exports = {
  apps: [
    {
      name: 'fetis-api',
      cwd: '/var/www/fetis/apps/api',
      script: 'node_modules/.bin/ts-node-dev',
      args: '--transpile-only -r tsconfig-paths/register src/main.ts',
      env: { NODE_ENV: 'production' },
      max_memory_restart: '500M',
    },
    {
      name: 'fetis-web',
      cwd: '/var/www/fetis/apps/web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 4000',
      env: { NODE_ENV: 'production' },
      max_memory_restart: '500M',
    },
  ],
};
```

Levantar:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u $USER --hp /home/$USER
# Ejecutar el comando que imprime arriba (con sudo)
```

## 10. Configurar Nginx como reverse proxy

Crear `/etc/nginx/sites-available/fetis`:

```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    client_max_body_size 15M;

    # API NestJS
    location /api/ {
        proxy_pass http://localhost:4001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploads (archivos estáticos servidos por la API)
    location /uploads/ {
        proxy_pass http://localhost:4001/uploads/;
        proxy_set_header Host $host;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    # Next.js (landing + admin)
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Activar y recargar:
```bash
sudo ln -s /etc/nginx/sites-available/fetis /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 11. SSL gratuito con Let's Encrypt

```bash
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
# Responder con el email y aceptar términos
# Elegir opción 2: redirigir HTTP a HTTPS
```

Verificar renovación automática:
```bash
sudo systemctl status certbot.timer
```

## 12. Verificación final

```bash
# Procesos PM2
pm2 status
pm2 logs --lines 50

# Nginx
sudo systemctl status nginx

# Probar:
curl -I https://tu-dominio.com/
curl -I https://tu-dominio.com/api/public/business
```

Acceder en navegador:
- Landing: `https://tu-dominio.com`
- Galería: `https://tu-dominio.com/galeria`
- Contacto: `https://tu-dominio.com/contacto`
- Login admin: `https://tu-dominio.com/login`
- Panel: `https://tu-dominio.com/admin`

## Comandos de mantenimiento

```bash
# Actualizar el código
cd /var/www/fetis
git pull
npm install
npm run db:migrate -- --schema=./prisma/schema.prisma
cd apps/web && npm run build && cd ../..
pm2 restart all

# Ver logs
pm2 logs fetis-api
pm2 logs fetis-web

# Backup BD diario (agregar a crontab)
0 2 * * * mysqldump -ufetis -p'PASSWORD' fetis_db | gzip > /var/backups/fetis_$(date +\%F).sql.gz

# Limpiar backups antiguos (>30 días)
0 3 * * * find /var/backups -name 'fetis_*.sql.gz' -mtime +30 -delete
```

## Troubleshooting

- **"502 Bad Gateway"** → PM2 process caído. Revisar `pm2 logs`.
- **"Cannot connect to DB"** → Verificar `.env` y permisos MySQL.
- **Imágenes no cargan en producción** → revisar `NEXT_PUBLIC_UPLOADS_URL` en `.env`; debe apuntar al dominio HTTPS.
- **PM2 no reinicia tras reboot** → reejecutar `pm2 startup` y `pm2 save`.

## Hardening adicional recomendado (opcional)

- Cambiar el puerto SSH del default 22 y deshabilitar login root
- Instalar fail2ban: `sudo apt install -y fail2ban`
- Hacer pruebas con [SSL Labs](https://www.ssllabs.com/ssltest/)
- Configurar CDN (Cloudflare) frente al VPS para protección DDoS y caché
