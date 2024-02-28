FROM node:21.6-alpine3.18

MAINTAINER @Gyd0x <gyd0x@bespoke-bots.xyz>

WORKDIR /app

RUN apk update
RUN apk upgrade
RUN apk add build-base bash curl nano tmux python3 chromium
RUN npm add -g pm2 nodemon

COPY package*.json ./

RUN npm ci

COPY . .

USER node

CMD ["pm2-runtime", "ecosystem.config.js"]