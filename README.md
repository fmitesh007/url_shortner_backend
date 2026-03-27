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
| Caching | Upstash Redis (ioredis) |
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
│   ├── config/
│   │   ├── db.js
│   │   └── redis.js
│   ├── controllers/
│   │   ├── urlController.js
│   │   └── userController.js
│   ├── middlewares/
│   │   ├── auth.js
│   │   ├── validateUrl.js
│   │   └── validateUser.js
│   ├── models/
│   │   ├── urlModel.js
│   │   └── userModel.js
│   ├── routes/
│   │   ├── shortRoute.js
│   │   ├── urlRoutes.js
│   │   └── userRoutes.js
│   └── utils/
│       ├── isExpired.js
│       ├── updateAnalytics.js
│       └── userValidater.js
├── .env
├── app.js
├── server.js
└── package.json
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGOURL=mongodb://localhost:27017/urlshortener
BASE_URL=http://localhost:5000
JWTSECERET=your_jwt_secret_here
UPSTASH_REDIS_REST_URL=https://your-upstash-redis-url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
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

> Make sure MongoDB is running locally (or use a hosted URI). Redis is handled via Upstash — no local setup needed.

---

## 🔐 Auth Endpoints

Routes served by `userRoutes.js`

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

Routes served by `urlRoutes.js`

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

Route served by `shortRoute.js`

```
GET /:shortCode
```

Checks Redis first, falls back to MongoDB. Increments the click counter and records analytics (IP, User-Agent, country via geoip-lite) on every hit.

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

### URL Model (`urlModel.js`)

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

### User Model (`userModel.js`)

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

| File | Purpose |
|---|---|
| `auth.js` | JWT verification on protected routes |
| `validateUrl.js` | Zod validation for URL request bodies |
| `validateUser.js` | Zod validation for auth request bodies |
| `helmet` | Secure HTTP response headers |
| `morgan` | HTTP request logging |
| `express-rate-limit` | Abuse and brute-force protection |
| `cors` | Cross-origin request handling |
| `cookie-parser` | Cookie parsing support |

---

## 🔧 Utilities

| File | Purpose |
|---|---|
| `isExpired.js` | Checks if a URL's `expiresAt` has passed |
| `updateAnalytics.js` | Records IP, User-Agent, and country on each redirect |
| `userValidater.js` | Shared Zod schemas for user input validation |

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

MIT
