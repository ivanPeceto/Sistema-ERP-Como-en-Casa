#!/bin/bash

# --- Obtener la dirección IP del host ---
IP_ADDRESS=$(hostname -I | awk '{print $1}')

if [ -z "$IP_ADDRESS" ]; then
    echo "No se pudo obtener la dirección IP. Asegúrate de que ifconfig esté instalado."
    exit 1
fi

echo "La dirección IP obtenida es: $IP_ADDRESS"

# --- Archivs a actualizar ---
ENV_FILE=".env"
DOCKER_COMPOSE_FILE="docker-compose.yml"
NGINX_CONF_FILE="nginx/nginx.conf"

# --- Funciones ---

update_files() {
    ENV_TEMPLATE=".env.template"
    ENV_FILE=".env"
    DOCKER_COMPOSE_TEMPLATE="docker-compose.yml.template"
    DOCKER_COMPOSE_FILE="docker-compose.yml"
    NGINX_CONF_TEMPLATE="nginx/nginx.conf.template"
    NGINX_CONF_FILE="nginx/nginx.conf"

    # --- Crear archivos de configuración a partir de plantillas si no existen ---
    [ ! -f "$ENV_FILE" ] && cp "$ENV_TEMPLATE" "$ENV_FILE"
    [ ! -f "$DOCKER_COMPOSE_FILE" ] && cp "$DOCKER_COMPOSE_TEMPLATE" "$DOCKER_COMPOSE_FILE"
    [ ! -f "$NGINX_CONF_FILE" ] && cp "$NGINX_CONF_TEMPLATE" "$NGINX_CONF_FILE"

    # --- Reemplazar marcadores de posición con la IP actual en los archivos locales ---
    # .env
    sed -i "s/ALLOWED_HOSTS=.*/ALLOWED_HOSTS=${IP_ADDRESS},localhost/" $ENV_FILE
    echo "ALLOWED_HOSTS actualizado en $ENV_FILE"

    # docker compose.yml
    sed -i "s/VITE_API_BASE_URL=http:\/\/[0-9.]*/VITE_API_BASE_URL=http:\/\/$IP_ADDRESS/" $DOCKER_COMPOSE_FILE
    echo "VITE_API_BASE_URL actualizado en $DOCKER_COMPOSE_FILE"

    # nginx.conf
    sed -i "s/server_name [0-9.]*;/server_name $IP_ADDRESS;/" $NGINX_CONF_FILE
    echo "server_name actualizado en $NGINX_CONF_FILE"
}

wait_for_services() {
    SERVICES=("usuarios" "productos" "pedidos")
    for service in "${SERVICES[@]}"; do
        echo "Esperando a que la base de datos '$service' esté lista..."
        while ! docker compose logs $service | grep -q "${service}:3306 is available"; do
            sleep 3
            echo "Reintentando conexion con bdd..."
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
    docker compose exec -T usuarios python manage.py shell <<EOF
from django.contrib.auth import get_user_model

User = get_user_model()

if not User.objects.filter(email='admin@admin.com').exists():
    User.objects.create_superuser(email='admin@admin.com', nombre='admin', password='admin')
    print("Superusuario admin@admin.com creado exitosamente.")
else:
    print("ℹEl superusuario admin@admin.com ya existe.")
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
    docker compose up -d --build
    echo "Servidor disponible en: http://${IP_ADDRESS}/login"

elif [ "$1" == "--migrate" ]; then
    docker compose up -d
    wait_for_services
    run_migrations
    echo "Servidor disponible en: http://${IP_ADDRESS}/login"

elif [ "$1" == "--clean" ] && [ "$2" == "--migrate" ]; then
    echo "Limpiando contenedores y volúmenes..."
    docker compose down -v
    docker compose up -d --build
    wait_for_services
    run_migrations
    create_superuser
    echo "Servidor disponible en: http://${IP_ADDRESS}/login"

elif [ "$1" == "--clean" ]; then
    echo "Limpiando contenedores y volúmenes..."
    docker compose down -v
    echo "Limpieza de contenedores y volúmenes exitosa."

elif [ "$1" == "--stop" ]; then
    docker compose down

else
    echo "Iniciando los servicios..."
    docker compose up -d
    echo "Servidor disponible en: http://${IP_ADDRESS}/login"
fi

