# Multi-stage build for Angular SSR application
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

RUN npm ci --only=production

EXPOSE 4000

CMD ["npm", "run", "serve:ssr:tech-profile"]