# Capital University Club — Project Delivery

Graduation project delivery package for **Helwan University / CITC**.

## Quick links

| Requirement | Location |
|-------------|----------|
| **Full delivery index (AR)** | [README.md](./README.md) |
| Front-End source | [`../Frontend/src/`](../Frontend/src/) |
| Back-End source | [`../Backend/src/`](../Backend/src/) |
| Database backup | [`../database/full-dump.sql`](../database/full-dump.sql) |
| SQL migrations | [`../Backend/migrations/`](../Backend/migrations/) |
| Technologies | [01-TECHNOLOGIES.md](./01-TECHNOLOGIES.md) |
| Dependencies | [`../Backend/package.json`](../Backend/package.json) + [`../Frontend/package.json`](../Frontend/package.json) |
| Environment variables | [03-ENVIRONMENT-VARIABLES.md](./03-ENVIRONMENT-VARIABLES.md) |
| Local setup | [04-LOCAL-SETUP.md](./04-LOCAL-SETUP.md) |
| Test accounts | [05-TEST-ACCOUNTS.md](./05-TEST-ACCOUNTS.md) |
| External services | [06-EXTERNAL-SERVICES.md](./06-EXTERNAL-SERVICES.md) |
| Production deploy | [`../README-DEPLOY.md`](../README-DEPLOY.md) |

## Run locally (summary)

```powershell
# Restore DB
psql -U postgres -d "Helwan-University-Club" -f database\full-dump.sql

# Backend (terminal 1)
cd Backend; copy .env.example .env; npm install; npm run dev

# Frontend (terminal 2)
cd Frontend; copy .env.example .env; npm install; npm run dev
```

Login: `admin@club.local` / `Password@123`
