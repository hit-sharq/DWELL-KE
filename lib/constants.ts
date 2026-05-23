// Dwell KE Branding & Theme Constants

export const BRAND = {
  name: "Dwell KE",
  tagline: "Your Trusted Property Partner in Kenya",
  description: "Discover verified properties with secure bookings and trusted landlords.",
};

// Premium Dark Luxury Color Palette
export const COLORS = {
  // Backgrounds
  midnight: "#070B14", // Primary dark background
  navy: "#0F172A", // Card backgrounds
  graphite: "#111827", // Alternate dark surface
  slate: "#1E293B", // Input/border color

  // Accents
  blue: "#3B82F6", // Primary accent
  cyan: "#22D3EE", // Secondary accent
  emerald: "#10B981", // Success color
  violet: "#8B5CF6", // Purple accent
  teal: "#06B6D4", // Teal accent

  // Text & Neutrals
  lightGray: "#E5E7EB", // Primary text
  mediumGray: "#94A3B8", // Secondary text
  white: "#F1F5F9", // Light backgrounds

  // Status
  error: "#EF4444",
  warning: "#F59E0B",
  success: "#10B981",
  info: "#06B6D4",
};

// Navigation Links
export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

// CTA Links
export const CTA_LINKS = [
  { label: "Sign In", href: "/auth/login", variant: "outline" },
  { label: "Get Started", href: "/auth/signup", variant: "solid" },
];

// Feature List
export const FEATURES = [
  {
    title: "Verified Properties",
    description: "All properties are verified and authenticated for your security.",
    icon: "✓",
  },
  {
    title: "M-Pesa Integration",
    description: "Seamless, secure payments directly through M-Pesa.",
    icon: "💳",
  },
  {
    title: "AI Fraud Detection",
    description: "Advanced AI technology to detect and prevent fraudulent listings.",
    icon: "🤖",
  },
  {
    title: "Real-Time Insights",
    description: "Get instant notifications and analytics on property inquiries.",
    icon: "📊",
  },
];

// Dashboard Routes
export const DASHBOARD_ROUTES = {
  tenant: "/dashboard/tenant",
  landlord: "/dashboard/landlord",
  admin: "/dashboard/admin",
};

// Property Types
export const PROPERTY_TYPES = [
  "Apartment",
  "House",
  "Studio",
  "Townhouse",
  "Penthouse",
  "Condo",
  "Bedsitter",
];

// Amenities
export const AMENITIES = [
  "WiFi",
  "Parking",
  "Pool",
  "Gym",
  "Security",
  "Furnished",
  "Pet Friendly",
  "Balcony",
  "Air Conditioning",
  "Kitchen",
];
