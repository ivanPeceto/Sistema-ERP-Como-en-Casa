FROM python:3.11-slim

RUN apt-get update && \
    apt-get install -y default-libmysqlclient-dev gcc pkg-config && \
    apt-get clean

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8002

CMD ["python", "manage.py", "runserver", "0.0.0.0:8002"]
