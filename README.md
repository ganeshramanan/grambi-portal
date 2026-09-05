# Grambi.in — Multi-Product Launchpad & Central Auth Hub

A Node.js & Express centralized portal for **Grambi.in** to manage client onboarding, admin approval, and single-sign-on routing to microservices hosted on Render (such as WhatsApp Automator, Website Builder, and future products).

---

## 🚀 Quick Start (Windows / Mac / Linux)

### 1. Clone & Install
```bash
git clone <YOUR_REPO_URL>
cd grambi-portal
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update your Render URLs in `.env`:
```env
PORT=3000
JWT_SECRET=your_custom_secret_key_here
WHATSAPP_APP_URL=https://your-whatsapp-app.onrender.com
WEBSITE_BUILDER_APP_URL=https://your-website-builder.onrender.com
```

### 3. Run the App
```bash
node server.js
```
Visit `http://localhost:3000`.

---

## 🔑 Default Accounts (Initial Demo)

* **Admin Portal**: `admin@grambi.in` / `admin123` (Access `/admin.html` to approve users and assign product permissions)
* **Demo Customer**: `client@example.com` / `client123` (Access `/dashboard.html` to launch allowed products)

---

## 📁 Project Structure

* `server.js` — Core Express backend, JWT auth, dynamic product routing & admin APIs.
* `public/index.html` — Public landing page & registration modal.
* `public/dashboard.html` — Customer dashboard with product launch cards.
* `public/admin.html` — Admin user management and granular product permission toggles.
