FROM python:3

WORKDIR /usr/app

ADD ../../ .

RUN pip3 install -r src/requirements.txt

CMD ["python3", "src/server.py" ]