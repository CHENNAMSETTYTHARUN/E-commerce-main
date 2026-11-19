# Stackly E-Commerce Backend

A FastAPI backend for the Stackly E-commerce platform, implementing user authentication with SQLite persistence, bcrypt password hashing, JWT tokens, and OAuth 2.0 (Google & Microsoft).

---

## 🌟 Features

- **User Signup (`POST /api/auth/signup`)**:
  - Validates user input (name, valid email, minimum 8-character password).
  - Hashes passwords securely using `bcrypt`.
  - Saves user to persistent SQLite database.
  - Returns JWT bearer access token and user profile.
- **User Login (`POST /api/auth/login`)**:
  - Verifies user credentials.
  - Generates secure JWT access tokens.
- **User Logout (`POST /api/auth/logout`)**:
  - Invalidates active user session and blacklists the token.
- **Current User Profile (`GET /api/auth/me`)**:
  - Protected endpoint requiring `Authorization: Bearer <token>`.
- **Google & Microsoft Authentication**:
  - Direct endpoint (`POST /api/auth/oauth/social`) for one-click popup login.
  - Real OAuth 2.0 redirect flow (`/api/auth/oauth/google` and `/api/auth/oauth/microsoft`).
  - Interactive OAuth simulation consent screen when credentials are not configured in `.env`, enabling instant out-of-the-box testing!
- **Static Website Hosting**:
  - Mounts the frontend directory directly at `http://localhost:8000`.
  - Also fully supports separate frontend hosting via CORS headers.
- **Interactive Documentation**:
  - Interactive Swagger UI available at `http://localhost:8000/docs`.
  - ReDoc available at `http://localhost:8000/redoc`.

---

## 🚀 Quick Start

### 1. Requirements
Ensure Python 3.9+ is installed:
```bash
python --version
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Start the Server
Run from the `backend/` folder:
```bash
python run.py
```
Or directly with uvicorn:
```bash
uvicorn main:app --reload --port 8000
```

Open your browser to:
- **Website Home**: [http://localhost:8000](http://localhost:8000)
- **Sign In Page**: [http://localhost:8000/signin.html](http://localhost:8000/signin.html)
- **Sign Up Page**: [http://localhost:8000/signup.html](http://localhost:8000/signup.html)
- **API Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🔑 Setting up Real Google & Microsoft OAuth (Optional)

If `GOOGLE_CLIENT_ID` or `MICROSOFT_CLIENT_ID` are left blank in `.env`, the backend will automatically use its built-in interactive OAuth simulation screen.

To use real Google or Microsoft accounts:
1. Open `.env` in the `backend/` directory.
2. For Google:
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
   - Create an OAuth 2.0 Web Client ID.
   - Set Authorized Redirect URI to `http://localhost:8000/api/auth/oauth/google/callback`.
   - Paste `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` into `.env`.
3. For Microsoft:
   - Go to [Azure Portal / Microsoft Entra ID](https://portal.azure.com/).
   - Register a new application with redirect URI `http://localhost:8000/api/auth/oauth/microsoft/callback`.
   - Paste `MICROSOFT_CLIENT_ID` and `MICROSOFT_CLIENT_SECRET` into `.env`.

---

## 🗄️ Database
- The backend uses SQLite located at `backend/ecommerce.db`.
- Database schema is automatically created on startup.
