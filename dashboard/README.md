# TOGETHER Neo-Brutalist Music Dashboard

Production URL: **https://dash.together.dpdns.org/**

## Architecture
- **Frontend:** React + Vite + Tailwind CSS (Cyber/Digital Brutalism theme `#0B0B0B` & `#00E676`).
- **Backend:** Node.js + Express + Socket.IO on port `5080`.
- **Database:** Connects directly to the existing TOGETHER MongoDB cluster (`UserPreferences`, `247`, `PlaylistLibrary`, `Setup`).
- **Bot Bridge:** Interacts with `http://127.0.0.1:5050` using authenticated secret headers.

## Nginx Configuration for VPS (`dash.together.dpdns.org`)

```nginx
server {
    server_name dash.together.dpdns.org;

    # Production React Build
    location / {
        root /home/imadmin/app/dashboard/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:5080/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Socket.IO Real-time Sync
    location /socket.io/ {
        proxy_pass http://127.0.0.1:5080/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    listen [::]:443 ssl;
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/together.dpdns.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/together.dpdns.org/privkey.pem;
}

server {
    listen 80;
    listen [::]:80;
    server_name dash.together.dpdns.org;
    return 301 https://$host$request_uri;
}
```

## Running the Dashboard Backend
```bash
# Direct run
node dashboard/backend/server.js

# Or with PM2
pm2 start dashboard/ecosystem.config.js
```

