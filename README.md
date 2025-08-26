# Sandra Ultra Front · Docker
Sirve el front con Nginx.

## Uso
```bash
unzip sandra-ultra-front-docker.zip
cd sandra-ultra-front-docker
# Edita app/app.js y setea BACKEND
docker build -t sandra-ultra-front .
docker run -d -p 8080:80 --name sandra-ultra-front sandra-ultra-front
# Abre http://localhost:8080
```
