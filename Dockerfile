FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .

# Generate environment.dev.ts at build time (gitignored so not in repo)
RUN printf "export const environment = {\n\
  production: false,\n\
  envName: 'dev',\n\
  apiUrl: 'https://api-dev.jobmouka.com',\n\
  googleClientId: '137210229872-43duvvcshrlm66nvtilatld1bfm36080.apps.googleusercontent.com',\n\
  geminiApiKey: '',\n\
  geminiApiBaseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',\n\
  geminiModel: 'gemini-2.5-flash-preview-05-20',\n\
  enableLogging: true\n\
};\n" > src/environments/environment.dev.ts

RUN npm run build -- --configuration dev

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist/tech-profile/server ./server
COPY --from=build /app/dist/tech-profile/browser ./browser
ENV PORT=8080
EXPOSE 8080
CMD ["node", "server/server.mjs"]
