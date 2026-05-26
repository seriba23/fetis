#!/bin/bash
# Genera el archivo .env para un deploy "demo" bajo un subpath
# (ej. ingenieroibarra.com/muebleria), aislado del Fetis principal:
# DB separada, puertos 5000/5001, basePath/prefix configurados.
#
# Uso:
#   bash scripts/setup-demo-env.sh <DB_USER> <DB_PASS> <DB_NAME> <DOMAIN> <BASE_PATH> [WHATSAPP]
#
# Ejemplo:
#   bash scripts/setup-demo-env.sh muebleria_user 'pass' muebleria_db ingenieroibarra.com /muebleria 5215555555555

set -euo pipefail

if [ "$#" -lt 5 ]; then
  echo "Uso: bash scripts/setup-demo-env.sh <DB_USER> <DB_PASS> <DB_NAME> <DOMAIN> <BASE_PATH> [WHATSAPP]"
  echo "Ejemplo: bash scripts/setup-demo-env.sh muebleria_user '5Kg...' muebleria_db ingenieroibarra.com /muebleria 5215555555555"
  exit 1
fi

DB_USER="$1"
DB_PASS_RAW="$2"
DB_NAME="$3"
DOMAIN="$4"
BASE_PATH="$5"           # ej. /muebleria
WHATSAPP="${6:-5215555555555}"

# Normaliza BASE_PATH: debe empezar con / y no terminar con /
BASE_PATH="/${BASE_PATH#/}"
BASE_PATH="${BASE_PATH%/}"

urlencode() {
  local raw="$1" out="" i ch
  for (( i=0; i<${#raw}; i++ )); do
    ch="${raw:i:1}"
    case "$ch" in
      [a-zA-Z0-9._~-]) out+="$ch" ;;
      *) printf -v hex '%%%02X' "'$ch"; out+="$hex" ;;
    esac
  done
  printf '%s' "$out"
}

DB_PASS=$(urlencode "$DB_PASS_RAW")
JWT1=$(openssl rand -hex 32)
JWT2=$(openssl rand -hex 32)

# Strip leading slash de BASE_PATH para el API prefix (NestJS no lo quiere)
API_PREFIX="${BASE_PATH#/}/api"
UPLOADS_PREFIX="${BASE_PATH}/uploads/"

cat > .env <<ENV
DATABASE_URL="mysql://${DB_USER}:${DB_PASS}@localhost:3306/${DB_NAME}"

# Puertos distintos al Fetis principal (4000/4001) para correr en paralelo
API_PORT=5001
JWT_SECRET="${JWT1}"
JWT_REFRESH_SECRET="${JWT2}"
JWT_EXPIRES_IN="8h"
JWT_REFRESH_EXPIRES_IN="30d"

# NestJS monta sus rutas bajo este prefix (sin slash inicial)
API_GLOBAL_PREFIX="${API_PREFIX}"

# useStaticAssets prefix para /uploads (con slashes inicial y final)
UPLOADS_PREFIX="${UPLOADS_PREFIX}"

WEB_PORT=5000

# Next.js basePath — todas las rutas, assets y links se prefijan con esto
NEXT_PUBLIC_BASE_PATH="${BASE_PATH}"

# URLs absolutas que ven los clientes (basePath ya incluido)
NEXT_PUBLIC_API_URL="https://${DOMAIN}${BASE_PATH}/api"
NEXT_PUBLIC_UPLOADS_URL="https://${DOMAIN}"
NEXT_PUBLIC_SITE_URL="https://${DOMAIN}${BASE_PATH}"

SEED_ADMIN_EMAIL="admin@${DOMAIN}"
SEED_ADMIN_PASSWORD="Demo2026!CambiarEnProd"
SEED_ADMIN_NAME="Administrador Demo"

BUSINESS_NAME="Mueblería Demo"
BUSINESS_WHATSAPP="${WHATSAPP}"
BUSINESS_EMAIL="contacto@${DOMAIN}"
ENV

chmod 600 .env
echo "=== .env demo generado en $(pwd)/.env ==="
echo "Variables clave:"
grep -E '^(API_PORT|WEB_PORT|API_GLOBAL_PREFIX|UPLOADS_PREFIX|NEXT_PUBLIC_BASE_PATH|NEXT_PUBLIC_API_URL|NEXT_PUBLIC_SITE_URL)' .env
