FROM python:3.11-slim

WORKDIR /productos

COPY . /productos/

RUN apt-get update && \
    apt-get install -y \
    default-libmysqlclient-dev gcc\
    pkg-config

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

COPY scripts/wait-for-it.sh /usr/local/bin/wait-for-it.sh

RUN chmod +x /usr/local/bin/wait-for-it.sh

ENTRYPOINT ["wait-for-it.sh", "db_productos:3306", "--timeout=60", "--"]

EXPOSE 8003

CMD ["python", "manage.py", "runserver", "0.0.0.0:8003"]