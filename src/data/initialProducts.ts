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
  adminPin: "Khurshid@8587",
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

export const STARTER_GROCERY_PRODUCTS: Product[] = [
  {
    id: "p_atta_10kg",
    name: "Aashirvaad Shudh Chakki Atta",
    hindiName: "आशीर्वाद शुद्ध चक्की आटा",
    category: "🌾 Staples & Atta",
    unit: "10 kg Pack",
    mrp: 460,
    price: 430,
    stock: 25,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
    description: "100% pure whole wheat grain atta with 0% maida",
    featured: true,
    isPopular: true,
    badge: "Best Seller"
  },
  {
    id: "p_rice_5kg",
    name: "India Gate Basmati Rice (Classic)",
    hindiName: "इंडिया गेट बासमती चावल",
    category: "🌾 Staples & Atta",
    unit: "5 kg Bag",
    mrp: 550,
    price: 495,
    stock: 30,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
    description: "Premium aged long grain fragrant basmati rice",
    featured: true,
    isPopular: true,
    badge: "Top Choice"
  },
  {
    id: "p_mustard_oil_1l",
    name: "Fortune Premium Kachi Ghani Mustard Oil",
    hindiName: "फॉर्च्यून कच्ची घानी शुद्ध सरसों तेल",
    category: "🫗 Oils & Ghee",
    unit: "1 Litre Pouch",
    mrp: 175,
    price: 155,
    stock: 40,
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80",
    description: "Cold-pressed pungent pure sarson tel for everyday cooking",
    featured: true,
    isPopular: true,
    badge: "100% Shuddh"
  },
  {
    id: "p_amul_ghee_1l",
    name: "Amul Pure Cow Ghee",
    hindiName: "अमूल शुद्ध देसी गाय का घी",
    category: "🫗 Oils & Ghee",
    unit: "1 Litre Tin",
    mrp: 680,
    price: 635,
    stock: 15,
    image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80",
    description: "Rich aroma and granular texture pure desi ghee",
    featured: true,
    isPopular: true,
    badge: "Pure Ghee"
  },
  {
    id: "p_arhar_dal_1kg",
    name: "Tata Sampann Desi Toor / Arhar Dal",
    hindiName: "अरहर / तुअर दाल (अनपॉलिश्ड)",
    category: "🫘 Dals & Pulses",
    unit: "1 kg Pack",
    mrp: 195,
    price: 175,
    stock: 35,
    image: "https://images.unsplash.com/photo-1585994192701-f9b6b7f32997?auto=format&fit=crop&w=600&q=80",
    description: "Unpolished, naturally protein-rich desi arhar dal",
    featured: true,
    isPopular: true,
    badge: "Unpolished"
  },
  {
    id: "p_tata_tea_gold_500g",
    name: "Tata Tea Gold Leaf Tea",
    hindiName: "टाटा टी गोल्ड कड़क चाय पत्ती",
    category: "☕ Tea, Coffee & Sugar",
    unit: "500g Pack",
    mrp: 320,
    price: 290,
    stock: 25,
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80",
    description: "Kadak granules with gently rolled aromatic long tea leaves",
    featured: true,
    isPopular: true,
    badge: "Kadak Chai"
  },
  {
    id: "p_tata_salt_1kg",
    name: "Tata Salt (Vacuum Evaporated Iodized)",
    hindiName: "टाटा नमक (देश का नमक)",
    category: "🌶️ Spices & Salt",
    unit: "1 kg Packet",
    mrp: 28,
    price: 26,
    stock: 80,
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80",
    description: "Desh ka namak with guaranteed iodine content",
    featured: false,
    isPopular: true,
    badge: "Iodized"
  },
  {
    id: "p_parle_g_packet",
    name: "Parle-G Original Glucose Biscuits",
    hindiName: "पारले-जी ग्लूकोज बिस्किट",
    category: "🍪 Biscuits & Snacks",
    unit: "800g Family Pack",
    mrp: 90,
    price: 80,
    stock: 50,
    image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80",
    description: "India's favorite chai biscuit packed with milk and wheat",
    featured: true,
    isPopular: true,
    badge: "Family Pack"
  }
];

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
