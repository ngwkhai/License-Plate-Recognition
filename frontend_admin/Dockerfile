# Dockerfile cho React frontend

FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

EXPOSE 5174

CMD ["npm", "start"]
