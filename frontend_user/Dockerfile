# 1. Base image
FROM node:18

# 2. Set working directory
WORKDIR /app

# 3. Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# 4. Copy toàn bộ mã nguồn
COPY . .

# 5. Build ứng dụng
RUN npm run build

# 6. Expose port và run app
EXPOSE 3000

# Lệnh khởi động ứng dụng
CMD ["npm", "start"]
