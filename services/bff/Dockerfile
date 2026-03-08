# BFF (Backend for Frontend) Service
FROM node:18-alpine

WORKDIR /app

COPY services/bff/package*.json ./
RUN npm install

COPY services/bff .

EXPOSE 3000

CMD ["npm", "start"]
