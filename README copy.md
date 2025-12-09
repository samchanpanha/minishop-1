# MiniShop E-Commerce Website

A comprehensive e-commerce website with **Stripe payment integration** and **Telegram bot notifications**

## 🚀 Features

### **Customer Features:**
- 📦 Product browsing and search
- 🛒 Shopping cart with add/update/remove functionality
- 💳 Secure Stripe payment processing
- 📧 Guest checkout
- 📱 Mobile-responsive design
- 📧 Order confirmation

### **Admin Features:**
- 🔧 Product management (CRUD)
- 📊 Order management and viewing
- 📈 Sales statistics
- 🔍 Product search and filtering
- 📦 Stock management

### **Payment & Notifications:**
- 💳 **Stripe Integration** - Secure payment processing
- 🤖 **Telegram Bot** - Real-time order notifications
- 📱 **Bot Commands** - Order management via Telegram
- 🔔 **Webhook Handling** - Payment status updates

## � Screenshots

### Homepage - Product Listing
![Homepage](docs/screenshots/homepage.png)

### Product Details
![Product Details](docs/screenshots/product-detail.png)

### Payment Page (Stripe Integration)
![Payment Page](docs/screenshots/payment.png)

### Admin Settings (Configuration)
![Admin Settings](docs/screenshots/admin-settings.png)

## �🛠 Technology Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** SQLite with Prisma ORM
- **Payment:** Stripe
- **Notifications:** Telegram Bot (Integrated)
- **Icons:** Lucide React

## 📋 Setup Instructions

### 1. **Environment Variables**

Copy `.env.example` to `.env` and configure:

```bash
# Database
DATABASE_URL="file:./dev.db"

# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
TELEGRAM_CHAT_ID="123456789"

# Base URL for webhooks (your deployed domain)
NEXT_PUBLIC_BASE_URL="https://yourdomain.com"
```

### 2. **Stripe Setup**

1. Create a [Stripe Account](https://stripe.com)
2. Get API keys from Dashboard → Developers → API keys
3. Create webhook endpoint: `https://yourdomain.com/api/payments/webhook`
4. Configure webhook events: `payment_intent.succeeded`, `payment_intent.payment_failed`

### 3. **Telegram Bot Setup**

1. Create a bot via [@BotFather](https://t.me/botfather)
2. Get bot token and add to `.env`
3. Get your chat ID (send message to @userinfobot)
4. Add chat ID to `.env`
5. Set webhook: `GET https://yourdomain.com/api/telegram`

### 4. **Installation**

```bash
# Install dependencies
npm install

# Setup database
npm run db:push

# Seed sample products
npx tsx seed-products.ts

# Start application
npm run dev
```

## 🌐 Deployment

### **Single Deployment**
Deploy to any Node.js hosting platform:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Railway**
- **DigitalOcean**
- **Heroku**

### **Post-Deployment Setup**
1. Set environment variables in your hosting platform
2. Configure Stripe webhook URL
3. Set Telegram webhook: `GET https://yourdomain.com/api/telegram`

## 📱 Telegram Bot Commands

- `/start` - Welcome message
- `/help` - Show all commands
- `/orders` - View recent orders
- `/order <id>` - View specific order
- `/stats` - View sales statistics

Example: `/order 123`

## 💳 Payment Flow

1. Customer adds items to cart
2. Proceeds to checkout and fills information
3. Redirected to secure Stripe payment page
4. Payment processed via Stripe
5. Webhook updates order status
6. Telegram notification sent
7. Customer redirected to success page

## 🔧 API Endpoints

### **Products:**
- `GET /api/products` - List all products
- `POST /api/products` - Create product
- `GET /api/products/[id]` - Get product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### **Orders:**
- `GET /api/orders` - List all orders
- `POST /api/orders` - Create order
- `GET /api/orders/[id]` - Get order

### **Payments:**
- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/payments/webhook` - Stripe webhook handler

### **Telegram Bot:**
- `POST /api/telegram` - Bot command handler
- `GET /api/telegram` - Webhook setup

## 🎨 Pages

### **Public:**
- `/` - Home page with products
- `/product/[id]` - Product details
- `/cart` - Shopping cart
- `/checkout` - Customer information
- `/payment` - Stripe payment form
- `/payment/success` - Payment confirmation
- `/payment/cancelled` - Payment cancelled

### **Admin:**
- `/admin` - Product management dashboard
- `/admin/product/new` - Add new product
- `/admin/product/[id]` - Edit product

## 📁 Project Structure

```
minishop-unified/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── products/          # Product API
│   │   │   ├── orders/           # Order API
│   │   │   ├── payments/         # Stripe API
│   │   │   └── telegram/         # Telegram Bot API
│   │   ├── payment/             # Payment pages
│   │   ├── admin/               # Admin pages
│   │   └── (pages)/            # Public pages
│   ├── lib/
│   │   ├── db.ts              # Database connection
│   │   ├── stripe.ts          # Stripe configuration
│   │   └── telegram-bot.ts    # Telegram notifications
│   └── components/ui/          # UI components
├── prisma/
│   └── schema.prisma          # Database schema
├── .env.example              # Configuration template
├── README.md                # This file
└── package.json             # Dependencies
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

MIT License - feel free to use for commercial projects.

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Use Telegram bot commands for order management
- Check the documentation

---

**Built with ❤️ using Next.js, Stripe, and Telegram - All in One Unified Project!**