FROM node:20-alpine AS build
WORKDIR /app

# Accept Mapbox token as build arg
ARG MAPBOX_TOKEN=YOUR_MAPBOX_TOKEN

COPY package*.json ./
RUN npm ci
COPY . .

# Create environment.ts with the token before building
RUN echo "export const environment = { production: true, mapboxToken: '${MAPBOX_TOKEN}', apiUrl: '/api', uploadsUrl: '' };" > src/environments/environment.ts
RUN echo "export const environment = { production: true, mapboxToken: '${MAPBOX_TOKEN}', apiUrl: '/api', uploadsUrl: '' };" > src/environments/environment.prod.ts

RUN npm run build -- --configuration=production

FROM nginx:alpine
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
