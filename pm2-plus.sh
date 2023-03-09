#!/bin/sh
source /run/secrets/pm2-env
pm2 link $PM2_PUBLIC_KEY $PM2_SECRET_KEY