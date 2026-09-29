import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ChevronLeft,
  ChevronRight,
  MapPin,
  Truck,
  MessageCircle,
  Store,
  PhoneCall
} from 'lucide-react';
import { Product, StoreSettings, CartItem, Invoice } from './types';
import { INITIAL_PRODUCTS, DEFAULT_STORE_SETTINGS, INITIAL_CATEGORIES } from './data/initialProducts';
import { formatCurrency, cleanPhoneNumber, formatTelLink, sanitizeUrl } from './lib/utils';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';

// Code-split heavy modals to ensure customer storefront bundle is ultra-lightweight
const BillModal = React.lazy(() => import('./components/BillModal').then(m => ({ default: m.BillModal })));
const AdminPanel = React.lazy(() => import('./components/AdminPanel').then(m => ({ default: m.AdminPanel })));

export default function App() {
  // 1. Persistent State Initialization
  const [products, setProducts] = useState<Product[]>(() => {
    // Check if store was cleared for manual product entry
    const isCleaned = localStorage.getItem('khurshid_clean_catalog_v2');
    if (!isCleaned) {
      localStorage.setItem('khurshid_clean_catalog_v2', 'true');
      localStorage.removeItem('khurshid_products');
      localStorage.removeItem('khurshid_cart');
      return [];
    }
    const saved = localStorage.getItem('khurshid_products');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing stored products', e);
      }
    }
    return INITIAL_PRODUCTS;
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('khurshid_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If old Patna placeholder address is stored in localStorage, replace with current new address
        if (parsed.address && parsed.address.includes('Main Market Road')) {
          parsed.address = DEFAULT_STORE_SETTINGS.address;
          parsed.cityState = DEFAULT_STORE_SETTINGS.cityState;
        }
        if (parsed.tagline && parsed.tagline.includes('Kifayati Kirana')) {
          parsed.tagline = DEFAULT_STORE_SETTINGS.tagline;
        }
        if (parsed.deliveryFee === 30 || parsed.deliveryFee === undefined) {
          parsed.deliveryFee = 10;
        }
        if (parsed.phone2 === '85870799786') {
          parsed.phone2 = '8587079786';
        }
        if (parsed.adminPin === 'kgs2026' || parsed.adminPin === '1234') {
          parsed.adminPin = DEFAULT_STORE_SETTINGS.adminPin;
        }
        return {
          ...DEFAULT_STORE_SETTINGS,
          ...parsed,
          adminPin: parsed.adminPin || DEFAULT_STORE_SETTINGS.adminPin,
          deliveryFee: parsed.deliveryFee ?? DEFAULT_STORE_SETTINGS.deliveryFee,
          deliveryRadiusKm: parsed.deliveryRadiusKm ?? DEFAULT_STORE_SETTINGS.deliveryRadiusKm,
          lowStockThreshold: parsed.lowStockThreshold ?? DEFAULT_STORE_SETTINGS.lowStockThreshold,
          googleMapsUrl: parsed.googleMapsUrl || DEFAULT_STORE_SETTINGS.googleMapsUrl
        };
      } catch (e) {
        console.error('Error parsing stored settings', e);
      }
    }
    return DEFAULT_STORE_SETTINGS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('khurshid_invoices');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored invoices', e);
      }
    }
    return [];
  });

  // Cart state: map of productId -> quantity
  const [cart, setCart] = useState<{ [productId: string]: number }>(() => {
    const saved = localStorage.getItem('khurshid_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored cart', e);
      }
    }
    return {};
  });

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(() => {
    return window.location.hash === '#admin';
  });
  const [activeInvoiceForView, setActiveInvoiceForView] = useState<Invoice | null>(null);
  const categoryScrollRef = React.useRef<HTMLDivElement>(null);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Hash & Keyboard shortcut listener for store owner / admin access
  useEffect(() => {
    const checkAdminAccess = () => {
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      if (hash === '#admin' || hash === '#admin-login' || params.get('admin') === 'true') {
        setIsAdminOpen(true);
      }
    };

    checkAdminAccess();
    window.addEventListener('hashchange', checkAdminAccess);

    // Keyboard shortcut (Alt + A or Ctrl + Shift + A) for instant admin panel open
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.key.toLowerCase() === 'a') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        setIsAdminOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', checkAdminAccess);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Cross-Tab Real-time Broadcast & Synchronization
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel('khurshid_store_channel');
        channel.onmessage = (event) => {
          const { type, payload } = event.data || {};
          if (type === 'SYNC_PRODUCTS' && Array.isArray(payload)) {
            setProducts(payload);
          } else if (type === 'SYNC_SETTINGS' && payload) {
            setSettings(prev => ({ ...prev, ...payload }));
          } else if (type === 'SYNC_INVOICES' && Array.isArray(payload)) {
            setInvoices(payload);
          } else if (type === 'SYNC_CART' && payload) {
            setCart(payload);
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel not available', e);
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (!e.newValue) return;
      try {
        if (e.key === 'khurshid_products') {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setProducts(parsed);
        } else if (e.key === 'khurshid_settings') {
          const parsed = JSON.parse(e.newValue);
          if (parsed) setSettings(prev => ({ ...prev, ...parsed }));
        } else if (e.key === 'khurshid_invoices') {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setInvoices(parsed);
        } else if (e.key === 'khurshid_cart') {
          const parsed = JSON.parse(e.newValue);
          if (parsed) setCart(parsed);
        }
      } catch (err) {
        console.error('Error syncing storage event', err);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (channel) channel.close();
    };
  }, []);

  // Save to localStorage whenever critical state changes and broadcast across tabs
  useEffect(() => {
    try {
      localStorage.setItem('khurshid_products', JSON.stringify(products));
      if (typeof BroadcastChannel !== 'undefined') {
        const ch = new BroadcastChannel('khurshid_store_channel');
        ch.postMessage({ type: 'SYNC_PRODUCTS', payload: products });
        ch.close();
      }
    } catch (e) {
      console.warn('Error saving products to localStorage', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('khurshid_settings', JSON.stringify(settings));
      if (typeof BroadcastChannel !== 'undefined') {
        const ch = new BroadcastChannel('khurshid_store_channel');
        ch.postMessage({ type: 'SYNC_SETTINGS', payload: settings });
        ch.close();
      }
    } catch (e) {
      console.warn('Error saving settings to localStorage', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('khurshid_invoices', JSON.stringify(invoices));
      if (typeof BroadcastChannel !== 'undefined') {
        const ch = new BroadcastChannel('khurshid_store_channel');
        ch.postMessage({ type: 'SYNC_INVOICES', payload: invoices });
        ch.close();
      }
    } catch (e) {
      console.warn('Error saving invoices to localStorage', e);
    }
  }, [invoices]);

  useEffect(() => {
    try {
      localStorage.setItem('khurshid_cart', JSON.stringify(cart));
      if (typeof BroadcastChannel !== 'undefined') {
        const ch = new BroadcastChannel('khurshid_store_channel');
        ch.postMessage({ type: 'SYNC_CART', payload: cart });
        ch.close();
      }
    } catch (e) {
      console.warn('Error saving cart to localStorage', e);
    }
  }, [cart]);

  // Convert cart map to full CartItem array
  const cartItems: CartItem[] = useMemo(() => {
    return Object.entries(cart).map(([productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      const qty = Number(quantity);
      if (!product || qty <= 0 || product.stock <= 0) return null;
      const validQty = Math.min(product.stock, qty);
      return { product, quantity: validQty };
    }).filter(Boolean) as CartItem[];
  }, [cart, products]);

  const totalCartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const totalCartAmount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }, [cartItems]);

  // Cart Actions
  const handleAddToCart = (product: Product, quantity = 1) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const currentQty = prev[product.id] || 0;
      const newQty = Math.min(product.stock, currentQty + quantity);
      return {
        ...prev,
        [product.id]: newQty
      };
    });
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    setCart(prev => {
      const copy = { ...prev };
      const product = products.find(p => p.id === productId);
      if (newQuantity <= 0) {
        delete copy[productId];
      } else {
        const maxStock = product ? product.stock : newQuantity;
        copy[productId] = Math.min(maxStock, newQuantity);
      }
      return copy;
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });
  };

  const handleClearCart = () => {
    setCart({});
  };

  // Admin Product Actions
  const handleAddProduct = (newProduct: Product) => {
    setProducts(prev => [newProduct, ...prev]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    setCart(prev => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });
  };

  // When an order is completed & bill is generated
  const handleOrderCompleted = (newInvoice: Invoice) => {
    setInvoices(prev => [newInvoice, ...prev]);
    setCart({});
    // Deduct purchased quantities from product inventory stock
    setProducts(prev => prev.map(p => {
      const purchased = newInvoice.items.find(item => item.id === p.id);
      if (purchased) {
        return {
          ...p,
          stock: Math.max(0, p.stock - purchased.quantity)
        };
      }
      return p;
    }));
  };

  // Delete single invoice record
  const handleDeleteInvoice = (invoiceId: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
    if (activeInvoiceForView?.id === invoiceId) {
      setActiveInvoiceForView(null);
    }
  };

  // View past invoice
  const handleViewInvoice = (inv: Invoice) => {
    setActiveInvoiceForView(inv);
    setIsBillModalOpen(true);
  };

  // POS Quick Bill generator from admin
  const handleGenerateQuickPOSBill = (items: CartItem[], customerName: string, customerPhone: string) => {
    const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const totalMrp = items.reduce((sum, item) => sum + (item.product.mrp * item.quantity), 0);
    const totalDiscount = Math.max(0, totalMrp - subtotal);
    const now = new Date();

    const newInvoice: Invoice = {
      id: 'inv_' + Date.now(),
      invoiceNumber: 'KGS-POS-' + Math.floor(1000 + Math.random() * 9000),
      createdAt: now.toISOString(),
      dateStr: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      timeStr: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      customer: {
        name: customerName.trim() || 'Counter Customer',
        phone: cleanPhoneNumber(customerPhone) || (customerPhone.trim() ? customerPhone.trim() : 'Walk-in'),
        address: 'Direct Counter Sale',
        deliveryType: 'pickup',
        paymentMethod: 'counter_cash'
      },
      items: items.map(i => ({
        id: i.product.id,
        name: i.product.name,
        unit: i.product.unit,
        rate: i.product.price,
        mrp: i.product.mrp,
        quantity: i.quantity,
        amount: i.product.price * i.quantity,
        image: i.product.image
      })),
      subtotal,
      discount: totalDiscount,
      deliveryFee: 0,
      taxAmount: Math.round((subtotal * 0.05) * 100) / 100,
      totalAmount: subtotal,
      paymentStatus: 'Paid',
      orderStatus: 'Delivered',
      cashierName: 'Admin Counter'
    };

    setInvoices(prev => [newInvoice, ...prev]);

    // Deduct stock for POS sales
    setProducts(prev => prev.map(p => {
      const soldItem = items.find(item => item.product.id === p.id);
      if (soldItem) {
        return {
          ...p,
          stock: Math.max(0, p.stock - soldItem.quantity)
        };
      }
      return p;
    }));

    setActiveInvoiceForView(newInvoice);
    setIsBillModalOpen(true);
  };

  // Filtered Products for public storefront
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'All Items' || p.category === selectedCategory;
      const searchLower = searchTerm.trim().toLowerCase();
      const matchesSearch = searchLower === '' || 
        p.name.toLowerCase().includes(searchLower) ||
        (p.hindiName && p.hindiName.toLowerCase().includes(searchLower)) ||
        p.category.toLowerCase().includes(searchLower) ||
        (p.unit && p.unit.toLowerCase().includes(searchLower)) ||
        (p.description && p.description.toLowerCase().includes(searchLower));
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F1EAD9] text-[#241F18] selection:bg-[#C68A2E] selection:text-[#241F18]">
      
      {/* 1. Header Navigation */}
      <Navbar
        settings={settings}
        cartCount={totalCartCount}
        cartTotal={totalCartAmount}
        onOpenCart={() => setIsCartOpen(true)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Main Landmark */}
      <main id="main-content" className="flex-1 pb-24 sm:pb-8">
        {/* 2. Hero Banner */}
        <HeroBanner
          settings={settings}
          onScrollToProducts={() => {
            document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

      {/* 3. Categories Strip */}
      <section id="categories" className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 w-full overflow-hidden">
        <div className="flex items-center justify-between gap-2 mb-2.5 sm:mb-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <h2 className="font-display font-bold text-sm xs:text-base sm:text-lg text-[#152A1C] truncate">
              Shop by Category (सामान की श्रेणियां)
            </h2>
            <span className="hidden xs:inline-block font-mono text-[10px] sm:text-xs text-[#6B6152] bg-white px-2 py-0.5 rounded border border-[#6B6152]/30 shrink-0">
              {INITIAL_CATEGORIES.length - 1} Categories
            </span>
          </div>

          {/* Left / Right Quick Scroll Navigation Arrows */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-[#4E4639] font-mono sm:hidden">Swipe →</span>
            <button
              type="button"
              onClick={() => scrollCategories('left')}
              className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-full bg-white hover:bg-[#F1EAD9] text-[#241F18] border border-[#241F18] flex items-center justify-center shadow-xs cursor-pointer active:scale-95 transition-transform touch-manipulation"
              title="Previous Category"
              aria-label="Previous Category"
            >
              <ChevronLeft aria-hidden="true" className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollCategories('right')}
              className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-full bg-white hover:bg-[#F1EAD9] text-[#241F18] border border-[#241F18] flex items-center justify-center shadow-xs cursor-pointer active:scale-95 transition-transform touch-manipulation"
              title="Next Category"
              aria-label="Next Category"
            >
              <ChevronRight aria-hidden="true" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Categories List */}
        <div 
          ref={categoryScrollRef}
          className="flex gap-2 overflow-x-auto pb-2 pt-0.5 scrollbar-none scroll-smooth touch-pan-x overscroll-x-contain w-full"
        >
          {INITIAL_CATEGORIES.map((cat) => {
            const count = cat === 'All Items' 
              ? products.length 
              : products.filter(p => p.category === cat).length;
            const isSelected = selectedCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`tag-chip shrink-0 font-bold text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-all min-h-[48px] inline-flex items-center gap-2 px-3.5 ${
                  isSelected 
                    ? 'bg-[#2B4430] text-[#F1EAD9] shadow-[2px_2px_0_#241F18]' 
                    : 'bg-white text-[#241F18] hover:bg-[#F1EAD9]'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                  isSelected ? 'bg-[#C68A2E] text-[#241F18]' : 'bg-[#F1EAD9] text-[#6B6152]'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Main Catalog: "Aaj ka Stock" */}
      <section id="shop" className="flex-1 max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 w-full">
        
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-4 sm:mb-6 pb-2 border-b-[1.5px] border-dashed border-[#6B6152]">
          <div>
            <h2 className="font-display font-bold text-xl xs:text-2xl sm:text-3xl text-[#152A1C] flex flex-wrap items-center gap-2">
              <span>Aaj ka Stock</span>
              <span className="font-hand text-base sm:text-lg text-[#B14B2C] underline decoration-[#C68A2E]">
                (ताज़ा राशन)
              </span>
            </h2>
            <p className="font-hand text-[11px] sm:text-sm text-[#6B6152]">
              Shuddh kirana aur rozmarra ka saaman — direct order & instant receipt
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {searchTerm && (
              <span className="text-[11px] sm:text-xs text-[#2B4430] bg-white px-2.5 py-1 rounded-[4px_8px_4px_8px] border border-[#241F18] font-bold">
                Filtered: "{searchTerm}"
              </span>
            )}
            <span className="font-mono text-[11px] sm:text-xs text-[#152A1C] bg-white px-2.5 py-1 rounded-[4px_8px_4px_8px] border border-[#241F18] font-bold">
              {filteredProducts.length} Items Listed
            </span>
          </div>
        </div>

        {/* Product Cards Grid */}
        {products.length === 0 ? (
          <div className="bg-white rounded-[6px_20px_6px_20px] p-8 sm:p-12 text-center border-[1.5px] border-[#241F18] shadow-[4px_4px_0_rgba(36,31,24,0.1)] space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#F1EAD9] border border-[#241F18] flex items-center justify-center mx-auto text-3xl">
              🛒
            </div>
            <h3 className="font-display font-bold text-lg sm:text-xl text-[#152A1C]">
              Store me abhi koi product add nahi hai
            </h3>
            <p className="text-xs sm:text-sm text-[#6B6152] max-w-md mx-auto font-medium">
              Sabhi purane dummy products remove kar diye gaye hain. Aap Admin Panel khol kar apne pasand ke naye products (+ Add Product) manually add kar sakte hain.
            </p>
            <button
              onClick={() => { setIsAdminOpen(true); window.location.hash = 'admin'; }}
              className="mt-3 inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[48px] rounded-[4px_12px_4px_12px] bg-[#2B4430] text-[#F1EAD9] text-xs sm:text-sm font-bold border-[1.5px] border-[#241F18] shadow-[3px_3px_0_#241F18] hover:bg-[#152A1C] transition-all cursor-pointer"
            >
              <span>+ Add Products in Admin (सामान जोड़ें)</span>
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-[6px_20px_6px_20px] p-8 sm:p-12 text-center border-[1.5px] border-[#241F18] shadow-[4px_4px_0_rgba(36,31,24,0.1)] space-y-3">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#F1EAD9] border border-[#241F18] flex items-center justify-center mx-auto text-2xl">
              🔍
            </div>
            <h3 className="font-display font-bold text-base text-[#152A1C]">
              Koi saaman nahi mila
            </h3>
            <p className="text-xs sm:text-sm text-[#6B6152] max-w-sm mx-auto font-medium">
              "{searchTerm}" ke liye koi product match nahi hua. Search clear karein ya dusri category dekhein.
            </p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedCategory('All Items'); }}
              className="mt-2 px-4 sm:px-5 py-2 sm:py-2.5 min-h-[48px] inline-flex items-center justify-center rounded-[4px_12px_4px_12px] bg-[#2B4430] text-[#F1EAD9] text-xs font-bold border-[1.5px] border-[#241F18] shadow-[2px_2px_0_#241F18] hover:bg-[#152A1C] transition-colors cursor-pointer"
            >
              Show All Products (सभी सामान देखें)
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                quantity={cart[product.id] || 0}
                onAddToCart={handleAddToCart}
                onUpdateQuantity={handleUpdateQuantity}
              />
            ))}
          </div>
        )}

      </section>

      {/* Store Location & 1 KM Delivery Radius Section */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 w-full">
        <div className="bg-white rounded-[6px_18px_6px_18px] sm:rounded-[6px_22px_6px_22px] border-[1.5px] border-[#241F18] shadow-[3.5px_3.5px_0_#241F18] sm:shadow-[5px_5px_0_#241F18] p-4 sm:p-8 overflow-hidden relative">
          
          {/* Top accent badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-dashed border-[#DCD0B4]">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#2B4430] text-white flex items-center justify-center border border-[#241F18] shadow-xs shrink-0">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-[#C68A2E]" />
              </div>
              <div className="min-w-0">
                <h2 className="font-display text-base xs:text-lg sm:text-2xl font-bold text-[#152A1C] leading-snug">
                  Dukaan ka Pata & Delivery Area (दुकान का पता)
                </h2>
                <p className="text-[11px] sm:text-sm text-[#4E4639] font-hand">
                  Khurshid General Store · Same-day Kirana Delivery
                </p>
              </div>
            </div>

            {/* 1 KM Delivery Limit Badge */}
            <div className="inline-flex items-center gap-1.5 bg-[#B14B2C] text-white px-3 py-1.5 rounded-full font-bold text-[11px] sm:text-xs shadow-xs border border-[#241F18] shrink-0 self-start sm:self-auto">
              <span>🛵 Delivery:</span>
              <span className="bg-white text-[#B14B2C] px-1.5 py-0.2 rounded-full font-mono text-[10px] sm:text-xs">
                Upto {settings.deliveryRadiusKm ?? 1} KM Only
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-12 gap-5 sm:gap-6 items-center">
            {/* Left: Location Details */}
            <div className="md:col-span-7 space-y-3 sm:space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#523306]">Address / दुकान का पता:</span>
                <p className="font-display font-bold text-base sm:text-lg text-[#152A1C] leading-snug break-words">
                  {settings.address}
                </p>
                <p className="text-xs sm:text-sm text-[#4E4639] font-medium">
                  {settings.cityState}
                </p>
              </div>

              {/* Delivery Boundary Notice Card */}
              <div className="bg-[#F1EAD9]/80 rounded-xl p-3.5 sm:p-4 border border-[#241F18] space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#152A1C]">
                  <Truck aria-hidden="true" className="w-4 h-4 text-[#2B4430] shrink-0" />
                  <span>1 KM Delivery Radius Policy (होम डिलीवरी नियम):</span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#4E4639] leading-relaxed">
                  Humari dukaan se <strong>1 kilometer ke daayre</strong> ke andar aane wale sabhi gharon tak tez aur taaza ration deliver kiya jata hai. 1 km se bahar ke customers dukaan se counter pickup kar sakte hain ya WhatsApp par sampark kar sakte hain.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5 pt-1">
                <a
                  href={settings.googleMapsUrl || 'https://maps.app.goo.gl/eYQJgkGnchc1DfPr8'}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open Khurshid General Store Location on Google Maps"
                  className="inline-flex items-center justify-center gap-1.5 bg-[#B14B2C] hover:bg-[#8F371C] text-white px-4 py-3 rounded-[4px_10px_4px_10px] font-bold text-xs sm:text-sm border-[1.5px] border-[#241F18] shadow-[2px_2px_0_#241F18] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer text-center min-h-[48px] touch-manipulation"
                >
                  <MapPin aria-hidden="true" className="w-4 h-4 shrink-0" />
                  <span>Open on Google Maps ↗</span>
                </a>

                <a
                  href={`https://wa.me/91${cleanPhoneNumber(settings.phone1)}?text=${encodeURIComponent('Namaste, main Khurshid General Store ke 1 km delivery area se order karna chahta hoon. Mera location share kar raha hoon.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share location on WhatsApp"
                  className="inline-flex items-center justify-center gap-1.5 bg-[#25D366] text-[#0e3d1e] px-4 py-3 rounded-[4px_10px_4px_10px] font-bold text-xs sm:text-sm border-[1.5px] border-[#241F18] shadow-[2px_2px_0_#241F18] hover:bg-[#20ba59] transition-all cursor-pointer text-center min-h-[48px] touch-manipulation"
                >
                  <MessageCircle aria-hidden="true" className="w-4 h-4 shrink-0" />
                  <span>Send Location WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Right: Map Graphic / Quick Card */}
            <div className="md:col-span-5 w-full">
              <div className="bg-[#152A1C] text-white rounded-2xl p-4 sm:p-5 border-[1.5px] border-[#241F18] shadow-[3px_3px_0_#241F18] space-y-3.5">
                <div className="flex items-center justify-between border-b border-white/20 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Store aria-hidden="true" className="w-4 h-4 text-[#C68A2E]" />
                    <span className="font-bold text-xs sm:text-sm text-[#F1EAD9]">Store Map & Hours</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#25D366] bg-[#25D366]/20 px-2 py-0.5 rounded-full font-bold">
                    ● Open Now
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono text-[#DCE6DF]">
                  <div className="flex justify-between items-center">
                    <span className="text-[#9FB2CE]">Timing:</span>
                    <span className="font-bold text-[#F1EAD9]">6:00 AM – 9:00 PM (Daily)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#9FB2CE]">Delivery Zone:</span>
                    <span className="font-bold text-[#FFE082]">Within 1 KM Radius</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-white/10">
                    <span className="text-[#9FB2CE]">Helpline 1:</span>
                    <a 
                      href={formatTelLink(settings.phone1)} 
                      aria-label={`Call primary store phone ${settings.phone1}`}
                      className="text-white hover:text-[#FFE082] py-2 px-3 bg-white/10 hover:bg-white/20 rounded-md font-bold min-h-[48px] inline-flex items-center touch-manipulation"
                    >
                      +91 {settings.phone1}
                    </a>
                  </div>
                  {settings.phone2 && (
                    <div className="flex justify-between items-center pt-1 border-t border-white/10">
                      <span className="text-[#9FB2CE]">Helpline 2:</span>
                      <a 
                        href={formatTelLink(settings.phone2)} 
                        aria-label={`Call secondary store phone ${settings.phone2}`}
                        className="text-white hover:text-[#FFE082] py-2 px-3 bg-white/10 hover:bg-white/20 rounded-md font-bold min-h-[48px] inline-flex items-center touch-manipulation"
                      >
                        +91 {settings.phone2}
                      </a>
                    </div>
                  )}
                </div>

                <a
                  href={sanitizeUrl(settings.googleMapsUrl, 'https://maps.app.goo.gl/eYQJgkGnchc1DfPr8')}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Click to navigate to Khurshid General Store on Google Maps"
                  className="w-full bg-[#C68A2E] text-[#152A1C] hover:bg-white py-3.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors text-center min-h-[48px] touch-manipulation"
                >
                  <MapPin aria-hidden="true" className="w-4 h-4 shrink-0" />
                  <span>Click to Navigate on Google Maps</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      </main>

      {/* Consolidated Mobile Bottom Sticky Action Bar (< 640px) */}
      {!isCartOpen && !isBillModalOpen && !isAdminOpen && (
        <nav
          aria-label="Mobile Bottom Quick Actions"
          className="fixed bottom-0 inset-x-0 z-40 bg-[#152A1C]/95 backdrop-blur-md border-t-[1.5px] border-[#241F18] px-2 py-1.5 flex items-center justify-around shadow-2xl sm:hidden"
        >
          {/* Call Store */}
          <a
            href={formatTelLink(settings.phone1)}
            aria-label={`Call Store at ${settings.phone1}`}
            className="flex flex-col items-center justify-center text-white hover:text-[#FFE082] py-1 px-2 rounded-lg text-[10px] font-bold min-h-[48px] min-w-[48px] touch-manipulation transition-colors"
          >
            <PhoneCall aria-hidden="true" className="w-5 h-5 text-[#FFE082] mb-0.5" />
            <span>Call</span>
          </a>

          {/* WhatsApp Order */}
          <a
            href={`https://wa.me/91${cleanPhoneNumber(settings.phone1)}?text=${encodeURIComponent('Namaste Khurshid General Store, mujhe saman order karna hai.')}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Order on WhatsApp"
            className="flex flex-col items-center justify-center text-[#25D366] hover:text-white py-1 px-2 rounded-lg text-[10px] font-bold min-h-[48px] min-w-[48px] touch-manipulation transition-colors"
          >
            <MessageCircle aria-hidden="true" className="w-5 h-5 mb-0.5" />
            <span>WhatsApp</span>
          </a>

          {/* Cart with Live Badge */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            aria-label={`View Cart with ${totalCartCount} items`}
            className="relative flex flex-col items-center justify-center text-[#F1EAD9] bg-[#2B4430] hover:bg-[#1f3323] px-3.5 py-1 rounded-xl border border-[#241F18] text-[10px] font-bold min-h-[48px] min-w-[56px] shadow-xs touch-manipulation cursor-pointer transition-colors"
          >
            <div className="relative">
              <span aria-hidden="true" className="text-base leading-none">🧺</span>
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#C68A2E] text-[#241F18] font-mono font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </div>
            <span>Cart</span>
          </button>

          {/* Store Maps Location */}
          <a
            href={sanitizeUrl(settings.googleMapsUrl, 'https://maps.app.goo.gl/eYQJgkGnchc1DfPr8')}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View store location on Google Maps"
            className="flex flex-col items-center justify-center text-[#DCE6DF] hover:text-[#FFE082] py-1 px-2 rounded-lg text-[10px] font-bold min-h-[48px] min-w-[48px] touch-manipulation transition-colors"
          >
            <MapPin aria-hidden="true" className="w-5 h-5 text-[#B14B2C] mb-0.5" />
            <span>Location</span>
          </a>
        </nav>
      )}

      {/* Floating Bottom Sticky Cart Button on Desktop / Tablet (>= sm) */}
      {totalCartCount > 0 && !isCartOpen && !isBillModalOpen && (
        <div className="hidden sm:block fixed bottom-6 right-6 sm:right-8 z-40 animate-slide-up">
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label={`View Cart with ${totalCartCount} items totaling ${formatCurrency(totalCartAmount)}`}
            className="flex items-center gap-3 bg-[#2B4430] text-[#F1EAD9] border-[1.5px] border-[#241F18] px-5 py-3 rounded-full shadow-[4px_4px_0_#241F18] hover:shadow-[6px_6px_0_#241F18] hover:-translate-y-1 active:translate-y-0 transition-all cursor-pointer min-h-[48px]"
          >
            <span className="w-7 h-7 rounded-full bg-[#C68A2E] text-[#241F18] font-mono font-bold text-xs flex items-center justify-center">
              {totalCartCount}
            </span>
            <span className="font-bold text-sm">View Cart ({formatCurrency(totalCartAmount)})</span>
            <ChevronRight aria-hidden="true" className="w-4 h-4 text-[#C68A2E]" />
          </button>
        </div>
      )}

      {/* 5. Sliding Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        settings={settings}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onProceedToBill={() => {
          setIsCartOpen(false);
          setActiveInvoiceForView(null);
          setIsBillModalOpen(true);
        }}
      />

      {/* 6. Central Tax Invoice & Bill Modal */}
      <BillModal
        isOpen={isBillModalOpen}
        onClose={() => {
          setIsBillModalOpen(false);
          setActiveInvoiceForView(null);
        }}
        items={cartItems}
        settings={settings}
        onOrderCompleted={handleOrderCompleted}
        initialInvoice={activeInvoiceForView}
      />

      {/* 7. Standalone / Modal Admin Panel */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => {
          setIsAdminOpen(false);
          if (window.location.hash.toLowerCase().startsWith('#admin')) {
            history.replaceState(null, '', window.location.pathname + window.location.search);
          }
        }}
        products={products}
        settings={settings}
        invoices={invoices}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onResetProducts={() => setProducts(INITIAL_PRODUCTS)}
        onImportProducts={(importedList) => setProducts(importedList)}
        onUpdateSettings={setSettings}
        onViewInvoice={handleViewInvoice}
        onDeleteInvoice={handleDeleteInvoice}
        onGenerateQuickPOSBill={handleGenerateQuickPOSBill}
      />

      {/* 8. Footer */}
      <Footer
        settings={settings}
        onOpenAdmin={() => {
          setIsAdminOpen(true);
          window.location.hash = 'admin';
        }}
      />

    </div>
  );
}
