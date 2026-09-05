# Grambi.in — Unified Multi-Product Platform & WhatsApp Broadcaster

A single, clean, modular Node.js & TypeScript application that unifies:
1. **Public Marketing Landing Page** (`grambi.in`)
2. **Central Customer Launchpad** (View and launch active vs locked products)
3. **Super Admin Access Hub** (Approve customers & assign product permissions)
4. **WhatsApp Bulk Broadcast Engine** (High-volume broadcasts, Meta Cloud API, templates, delivery reports)
5. **Website & Customer Portal Module** (Product 2)

---

## ⚡ Quick Start on Windows / Mac

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/ganeshramanan/grambi-portal.git
cd grambi-portal
npm install
```

### 2. Configure Environment
Create `.env`:
```env
PORT=3000
DATABASE_URL="file:./dev.db"
REDIS_URL="redis://127.0.0.1:6379"
JWT_SECRET="grambi_unified_secret_key_2026"
```

### 3. Initialize Prisma Database & Run
```bash
npx prisma db push
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 🔑 Default Roles & Flow

* **First Account Created**: Automatically becomes the **Super Admin** (`ADMIN`) with instant approval and access to all products.
* **Customer Accounts**: Sign up via the public landing page $\rightarrow$ Admin approves them and toggles product checkboxes in `/admin.html`.
* **Zero Redirect Issues**: Everything runs on the exact same domain & authentication cookie. No cross-site tokens or URL query parameters needed!
