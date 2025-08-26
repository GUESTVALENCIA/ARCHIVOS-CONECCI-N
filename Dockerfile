# Sandra Ultra Front - Dockerfile
FROM nginx:alpine
COPY app /usr/share/nginx/html
# Puedes añadir cabeceras/CORS en /etc/nginx/conf.d/default.conf si te hace falta
EXPOSE 80
