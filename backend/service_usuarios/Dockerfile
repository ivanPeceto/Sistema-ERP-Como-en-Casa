FROM python:3.9-slim

WORKDIR /usuarios

COPY . /usuarios/

RUN apt-get update && apt-get install -y libmysqlclient-dev

RUN pip install --no--chache-dir -r requirements.txt

EXPOSE 8001

CMD ["python", "manage.py", "runserver", "0.0.0.0:8001"]