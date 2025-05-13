FROM python:3.9-slim

WORKDIR /app

COPY /app/

RUN pip install --no--chache-dir -r requirements.txt

EXPOSE 8001

CMD ["python", "manage.py", "runserver", "0.0.0.0:8001"]