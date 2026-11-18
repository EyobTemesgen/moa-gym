# MoA Staff Wellness & Gym Management System — Deployment Guide

This guide details the procedure for deploying and operating the **MoA Staff Wellness & Gym Management System** on Ministry on-premises servers. The production environment is on-premises and air-gapped without direct internet access; all Docker images, configuration files, and dependencies are built and delivered via the deployment pipeline.

---

## 1. Architecture & Network Topology

```
 [Clients / Front Desk / Mobile]
                │
                ▼ (Port 80 HTTP -> 443 HTTPS)
   ┌────────────────────────────────────────────────────────┐
   │                  Nginx Gateway (Reverse Proxy)         │
   │  - Terminates TLS 1.2 / 1.3 (SSL fullchain & privkey)  │
   │  - Serves React SPA (Vite Production PWA)              │
   │  - Gzip compression, HSTS, security headers            │
   └───────────────┬────────────────────────────────────────┘
                   │
                   ▼ (Internal Docker Network)
   ┌────────────────────────────────────────────────────────┐
   │                   NestJS API Backend (:5005)           │
   │  - REST API & Swagger Documentation                    │
   │  - JWT Authentication & RBAC Guard                     │
   │  - Health Diagnostics (/api/health)                    │
   └───────────────┬────────────────────────────────────────┘
                   │
                   ▼ (Internal Docker Network)
   ┌────────────────────────────────────────────────────────┐
   │                PostgreSQL 16 Database (:5432)          │
   │  - Persistent data volume: moa_gym_db_data             │
   │  - Strict schema with Prisma ORM                       │
   │  - Auto-migrations & database push on entry            │
   └────────────────────────────────────────────────────────┘
```

Only the Nginx container binds to external ports **80** and **443**. The NestJS API and PostgreSQL database run entirely inside the isolated Docker network.

| Environment | Host Address | Domain Name | System User | App Directory | Health Endpoint |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Production** | `10.10.20.155` | `gym.moa.gov.et` | `gymp` | `/opt/moa-gym` | `https://gym.moa.gov.et/api/health` |
| **Staging** | `10.10.20.156` | `gym-stg.moa.gov.et` | `gyms` | `/opt/moa-gym` | `https://gym-stg.moa.gov.et/api/health` |

---

## 2. Server Prerequisites

- **Operating System:** Ubuntu 22.04 LTS / 24.04 LTS or RHEL 9
- **Compute:** 4+ vCPU cores, 8 GB RAM (4 GB for staging)
- **Disk:** 50 GB+ SSD storage (dedicated partition for `/var/lib/docker`)
- **Software:** Docker Engine 24+ and Docker Compose v2+
- **Security:** Inbound ports 80/tcp and 443/tcp open in firewall (`ufw` or `firewalld`)
- **System Clock:** Must be synchronized to `Africa/Addis_Ababa`:
  ```bash
  sudo timedatectl set-timezone Africa/Addis_Ababa
  ```

---

## 3. Directory Layout on App Server (`/opt/moa-gym`)

```
/opt/moa-gym/
├── docker-compose.yml       # Production Docker service definition
├── .env                     # Private database passwords, JWT secrets, environment variables
├── ssl/                     # SSL certificates directory
│   ├── fullchain.pem        # Ministry certificate chain
│   └── privkey.pem          # Private key
└── backups/                 # Automated pre-deployment database dumps
```

---

## 4. Production Deployment Steps

### Step 1: Prepare Directory & Environment Variables
```bash
sudo mkdir -p /opt/moa-gym/ssl /opt/moa-gym/backups
sudo chown -R $USER:$USER /opt/moa-gym
cd /opt/moa-gym

# Create and populate .env
cp .env.example .env
nano .env
```

Ensure `.env` contains:
```env
APP_ENV=prod
TZ=Africa/Addis_Ababa
POSTGRES_USER=moa_gym_user
POSTGRES_PASSWORD=<generated-random-32-char-password>
POSTGRES_DB=moa_gym_db
JWT_SECRET=<generated-random-64-char-hex-secret>
JWT_EXPIRATION=8h
TRUST_PROXY=1
```

### Step 2: Install SSL Certificates
Place the official Ministry of Agriculture SSL certificates into `/opt/moa-gym/ssl`:
```bash
sudo cp /path/to/fullchain.pem /opt/moa-gym/ssl/fullchain.pem
sudo cp /path/to/privkey.pem /opt/moa-gym/ssl/privkey.pem
sudo chmod 600 /opt/moa-gym/ssl/privkey.pem
```

*(For staging or LAN testing where CA certs are unavailable, run `./ssl/generate-self-signed.sh`)*.

### Step 3: Launch Application Stack
```bash
docker compose up -d --build
```

### Step 4: Verify Deployment
Inspect container statuses:
```bash
docker compose ps
```
Both `moa-gym-db`, `moa-gym-backend`, and `moa-gym-nginx` should report `Up (healthy)`.

Verify API Health Check:
```bash
curl -skf https://localhost/api/health
```

Expected JSON response:
```json
{
  "status": "healthy",
  "database": "connected",
  "system": "MoA Staff Wellness & Fitness Management System",
  "environment": "prod",
  "version": "1.0.0",
  "commit": "fa8230b",
  "timestamp": "2026-11-18T15:50:00.000Z"
}
```

---

## 5. Local Development & HTTP Testing

To run locally without requiring SSL certificates or modifying ports:
```bash
npm run docker:local
# Equivalent to:
# docker compose -f docker-compose.yml -f docker-compose.local.yml up -d --build
```
Access the application at [http://localhost:3005](http://localhost:3005).

To stop local services:
```bash
npm run docker:local:down
```

---

## 6. Backup & Recovery

### Automated Pre-Deployment Backups
The Jenkins CI/CD pipeline automatically executes a PostgreSQL custom-format dump (`pg_dump -Fc`) before every deployment, retaining the last 30 days in `/opt/moa-gym/backups/`.

### Manual Backup Command
```bash
docker compose exec -T db pg_dump -U moa_gym_user -Fc moa_gym_db > /opt/moa-gym/backups/manual-$(date +%F_%H%M%S).dump
```

### Disaster Recovery / Restore Procedure
To restore a database dump into a fresh or recovered database:
```bash
# 1. Stop backend to prevent incoming transactions
docker compose stop backend

# 2. Restore dump file using pg_restore
docker compose exec -T db pg_restore -U moa_gym_user -d moa_gym_db --clean --if-exists < /opt/moa-gym/backups/your-backup.dump

# 3. Restart the full stack
docker compose up -d
```

---

## 7. Emergency Rollback Procedure

The automated deployment pipeline tags the currently running container images as `:previous` before deploying a new build.

To instantly roll back to the previous stable release:
```bash
docker tag moa-gym-backend:previous moa-gym-backend:latest
docker tag moa-gym-nginx:previous moa-gym-nginx:latest
docker compose up -d --no-build
```
