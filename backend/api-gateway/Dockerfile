FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

RUN npm ci 
RUN npm i typescript
# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Install dependencies
RUN npm ci --only=production

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
