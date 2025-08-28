# Basic Auth para Nginx (archivo de contraseñas)

## Crear el archivo `.htpasswd-sandra`
En el servidor, ejecuta UNA de estas opciones:

### Opción A) con `htpasswd` (Apache utils)
sudo apt-get install -y apache2-utils
sudo htpasswd -c /etc/nginx/.htpasswd-sandra admin

### Opción B) con OpenSSL (MD5 apr1 compatible)
# reemplaza TU_PASSWORD por la contraseña
printf "admin:$(openssl passwd -apr1 'TU_PASSWORD')\n" | sudo tee /etc/nginx/.htpasswd-sandra

> Usuario por defecto del ejemplo: `admin` (puedes usar otro).

## Probar y recargar Nginx
sudo nginx -t && sudo systemctl reload nginx
