# 🔗 URL Shortener API

A production-ready REST API for shortening URLs — featuring custom aliases, link expiry, click analytics with geo-tracking, JWT authentication, and Redis caching.

---

## 📦 Tech Stack

| Category | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js v5 |
| Database | MongoDB + Mongoose |
| Validation | Zod |
| Auth | JWT + bcrypt |
| ID Generation | nanoid |
| Geo Lookup | geoip-lite |
| Caching | Redis (ioredis) |
| Security | Helmet + express-rate-limit |
| Logging | Morgan |
| Misc | cors, cookie-parser, valid-url, dotenv |

---

## ✨ Features

- Shorten long URLs with auto-generated or custom aliases
- Link expiry — expired links return `410 Gone`
- Click tracking on every redirect
- Per-click analytics: IP, User-Agent, country, and timestamp
- JWT-based authentication with secure cookie support
- User dashboard — manage all your links in one place
- Redis caching for fast redirects (cache-first strategy)
- Rate limiting and security headers out of the box
- Zod schema validation on all request bodies

---

## 📁 Project Structure

```
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── url.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── rateLimit.middleware.js
│   │   └── validate.middleware.js
│   ├── models/
│   │   ├── user.model.js
│   │   └── url.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── url.routes.js
│   ├── config/
│   │   ├── db.js
│   │   └── redis.js
│   └── utils/
│       └── generateShortCode.js
├── app.js
├── server.js
└── package.json
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/urlshortener
JWT_SECRET=your_jwt_secret_here
BASE_URL=http://localhost:5000
REDIS_URL=redis://localhost:6379
```

---

## 🛠️ Installation & Setup

```bash
# Clone the repository
git clone https://github.com/fmitesh007/url_shortner_backend.git
cd url_shortner_backend

# Install dependencies
npm install

# Start the development server
npm run dev
```

> Make sure MongoDB and Redis are running locally before starting the server.

---

## 🔐 Auth Endpoints

### Register

```
POST /api/auth/register
```

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully"
}
```

---

### Login

```
POST /api/auth/login
```

```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5..."
}
```

> All `/api/url` routes require `Authorization: Bearer <token>` in the request header.

---

## 🌐 URL Endpoints

### Create Short URL

```
POST /api/url
```

```json
{
  "originalUrl": "https://example.com/some/very/long/url",
  "customAlias": "my-link",
  "expiresAt": "2026-04-01T00:00:00Z"
}
```

`customAlias` and `expiresAt` are optional. If no alias is provided, one is auto-generated using nanoid.

**Response:**

```json
{
  "success": true,
  "data": {
    "originalUrl": "https://example.com/some/very/long/url",
    "shortCode": "my-link",
    "shortUrl": "http://localhost:5000/my-link",
    "expiresAt": "2026-04-01T00:00:00Z"
  }
}
```

---

### Redirect

```
GET /:shortCode
```

Checks Redis first, falls back to MongoDB. Increments the click counter and records analytics on every hit.

- Expired link → `410 Gone`
- Unknown short code → `404 Not Found`
- Valid link → browser redirect (no JSON response)

---

### Get URL Details

```
GET /api/url/:shortCode
```

**Response:**

```json
{
  "success": true,
  "data": {
    "originalUrl": "https://example.com",
    "shortUrl": "http://localhost:5000/my-link",
    "clicks": 12,
    "createdAt": "2026-03-25T10:00:00Z",
    "expiresAt": "2026-04-01T00:00:00Z"
  }
}
```

---

### Get All URLs (User Dashboard)

```
GET /api/url
```

Returns all URLs created by the authenticated user.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "shortCode": "my-link",
      "shortUrl": "http://localhost:5000/my-link",
      "clicks": 20,
      "createdAt": "2026-03-25T10:00:00Z"
    }
  ]
}
```

---

### Get Analytics

```
GET /api/url/:shortCode/analytics
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalClicks": 100,
    "devices": ["mobile", "desktop"],
    "countries": ["India", "US"]
  }
}
```

---

### Delete URL

```
DELETE /api/url/:shortCode
```

**Response:**

```json
{
  "success": true,
  "message": "Deleted successfully"
}
```

---

## 🗄️ Database Schema

### URL Model

```js
{
  originalUrl: String,
  shortCode:   { type: String, unique: true },
  shortUrl:    String,
  clicks:      { type: Number, default: 0 },
  expiresAt:   Date,
  userId:      ObjectId,
  analytics: [
    {
      ip:        String,
      userAgent: String,
      country:   String,
      timestamp: Date
    }
  ],
  createdAt: { type: Date, default: Date.now }
}
```

### User Model

```js
{
  name:      String,
  email:     { type: String, unique: true },
  password:  String,   // hashed with bcrypt
  createdAt: { type: Date, default: Date.now }
}
```

---

## ⚡ Redis Caching Strategy

```
GET /:shortCode
      │
      ├── Redis HIT  ──► redirect immediately
      │
      └── Redis MISS ──► query MongoDB ──► cache result ──► redirect
```

Cache entries are invalidated on link deletion or expiry.

---

## 🛡️ Middleware

| Middleware | Purpose |
|---|---|
| `helmet` | Secure HTTP response headers |
| `morgan` | HTTP request logging |
| `express-rate-limit` | Abuse and brute-force protection |
| `cors` | Cross-origin request handling |
| `cookie-parser` | Cookie parsing support |
| `auth.middleware` | JWT verification on protected routes |
| `validate.middleware` | Zod schema validation on request bodies |

---

## ❌ Error Responses

| Status | Meaning |
|---|---|
| `400` | Validation error or bad input |
| `401` | Unauthorized — missing or invalid token |
| `404` | Short code not found |
| `409` | Custom alias already in use |
| `410` | Link has expired |
| `500` | Internal server error |

---

## 📄 License

ISC
