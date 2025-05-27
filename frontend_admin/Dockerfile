# Dockerfile cho React frontend

FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install --save-dev cross-env

COPY . .

EXPOSE 5174

CMD ["npm", "start"]
