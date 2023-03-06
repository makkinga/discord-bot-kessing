FROM node:lts-slim

MAINTAINER Gyd0x Gyd0x#7981

WORKDIR /app

RUN apt-get -y update
RUN apt-get -y upgrade
RUN apt install -y build-essential
RUN apt install -y python3
RUN apt install -y chromium
RUN npm install pm2 -g

COPY package*.json ./
RUN npm ci

COPY . .

CMD ["pm2-runtime", "ecosystem.config.js", "--watch"]