FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apt-get update && \
    apt-get install -y default-libmysqlclient-dev gcc pkg-config && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir python-decouple

RUN pip install --no-cache-dir -r requirements.txt

RUN pip install channels
RUN pip install channels_redis

RUN apt-get update && apt-get install -y curl

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=5 \
  CMD curl -f http://localhost:8004/healthcheck/ || exit 1

COPY . .

COPY utils/wait-for-it.sh /usr/local/bin/wait-for-it.sh
RUN chmod +x /usr/local/bin/wait-for-it.sh

EXPOSE 8004

ENTRYPOINT ["wait-for-it.sh", "db_pedidos:3306", "--timeout=240", "--"]

CMD ["daphne", "-b", "0.0.0.0", "-p", "8004", "orders.asgi:application"]