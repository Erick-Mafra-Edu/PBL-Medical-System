FROM node:20-alpine

WORKDIR /app


# Install all dependencies (including devDependencies) for build
COPY package*.json ./
RUN npm ci


# Copy source and build
COPY . .
RUN npm run build

# Remove devDependencies for production image
RUN npm prune --production

EXPOSE 3001

CMD ["npm", "start"]
