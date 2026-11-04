# NOVAPOS – Production Deployment & DevOps Guide
**Document Path:** `/docs/deployment-guide.md`  
**Classification:** DevOps / Systems Administration  
**Version:** 1.0.0  
**Phase:** Phase 5 – Production Release  

---

## 1. System Requirements & Architecture Stack
- **OS:** Linux (Ubuntu 22.04 LTS / Debian 12 / Alpine) or Windows Server.
- **Node.js:** v20.x or v22.x LTS.
- **Database:** PostgreSQL 16+ with Row-Level Security enabled.
- **Cache & Message Broker:** Redis 7.x (Pub/Sub for WebSocket KDS sync & BullMQ background workers).
- **Reverse Proxy:** Nginx 1.24+ with TLS 1.3 & HTTP/2.

---

## 2. One-Command Local Development Setup
```bash
# 1. Clone repository
git clone https://github.com/chowdhurybahalulhossain/Restroworks.git
cd Restroworks

# 2. Install dependencies (Node 18+ / React 18 / Three.js)
npm install --legacy-peer-deps

# 3. Run test suite
npm test

# 4. Launch development server with hot-reload
npm run dev
# -> Opens http://localhost:3000/ with all 12 restaurant portals
```

---

## 3. Production Docker Compose Stack (`docker-compose.yml`)

```yaml
version: '3.9'

services:
  novapos-web:
    build:
      context: .
      dockerfile: Dockerfile
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://novapos_user:Secr3tP@ss@postgres:5432/novapos_db?schema=public
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=your_production_jwt_secret_min_64_chars_hex
      - SSLCOMMERZ_STORE_ID=novapos_live
      - SSLCOMMERZ_STORE_PASS=live_password_secret
      - SSLCOMMERZ_IS_SANDBOX=false
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: novapos_user
      POSTGRES_PASSWORD: Secr3tP@ss
      POSTGRES_DB: novapos_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --appendonly yes --requirepass RedisSecr3t
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

volumes:
  postgres_data:
  redis_data:
```

---

## 4. Production Nginx Reverse Proxy & SSL Configuration
```nginx
server {
    listen 80;
    server_name pos.novasphere.restaurant *.pos.novasphere.restaurant;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name pos.novasphere.restaurant *.pos.novasphere.restaurant;

    ssl_certificate /etc/letsencrypt/live/pos.novasphere.restaurant/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pos.novasphere.restaurant/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Frontend Single Page App & Portals
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket Real-Time Gateway (KDS & Order Broadcast)
    location /socket.io/ {
        proxy_pass http://localhost:3000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

---

## 5. Health Check & Monitoring Endpoints
- **Liveness probe:** `GET /health/liveness` (returns `200 OK`)
- **Readiness probe:** `GET /health/readiness` (validates PostgreSQL connection, Redis ping, Dexie storage)
- **Metrics:** `GET /metrics` (Prometheus-compatible format for Grafana dashboards)

