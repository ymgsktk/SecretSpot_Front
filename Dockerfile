FROM node:alpine3.19

WORKDIR /app

COPY package*.json .
# Install npm package
RUN npm install npm

RUN npm install axios

COPY . .

RUN apk update && apk add --no-cache git
RUN apk add sudo