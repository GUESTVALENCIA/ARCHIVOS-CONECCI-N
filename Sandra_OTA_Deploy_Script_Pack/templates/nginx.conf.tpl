# Template Nginx ultra-privado para OTA
server {
    listen 443 ssl http2;
    server_name __SERVER_NAME__;

    # TLS fuerte (ajusta a tu include / rutas reales)
    include snippets/tls-strong.conf;
    ssl_certificate     /etc/letsencrypt/live/__SERVER_NAME__/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/__SERVER_NAME__/privkey.pem;

    root __WEBROOT__;

    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header Referrer-Policy no-referrer always;
    add_header X-Robots-Tag "noindex, nofollow, noarchive, nosnippet, noimageindex" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    add_header Cache-Control "no-store";

    # Basic Auth
    auth_basic "Sandra Private Downloads";
    auth_basic_user_file /etc/nginx/.htpasswd-sandra;

    # Allowlist opcional (inyectado por script)
    __ALLOW_BLOCK__

    # Rate limit
    limit_req_zone $binary_remote_addr zone=sandra_limit:10m rate=3r/s;
    location / {
        limit_req zone=sandra_limit burst=10 nodelay;
        try_files $uri $uri/ =404;
    }

    types {
        application/xml plist;
        application/octet-stream ipa;
    }

    access_log off;
    error_log  /var/log/nginx/sandra_error.log warn;
}

server {
    listen 80;
    server_name __SERVER_NAME__;
    return 301 https://$host$request_uri;
}
