FROM python:3

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN apt-get update && apt-get install ffmpeg libsm6 libxext6 -y
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["fastapi", "run", "./api.py", "--port", "80"]
