export type Property = {
  id: string
  title: string
  description: string
  type: string
  listingType: string
  price: number
  location: string
  bedrooms: number
  bathrooms: number
  amenities: string[]
  images: string[]
  verified: boolean
  featured?: boolean
  status?: string
  landlord: {
    id?: string
    firstName: string
    lastName: string
    profileImage?: string
  }
  latitude?: number | null
  longitude?: number | null
  area?: number | null
  createdAt?: string
  updatedAt?: string
}

