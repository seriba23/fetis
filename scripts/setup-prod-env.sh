#!/bin/bash
# Genera el archivo .env de producción para Fetis Muebles.
# Uso:
#   bash scripts/setup-prod-env.sh <DB_USER> <DB_PASS> <DB_NAME> <DOMAIN> <WHATSAPP>
#
# Ejemplo:
#   bash scripts/setup-prod-env.sh fetis_user '5Kg4wL3pDND%^QfA' fetis_database fetis.mx 5213339130931

set -euo pipefail

if [ "$#" -lt 5 ]; then
  echo "Uso: bash scripts/setup-prod-env.sh <DB_USER> <DB_PASS> <DB_NAME> <DOMAIN> <WHATSAPP>"
  exit 1
fi

DB_USER="$1"
DB_PASS_RAW="$2"
DB_NAME="$3"
DOMAIN="$4"
WHATSAPP="$5"

# URL-encode caracteres problemáticos de la contraseña (% ^ @ : / # ? & = +)
urlencode() {
  local raw="$1"
  local out=""
  local i ch
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

cat > .env <<ENV
DATABASE_URL="mysql://${DB_USER}:${DB_PASS}@localhost:3306/${DB_NAME}"

API_PORT=4001
JWT_SECRET="${JWT1}"
JWT_REFRESH_SECRET="${JWT2}"
JWT_EXPIRES_IN="8h"
JWT_REFRESH_EXPIRES_IN="30d"

WEB_PORT=4000
NEXT_PUBLIC_API_URL="https://${DOMAIN}/api"
NEXT_PUBLIC_UPLOADS_URL="https://${DOMAIN}"
NEXT_PUBLIC_SITE_URL="https://${DOMAIN}"

SEED_ADMIN_EMAIL="admin@${DOMAIN}"
SEED_ADMIN_PASSWORD="Fetis2026!CambiarEnProd"
SEED_ADMIN_NAME="Administrador Fetis"

BUSINESS_NAME="Fetis Muebles"
BUSINESS_WHATSAPP="${WHATSAPP}"
BUSINESS_EMAIL="contacto@${DOMAIN}"
ENV

chmod 600 .env
echo "=== .env generado en $(pwd)/.env ==="
echo "Resumen (oculta secrets):"
grep -E '^(API_PORT|WEB_PORT|NEXT_PUBLIC_API_URL|NEXT_PUBLIC_SITE_URL|SEED_ADMIN_EMAIL|BUSINESS_WHATSAPP)' .env
