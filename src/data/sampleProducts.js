// Sample data (in real app, this would come from API)

import { generateSlug } from "../utils/slugify";

export const sampleProducts = [
  {
    id: 1,
    name: "Special Lion Bidi (Big)",
    slug: generateSlug("special-lion-bidi-big"),
    price: 280,
    originalPrice: 400,
    discount: 30,
    image: "https://res.cloudinary.com/dxqerqng1/image/upload/v1757644152/LionBidi_z4lirw.jpg",
    category: "BEEDI",
    brand: "Lion Bidi",
    inStock: true,
    bestseller: true,
    minQuantity: 1, // Add this line - minimum 1 piece
    //maxQuantity: 10
  },
  {
    id: 2,
    name: "Special Lion Bidi (Small)",
    slug: generateSlug("special-lion-bidi-small"),
    price: 210,
    originalPrice: 300,
    discount: 30,
    image: "https://res.cloudinary.com/dxqerqng1/image/upload/v1757644249/LionBidiSmall_cq01ov.jpg",
    category: "BEEDI",
    brand: "Lion Bidi",
    inStock: true,
    bestseller: true,
    minQuantity: 1, // Different minimum for small pack
    //maxQuantity: 15
  },
];

export const categories = [
  //{ name: "Cigarette", count: 45 },
  // { name: "Tobacco", count: 25 },
  // { name: "Rolling Paper & Accessories", count: 15 },
  { name: "BEEDI", count: 2 },
];

export const featuredCategories = [
  {
    name: "Cigarette",
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop",
    products: 45,
  },
  {
    name: "Tobacco",
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop",
    products: 25,
  },
  {
    name: "Rolling Paper",
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop",
    products: 15,
  },
  {
    name: "BEEDI",
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop",
    products: 12,
  },
];
