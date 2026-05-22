# Dwell KE - Full-Stack Setup Guide

## 🚀 Prerequisites

Make sure you have the following setup before starting:

1. **Clerk Account** - https://dashboard.clerk.com
2. **Neon PostgreSQL Database** - https://neon.tech
3. **Cloudinary Account** - https://cloudinary.com
4. **PesaPal Account** - https://pesapal.com

---

## 📋 Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
CLERK_WEBHOOK_SECRET=your_webhook_secret

# Neon Database
DATABASE_URL=postgresql://user:password@ep-xxxx.neon.tech/dwellke

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# PesaPal Payments
NEXT_PUBLIC_PESAPAL_CONSUMER_KEY=your_consumer_key
NEXT_PUBLIC_PESAPAL_CONSUMER_SECRET=your_consumer_secret

# Admin Role Management
NEXT_PUBLIC_ADMIN_CLERK_IDS=clerk_id_1,clerk_id_2
```

---

## 🔐 Clerk Setup

### 1. Create a New Application

- Go to https://dashboard.clerk.com
- Create a new application for Dwell KE
- Choose "Next.js" as the framework

### 2. Get Your Keys

- Copy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
- Add them to `.env.local`

### 3. Configure Sign-In & Sign-Up URLs

- Go to **Settings → Paths**
- Sign-in URL: `http://localhost:3000/auth/login`
- Sign-up URL: `http://localhost:3000/auth/signup`

### 4. Set Up Webhooks (for user syncing)

- Go to **Settings → Webhooks**
- Create a new endpoint: `http://localhost:3000/api/clerk/webhook`
- Subscribe to: `user.created`, `user.deleted`
- Save the signing secret as `CLERK_WEBHOOK_SECRET`

### 5. Admin Role Management

- Get your Clerk User IDs for admins
- Add them to `.env.local` as `NEXT_PUBLIC_ADMIN_CLERK_IDS` (comma-separated)

Example: `NEXT_PUBLIC_ADMIN_CLERK_IDS=user_123,user_456`

---

## 🗄️ Neon Database Setup

### 1. Create a New Database

- Go to https://neon.tech
- Create a new project
- Copy the connection string (DATABASE_URL)
- Add it to `.env.local`

### 2. Generate Prisma Client & Run Migrations

```bash
# Generate Prisma client
npm run prisma:generate

# Create and run migrations
npm run prisma:migrate
```

This will create all necessary tables:
- `users` - User accounts synced with Clerk
- `properties` - Property listings
- `bookings` - Booking records
- `payments` - Payment transactions
- `reviews` - Property reviews
- `messages` - User messages
- `favorites` - User favorite properties
- `activity_logs` - Admin activity logs

---

## 🖼️ Cloudinary Setup

### 1. Create Account

- Go to https://cloudinary.com
- Sign up and create a new project
- Get your Cloud Name from the dashboard

### 2. Create Upload Preset

- Go to **Settings → Upload**
- Create a new upload preset named `dwell_ke`
- Set it to "Unsigned" for easier integration
- Copy your API Key and API Secret

### 3. Add to .env.local

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 💳 PesaPal Setup

### 1. Create PesaPal Account

- Go to https://pesapal.com
- Sign up as a merchant
- Get your Consumer Key and Consumer Secret from the dashboard

### 2. Configure Callback URL

- Set callback URL to: `http://localhost:3000/api/pesapal/callback`
- This is where payment confirmations are sent

### 3. Add to .env.local

```env
NEXT_PUBLIC_PESAPAL_CONSUMER_KEY=your_consumer_key
NEXT_PUBLIC_PESAPAL_CONSUMER_SECRET=your_consumer_secret
```

---

## 🏃 Running the Application

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Database

```bash
pnpm db:push
```

### 3. Start Development Server

```bash
pnpm dev
```

Visit http://localhost:3000

---

## 📌 Key Features

### ✨ Authentication
- **Sign Up / Sign In** - Full Clerk integration with split design (50/50 form + 3D scene)
- **Role-Based Access** - Tenant, Landlord, Admin roles
- **Admin Detection** - Automatic admin panel access via environment variables

### 🏠 Property Management
- **Create Properties** - Landlords can upload properties with images via Cloudinary
- **Property Listing** - Search and filter properties by location, type, price
- **Property Details** - Full property information, amenities, and image gallery

### 💰 Payments
- **PesaPal Integration** - Secure payment processing for bookings
- **Payment Tracking** - Admin dashboard with payment history
- **Invoice Generation** - Automated invoice creation

### 👥 User Management
- **Tenant Dashboard** - View bookings, favorites, messages
- **Landlord Dashboard** - Manage properties, view earnings, track bookings
- **Admin Dashboard** - Comprehensive platform management

### 🖼️ Image Uploads
- **Cloudinary Integration** - Optimized image storage and delivery
- **Multiple Uploads** - Support for multiple property images
- **Auto Optimization** - Images automatically optimized for web

---

## 🛠️ API Routes

### Properties
- `GET /api/properties` - List all properties (with filters)
- `POST /api/properties` - Create new property (landlord only)
- `GET /api/properties/[id]` - Get property details

### Users
- `GET /api/users` - Get current user
- `POST /api/users` - Create/sync user with Clerk

### Payments
- `POST /api/payments/initiate` - Initiate payment
- `GET /api/pesapal/callback` - Payment callback handler

### Webhooks
- `POST /api/clerk/webhook` - Clerk webhook for user sync

---

## 📱 Mobile Responsive

All pages are fully responsive:
- Mobile-first design
- Touch-friendly buttons
- Responsive images
- Mobile navigation

---

## 🔒 Security

- ✅ Clerk authentication for secure user management
- ✅ Environment variables for sensitive data
- ✅ Database validation and sanitization
- ✅ HTTPS-only in production
- ✅ Row-level security ready in database

---

## 🚀 Deployment

### Deploy to Vercel

```bash
vercel
```

Make sure to add all environment variables in Vercel's Project Settings → Environment Variables

---

## 🐛 Troubleshooting

### Database Connection Issues
- Check `DATABASE_URL` is correct
- Ensure Neon project is active
- Verify whitelist IP in Neon settings

### Clerk Authentication Failing
- Verify API keys are correct
- Check webhook is configured
- Clear browser cookies and try again

### Images Not Uploading
- Confirm Cloudinary upload preset is "Unsigned"
- Check `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is correct
- Verify upload folder is accessible

### Payment Issues
- Check PesaPal credentials are correct
- Verify callback URL is set in PesaPal
- Review payment logs in admin dashboard

---

## 📚 Documentation Links

- [Clerk Docs](https://clerk.com/docs)
- [Neon Docs](https://neon.tech/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Next.js Docs](https://nextjs.org/docs)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [PesaPal Docs](https://pesapal.com/api)

---

## ✅ Testing Checklist

- [ ] Set up all environment variables
- [ ] Database schema pushed successfully
- [ ] Clerk authentication working
- [ ] Can create account
- [ ] Can log in
- [ ] Can view properties
- [ ] Landlord can create property
- [ ] Images upload to Cloudinary
- [ ] Admin can access admin panel
- [ ] Payment initiation works

---

## 🎉 You're Ready!

Your full-stack Dwell KE platform is now set up and ready to use. Start by signing up, creating properties, and testing the complete flow!

For any issues, check the console logs and error messages for debugging information.
