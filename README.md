# Dwell KE - Premium Property Management Platform

A modern, full-stack property rental platform built with Next.js 16, featuring a dark luxury aesthetic with glassmorphic design, seamless payment integration, and advanced admin controls. Tailored for the Kenyan market with PesaPal payment support.

## 🎯 Overview

Dwell KE is an innovative PropTech (Property Technology) solution that connects property owners (landlords) with tenants, providing a secure, transparent, and user-friendly platform for property discovery, booking, and management. Built with production-grade technology and Kenya-optimized integrations.

### Key Features

- **Authentication & User Management**
  - Clerk-based authentication with social login
  - Admin role detection via environment variables
  - Role-based access control (Tenant, Landlord, Admin)
  - Automatic user syncing from Clerk to database

- **Property Management**
  - Landlord dashboard for creating and managing properties
  - Cloudinary integration for image uploads and optimization
  - Advanced filtering and search functionality
  - Property verification system
  - Review and rating system

- **Booking System**
  - Seamless booking workflow
  - Calendar-based availability management
  - Booking status tracking (pending, confirmed, completed, cancelled)
  - Favorite properties functionality

- **Payment Integration**
  - PesaPal payment gateway (Kenya-optimized)
  - Secure payment processing
  - Payment status tracking
  - Transaction history and receipts

- **Admin Dashboard**
  - Comprehensive system analytics
  - User management and moderation
  - Property listing approval/rejection
  - Payment monitoring
  - Fraud detection
  - System health reports
  - Activity logging

- **Real-time Features**
  - Live messaging between users
  - Activity notifications
  - Real-time booking updates

- **UI/UX**
  - Dark luxury design with glassmorphism
  - Smooth animations and transitions
  - Fully responsive (mobile, tablet, desktop)
  - 3D animated authentication pages
  - Premium component library

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 with custom theme
- **Animations**: Framer Motion
- **3D Graphics**: React Three Fiber + Three.js
- **Form Handling**: React Hook Form
- **Image Management**: Next Cloudinary
- **State Management**: Zustand

### Backend
- **Runtime**: Node.js (via Next.js API Routes)
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma 5.20.0
- **Authentication**: Clerk
- **Payments**: PesaPal API
- **Image Storage**: Cloudinary CDN
- **Webhooks**: Svix (for Clerk events)

### Infrastructure & Deployment
- **Hosting**: Vercel
- **Database**: Neon (Serverless PostgreSQL)
- **Image CDN**: Cloudinary
- **Authentication Provider**: Clerk
- **Payment Gateway**: PesaPal

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ installed
- **npm** 9+ installed
- **PostgreSQL** database (via Neon)
- **Git** for version control

### Required API Keys/Accounts
1. [Clerk](https://clerk.com) - Authentication
2. [Neon](https://neon.tech) - PostgreSQL database
3. [Cloudinary](https://cloudinary.com) - Image management
4. [PesaPal](https://pesapal.com) - Payment processing

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/dwell-ke.git
cd dwell-ke
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your credentials:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Database
DATABASE_URL=postgresql://user:password@host/database

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# PesaPal Payments
NEXT_PUBLIC_PESAPAL_CONSUMER_KEY=your_consumer_key
NEXT_PUBLIC_PESAPAL_CONSUMER_SECRET=your_consumer_secret

# Admin Configuration (server-only)
ADMIN_CLERK_IDS=admin_clerk_id_1,admin_clerk_id_2

# Webhook Security
CLERK_WEBHOOK_SECRET=your_webhook_secret
```

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup instructions for each service.

### 4. Set Up Database

Generate Prisma client:

```bash
npm run prisma:generate
```

Run migrations to create database tables:

```bash
npm run prisma:migrate
```

Optional: View database with Prisma Studio:

```bash
npm run prisma:studio
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
dwell-ke/
├── app/
│   ├── (public)/              # Public pages
│   ├── auth/                  # Authentication pages (login, signup)
│   ├── dashboard/
│   │   ├── tenant/            # Tenant dashboard
│   │   ├── landlord/          # Landlord dashboard
│   │   └── admin/             # Admin dashboard
│   ├── marketplace/           # Property marketplace
│   ├── properties/[id]/       # Property detail pages
│   ├── api/                   # API routes
│   │   ├── properties/        # Property CRUD
│   │   ├── payments/          # Payment processing
│   │   ├── users/             # User management
│   │   ├── clerk/             # Clerk webhooks
│   │   └── pesapal/           # PesaPal callbacks
│   ├── layout.tsx             # Root layout with Clerk provider
│   └── globals.css            # Global styles & animations
├── components/
│   ├── Navigation.tsx         # Top navigation bar
│   ├── Footer.tsx             # Footer with links
│   ├── HeroSection.tsx        # Landing page hero
│   ├── FeaturesSection.tsx    # Features showcase
│   ├── CTASection.tsx         # Call-to-action section
│   ├── PropertyListing.tsx    # Property grid & filters
│   ├── PropertyForm.tsx       # Property creation form
│   ├── DashboardNav.tsx       # Dashboard navigation
│   ├── AdminNav.tsx           # Admin dashboard navigation
│   ├── StatsCard.tsx          # Statistics component
│   ├── GlassmorphicCard.tsx   # Reusable card component
│   ├── PremiumButton.tsx      # Button variants
│   ├── AuthScene3D.tsx        # 3D authentication scene
│   └── ui/                    # Shadcn UI components
├── lib/
│   ├── db.ts                  # Prisma client singleton
│   ├── admin.ts               # Admin utilities
│   ├── constants.ts           # App constants & navigation
│   ├── animations.ts          # Framer Motion presets
│   └── pesapal.ts             # PesaPal utilities
├── prisma/
│   └── schema.prisma          # Database schema
├── public/                    # Static assets
├── .env.example               # Environment variables template
├── .env.local                 # Local environment (git ignored)
├── QUICK_START.md             # Quick start guide
├── SETUP_GUIDE.md             # Detailed setup guide
└── README.md                  # This file
```

## 🗄️ Database Schema

### Core Tables

**users** - User accounts synced with Clerk
- id, clerkId, email, firstName, lastName
- role (tenant, landlord, admin)
- profileImage, phoneNumber, bio
- createdAt, updatedAt

**properties** - Property listings
- id, title, description, address, city, county
- price (per night), bedrooms, bathrooms, amenities
- images[], landlordId, verified, createdAt
- Relationships: landlord (User), bookings (Booking[]), reviews (Review[])

**bookings** - Booking records
- id, propertyId, tenantId, checkInDate, checkOutDate
- status (pending, confirmed, completed, cancelled)
- totalPrice, paymentStatus, createdAt
- Relationships: property, tenant, payment

**payments** - Payment transactions
- id, bookingId, amount, currency
- status (pending, completed, failed, refunded)
- pesapalOrderId, pesapalReference
- createdAt, updatedAt

**reviews** - Property reviews
- id, propertyId, tenantId, rating, comment
- createdAt, updatedAt

**messages** - User messages
- id, senderId, recipientId, content
- read, createdAt

**favorites** - Bookmarked properties
- id, tenantId, propertyId, createdAt

**activity_logs** - Admin action logs
- id, adminId, action, entityType, entityId
- details, createdAt

## 🔌 API Endpoints

### Properties
- `GET /api/properties` - List all properties with filters
- `POST /api/properties` - Create new property (landlord)
- `GET /api/properties/[id]` - Get property details

### Users
- `GET /api/users` - Get user profile
- `POST /api/users` - Create/sync user from Clerk

### Payments
- `POST /api/payments/initiate` - Initiate PesaPal payment
- `POST /api/pesapal/callback` - Handle payment callback

### Webhooks
- `POST /api/clerk/webhook` - Clerk user event handler

## 🔐 Authentication & Authorization

### Clerk Integration
- Social login (Google, Apple)
- Email/password authentication
- Multi-factor authentication support
- Automatic user database sync via webhooks

### Admin Access
Admin status is determined by Clerk ID:

```env
NEXT_PUBLIC_ADMIN_CLERK_IDS=clerk_user_id_1,clerk_user_id_2
```

When logged in, admins see:
- "Admin Panel" link in navigation
- Access to `/admin` dashboard
- All admin features and controls

## 🎨 Design System

### Color Palette
- **Background**: #070B14 (Midnight Black)
- **Primary**: #3B82F6 (Electric Blue)
- **Secondary**: #22D3EE (Cyan Glow)
- **Accent**: #06B6D4 (Cyan)
- **Muted**: #1E293B (Slate)

### Components
- Glassmorphic cards with backdrop blur
- Smooth animations with Framer Motion
- Dark theme with light text contrast
- Responsive grid layouts
- 3D animated scenes

## 📱 Responsive Design

- **Mobile**: 320px - 640px
- **Tablet**: 641px - 1024px
- **Desktop**: 1025px+

All pages are fully responsive with mobile-first approach.

## 🚢 Deployment

### Deploy to Vercel (Recommended)

```bash
npm run build
npm run start
```

Or connect your GitHub repository to Vercel for automatic deployments.

### Environment Variables on Vercel
Add all `.env.local` variables to Vercel project settings under "Environment Variables".

### Database Migrations on Production

```bash
npm run prisma:deploy
```

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - 5-minute setup guide
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Detailed integration guides
- **[PRISMA_MIGRATION_COMPLETE.md](./PRISMA_MIGRATION_COMPLETE.md)** - Database migration notes

## 🐛 Debugging

### Enable Prisma Query Logging
In development mode, Prisma queries are logged to console.

### View Database with Prisma Studio
```bash
npm run prisma:studio
```

Opens [http://localhost:5555](http://localhost:5555)

### Check Application Logs
```bash
npm run dev
```

View logs in terminal output.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Code Style

- Use TypeScript for type safety
- Follow ESLint rules
- Format with Prettier
- Use component composition pattern
- Implement proper error handling

Run linter:
```bash
npm run lint
```

## 🔒 Security

- **Environment Variables**: Keep sensitive data in `.env.local` (git ignored)
- **Authentication**: All protected routes use Clerk middleware
- **Database**: Use Prisma for SQL injection protection
- **Images**: Cloudinary CDN handles optimization and security
- **Payments**: PesaPal handles PCI compliance

## 📊 Performance

- **Caching**: Nextjs automatic static optimization
- **Image Optimization**: Cloudinary CDN
- **Bundle Size**: Optimized with Next.js tree-shaking
- **Database Queries**: Optimized with Prisma relations
- **API Routes**: Serverless functions on Vercel

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Clerk Documentation](https://clerk.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)

## 📞 Support

For issues, questions, or suggestions:
- Create an issue on GitHub
- Contact: support@dwellke.com
- Documentation: [https://dwellke.com/docs](https://dwellke.com/docs)

## 📄 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- Animated with [Framer Motion](https://www.framer.com/motion/)
- 3D with [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- Database with [Prisma](https://www.prisma.io/)
- Auth with [Clerk](https://clerk.com)
- Payments with [PesaPal](https://pesapal.com)
- Images with [Cloudinary](https://cloudinary.com)
- Hosted on [Vercel](https://vercel.com)

---

**Built with ❤️ for Kenya's property market**

Last Updated: 2026 | Version: 1.0.0
# DWELL-KE
# DWELL-KE
