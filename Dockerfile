# Gunakan base image Node.js
FROM node:20-alpine

# Tentukan working directory di dalam container
WORKDIR /app

# Copy file package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy semua file project
COPY . .

# Build NestJS (compile ke dist)
RUN npm run build

# Ekspos port (NestJS default di 3000)
EXPOSE 3000

# Jalankan perintah start
CMD ["npm", "run", "start:prod"]
