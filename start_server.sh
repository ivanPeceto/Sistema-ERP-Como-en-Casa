#!/bin/bash

# --- Obtener la dirección IP del host ---
IP_ADDRESS=$(hostname -I | awk '{print $1}')

if [ -z "$IP_ADDRESS" ]; then
    echo "No se pudo obtener la dirección IP. Asegúrate de que ifconfig esté instalado."
    exit 1
fi

echo "La dirección IP obtenida es: $IP_ADDRESS"

# --- Archivos a actualizar ---
ENV_FILE=".env"
DOCKER_COMPOSE_FILE="docker-compose.yml"
NGINX_CONF_FILE="nginx/nginx.conf"

# --- Funciones ---

update_files() {
    # .env
    sed -i "s/ALLOWED_HOSTS=.*/ALLOWED_HOSTS=$IP_ADDRESS/" $ENV_FILE
    echo "ALLOWED_HOSTS actualizado en $ENV_FILE"

    # docker compose.yml
    sed -i "s/VITE_API_BASE_URL=http:\/\/[0-9.]*:80/VITE_API_BASE_URL=http:\/\/$IP_ADDRESS:80/" $DOCKER_COMPOSE_FILE
    echo "VITE_API_BASE_URL actualizado en $DOCKER_COMPOSE_FILE"

    # nginx.conf
    sed -i "s/server_name [0-9.]*;/server_name $IP_ADDRESS;/" $NGINX_CONF_FILE
    echo "server_name actualizado en $NGINX_CONF_FILE"
}

wait_for_services() {
    SERVICES=("usuarios" "productos" "pedidos")
    for service in "${SERVICES[@]}"; do
        echo "Esperando a que la base de datos '$service' esté lista..."
        while ! docker compose logs $service 2>&1 | grep -q "wait-for-it.sh: ${service}:3306 is available"; do
            sleep 3 # Espera 3 segundos antes de volver a comprobar
        done
        echo "'$service' lista."
    done
    echo "Todas las bases de datos están operativas."
}

run_migrations() {
    echo "Ejecutando migraciones..."
    docker compose exec usuarios python manage.py makemigrations
    docker compose exec usuarios python manage.py migrate
    docker compose exec productos python manage.py makemigrations
    docker compose exec productos python manage.py migrate
    docker compose exec pedidos python manage.py makemigrations
    docker compose exec pedidos python manage.py migrate
}

create_superuser() {
    echo "Creando superusuario..."
    docker compose exec usuarios python manage.py shell <<EOF
from django.contrib.auth import get_user_model

User = get_user_model()

if not User.objects.filter(email='admin@admin.com').exists():
    User.objects.create_superuser('admin@admin.com', 'admin')
EOF
}

# --- End funciones ---

# --- Comandos ---

# Actualizar siempre los archivos
update_files

echo "/n⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀"
echo "/n⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣀⣀⠀⠀⠀⠀⠀⠀⢹⣛⣷⣶⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀"
echo "/n⠀⠀⠀⠀⠀⠀⢀⣠⠴⣒⡮⠭⠉⠉⢐⠊⢋⡉⠉⠉⢒⣒⠬⢄⡉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀"
echo "/n⠀⠀⠀⠀⢀⡴⣫⠤⠖⠒⠈⠉⠉⠀⠀⠀⠀⠈⠒⠂⠀⣠⠉⣑⠚⠵⣦⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀"
echo "/n⠀⠀⠀⡰⡻⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠘⠳⠀⠒⠙⢦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢴⣼⣿⡄⠀⠀"
echo "/n⠀⠀⣰⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢦⠀⠀⠀⠀⠀⠀⠀⣤⣄⠀⠀⠁⠉⠀⠀⠀"
echo "/n⠀⢠⠏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠳⡀⠀⠀⠀⠀⢰⢷⣿⣷⡄⠀⢀⣀⣀⣀"
echo "/n⠀⣸⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⣄⠀⠀⠀⢸⣻⠚⠙⣧⢾⢿⣯⣿⡿"
echo "/n⠀⡏⠀⢀⡀⠀⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠣⡀⠀⠀⠳⢤⡽⢏⠋⠀⠈⣽⠇"
echo "/n⢀⣇⣀⣈⣓⣋⣁⣀⣙⣒⣚⡁⠀⠀⢀⣀⣀⠀⠀⢿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣓⢦⣤⣾⣧⡟⠦⠶⠞⠋⠀"
echo "/n⠈⡏⠇⠀⡇⠀⡇⠀⡇⠀⡇⠉⡏⠉⡟⠛⡫⠤⣀⣀⣉⡀⠀⠀⠀⢀⣴⣦⣄⠀⠀⠀⠀⠀⠀⠀⠀⠈⠀⢹⣿⡿⠀⠀⠀⠀⠀⠀"
echo "/n⠀⣇⢸⠀⡇⠀⡇⠀⡇⠀⡁⠀⡇⠀⡇⠀⡇⠀⢸⢹⠀⡧⡀⠀⠀⢸⣿⣿⣿⣷⣄⡀⠀⠀⠀⠀⠀⠀⣶⣾⡟⠁⠀⠀⠀⠀⠀⠀"
echo "/n⠀⠘⢾⣆⢸⠀⢣⠀⡇⠀⡇⠀⡇⠀⡇⠀⢱⠀⢸⠈⠚⡇⡌⢦⡀⠈⢿⣿⣿⣿⣿⣿⣦⡀⠀⢠⣶⣾⣿⠋⠀⠀⠀⠀⠀⠀⠀⠀"
echo "/n⠀⠀⠈⠙⣦⣣⡘⣆⠸⡀⢳⡀⢱⠀⢱⠀⠸⡀⠘⡄⠀⣷⠗⢰⠈⠓⡾⢿⣿⣿⣿⣿⣿⣿⣦⣤⡿⠋⢁⠀⠀⠀⠀⠀⠀⠀⠀⠀"
echo "/n⠀⠀⠀⠀⠹⠛⠛⠛⠓⠿⠦⠷⠦⢷⣤⣷⣄⣳⣄⣱⣄⣘⣦⣀⣳⣤⡽⠦⠴⠾⠟⠛⣿⢿⣿⠿⠿⠿⠿⠄⠀⠀⠀⠀⠀⠀⠀⠀"

if [ "$1" == "--build" ]; then
    echo "Reconstruyendo los contenedores..."
    docker compose down
    docker compose up --build

elif [ "$1" == "--migrate" ]; then
    docker compose up -d
    wait_for_services
    run_migrations

elif [ "$1" == "--clean" ] && [ "$2" == "--migrate" ]; then
    echo "Limpiando contenedores y volúmenes..."
    docker compose down -v
    docker compose up -d --build
    wait_for_services

    run_migrations
    create_superuser

elif [ "$1" == "--clean" ]; then
    echo "Limpiando contenedores y volúmenes..."
    docker compose down -v
    echo "Limpieza de contenedores y volúmenes exitosa."

else
    echo "Iniciando los servicios..."
    docker compose up
fi
