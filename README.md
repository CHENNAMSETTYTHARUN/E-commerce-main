# Stackly — Modern E-Commerce Platform

A feature-rich, responsive modern e-commerce storefront with client-side shopping capabilities and an optional FastAPI backend with SQLite authentication.

🌐 **Live Website**: [https://chennamsettytharun.github.io/E-commerce-main/](https://chennamsettytharun.github.io/E-commerce-main/)

---

## 🚀 Features

- **Storefront & Catalog**:
  - Featured products hero carousel, trending items, and category browsing
  - Product filtering, searching, and sorting (price, rating, popular)
  - Detailed product view with descriptions, stock status, and reviews
- **Cart & Wishlist**:
  - Real-time shopping bag counter with quantity adjustments and persistent cart storage
  - Wishlist management and product comparison matrix
- **User Authentication**:
  - Interactive Google & Microsoft Social Sign-In simulation
  - Secure Signup, Sign In, and Logout with credential validation
  - Persistent user session in browser `localStorage`
  - Optional FastAPI REST backend integration (`/api/auth`) with SQLite and bcrypt
- **Customer Hub**:
  - Contact Us page, order tracking interface, and interactive feedback submission
- **Responsive Design**:
  - Mobile-first, fully responsive design optimized for phones, tablets, and desktops

---

## 💻 Tech Stack

- **Frontend**: HTML5, Modern CSS3 (Flexbox & Grid), Vanilla JavaScript (Zero external runtime dependencies)
- **Backend (Optional Local / Cloud API)**: Python 3.9+, FastAPI, SQLAlchemy, SQLite, Uvicorn, Passlib (bcrypt), PyJWT

---

## 🛠️ Running Locally

### Option 1: Static Frontend (No Python required)
Simply double-click `index.html` or serve using any static web server:
```bash
python -m http.server 8000
```
Open [http://localhost:8000](http://localhost:8000) in your browser.

### Option 2: Full-Stack with FastAPI Backend
1. Install dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
2. Start the backend:
   ```bash
   python run.py
   # Or run start_backend.bat on Windows
   ```
3. Open [http://localhost:8000](http://localhost:8000) to view the site, or [http://localhost:8000/docs](http://localhost:8000/docs) to explore the Swagger API.
