# 🐾 MyPets Store — Backend API

A full-featured **e-commerce REST API** for a pet food & supplies store — built with real-world architecture decisions, security at every layer, and a complete shopping experience covering everything from authentication to order fulfillment.

---

## 🌐 Live API

```
https://my-pet-store-api.vercel.app
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js |
| Framework | Express.js v5 |
| Database | MongoDB + Mongoose |
| Cache / Session | Redis |
| Authentication | JWT (jsonwebtoken) |
| Payment | Stripe |
| File Storage | Cloudinary |
| Email | Nodemailer (Gmail SMTP) |
| Validation | Joi |
| Security | Helmet, bcrypt, AES-256-CBC |
| Rate Limiting | express-rate-limit |
| Scheduled Jobs | node-cron |
| Deployment | Vercel |

---

## 🏗️ Project Structure

```
src/
├── app.controller.js
├── main.js
├── common/
│   ├── cron/
│   │   └── order.cron.js
│   ├── enum/
│   │   ├── multer.enum.js
│   │   ├── order.enum.js
│   │   ├── product.enum.js
│   │   └── user.enum.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── multer.js
│   │   ├── schema.js
│   │   └── schema/
│   │       ├── auth.schema.js
│   │       ├── cart.schema.js
│   │       ├── coupon.schema.js
│   │       ├── order.schema.js
│   │       ├── review.schema.js
│   │       └── wishlist.schema.js
│   ├── stripe/
│   │   └── stripe.js
│   └── utils/
│       ├── cloudinary.js
│       ├── productRatingUpdate.js
│       ├── response.success.js
│       ├── total.price.js
│       ├── email/
│       │   ├── email.otp.js
│       │   ├── email.template.js
│       │   └── send.email.js
│       └── security/
│           ├── encrypt.security.js
│           └── hash.security.js
├── DB/
│   ├── connectionDB.js
│   ├── db.service.js
│   ├── models/
│   │   ├── cart.model.js
│   │   ├── coupon.model.js
│   │   ├── order.model.js
│   │   ├── product.model.js
│   │   ├── review.model.js
│   │   ├── user.model.js
│   │   └── wishlist.model.js
│   └── redis/
│       ├── redis.db.js
│       └── redis.service.js
└── modules/
    ├── cart/
    ├── coupons/
    ├── orders/
    ├── products/
    ├── reviews/
    ├── users/
    └── wishlist/
```

---

## 🔐 Security

- **AES-256-CBC encryption** for sensitive user data (phone numbers)
- **Bcrypt hashing** with 12 salt rounds for passwords
- **JWT authentication** for all protected routes
- **OTP system** with 2-minute expiration, resend cooldown, and auto-block after 3 failed attempts (5-minute block) — all managed via Redis TTL
- **Rate limiting** — 200 requests per 15 minutes per IP via `express-rate-limit`
- **Helmet** for HTTP security headers
- **Joi validation** schemas on every endpoint

---

## 📦 Modules

### Auth
- Sign Up with full validation
- Sign In with JWT token issuance
- Forget Password → OTP via email → Confirm OTP → Reset Password (3-step flow)
- Update Password (authenticated)
- New password must differ from current password on reset

### User
- Get Profile (phone returned decrypted)
- Update Profile
- Address Book — add, get, update, delete with default address logic (max 10 addresses per user)

### Products
- Get All Products with optional pagination
- Get Specific Product
- Filter Products by category, name (partial match), min/max price with optional pagination
- Products shuffled using a seeded random algorithm

### Reviews
- Get all reviews for a product (populated with user info, sorted newest first)
- Add Review — one review per user per product
- Update Review — own review only
- Delete Review — own review only
- Product `rating` auto-recalculated as average after every add / update / delete

### Wishlist
- Add to Wishlist — duplicate prevention via unique DB index on (user + product)
- Get Wishlist — populated with full product data
- Remove from Wishlist
- Clear Wishlist

### Cart
- Add to Cart — creates cart if not exists, increments quantity if product already in cart
- Get Cart — populated with product name, price, and image
- Update Cart Quantity — setting quantity ≤ 0 removes the product automatically
- Remove from Cart
- Clear Cart
- `totalPrice` recalculated automatically after every operation

### Coupons
- Apply Coupon — validates and applies discount directly on the cart, updates `couponCode`, `discountAmount`, and `discountedPrice`
- Remove Coupon — resets cart coupon fields and frees the coupon for reuse
- Supports two discount types: **percentage** and **fixed amount**
- Each user can use each coupon **only once**
- Coupon validation covers: expiry date, max usage limit, and per-user duplicate usage

### Orders
- Create Order — supports **cash on delivery** and **card payment via Stripe**
- If a coupon was applied on the cart, the order automatically uses `discountedPrice`
- For card payments, a Stripe Checkout session is created — each product's price in Stripe reflects the post-discount price proportionally
- Stripe Webhook handler creates the order and clears the cart after confirmed payment
- Duplicate webhook event protection via `stripeSessionId`
- Get My Orders — sorted by most recent
- Cancel Order — allowed only when status is `pending` or `confirmed`

### Automated Order Lifecycle (node-cron)
- Runs every hour
- Orders in `pending` status for more than **6 hours** → auto-confirmed
- Orders in `confirmed` status for more than **24 hours** → auto-shipped

---

## 🔄 Order Status Flow

```
pending → confirmed (auto after 6h) → shipped (auto 24h after confirmed) → delivered
    ↘                    ↘
     cancelled          cancelled
```

Cancellation is allowed only at `pending` or `confirmed` status.

---

## 🏷️ Coupon System

| Code | Type | Discount |
|------|------|----------|
| `MYPETSSTORE` | percentage | 100% |
| `ENG.DIAA ELDEEN` | percentage | 100% |
| `SAVE10` | percentage | 10% |
| `SAVE20` | percentage | 20% |
| `SAVE30` | percentage | 30% |
| `SAVE50` | percentage | 50% |
| `WELCOME15` | percentage | 15% |
| `PETS25` | percentage | 25% |
| `OFF50` | fixed | 50 EGP |
| `OFF100` | fixed | 100 EGP |
| `OFF200` | fixed | 200 EGP |
| `OFF500` | fixed | 500 EGP |

---

## 💳 Payment Flow

### Cash on Delivery
```
POST /orders → order created immediately → cart cleared
```

### Card (Stripe)
```
POST /orders → Stripe Checkout session created → URL returned to client
     ↓
User completes payment on Stripe
     ↓
POST /webhooks/stripe → order created → cart cleared
```

---

## 📧 OTP Flow

```
PATCH /users/forgetPassword  →  OTP sent to email (valid 2 min)
POST  /users/confirmPassword →  OTP verified, verification token saved in Redis (valid 5 min)
PATCH /users/resetPassword   →  new password set (must differ from current)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js
- MongoDB Atlas (or local)
- Redis instance
- Cloudinary account
- Stripe account
- Gmail account (for SMTP)

### Installation

```bash
git clone https://github.com/diaaeldeenn/myPetStore.git
cd myPetStore
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
PORT=5000
NODE_ENV=development

MONGO_URI=your_mongodb_atlas_uri
MONGO_LOCAL=mongodb://localhost:27017/myPetStore

Redis_URL=your_redis_url

JWT_SECRET=your_jwt_secret

ENCRYPTION_KEY=your_32_byte_encryption_key

GMAIL_USER=your_gmail@gmail.com
GMAIL_PASS=your_gmail_app_password

CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

CLIENT_URL=https://your-frontend-url.com
```

### Run

```bash
# Development
npm run dev

# Production
npm start
```

---

## 📋 API Documentation

Full Postman documentation covering all endpoints, request bodies, headers, params, and response examples:

🔗 **[View API Docs](https://documenter.getpostman.com/view/49715513/2sBXqFLhKk)**

---

## 📌 Quick Endpoint Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/users/signup` | No | Register |
| POST | `/users/signin` | No | Login |
| PATCH | `/users/forgetPassword` | No | Send OTP |
| POST | `/users/confirmPassword` | No | Verify OTP |
| PATCH | `/users/resetPassword` | No | Reset Password |
| PATCH | `/users/updatePassword` | Yes | Update Password |
| GET | `/users/profile` | Yes | Get Profile |
| PATCH | `/users/updateProfile` | Yes | Update Profile |
| POST | `/users/address` | Yes | Add Address |
| GET | `/users/address` | Yes | Get Addresses |
| PATCH | `/users/address/:addressId` | Yes | Update Address |
| DELETE | `/users/address/:addressId` | Yes | Remove Address |
| GET | `/products` | No | Get All Products |
| GET | `/products/filter` | No | Filter Products |
| GET | `/products/:productId` | No | Get Product |
| GET | `/products/:productId/reviews` | No | Get Reviews |
| POST | `/products/:productId/reviews` | Yes | Add Review |
| PATCH | `/products/:productId/reviews/:reviewId` | Yes | Update Review |
| DELETE | `/products/:productId/reviews/:reviewId` | Yes | Delete Review |
| POST | `/wishlist` | Yes | Add to Wishlist |
| GET | `/wishlist` | Yes | Get Wishlist |
| DELETE | `/wishlist/:productId` | Yes | Remove from Wishlist |
| DELETE | `/wishlist` | Yes | Clear Wishlist |
| POST | `/cart` | Yes | Add to Cart |
| GET | `/cart` | Yes | Get Cart |
| PATCH | `/cart` | Yes | Update Quantity |
| DELETE | `/cart/:productId` | Yes | Remove from Cart |
| DELETE | `/cart` | Yes | Clear Cart |
| POST | `/coupons/apply` | Yes | Apply Coupon |
| DELETE | `/coupons/remove` | Yes | Remove Coupon |
| POST | `/orders` | Yes | Create Order |
| GET | `/orders` | Yes | Get My Orders |
| PATCH | `/orders/:orderId/cancel` | Yes | Cancel Order |

---

## 👤 Author

**Eng. Diaa Eldeen**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue)](https://www.linkedin.com/in/diaaelseady)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-black)](https://github.com/diaaeldeenn)
