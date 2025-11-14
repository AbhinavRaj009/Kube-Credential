# build
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build   # outputs to dist/

# serve
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist ./
# optional: custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
