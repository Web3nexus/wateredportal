# MYWATER Membership Portal

An institutional, sovereign membership portal engineered for the **MYWATER High Council**. Built with decoupled architecture, high-security public cryptographic verification, and an administrative operations chamber.

---

## 🏛️ System Architecture

- **Frontend**: Single Page Application built with **React 19 + TypeScript + Vite + Tailwind CSS**.
  - Strictly decoupled from the backend (No Next.js).
  - Designed with an institutional aesthetic: Deep Obsidian (`#0b0d12`), slate structural surfaces, and gold foil accents (`#d4af37`).
  - Restrained, dignified animations and typography (Cinzel & Inter).
- **Backend**: **Laravel 12 API (PHP 8.2+)**.
  - Laravel Sanctum authentication (token-based with secure cookie fallback).
  - Policy & role-based middleware (`EnsureAdmin`).
  - Immutable audit ledger logging all administrative operations, status changes, and tier promotions.
  - Zero private data exposure on public QR verification endpoints.

---

## 👑 Membership Courts Hierarchy

The dynamic database-driven court hierarchy:
1. **Watered** (Supreme Sovereign Tier)
2. **Leopard's Court** (Ancestral Wisdom & Lineage Stewardship)
3. **Chokwe Initiates** (Scholars of Sacred Geometry & Craft)
4. **Kemetic Court** (Preservers of Cosmic Order & Law)
5. **Auset Court** (Matriarchal Council of Nurture & Rebirth)
6. **The Reminder's Court** (Custodians of Oral History & Memorials)
7. **Hudorian Guard** (Shield & Sentinel of the Sanctuary)

---

## 🔒 Security & Privacy Guarantees

- **Tamper-Evident Digital Credential**:
  - Encoded with high-density QR verification linking to `/verify/{secure_qr_id}`.
  - Public verification returns **strictly non-sensitive credentials**: Full name, court classification, member ID, joined date, and status.
  - Private contact details, phone numbers, birthplaces, and personal statements are strictly redacted.
- **Administrative Audit Trail**:
  - Every application review, approval, status transition, court reassignment, and broadcast dispatch is recorded in `audit_logs` with actor ID, IP address, user agent, and contextual payload.
- **Account Protection**:
  - Member suspension instantly invalidates member privileges and dashboard access.

---

## 🚀 Quick Start Guide

### Prerequisites
- **PHP 8.2+** (or Laravel Herd / Valet)
- **Composer 2+**
- **Node.js 20+** and **npm**

### 1. Backend Setup
```bash
cd backend

# Install PHP dependencies
composer install

# Environment configuration
cp .env.example .env
php artisan key:generate

# Run database migrations and seed default courts & accounts
php artisan migrate:fresh --seed

# Start backend server (defaults to port 8000)
php artisan serve
```

### 2. Frontend Setup
```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite development server (defaults to port 5173 with proxy to backend :8000)
npm run dev

# Or build for production
npm run build
```

---

## 🔑 Default Seeded Accounts

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **High Council Admin** | `admin@mywater.com` | `password` | Complete access to Operations Chamber |
| **Active Member (Amina)** | `amina@mywater.com` | `password` | Leopard's Court (Member ID: `MW-2024-0001`) |
| **Active Member (Kofi)** | `member@mywater.com` | `password` | Watered Court (Member ID: `MW-2024-0002`) |

---

## 🧪 Automated Testing

### Backend Unit & Feature Tests
```bash
cd backend
php artisan test
```
*Current test suite: **9 tests passed, 101 assertions** covering Auth, Public Verification, Member Portal, and Admin Chamber.*

### Frontend Production Build Test
```bash
cd frontend
npm run build
```
*Compiles TypeScript without errors and produces optimized Vite assets.*

---

## 📁 Repository Structure

```
wateredportal/
├── backend/                  # Laravel 12 API
│   ├── app/
│   │   ├── Http/Controllers/Api/  # Auth, Public, Member, Admin controllers
│   │   ├── Http/Middleware/       # EnsureAdmin, etc.
│   │   └── Models/                # User, Member, Category, AuditLog, etc.
│   ├── database/
│   │   ├── migrations/            # Complete relational schema
│   │   └── seeders/               # 7 courts + mock members & audits
│   └── routes/api.php             # 35 RESTful endpoints
├── frontend/                 # React 19 + TypeScript + Vite
│   ├── src/
│   │   ├── api/                   # Axios client with bearer token interceptors
│   │   ├── components/            # Institutional Button, Badge, Modal, Card
│   │   ├── layouts/               # MainLayout, MemberLayout, AdminLayout
│   │   ├── pages/                 # Public, Member, and Admin views
│   │   ├── services/              # Type-safe API services
│   │   └── types/                 # Domain types & interfaces
│   └── vite.config.ts             # Proxy configured to backend
└── prompt.md                 # Original project specification
```

