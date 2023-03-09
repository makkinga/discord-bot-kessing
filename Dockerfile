FROM node:lts-slim

MAINTAINER @Gyd0x <gyd0x@bespoke-bots.xyz>

WORKDIR /app

RUN apt-get -y update
RUN apt-get -y upgrade
RUN apt-get install -y neovim nano
RUN apt install -y build-essential
RUN apt install -y python3
RUN apt install -y chromium
RUN npm install -g pm2

COPY package*.json ./

RUN npm ci

COPY . .

CMD ["pm2-plus.sh"]
CMD ["pm2-runtime", "ecosystem.config.js"]