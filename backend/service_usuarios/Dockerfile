FROM python:3.11-slim

WORKDIR /usuarios

COPY . /usuarios/

RUN apt-get update && \
    apt-get install -y \
    default-libmysqlclient-dev gcc\
    pkg-config

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8001

EXPOSE 8001

CMD ["python", "manage.py", "runserver", "0.0.0.0:8001"]