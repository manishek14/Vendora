# 🛍️ NestJS OnlineShop

A production-ready multi-vendor OnlineShop backend built with **NestJS**, **PostgreSQL**, **TypeORM**, and **Redis**.  
Designed for platforms like Digikala, Amazon, or any e-commerce ecosystem requiring vendor support, complex product attributes, and flexible payment flows.

> 🔐 Authentication • 💰 Wallet + Withdrawal • 📦 Order Management • 🚚 Dynamic Shipping • 🧾 Discount Codes • 📢 Notification System • ⚖️ Violation & Ban Engine

---

## 🚀 Key Features

### 👥 Authentication & User Management
- Register/Login with **Email/Password** + **Google OAuth** + **Phone OTP**
- **JWT Access & Refresh tokens** with secure rotation
- 12 granular roles: Super Admin, Sales Admin, Content Admin, Product Admin, Finance Admin, Support Admin, Vendor Admin, User Admin, Promo Admin, Warehouse Admin, Report Viewer, API Admin
- **Fully verified** logic: users must verify phone and address before checkout

### 🧩 Product System
- Multi-level categories (unlimited nesting)
- **Dynamic attributes** (vendors can add custom filters like "Material", "Color", "Battery Life")
- Tags (PostgreSQL array type)
- Featured & Special Sale flags
- **Vendor-specific products** with approval workflow
- Average rating calculation from approved reviews

### 🛒 Cart & Order
- Persistent cart for authenticated users only
- Order status flow: `pending_payment → waiting_approval → ready_to_ship → shipped → delivered → returned`
- **Partial wallet payment** + remaining via gateway (combination)
- Stock verification during order creation

### 💳 Payment & Wallet
- **Zarinpal** & **Pasargad** gateways
- Wallet system for both customers and vendors
- **Vendor withdrawal** with dynamic fee:  
  - 20% fee for withdrawals below 1 Billion Toman  
  - 10% fee for withdrawals ≥ 1 Billion Toman
- Deposit limit for customers (configurable, e.g., 200M Toman)
- Full transaction history for every wallet movement

### 🚚 Shipping Engine
- Cost calculation based on **city** and **total weight**
- External API integration (e.g., Tipax) + fallback to internal rule table
- User selects preferred shipping method at checkout

### 🎟️ Discount System
- Percentage-based discount codes
- Usage limits, minimum cart amount, max discount amount
- Expiration dates
- Admin management via Promo Admin role

### 📢 Notification Service
- **Email** via Nodemailer (SMTP)
- **SMS** via sms.ir (OTP, order updates, ban alerts)
- **Internal in-app notifications** stored in database
- Admin broadcast to all users or specific user

### ⚖️ Violation & Ban Engine
- Predefined violation categories & items (e.g., "Insulting comments", "Fake reviews")
- Auto-ban based on violation limits (e.g., 3 fake reviews → 3-day temporary ban)
- **Temporary ban** (with auto-expiry) or **Permanent ban** (hard delete user + blacklist identity)
- BanGuard blocks banned users from all actions

### 🧾 Reports & Comments (Coming Soon)
- Product reviews with rating and reply support
- Admin approval workflow for comments
- Sales and analytics reports for admin roles

---

## 🛠️ Tech Stack

| Layer          | Technology |
|----------------|------------|
| Framework       | NestJS 10 |
| Language        | TypeScript 5 |
| Database        | PostgreSQL 15 (with JSONB support) |
| ORM             | TypeORM 0.3 |
| Cache & Queue   | Redis 7 + Bull |
| Authentication  | Passport (Local, JWT, Google) |
| Validation      | class-validator + class-transformer |
| File Upload     | Multer |
| Email           | Nodemailer |
| SMS             | sms.ir API |
| Payment Gateways| Zarinpal, Pasargad |
| Logging         | Winston |
| Linting         | ESLint + Prettier |

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/nestjs-OnlineShop.git
cd nestjs-OnlineShop

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run PostgreSQL and Redis (using Docker)
docker-compose up -d

# Run migrations
npm run migration:run

# Seed initial data (roles, admin user, violation categories)
npm run seed

# Start development server
npm run start:dev
