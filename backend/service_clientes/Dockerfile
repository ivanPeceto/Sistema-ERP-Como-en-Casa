FROM python:3.11-slim

# Instalación de dependencias del sistema
RUN apt-get update && \
    apt-get install -y default-libmysqlclient-dev gcc pkg-config && \
    apt-get clean

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia del archivo de requerimientos y su instalación
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia del resto del código del microservicio
COPY . .

# Expone el puerto del servicio
EXPOSE 8002

# Comando para iniciar el servidor de Django
CMD ["python", "manage.py", "runserver", "0.0.0.0:8002"]
