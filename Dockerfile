FROM node:alpine3.19

WORKDIR /app

COPY package*.json .
# Install npm package
RUN npm install -g next@14.2.4

RUN npm install axios@1.7.7

RUN npm install @react-google-maps/api@2.19.3 

RUN npm install @radix-ui/themes@3.1.4
RUN npm install @radix-ui/react-icons@1.3.0

COPY . .

RUN apk update && apk add --no-cache git
RUN apk add sudo