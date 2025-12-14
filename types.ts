

export enum Category {
  ALL = "All",
  RETAIL = "Retail & Markets",
  FOOD_BEVERAGE = "Food & Beverage",
  CAFES_RESTAURANTS = "Cafés & Restaurants",
  EFG = "EFG Group",
  ENERGY = "Energy & Fuel",
  CONSTRUCTION = "Construction",
  FINANCE = "Banking & Finance",
  LOGISTICS = "Logistics",
  COSMETICS = "Cosmetics",
  DENTAL = "Dental Clinic",
  ELECTRONICS = "Electronics",
  ENTERTAINMENT = "Entertainment",
  FASHION = "Fashion",
  HAIR_CARE = "Hair Care",
  HEALTHCARE = "Healthcare",
  HOSPITALITY = "Hospitality",
  KITCHENWARE = "Kitchenware",
  OFFICE_SUPPLIES = "Office Supplies",
  ORAL_CARE = "Oral Care"
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