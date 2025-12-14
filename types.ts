

export enum Category {
  ALL = "All",
  AGRICULTURE = "Agriculture & Farming",
  MANUFACTURING = "Manufacturing & Industrial",
  REAL_ESTATE = "Real Estate & Property",
  CONSTRUCTION = "Construction & Materials",
  ENERGY = "Energy & Fuel",
  LOGISTICS = "Logistics & Transport",
  RETAIL = "Retail & Markets",
  FOOD_BEVERAGE = "Food & Beverage",
  CAFES_RESTAURANTS = "Cafés & Restaurants",
  AUTOMOTIVE = "Automotive",
  FINANCE = "Banking & Finance",
  PROFESSIONAL_SERVICES = "Professional Services",
  ELECTRONICS = "Electronics & Tech",
  MEDIA = "Media & Communications",
  EDUCATION = "Education & Training",
  HEALTHCARE = "Healthcare & Pharmacy",
  COSMETICS = "Cosmetics & Personal Care",
  FASHION = "Fashion & Apparel",
  HOSPITALITY = "Hospitality & Tourism",
  ENTERTAINMENT = "Entertainment & Leisure",
  HOUSEHOLD_OFFICE = "Household & Office Supplies"
}

export interface Brand {
  id: string;
  name: string;
  category: Category;
  purpose: string;
  purposeKm?: string; // Khmer translation
  location: string;
  locationKm?: string; // Khmer translation
  website: string;
  description: string;
  descriptionKm?: string; // Khmer translation
  imageUrl: string;
  evidenceUrl?: string; // URL to evidence/source
}

export interface BrandReport {
  id: string;
  brandId: string;
  brandName: string;
  brandImage: string;
  reason: string;
  details: string;
  email?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  submittedAt: string;
}