#!/bin/bash
RUTA_ENV="./.env"
RUTA_DOCKERYML="./docker-compose.yml"
BUILD=1

while getopts "b" flag; do
  case "${flag}" in
    b) BUILD=0;;
    \?) echo "Flag invalida: -$OPTARG" >&2;
        exit 1;;
  esac
done

shift $((OPTIND-1))
if [ "$#" -ne 1 ]; then
    echo "ERROR Se necesita solo un argumento.."
    exit 1
fi
NEW_HOST=$1

if grep -q "^ALLOWED_HOSTS=" "$RUTA_ENV"; then
    sed -i -e "s|^ALLOWED_HOSTS=.*|ALLOWED_HOSTS=${NEW_HOST}|" "$RUTA_ENV"
fi

if grep -q "VITE_API_BASE_URL=https://" "$RUTA_DOCKERYML"; then
    sed -i -e "s|VITE_API_BASE_URL=https://.*|VITE_API_BASE_URL=https://${NEW_HOST}|" "$RUTA_DOCKERYML"
fi

# ---- Inicio del servidor ---- #
if [ $BUILD -eq 0 ]; then
    gnome-terminal -- COMPOSE_BAKE=True docker compose up --build
else 
    gnome-terminal -- docker compose up 
fi

exit 0