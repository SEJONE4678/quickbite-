# ⚡ QuickBite — Full-Stack Food Delivery Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg?logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-v4.19-lightgrey.svg?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v7.0%2B-darkgreen.svg?logo=mongodb)](https://www.mongodb.com/)
[![JavaScript](https://img.shields.io/badge/Frontend-Vanilla%20ES6%2B%20%2F%20CSS3-yellow.svg?logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Python Tests](https://img.shields.io/badge/Python%203-Automated%20Tests%20%26%20Analytics-blue.svg?logo=python)](https://python.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#license)

**QuickBite** is a modern, high-performance, full-stack food delivery web application. Designed with an ultra-responsive glassmorphic UI, an asynchronous Express & MongoDB REST API, robust authentication, real-time simulated order tracking, and an automated Python integration testing and business intelligence suite.

---

## 📸 Key Features

- **🎨 Modern Glassmorphic UI**: High-contrast dark theme with micro-interactions, responsive grid layout, and seamless mobile-to-desktop responsiveness.
- **🔍 Smart Catalog & Instant Search**: Multi-category filtering (Pizza, Burgers, Biryani, Sushi, South Indian, Desserts, Healthy) with live debounced search across restaurants and dishes.
- **📍 Regional Location Selector**: Native delivery area switcher across Tamil Nadu districts and localities (Chennai, Coimbatore, Madurai, etc.).
- **🛒 Dynamic Cart & Checkout Engine**:
  - Live quantity counters with subtotal, dynamic delivery fee, and 5% tax computation.
  - Coupon discount engine supporting promo codes like `QUICKBITE` (20% off) and `FIRST10` (10% off).
  - Fast-testing **"Demo Fill"** button for instant checkout population.
- **🔐 Secure User Authentication**: User registration and login protected by `bcryptjs` salted password hashing (10 salt rounds).
- **🛵 Live Order Simulation & Telemetry**: Step-by-step automated order progression (`Placed` ➔ `Confirmed` ➔ `Preparing` ➔ `Out for Delivery` ➔ `Delivered`) with dynamic ETA countdowns.
- **📦 Persistent Order History**: Full order timeline archived in MongoDB with status indicators and itemized breakdowns.
- **🛡️ Resilient Architecture & Graceful Fallback**: If MongoDB is offline, the backend automatically falls back to an in-memory cached dataset, ensuring zero downtime for demonstrations.
- **🧪 Automated Python Integration Test Suite**: 10-step REST API verification runner (`test_api.py`) verifying health, categories, restaurants, authentication, and order workflows.
- **📊 Business Intelligence & Analytics Engine**: Python CLI tool (`analytics.py`) that queries live API endpoints to compute platform gross volume, average order value (AOV), and bestselling items.

---

## 🛠️ Technology Stack

| Layer | Technologies | Role & Purpose |
|---|---|---|
| **Frontend** | HTML5, CSS3, Vanilla ES6 JavaScript | Semantic layout, glassmorphic styling, reactive client state, and zero framework overhead |
| **Backend** | Node.js, Express.js | Asynchronous RESTful API server, static asset host, and route controllers |
| **Database** | MongoDB & Mongoose ODM | Document-based persistence with schema validation for users, restaurants, categories, and orders |
| **Security** | `bcryptjs`, CORS, `dotenv` | Salted password hashing, cross-origin resource sharing, and environment isolation |
| **Testing & BI** | Python 3 (`urllib`, `json`) | Zero-dependency automated test runner and business KPI dashboard |

---

## 📐 System Architecture

```text
┌────────────────────────────────────────────────────────┐
│             Client Browser (HTML5 / CSS3 / ES6)         │
│  - Reactive State (Cart, Categories, Filter, GPS)       │
│  - View Router (Home, Restaurant, Checkout, Tracking)   │
└─────────────────────────┬──────────────────────────────┘
                          │ HTTP REST Requests (JSON)
                          ▼
┌────────────────────────────────────────────────────────┐
│             Node.js + Express.js API Server             │
│  - Middleware: CORS, JSON Parser, Static File Serving   │
│  - Routes: /api/auth, /api/restaurants, /api/orders    │
│  - Resilient Fallback Layer (Handles offline DB gracefully)
└───────────┬────────────────────────────┬───────────────┘
            │ Mongoose ODM               │ API Validation
            ▼                            ▼
┌──────────────────────────────┐ ┌────────────────────────┐
│      MongoDB Database        │ │  Python 3 Test Runner  │
│  - Users (bcrypt hashed)     │ │  & Analytics Engine    │
│  - Restaurants & Menus       │ │  - test_api.py (10/10) │
│  - Categories & Orders       │ │  - analytics.py (KPIs) │
└──────────────────────────────┘ └────────────────────────┘
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) *(optional, fallback mode works automatically without it)*
- [Python 3](https://www.python.org/) *(optional, for running test & analytics suite)*

---

### 1. Clone the Repository
```bash
git clone https://github.com/SEJONE4678/quickbite-.git
cd quickbite-
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory (or use the preconfigured defaults):
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/quickbite
```

---

### 4. Running the Application

#### Option A: Quick Start (Runs Immediately)
The server starts instantly. If MongoDB is not yet running, it automatically operates in local fallback mode:
```bash
npm start
```
Then visit **[http://localhost:5000](http://localhost:5000)** in your browser.

---

#### Option B: Full-Stack Mode with MongoDB Persistence

1. **Start MongoDB**:
   ```bash
   npm run mongo
   ```
2. **Seed Initial Categories & Menus**:
   ```bash
   npm run seed
   ```
3. **Start the Express Server**:
   ```bash
   npm start
   ```
4. **Access the App**: Navigate to [http://localhost:5000](http://localhost:5000).

---

### 5. Running the Python Test & Analytics Suite

While the server is running on `http://localhost:5000`, open another terminal window:

- **Run 10-Step Automated API Tests**:
  ```bash
  python test_api.py
  ```
  *Output:*
  ```text
  =================================================================
    [+] QuickBite Full-Stack Automated Test Suite (Python 3)
  =================================================================
    [PASS] API Health & DB Connectivity
    [PASS] Fetch Categories (/api/categories)
    [PASS] Fetch All Restaurants (/api/restaurants)
    [PASS] Filter Restaurants by Category (/api/restaurants?category=pizza)
    [PASS] Fetch Single Restaurant (/api/restaurants/r1)
    [PASS] User Registration (/api/auth/register)
    [PASS] User Authentication (/api/auth/login)
    [PASS] Create Order (/api/orders)
    [PASS] Fetch Order History (/api/orders)
    [PASS] Update Order Status (/api/orders/:id/status)
  =================================================================
    Summary: 10/10 Tests Passed (100.0%)
  =================================================================
  ```

- **Run Platform Business Analytics**:
  ```bash
  python analytics.py
  ```
  *Calculates live Gross Platform Volume, Net Volume, Average Order Value (AOV), and Top Bestsellers.*

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Healthcheck and MongoDB connection status |
| `POST` | `/api/auth/register` | Register new user with bcrypt-hashed password |
| `POST` | `/api/auth/login` | Authenticate user credentials |
| `GET` | `/api/categories` | Retrieve all food categories |
| `GET` | `/api/restaurants` | List restaurants (supports `?category=` and `?search=` queries) |
| `GET` | `/api/restaurants/:id` | Fetch detailed restaurant profile and menu |
| `GET` | `/api/orders` | Fetch recent order history |
| `POST` | `/api/orders` | Place a new order with items, total, and delivery address |
| `PATCH` | `/api/orders/:id/status` | Update order tracking lifecycle state |

---

## 📂 Project Directory Structure

```text
quickbite-/
├── models/
│   ├── Category.js         # Mongoose schema for food categories
│   ├── Order.js            # Mongoose schema for orders and items
│   ├── Restaurant.js       # Mongoose schema for restaurant menus
│   └── User.js             # Mongoose schema for user accounts & auth
├── analytics.py            # Python KPI business analytics engine
├── app.js                  # Frontend client application logic & state
├── data.js                 # Fallback offline catalog data
├── index.html              # Single-page application entry point
├── package.json            # Node.js project manifest & scripts
├── PRESENTATION_GUIDE.md   # Architectural & presentation reference guide
├── seed.js                 # Database populator for categories & restaurants
├── server.js               # Express API server & static host
├── start-mongo.js          # Cross-platform MongoDB daemon launcher
├── style.css               # Glassmorphic CSS design system
└── test_api.py             # Python automated integration test runner
```

---

## 📜 Available NPM Scripts

| Command | Action |
|---|---|
| `npm start` | Launches Express server at `http://localhost:5000` |
| `npm run dev` | Starts server in development mode |
| `npm run mongo` | Launches local MongoDB daemon using `start-mongo.js` |
| `npm run seed` | Seeds categories and restaurants into MongoDB |

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
