FROM node:lts-slim

MAINTAINER @Gyd0x <gyd0x@bespoke-bots.xyz>

WORKDIR /app

RUN apt-get -y update
RUN apt-get -y upgrade
RUN apt-get install -y vim nano
RUN apt install -y build-essential
RUN apt install -y python3
RUN apt install -y chromium
RUN apt install -y yarn
RUN yarn global add pm2

RUN yarn install --frozen-lockfile

CMD ["pm2-runtime", "ecosystem.config.js"]