import { Product, StoreSettings } from '../types';

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: "Khurshid General Store",
  tagline: "Shuddh, Taaza aur Sasta Saman — Aapke Ghar Tak",
  phone1: "9162288060",
  phone2: "8587079786",
  email: "contact@khurshidstore.in",
  address: "Rupaulia Birta Road, Near me Birta Masjid, Word No. 11",
  cityState: "Phenhara, Bihar - 845430",
  gstNumber: "10ABCDE1234F1Z5",
  fssaiNumber: "10423000001289",
  upiId: "9162288060@upi",
  minFreeDelivery: 499,
  deliveryFee: 10,
  adminPin: "kgs2026",
  lowStockThreshold: 2,
  googleMapsUrl: "https://maps.app.goo.gl/eYQJgkGnchc1DfPr8",
  deliveryRadiusKm: 1
};

export const INITIAL_CATEGORIES = [
  "All Items",
  "🌾 Staples & Atta",
  "🫘 Dals & Pulses",
  "🫗 Oils & Ghee",
  "🥛 Dairy & Bakery",
  "🌶️ Spices & Salt",
  "☕ Tea, Coffee & Sugar",
  "🍪 Biscuits & Snacks",
  "🧼 Household & Detergents",
  "🪥 Personal Care",
  "🥜 Dry Fruits"
];

export const INITIAL_PRODUCTS: Product[] = [];

export const PRESET_IMAGE_OPTIONS = [
  { label: "Atta / Flour", url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80" },
  { label: "Rice / Chawal", url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80" },
  { label: "Dal / Pulses", url: "https://images.unsplash.com/photo-1585994192701-f9b6b7f32997?auto=format&fit=crop&w=600&q=80" },
  { label: "Cooking Oil", url: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80" },
  { label: "Ghee / Butter", url: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80" },
  { label: "Spices / Masala", url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80" },
  { label: "Tea / Chai", url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80" },
  { label: "Noodles / Pasta", url: "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80" },
  { label: "Biscuits / Bakery", url: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80" },
  { label: "Detergent / Soap", url: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=600&q=80" },
  { label: "Personal Care", url: "https://images.unsplash.com/photo-1559650656-5d1d4277c4e6?auto=format&fit=crop&w=600&q=80" },
  { label: "Dry Fruits", url: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=600&q=80" },
  { label: "Fresh Milk", url: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80" },
  { label: "Snacks / Chips", url: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80" },
  { label: "Cold Drink / Juice", url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80" }
];
