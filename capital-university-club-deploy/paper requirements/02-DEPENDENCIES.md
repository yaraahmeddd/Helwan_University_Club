# المتطلبات والتبعيات — Dependencies

## ملفات package.json

| المشروع | الملف |
|---------|-------|
| Back-End | [`Backend/package.json`](../Backend/package.json) |
| Front-End | [`Frontend/package.json`](../Frontend/package.json) |

---

## Back-End — أهم الحزم

### Production dependencies

| Package | Purpose |
|---------|---------|
| `express` | HTTP server & routing |
| `typeorm` | ORM for PostgreSQL |
| `pg` | PostgreSQL driver |
| `bcrypt` | Password hashing |
| `jsonwebtoken` | JWT auth tokens |
| `cors` | Cross-origin requests |
| `multer` | File upload handling |
| `express-validator` | Request validation |
| `socket.io` | Real-time WebSocket |
| `@google/generative-ai` | Gemini AI chatbot |
| `cloudinary` | Optional cloud image storage |
| `axios` | HTTP client (Paymob API) |
| `stripe` | Listed in deps (Paymob used primarily) |
| `reflect-metadata` | Required by TypeORM |

### Dev dependencies

| Package | Purpose |
|---------|---------|
| `typescript` | TypeScript compiler |
| `ts-node` | Run TS directly in dev/scripts |
| `@types/*` | Type definitions |

### npm scripts (Backend)

```bash
npm run dev              # Start dev server (nodemon)
npm run build            # Compile TypeScript → dist/
npm run migrate          # Run SQL migrations
npm run create:admin-account   # Create/reset admin user
```

---

## Front-End — أهم الحزم

### Production dependencies

| Package | Purpose |
|---------|---------|
| `react` / `react-dom` | UI framework |
| `react-router-dom` | Client routing |
| `axios` | API calls |
| `@tanstack/react-query` | Server state |
| `i18next` / `react-i18next` | Internationalization |
| `tailwindcss` | Styling |
| `@radix-ui/*` | Accessible UI primitives |
| `react-hook-form` / `zod` | Forms & validation |
| `exceljs` | Excel export |
| `html2pdf.js` | PDF export |
| `socket.io-client` | Real-time notifications |
| `framer-motion` | Animations |
| `recharts` | Charts |
| `lucide-react` | Icons |

### Dev dependencies

| Package | Purpose |
|---------|---------|
| `vite` | Dev server & bundler |
| `@vitejs/plugin-react` | React plugin for Vite |
| `typescript` | TypeScript |
| `eslint` | Linting |

### npm scripts (Frontend)

```bash
npm run dev      # Start Vite dev server
npm run build    # Production build → dist/
npm run preview  # Preview production build
npm run lint     # ESLint
```

---

## التثبيت | Installation

```bash
# Backend
cd Backend
npm install

# Frontend
cd Frontend
npm install
```

> **ملاحظة:** لا يوجد `requirements.txt` أو `composer.json` — المشروع Node.js بالكامل.
