# ⚡ Quick Start Guide - Dwell KE

## 5-Minute Setup

### Step 1: Install Dependencies ✓
```bash
npm install
```
(Already done!)

### Step 2: Create `.env.local` File

In the root folder, create a file named `.env.local` and add:

```env
# Clerk - Get from https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Neon - Get from https://neon.tech
DATABASE_URL=

# Cloudinary - Get from https://cloudinary.com
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# PesaPal - Get from https://pesapal.com
NEXT_PUBLIC_PESAPAL_CONSUMER_KEY=
NEXT_PUBLIC_PESAPAL_CONSUMER_SECRET=

# Admin Users (Clerk IDs, comma-separated)
NEXT_PUBLIC_ADMIN_CLERK_IDS=
```

### Step 3: Generate Prisma Client & Run Migrations

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations (creates all tables)
npm run prisma:migrate
```

This creates all your tables in Neon PostgreSQL.

### Step 4: Start Development Server

```bash
npm run dev
```

Visit: **http://localhost:3000**

---

## 🎯 Test the Features

### Home Page
- `http://localhost:3000/` - Beautiful landing page

### Authentication
- `http://localhost:3000/auth/login` - Login page (with 3D scene)
- `http://localhost:3000/auth/signup` - Signup page (with multi-step form)

### Marketplace
- `http://localhost:3000/marketplace` - Browse properties

### Dashboards
- `http://localhost:3000/dashboard/tenant` - Tenant dashboard
- `http://localhost:3000/dashboard/landlord` - Landlord dashboard
- `http://localhost:3000/dashboard/landlord/create-property` - Create property
- `http://localhost:3000/admin` - Admin panel (if you're an admin)

---

## 🔧 Service Setup (Choose Your Own Order)

Pick whichever service you want to set up first:

### 🔐 Clerk Authentication
1. Go to https://dashboard.clerk.com
2. Create new application
3. Copy your keys to `.env.local`
4. Go to **Settings → Webhooks**
5. Create endpoint: `http://localhost:3000/api/clerk/webhook`
6. Copy webhook secret to `.env.local`

### 📦 Neon Database
1. Go to https://neon.tech
2. Create new project
3. Copy connection string to `.env.local` as `DATABASE_URL`
4. Run: `pnpm db:push`

### 🖼️ Cloudinary Images
1. Go to https://cloudinary.com
2. Get your Cloud Name
3. Create upload preset named `dwell_ke` (Unsigned)
4. Get API Key and Secret
5. Add to `.env.local`

### 💳 PesaPal Payments
1. Go to https://pesapal.com
2. Get Consumer Key and Secret
3. Set callback URL: `http://localhost:3000/api/pesapal/callback`
4. Add to `.env.local`

---

## ✅ Checklist

- [ ] Created `.env.local` file
- [ ] Added Clerk keys
- [ ] Added Neon DATABASE_URL
- [ ] Added Cloudinary credentials
- [ ] Added PesaPal keys
- [ ] Ran `pnpm db:push`
- [ ] Server running with `pnpm dev`
- [ ] Visited http://localhost:3000

---

## 🎨 What You'll See

### Landing Page
- Animated hero section
- 4 feature cards
- Call-to-action section
- Footer with links

### Login Page
- 50/50 split design
- Form on left
- Animated 3D scene on right
- Email/password authentication

### Marketplace
- Property grid
- Search filters
- Property cards with images
- Quick property info

### Admin Dashboard
- System statistics
- User management
- Property moderation
- Payment tracking
- Reports and analytics

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'svix'"
**Solution**: Already installed, just restart the server

### Error: "Publishable key not valid"
**Solution**: Add your Clerk `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` to `.env.local`

### Database connection fails
**Solution**: Check `DATABASE_URL` is correct, verify Neon project is active

### Images not uploading
**Solution**: Check Cloudinary upload preset exists and is named `dwell_ke`

---

## 📚 Full Documentation

For detailed setup: Read `SETUP_GUIDE.md`
For complete feature overview: Read `FULLSTACK_BUILD_COMPLETE.md`

---

## 🚀 You're All Set!

Your full-stack platform is ready. Just connect the services and you're good to go!

**Questions?** Check the docs or see the code comments for help.
