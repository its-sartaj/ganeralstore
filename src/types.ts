export interface Product {
  id: string;
  name: string;
  hindiName?: string;
  category: string;
  unit: string;
  mrp: number;
  price: number;
  stock: number;
  image: string;
  description?: string;
  featured?: boolean;
  isPopular?: boolean;
  badge?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  landmark?: string;
  pincode?: string;
  deliveryType: 'delivery' | 'pickup';
  paymentMethod: 'cod' | 'upi' | 'card' | 'counter_cash';
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  name: string;
  unit: string;
  rate: number;
  mrp: number;
  quantity: number;
  amount: number;
  image?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  dateStr: string;
  timeStr: string;
  customer: CustomerInfo;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  taxAmount: number;
  totalAmount: number;
  paymentStatus: 'Paid' | 'Pending' | 'Cash on Delivery';
  orderStatus: 'New' | 'Packed' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  cashierName?: string;
  notes?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  phone1: string;
  phone2: string;
  email: string;
  address: string;
  cityState: string;
  gstNumber: string;
  fssaiNumber: string;
  upiId: string;
  minFreeDelivery: number;
  deliveryFee: number;
  adminPin: string;
  lowStockThreshold?: number;
  googleMapsUrl?: string;
  deliveryRadiusKm?: number;
}
