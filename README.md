# MEC Eatz 🍴

**MEC Eatz** is a comprehensive **college canteen management system** that enables  
students to place cashless food orders and canteen staff to manage menus, orders, and  
sales efficiently.  

This repository contains the **mobile application** (built with React Native / Expo) and  
backend API (Express.js + PostgreSQL) that power the system.

---

## 🌟 Features

### Student App
- 📋 **Live Daily Menu** – Browse real-time menu items served from the backend.
- 💳 **Prepaid Wallet** – Top up your wallet via UPI and pay cashlessly for orders. Balance and every credit/debit are tracked server-side.
- 🛒 **Order & Pay** – Add items to the cart and pay from the wallet in one tap. Prices are always re-computed on the server, so the client can never be trusted to under-pay.
- 🔑 **QR Code Pickup** – Every order gets a 6-digit pickup code rendered as a QR pass for fast, contactless collection.
- 📈 **Transaction Ledger** – A per-user history of every top-up and order with status and timestamps.

### Canteen Dashboard (staff role)
- 🔎 **QR Pickup Verification** – Enter/scan a pickup code to verify and complete an order at the counter.
- 💵 **Real-Time Sales Analytics** – Total revenue, order count, today's revenue.
- 📊 **Top-Selling Dishes** – Ranked best sellers to guide prep and cut waste.

### Future Enhancements
- 🔐 **Biometric Wallet Integration**
- 🤖 **Machine Learning** for demand forecasting and personalized recommendations.
- 🔗 **Blockchain** for tamper-proof transaction logs or tokenized wallet credits.

---

## 🏗️ Tech Stack
| Layer        | Technology |
|--------------|------------|
| **Mobile App** | React Native (Expo Router), NativeWind |
| **Backend**   | Express.js (token-authenticated REST API) |
| **Database**  | Supabase (PostgreSQL) |
| **Auth**      | Supabase Auth (JWT bearer tokens) |
| **Payments**  | UPI intent → prepaid wallet |

---

## 🔐 Architecture & Security

The money-moving core of the system lives in **`SECURITY DEFINER` Postgres
functions** (see [`backend/schema.sql`](backend/schema.sql)) rather than in
client code:

- `place_order` prices the cart from the `Items` table (client prices are
  ignored), locks the wallet row (`FOR UPDATE`), verifies funds, debits the
  balance, writes the order + line items, and mints a pickup code — **all in one
  atomic transaction** so concurrent requests can't double-spend.
- `wallet_topup` credits the wallet and appends a ledger entry atomically.
- `verify_pickup` marks a pending order completed when staff confirm the code.
- `staff_analytics` aggregates revenue and top sellers for the dashboard.

The API is **stateless** — the mobile client stores the Supabase access token
and sends it as `Authorization: Bearer <token>`; the backend verifies it on each
request. This replaced the previous in-memory session approach, which is
unreliable on free-tier hosting.

### API Endpoints
| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| `POST` | `/api/signup` | – | Register a student |
| `POST` | `/api/login` | – | Log in, returns profile + token |
| `GET`  | `/api/me` | user | Current profile + wallet balance |
| `GET`  | `/api/items` | – | Live menu |
| `GET`  | `/api/wallet` | user | Wallet balance |
| `POST` | `/api/wallet/topup` | user | Credit wallet (`{ amount }`) |
| `POST` | `/api/orders` | user | Place an order (`{ items:[{item_id,quantity}] }`) |
| `GET`  | `/api/orders` | user | Transaction ledger |
| `GET`  | `/api/orders/:id` | user | Single order + line items |
| `POST` | `/api/staff/verify-pickup` | staff | Verify a pickup code |
| `GET`  | `/api/staff/analytics` | staff | Sales analytics |

---

## 🚀 Getting Started

### Backend
```bash
cd backend
cp .env.example .env          # add your SUPABASE_URL and SUPABASE_ANON_KEY
# In the Supabase SQL editor, run backend/schema.sql once.
npm install
npm run seed                  # optional: load sample menu items
npm run dev                   # starts the API on http://localhost:3000
```
> To grant a user the canteen dashboard, set their row's `role` to `staff` in
> the `Users` table.

### Mobile app
```bash
cp .env.example .env          # SUPABASE_URL, SUPABASE_ANON_KEY, EXPO_PUBLIC_API_URL
npm install
npx expo start
```

---

## 👥 Team

   - Ajay Krishna D

   - Abhay Murali M

   - Gautham S Krishna

   - Abhishek A

---

> “Bridging operational efficiency with student convenience for a smarter canteen experience.”