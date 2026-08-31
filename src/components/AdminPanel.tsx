import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  Search, 
  AlertTriangle,
  AlertOctagon,
  Filter, 
  Eye, 
  Printer, 
  ExternalLink, 
  LogOut, 
  Store, 
  MapPin 
} from 'lucide-react';
import { Product, StoreSettings, Invoice, CartItem } from '../types';
import { INITIAL_CATEGORIES } from '../data/initialProducts';
import { formatCurrency, cleanPhoneNumber } from '../lib/utils';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  settings: StoreSettings;
  invoices: Invoice[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateSettings: (settings: StoreSettings) => void;
  onViewInvoice: (invoice: Invoice) => void;
  onDeleteInvoice?: (invoiceId: string) => void;
  onGenerateQuickPOSBill: (items: CartItem[], customerName: string, customerPhone: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  products,
  settings,
  invoices,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateSettings,
  onViewInvoice,
  onDeleteInvoice,
  onGenerateQuickPOSBill
}) => {
  if (!isOpen) return null;

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<'products' | 'pos' | 'invoices' | 'settings'>('products');

  // Stock filter in products table ('all' | 'low_stock' | 'out_of_stock')
  const [stockFilter, setStockFilter] = useState<'all' | 'low_stock' | 'out_of_stock'>('all');

  // Search in products table
  const [adminSearch, setAdminSearch] = useState('');
  const [selectedAdminCat, setSelectedAdminCat] = useState('All');

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Add / Edit Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [productForm, setProductForm] = useState({
    name: '',
    hindiName: '',
    category: '🌾 Staples & Atta',
    unit: '1 kg Pack',
    mrp: 100,
    price: 90,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    description: '',
    badge: 'Fresh Stock'
  });

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState<StoreSettings>({
    ...settings,
    lowStockThreshold: settings.lowStockThreshold ?? 2
  });

  // Keep settingsForm synchronized with settings prop
  useEffect(() => {
    setSettingsForm({
      ...settings,
      lowStockThreshold: settings.lowStockThreshold ?? 2
    });
  }, [settings]);

  // POS Billing State
  const [posCart, setPosCart] = useState<{ [productId: string]: number }>({});
  const [posCustomerName, setPosCustomerName] = useState('Counter Customer');
  const [posCustomerPhone, setPosCustomerPhone] = useState('');

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = settings.adminPin || 'kgs2026';
    if (passwordInput === correctPin || (correctPin === 'kgs2026' && passwordInput === '1234')) {
      setIsAuthenticated(true);
      setLoginError(false);
      setPasswordInput('');
      showToast('Admin Login Successful ✓');
    } else {
      setLoginError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    onClose();
  };

  // Open Modal for Add
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      hindiName: '',
      category: '🌾 Staples & Atta',
      unit: '1 kg Pack',
      mrp: 100,
      price: 90,
      stock: 50,
      image: '',
      description: '',
      badge: 'Fresh Stock'
    });
    setIsProductModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      hindiName: p.hindiName || '',
      category: p.category,
      unit: p.unit,
      mrp: p.mrp,
      price: p.price,
      stock: p.stock,
      image: p.image,
      description: p.description || '',
      badge: p.badge || ''
    });
    setIsProductModalOpen(true);
  };

  // Save Product (Add or Edit)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      alert('Kripya product ka naam zaroor bharein.');
      return;
    }

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        name: productForm.name.trim(),
        hindiName: productForm.hindiName.trim(),
        category: productForm.category,
        unit: productForm.unit.trim(),
        mrp: Number(productForm.mrp) || 0,
        price: Number(productForm.price) || 0,
        stock: Number(productForm.stock) || 0,
        image: productForm.image,
        description: productForm.description.trim(),
        badge: productForm.badge.trim()
      });
      showToast(`Product "${productForm.name}" updated ✓`);
    } else {
      const newProduct: Product = {
        id: 'p_' + Date.now(),
        name: productForm.name.trim(),
        hindiName: productForm.hindiName.trim(),
        category: productForm.category,
        unit: productForm.unit.trim(),
        mrp: Number(productForm.mrp) || 0,
        price: Number(productForm.price) || 0,
        stock: Number(productForm.stock) || 0,
        image: productForm.image,
        description: productForm.description.trim(),
        badge: productForm.badge.trim(),
        featured: true,
        isPopular: true
      };
      onAddProduct(newProduct);
      showToast(`New Product "${productForm.name}" added ✓`);
    }

    setIsProductModalOpen(false);
  };

  // Image Upload handler (Base64 file reading)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProductForm(prev => ({ ...prev, image: reader.result as string }));
          showToast('Product photo uploaded ✓');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({ ...settingsForm });
    showToast('Store settings updated ✓');
  };

  // Low Stock Calculations & Quick Controls
  const lowStockThreshold = settings.lowStockThreshold ?? 2;
  const lowStockProducts = products.filter(p => p.stock < lowStockThreshold);
  const outOfStockProducts = products.filter(p => p.stock === 0);
  const lowStockOnlyCount = products.filter(p => p.stock > 0 && p.stock < lowStockThreshold).length;

  const handleQuickThresholdChange = (newThreshold: number) => {
    const val = Math.max(1, newThreshold);
    const updated = { ...settings, lowStockThreshold: val };
    onUpdateSettings(updated);
    setSettingsForm(prev => ({ ...prev, lowStockThreshold: val }));
    showToast(`Low-stock alert threshold set to < ${val} units ✓`);
  };

  // Filtered products in admin
  const filteredProducts = products.filter(p => {
    const matchCat = selectedAdminCat === 'All' || p.category === selectedAdminCat;
    const matchSearch = adminSearch.trim() === '' || 
      p.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
      (p.hindiName && p.hindiName.toLowerCase().includes(adminSearch.toLowerCase())) ||
      p.category.toLowerCase().includes(adminSearch.toLowerCase());
    
    let matchStock = true;
    if (stockFilter === 'low_stock') {
      matchStock = p.stock < lowStockThreshold;
    } else if (stockFilter === 'out_of_stock') {
      matchStock = p.stock === 0;
    }
    return matchCat && matchSearch && matchStock;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#F1EAD9] text-[#241F18] flex flex-col">
      
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#152A1C] text-[#F1EAD9] px-5 py-2.5 rounded-[4px_12px_4px_12px] border-[1.5px] border-[#241F18] font-hand font-bold text-sm shadow-xl animate-slide-up">
          {toastMessage}
        </div>
      )}

      {!isAuthenticated ? (
        /* LOGIN SCREEN */
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-[6px_22px_6px_22px] p-8 sm:p-10 w-full max-w-sm border-[1.5px] border-[#241F18] shadow-[6px_6px_0_#152A1C] text-center space-y-4">
            
            {/* Vintage Emblem Badge */}
            <div className="w-16 h-16 mx-auto bg-[#2B4430] text-white rounded-[4px_14px_4px_14px] p-2 border-[1.5px] border-[#241F18] shadow-[3px_3px_0_#152A1C] flex items-center justify-center">
              <Store className="w-9 h-9" />
            </div>

            <div>
              <h2 className="font-display font-bold text-2xl text-[#152A1C]">
                Admin Panel
              </h2>
              <p className="font-hand text-xs text-[#6B6152] mt-0.5">
                {settings.storeName} manage karne ke liye login karein
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-3 pt-2">
              <div className="space-y-1 text-left">
                <label className="text-xs font-bold text-[#6B6152]">
                  Admin Password / PIN
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="Enter admin password..."
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setLoginError(false);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-[4px_10px_4px_10px] border-[1.5px] border-[#241F18] text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-[#C68A2E]"
                />
              </div>

              {loginError && (
                <div className="text-xs text-[#B14B2C] font-bold">
                  ⚠️ Galat password! Kripya sahi password dalein.
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#2B4430] hover:bg-[#152A1C] text-[#F1EAD9] py-3 rounded-[4px_10px_4px_10px] font-bold text-sm border-[1.5px] border-[#241F18] shadow-[3px_3px_0_#241F18] transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
              >
                Login to Admin (लॉगिन)
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full bg-white text-[#6B6152] hover:text-[#241F18] py-2 text-xs font-bold border-[1.5px] border-dashed border-[#6B6152] rounded-[4px_10px_4px_10px]"
              >
                ← Return to Public Store
              </button>
            </form>

            <div className="pt-3 border-t border-dashed border-[#DCD0B4] text-[11px] font-mono text-[#6B6152]">
              Default password: <strong className="text-[#241F18]">kgs2026</strong>
            </div>

          </div>
        </div>
      ) : (
        /* AUTHENTICATED ADMIN DASHBOARD */
        <div className="flex-1 flex flex-col min-h-screen">
          
          {/* Admin Header */}
          <header className="bg-[#152A1C] text-white px-4 sm:px-6 py-3 border-b-[1.5px] border-[#241F18] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[3px_9px_3px_9px] bg-white text-[#2B4430] flex items-center justify-center font-bold border border-[#241F18]">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-display text-base sm:text-lg font-bold leading-tight">
                  {settings.storeName} — Admin Portal
                </h1>
                <span className="font-hand text-xs text-[#C68A2E]">
                  Inventory, POS Billing & Store Controls
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="inline-flex items-center gap-1.5 bg-[#2B4430] hover:bg-[#38593f] text-[#DCE6DF] px-3 py-1.5 rounded-[4px_10px_4px_10px] text-xs font-bold border border-[#DCE6DF]/20 cursor-pointer"
                title="View Customer Storefront"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">View Store</span>
              </button>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 bg-[#B14B2C] hover:bg-[#973e23] text-white px-3 py-1.5 rounded-[4px_10px_4px_10px] text-xs font-bold border border-[#241F18] cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </header>

          {/* Admin Navigation Bar */}
          <div className="bg-white border-b-[1.5px] border-[#241F18] px-3 sm:px-6 py-2">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
              
              <div className="flex gap-1.5 sm:gap-2 shrink-0">
                <button
                  onClick={() => setActiveTab('products')}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-[4px_10px_4px_10px] sm:rounded-[4px_12px_4px_12px] text-xs sm:text-sm font-bold border-[1.5px] border-[#241F18] transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap touch-manipulation ${activeTab === 'products' ? 'bg-[#2B4430] text-[#F1EAD9] shadow-[2px_2px_0_#241F18]' : 'bg-[#F1EAD9] text-[#241F18] hover:bg-white'}`}
                >
                  <span>🛒 Products ({products.length})</span>
                  {lowStockProducts.length > 0 && (
                    <span className="inline-flex items-center gap-1 bg-rose-600 text-white text-[9px] sm:text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full shadow-2xs animate-pulse">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      <span>{lowStockProducts.length} Low</span>
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('pos')}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-[4px_10px_4px_10px] sm:rounded-[4px_12px_4px_12px] text-xs sm:text-sm font-bold border-[1.5px] border-[#241F18] transition-all cursor-pointer whitespace-nowrap touch-manipulation ${activeTab === 'pos' ? 'bg-[#2B4430] text-[#F1EAD9] shadow-[2px_2px_0_#241F18]' : 'bg-[#F1EAD9] text-[#241F18] hover:bg-white'}`}
                >
                  🧾 Counter POS
                </button>

                <button
                  onClick={() => setActiveTab('invoices')}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-[4px_10px_4px_10px] sm:rounded-[4px_12px_4px_12px] text-xs sm:text-sm font-bold border-[1.5px] border-[#241F18] transition-all cursor-pointer whitespace-nowrap touch-manipulation ${activeTab === 'invoices' ? 'bg-[#2B4430] text-[#F1EAD9] shadow-[2px_2px_0_#241F18]' : 'bg-[#F1EAD9] text-[#241F18] hover:bg-white'}`}
                >
                  📋 Invoices ({invoices.length})
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-[4px_10px_4px_10px] sm:rounded-[4px_12px_4px_12px] text-xs sm:text-sm font-bold border-[1.5px] border-[#241F18] transition-all cursor-pointer whitespace-nowrap touch-manipulation ${activeTab === 'settings' ? 'bg-[#2B4430] text-[#F1EAD9] shadow-[2px_2px_0_#241F18]' : 'bg-[#F1EAD9] text-[#241F18] hover:bg-white'}`}
                >
                  ⚙️ Settings
                </button>
              </div>

              {activeTab === 'products' && (
                <button
                  onClick={handleOpenAdd}
                  className="bg-[#C68A2E] text-[#241F18] px-3 sm:px-4 py-1.5 sm:py-2 rounded-[4px_10px_4px_10px] sm:rounded-[4px_12px_4px_12px] text-xs sm:text-sm font-bold border-[1.5px] border-[#241F18] shadow-[2px_2px_0_#241F18] hover:bg-[#b57d25] transition-all flex items-center gap-1 shrink-0 cursor-pointer whitespace-nowrap touch-manipulation"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Product</span>
                </button>
              )}

            </div>
          </div>

          {/* Admin Main Body */}
          <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full">
            
            {/* TAB 1: PRODUCTS INVENTORY */}
            {activeTab === 'products' && (
              <div className="space-y-4">
                
                {/* Low Stock Alert Notification Banner */}
                {lowStockProducts.length > 0 && (
                  <div className="bg-rose-50 border-[1.5px] border-rose-600 rounded-[4px_16px_4px_16px] p-4 shadow-[3px_3px_0_#e11d48] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-[4px_10px_4px_10px] bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                        <AlertTriangle className="w-5 h-5 animate-bounce" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-display font-bold text-sm sm:text-base text-rose-950">
                            Low-Stock Alert: {lowStockProducts.length} items require restock!
                          </h4>
                          <span className="bg-rose-200 text-rose-900 border border-rose-300 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full">
                            Alert Threshold: Stock &lt; {lowStockThreshold} units
                          </span>
                        </div>
                        <p className="font-hand text-xs text-rose-800 mt-0.5">
                          {outOfStockProducts.length > 0 && <span className="font-bold text-rose-900">{outOfStockProducts.length} out of stock (0)</span>}
                          {outOfStockProducts.length > 0 && lowStockOnlyCount > 0 && <span> and </span>}
                          {lowStockOnlyCount > 0 && <span>{lowStockOnlyCount} critically low items</span>}
                          . Below in the inventory table, these items are highlighted in red with quick restock buttons.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                      <button
                        onClick={() => setStockFilter(stockFilter === 'low_stock' ? 'all' : 'low_stock')}
                        className={`w-full sm:w-auto px-3 py-1.5 rounded-[4px_10px_4px_10px] text-xs font-bold border border-rose-700 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs ${
                          stockFilter === 'low_stock'
                            ? 'bg-rose-700 text-white'
                            : 'bg-white text-rose-900 hover:bg-rose-100'
                        }`}
                      >
                        <Filter className="w-3.5 h-3.5" />
                        <span>{stockFilter === 'low_stock' ? 'Showing Low Stock (Clear Filter)' : `View Low Stock Items (${lowStockProducts.length})`}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Search & Filter & Threshold Toolbar Controls */}
                <div className="bg-white p-4 rounded-[4px_16px_4px_16px] border-[1.5px] border-[#241F18] shadow-[3px_3px_0_rgba(36,31,24,0.1)] flex flex-col gap-3">
                  
                  <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6152]" />
                      <input
                        type="text"
                        value={adminSearch}
                        onChange={(e) => setAdminSearch(e.target.value)}
                        placeholder="Search inventory items by name, Hindi name, category..."
                        className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-[#F1EAD9] border-[1.5px] border-[#241F18] rounded-[4px_10px_4px_10px]"
                      />
                    </div>

                    {/* Category Filter */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#6B6152] shrink-0">Category:</span>
                      <select
                        value={selectedAdminCat}
                        onChange={(e) => setSelectedAdminCat(e.target.value)}
                        className="px-3 py-1.5 rounded-[4px_10px_4px_10px] border-[1.5px] border-[#241F18] bg-white text-xs font-bold"
                      >
                        <option value="All">All Categories ({products.length})</option>
                        {INITIAL_CATEGORIES.filter(c => c !== 'All Items').map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* Threshold Setting Stepper in Toolbar */}
                    <div className="flex items-center gap-2 bg-[#F1EAD9]/70 px-3 py-1.5 rounded-[4px_10px_4px_10px] border border-[#241F18] shrink-0">
                      <span className="text-xs font-bold text-[#152A1C] flex items-center gap-1 shrink-0">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Alert when stock &lt;</span>
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleQuickThresholdChange(lowStockThreshold - 1)}
                          disabled={lowStockThreshold <= 1}
                          className="w-6 h-6 rounded bg-white border border-[#241F18] flex items-center justify-center font-bold text-xs hover:bg-[#F1EAD9] disabled:opacity-40 cursor-pointer shadow-2xs"
                          title="Decrease threshold"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold text-xs px-2 py-0.5 bg-white border border-[#241F18] rounded text-rose-700 min-w-6 text-center shadow-2xs">
                          {lowStockThreshold}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuickThresholdChange(lowStockThreshold + 1)}
                          className="w-6 h-6 rounded bg-white border border-[#241F18] flex items-center justify-center font-bold text-xs hover:bg-[#F1EAD9] cursor-pointer shadow-2xs"
                          title="Increase threshold"
                        >
                          +
                        </button>
                        <span className="text-[11px] font-mono text-slate-600 ml-0.5">units</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stock Filter Chips */}
                  <div className="flex items-center gap-2 pt-2 border-t border-dashed border-[#DCD0B4] overflow-x-auto pb-1 scrollbar-none text-xs">
                    <span className="font-bold text-[#6B6152] shrink-0 text-[11px] uppercase font-mono">Filter by Stock:</span>
                    
                    <button
                      type="button"
                      onClick={() => setStockFilter('all')}
                      className={`px-3 py-1 rounded-full font-bold border transition-all cursor-pointer shrink-0 ${
                        stockFilter === 'all'
                          ? 'bg-[#2B4430] text-[#F1EAD9] border-[#241F18] shadow-xs'
                          : 'bg-white text-[#241F18] border-slate-300 hover:bg-[#F1EAD9]'
                      }`}
                    >
                      All Stock ({products.length})
                    </button>

                    <button
                      type="button"
                      onClick={() => setStockFilter('low_stock')}
                      className={`px-3 py-1 rounded-full font-bold border transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                        stockFilter === 'low_stock'
                          ? 'bg-rose-600 text-white border-rose-800 shadow-xs'
                          : 'bg-rose-50 text-rose-900 border-rose-300 hover:bg-rose-100'
                      }`}
                    >
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      <span>Low Stock (&lt; {lowStockThreshold} units) ({lowStockProducts.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStockFilter('out_of_stock')}
                      className={`px-3 py-1 rounded-full font-bold border transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                        stockFilter === 'out_of_stock'
                          ? 'bg-slate-900 text-white border-black shadow-xs'
                          : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      <AlertOctagon className="w-3 h-3 text-rose-600" />
                      <span>Out of Stock (0) ({outOfStockProducts.length})</span>
                    </button>
                  </div>

                </div>

                {/* Products Table Card */}
                <div className="bg-white rounded-[4px_16px_4px_16px] border-[1.5px] border-[#241F18] shadow-[4px_4px_0_rgba(36,31,24,0.12)] overflow-hidden">
                  <div className="p-4 border-b border-[#241F18] flex items-center justify-between bg-[#F1EAD9]/60 flex-wrap gap-2">
                    <div>
                      <h3 className="font-display font-bold text-base text-[#152A1C] flex items-center gap-2">
                        <span>Active Catalog Items ({filteredProducts.length})</span>
                        {stockFilter !== 'all' && (
                          <span className="text-xs bg-rose-100 text-rose-800 border border-rose-300 font-bold px-2 py-0.5 rounded-full">
                            Filtered: {stockFilter === 'low_stock' ? `Low Stock (< ${lowStockThreshold})` : 'Out of Stock (0)'}
                          </span>
                        )}
                      </h3>
                      <p className="font-hand text-xs text-[#6B6152]">
                        Items with stock &lt; {lowStockThreshold} are highlighted in red for easy restock management.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="flex items-center gap-1 text-slate-600">
                        <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span> Low Stock (&lt; {lowStockThreshold})
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b-[1.5px] border-[#241F18] bg-[#F1EAD9] text-[#152A1C] font-mono uppercase text-[11px]">
                          <th className="py-2.5 px-3 w-14 text-center">Photo</th>
                          <th className="py-2.5 px-3">Product Name</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3">Unit</th>
                          <th className="py-2.5 px-3 text-right">MRP (₹)</th>
                          <th className="py-2.5 px-3 text-right">Selling (₹)</th>
                          <th className="py-2.5 px-3 text-center">Stock Level</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-dashed divide-[#DCD0B4]">
                        {filteredProducts.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-8 text-center text-[#6B6152] font-hand text-sm">
                              {stockFilter === 'low_stock' 
                                ? `Shandaar! Koi bhi item low stock (< ${lowStockThreshold}) nahi hai.` 
                                : 'Koi product nahi mila. "+ Add Product" button se naya item jodein.'}
                            </td>
                          </tr>
                        ) : (
                          filteredProducts.map((p) => {
                            const isLowStock = p.stock < lowStockThreshold;
                            const isOutOfStock = p.stock === 0;

                            return (
                              <tr 
                                key={p.id} 
                                className={`transition-colors ${
                                  isLowStock 
                                    ? 'bg-rose-50/90 hover:bg-rose-100/90 border-l-[5px] border-l-rose-600' 
                                    : 'hover:bg-[#F1EAD9]/30'
                                }`}
                              >
                                {/* Photo */}
                                <td className="py-2.5 px-3 text-center">
                                  <div className="relative inline-block">
                                    <img
                                      src={p.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80"}
                                      alt={p.name}
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80";
                                      }}
                                      className="w-10 h-10 rounded-full object-contain mx-auto bg-[#F1EAD9] border border-[#241F18] p-0.5"
                                    />
                                    {isOutOfStock && (
                                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full flex items-center justify-center text-[9px] font-bold shadow-xs">
                                        !
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* Name */}
                                <td className="py-2.5 px-3">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-bold text-slate-900 text-xs sm:text-sm">
                                      {p.name}
                                    </span>
                                    {isOutOfStock ? (
                                      <span className="text-[10px] font-bold bg-rose-600 text-white px-1.5 py-0.2 rounded font-mono">
                                        OUT OF STOCK
                                      </span>
                                    ) : isLowStock ? (
                                      <span className="text-[10px] font-bold bg-rose-200 text-rose-900 border border-rose-300 px-1.5 py-0.2 rounded font-mono">
                                        LOW STOCK
                                      </span>
                                    ) : null}
                                  </div>
                                  {p.hindiName && (
                                    <div className="text-[11px] text-slate-500 font-sans">
                                      {p.hindiName}
                                    </div>
                                  )}
                                </td>

                                {/* Category */}
                                <td className="py-2.5 px-3">
                                  <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-medium text-[11px] border border-emerald-200">
                                    {p.category}
                                  </span>
                                </td>

                                {/* Unit */}
                                <td className="py-2.5 px-3 font-mono text-slate-700">
                                  {p.unit}
                                </td>

                                {/* MRP */}
                                <td className="py-2.5 px-3 text-right font-mono text-slate-400 line-through">
                                  ₹{p.mrp}
                                </td>

                                {/* Selling Price */}
                                <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800 text-sm">
                                  ₹{p.price}
                                </td>

                                {/* Stock with Alert Badging */}
                                <td className="py-2.5 px-3 text-center">
                                  {isOutOfStock ? (
                                    <div className="inline-flex flex-col items-center gap-0.5">
                                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded-[4px_8px_4px_8px] shadow-xs">
                                        <AlertOctagon className="w-3 h-3" />
                                        <span>OUT OF STOCK</span>
                                      </span>
                                      <span className="text-[10px] text-rose-800 font-mono font-bold">0 units left</span>
                                    </div>
                                  ) : isLowStock ? (
                                    <div className="inline-flex flex-col items-center gap-0.5">
                                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold bg-rose-100 text-rose-900 border border-rose-400 px-2 py-0.5 rounded-[4px_8px_4px_8px]">
                                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                                        <span>LOW STOCK ({p.stock})</span>
                                      </span>
                                      <span className="text-[10px] text-rose-800 font-mono font-bold">
                                        &lt; {lowStockThreshold} units limit
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="inline-flex flex-col items-center">
                                      <span className="font-mono text-xs text-slate-800 font-bold bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                                        {p.stock} in stock
                                      </span>
                                    </div>
                                  )}
                                </td>

                                {/* Actions */}
                                <td className="py-2.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                                  {/* Quick Restock Button */}
                                  <button
                                    onClick={() => {
                                      onUpdateProduct({ ...p, stock: p.stock + 10 });
                                      showToast(`Restocked +10 units to "${p.name}" (New stock: ${p.stock + 10}) ✓`);
                                    }}
                                    className="p-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[11px] cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                                    title="Quick Restock: Add +10 units to stock"
                                  >
                                    <Plus className="w-3 h-3 text-emerald-700" />
                                    <span className="font-mono">+10</span>
                                  </button>

                                  <button
                                    onClick={() => handleOpenEdit(p)}
                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-emerald-800 border border-slate-300 font-bold text-xs cursor-pointer inline-flex items-center shadow-2xs"
                                    title="Edit Product Details & Stock"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => {
                                      if (confirm(`Kya aap sach me "${p.name}" ko inventory se delete karna chahte hain?`)) {
                                        onDeleteProduct(p.id);
                                        showToast(`Product "${p.name}" deleted`);
                                      }
                                    }}
                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-rose-700 border border-slate-300 font-bold text-xs cursor-pointer inline-flex items-center shadow-2xs"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>

              </div>
            )}

            {/* TAB 2: COUNTER POS BILLING */}
            {activeTab === 'pos' && (
              <div className="grid lg:grid-cols-12 gap-6">
                
                {/* Left: Product Selector Grid */}
                <div className="lg:col-span-7 bg-white p-5 rounded-[4px_16px_4px_16px] border-[1.5px] border-[#241F18] shadow-[4px_4px_0_rgba(36,31,24,0.12)] space-y-4">
                  <div>
                    <h3 className="font-display font-bold text-base text-[#152A1C]">
                      Select Items for Quick POS Bill
                    </h3>
                    <p className="font-hand text-xs text-[#6B6152]">
                      Item par click karein bill me add karne ke liye
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[500px] overflow-y-auto p-1">
                    {products.map(p => {
                      const currentQtyInPos = posCart[p.id] || 0;
                      const isOutOfStock = p.stock <= 0;
                      const isMaxReached = currentQtyInPos >= p.stock;

                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            if (isOutOfStock) {
                              showToast(`⚠️ "${p.name}" out of stock hai!`);
                              return;
                            }
                            if (isMaxReached) {
                              showToast(`⚠️ "${p.name}" ka kewal ${p.stock} units available hai!`);
                              return;
                            }
                            setPosCart(prev => ({
                              ...prev,
                              [p.id]: (prev[p.id] || 0) + 1
                            }));
                          }}
                          className={`p-2.5 rounded-xl border border-[#241F18] transition-all flex flex-col justify-between ${
                            isOutOfStock
                              ? 'bg-rose-50/70 opacity-60 cursor-not-allowed'
                              : 'bg-[#F1EAD9]/40 hover:bg-[#F1EAD9] cursor-pointer hover:scale-[1.02]'
                          }`}
                        >
                          <div className="relative w-12 h-12 rounded-full bg-white border border-[#241F18] mx-auto p-1 overflow-hidden">
                            <img 
                              src={p.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80"} 
                              alt={p.name} 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80";
                              }}
                              className="w-full h-full object-contain" 
                            />
                            {isOutOfStock && (
                              <span className="absolute inset-0 bg-rose-900/60 text-white font-bold text-[9px] flex items-center justify-center">
                                Out
                              </span>
                            )}
                          </div>
                          <div className="text-center mt-1">
                            <div className="font-bold text-xs text-slate-900 truncate">{p.name}</div>
                            <div className="flex items-center justify-center gap-1">
                              <span className="font-mono text-xs font-extrabold text-[#2B4430]">₹{p.price}</span>
                              <span className="text-[10px] text-slate-500 font-mono">({p.stock})</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Active Bill Summary & Print */}
                <div className="lg:col-span-5 bg-white p-5 rounded-[4px_16px_4px_16px] border-[1.5px] border-[#241F18] shadow-[4px_4px_0_rgba(36,31,24,0.12)] flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <h3 className="font-display font-bold text-base text-[#152A1C] border-b border-[#241F18] pb-2">
                      Counter Bill Preview
                    </h3>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600">Customer Name</label>
                        <input
                          type="text"
                          value={posCustomerName}
                          onChange={(e) => setPosCustomerName(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded border border-[#241F18] text-xs bg-[#F1EAD9]/30"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600">Mobile No</label>
                        <input
                          type="text"
                          value={posCustomerPhone}
                          onChange={(e) => setPosCustomerPhone(e.target.value)}
                          placeholder="Optional"
                          className="w-full px-2.5 py-1.5 rounded border border-[#241F18] text-xs bg-[#F1EAD9]/30 font-mono"
                        />
                      </div>
                    </div>

                    {/* Selected items list */}
                    <div className="max-h-60 overflow-y-auto space-y-2 border-t border-b border-dashed border-[#DCD0B4] py-3">
                      {Object.keys(posCart).length === 0 ? (
                        <div className="text-center text-xs text-[#6B6152] font-hand py-6">
                          Koi item select nahi hua hai. Left side se items click karein.
                        </div>
                      ) : (
                        Object.entries(posCart).map(([id, quantity]) => {
                          const p = products.find(x => x.id === id);
                          const qty = Number(quantity);
                          if (!p) return null;
                          return (
                            <div key={id} className="flex items-center justify-between text-xs bg-[#F1EAD9]/50 p-2 rounded border border-[#241F18]">
                              <div className="flex-1 truncate mr-2">
                                <div className="font-bold text-slate-900 truncate">{p.name}</div>
                                <div className="text-[10px] text-slate-500 font-mono">₹{p.price} x {qty} = ₹{p.price * qty}</div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => setPosCart(prev => {
                                    const copy = { ...prev };
                                    if (copy[id] <= 1) delete copy[id];
                                    else copy[id] -= 1;
                                    return copy;
                                  })}
                                  className="w-5 h-5 bg-white border border-[#241F18] rounded flex items-center justify-center font-bold"
                                >
                                  −
                                </button>
                                <span className="w-5 text-center font-mono font-bold">{qty}</span>
                                <button
                                  onClick={() => {
                                    if (p && qty >= p.stock) {
                                      showToast(`⚠️ "${p.name}" ka kewal ${p.stock} units available hai!`);
                                      return;
                                    }
                                    setPosCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
                                  }}
                                  className="w-5 h-5 bg-white border border-[#241F18] rounded flex items-center justify-center font-bold"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Bill Total & Generate Button */}
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center font-mono">
                      <span className="text-xs font-bold text-slate-600">Total Amount:</span>
                      <span className="font-bold text-xl text-[#2B4430]">
                        {formatCurrency(
                          Object.entries(posCart).reduce((sum: number, [id, quantity]) => {
                            const p = products.find(x => x.id === id);
                            const qty = Number(quantity);
                            return sum + (p ? p.price * qty : 0);
                          }, 0)
                        )}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        const items: CartItem[] = Object.entries(posCart).map(([id, qty]) => {
                          const p = products.find(x => x.id === id);
                          if (!p) return null;
                          return { product: p, quantity: Number(qty) };
                        }).filter(Boolean) as CartItem[];

                        if (items.length === 0) {
                          alert('Pehle bill me kam se kam 1 item add karein.');
                          return;
                        }

                        onGenerateQuickPOSBill(items, posCustomerName, posCustomerPhone);
                        setPosCart({});
                      }}
                      className="w-full bg-[#2B4430] hover:bg-[#152A1C] text-[#F1EAD9] py-3 rounded-[4px_12px_4px_12px] font-bold text-sm border-[1.5px] border-[#241F18] shadow-[3px_3px_0_#241F18] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-[#C68A2E]" />
                      <span>Print & Generate Official Bill</span>
                    </button>
                  </div>

                </div>

              </div>
            )}

            {/* TAB 3: INVOICES HISTORY */}
            {activeTab === 'invoices' && (
              <div className="bg-white rounded-[4px_16px_4px_16px] border-[1.5px] border-[#241F18] shadow-[4px_4px_0_rgba(36,31,24,0.12)] p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#241F18] pb-3">
                  <div>
                    <h3 className="font-display font-bold text-base text-[#152A1C]">
                      Generated Bills & Order Records
                    </h3>
                    <p className="font-hand text-xs text-[#6B6152]">
                      Sabhi past orders aur computerized bills ka record
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b-[1.5px] border-[#241F18] bg-[#F1EAD9] text-[#152A1C] font-mono uppercase text-[11px]">
                        <th className="py-2.5 px-3">Invoice No</th>
                        <th className="py-2.5 px-3">Date & Time</th>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3">Phone</th>
                        <th className="py-2.5 px-3 text-center">Items</th>
                        <th className="py-2.5 px-3 text-right">Total (₹)</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dashed divide-[#DCD0B4]">
                      {invoices.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-[#6B6152] font-hand text-sm">
                            Abhi tak koi bill generate nahi hua hai.
                          </td>
                        </tr>
                      ) : (
                        invoices.map(inv => (
                          <tr key={inv.id} className="hover:bg-[#F1EAD9]/30">
                            <td className="py-2.5 px-3 font-mono font-bold text-[#2B4430]">
                              {inv.invoiceNumber}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-600">
                              {inv.dateStr} · {inv.timeStr}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">
                              {inv.customer.name}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-600">
                              {inv.customer.phone}
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold">
                              {inv.items.length}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-[#2B4430] text-sm">
                              ₹{inv.totalAmount}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="inline-flex items-center gap-1.5 justify-end">
                                <button
                                  onClick={() => onViewInvoice(inv)}
                                  className="inline-flex items-center gap-1 bg-[#F1EAD9] hover:bg-[#2B4430] hover:text-white px-2.5 py-1 rounded border border-[#241F18] font-bold text-xs cursor-pointer transition-colors"
                                  title="View and Print Invoice"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View / Print</span>
                                </button>
                                {onDeleteInvoice && (
                                  <button
                                    onClick={() => {
                                      if (confirm(`Kya aap Invoice ${inv.invoiceNumber} ko delete karna chahte hain?`)) {
                                        onDeleteInvoice(inv.id);
                                        showToast(`🗑️ Invoice ${inv.invoiceNumber} delete ho gaya.`);
                                      }
                                    }}
                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded border border-transparent hover:border-rose-300 transition-colors"
                                    title="Delete invoice record"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: STORE SETTINGS */}
            {activeTab === 'settings' && (
              <form onSubmit={handleSaveSettings} className="bg-white rounded-[4px_16px_4px_16px] border-[1.5px] border-[#241F18] shadow-[4px_4px_0_rgba(36,31,24,0.12)] p-6 space-y-6 max-w-3xl">
                <div>
                  <h3 className="font-display font-bold text-lg text-[#152A1C]">
                    Store Settings & Contact Details
                  </h3>
                  <p className="font-hand text-xs text-[#6B6152]">
                    Store name, helpline numbers, address, tax details aur admin password
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Store Name</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.storeName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#241F18] bg-[#F1EAD9]/30"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Tagline / Slogan</label>
                    <input
                      type="text"
                      value={settingsForm.tagline}
                      onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#241F18] bg-[#F1EAD9]/30"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Primary Phone & WhatsApp</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.phone1}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone1: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#241F18] bg-[#F1EAD9]/30 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Secondary Contact Phone</label>
                    <input
                      type="text"
                      value={settingsForm.phone2}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone2: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#241F18] bg-[#F1EAD9]/30 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Store Official Email</label>
                    <input
                      type="email"
                      value={settingsForm.email}
                      onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#241F18] bg-[#F1EAD9]/30"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Store UPI ID (For QR Payments)</label>
                    <input
                      type="text"
                      value={settingsForm.upiId}
                      onChange={(e) => setSettingsForm({ ...settingsForm, upiId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#241F18] bg-[#F1EAD9]/30 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-slate-700">Full Store Address</label>
                    <input
                      type="text"
                      value={settingsForm.address}
                      onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#241F18] bg-[#F1EAD9]/30"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-slate-700 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#B14B2C]" />
                        <span>Google Maps Store Location Link (दुकान का गूगल मैप्स लिंक)</span>
                      </span>
                      {settingsForm.googleMapsUrl && (
                        <a
                          href={settingsForm.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#B14B2C] hover:underline font-bold"
                        >
                          Test Link ↗
                        </a>
                      )}
                    </label>
                    <input
                      type="url"
                      placeholder="https://maps.app.goo.gl/..."
                      value={settingsForm.googleMapsUrl || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, googleMapsUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#241F18] bg-[#F1EAD9]/30 font-mono text-xs"
                    />
                    <p className="text-[11px] text-[#6B6152] font-hand">
                      Yeh link website ke navbar, hero section, footer aur computerized bill par dikhayi dega.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5">
                      <span>🛵 Max Home Delivery Radius (KM)</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0.5"
                        max="50"
                        step="0.5"
                        required
                        value={settingsForm.deliveryRadiusKm ?? 1}
                        onChange={(e) => setSettingsForm({ ...settingsForm, deliveryRadiusKm: Number(e.target.value) || 1 })}
                        className="w-full px-3 py-2 rounded-xl border border-[#241F18] bg-[#F1EAD9]/30 font-mono font-bold text-[#152A1C]"
                      />
                      <span className="text-xs font-mono text-[#6B6152] shrink-0 font-bold">KM</span>
                    </div>
                    <p className="text-[11px] text-[#6B6152] font-hand">
                      Customers ko banner aur checkout par bataya jayega ki delivery keval {settingsForm.deliveryRadiusKm ?? 1} km tak hi di ja sakti hai.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">GSTIN Number</label>
                    <input
                      type="text"
                      value={settingsForm.gstNumber}
                      onChange={(e) => setSettingsForm({ ...settingsForm, gstNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#241F18] bg-[#F1EAD9]/30 font-mono uppercase"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">FSSAI License No</label>
                    <input
                      type="text"
                      value={settingsForm.fssaiNumber}
                      onChange={(e) => setSettingsForm({ ...settingsForm, fssaiNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#241F18] bg-[#F1EAD9]/30 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Standard Delivery Fee (डिलीवरी चार्ज ₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={settingsForm.deliveryFee ?? 10}
                      onChange={(e) => setSettingsForm({ ...settingsForm, deliveryFee: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-[#241F18] bg-[#F1EAD9]/30 font-mono font-bold text-[#152A1C]"
                    />
                    <p className="text-[11px] text-[#6B6152] font-hand">
                      1 km ke andar delivery charge (₹{settingsForm.deliveryFee ?? 10})
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Min Free Delivery Amount (₹)</label>
                    <input
                      type="number"
                      value={settingsForm.minFreeDelivery}
                      onChange={(e) => setSettingsForm({ ...settingsForm, minFreeDelivery: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-[#241F18] bg-[#F1EAD9]/30 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Low-Stock Alert Threshold (कम स्टॉक चेतावनी सीमा)</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="500"
                        required
                        value={settingsForm.lowStockThreshold ?? 2}
                        onChange={(e) => setSettingsForm({ ...settingsForm, lowStockThreshold: Math.max(1, Number(e.target.value) || 1) })}
                        className="w-full px-3 py-2 rounded-xl border border-[#241F18] bg-[#F1EAD9]/30 font-mono font-bold text-rose-700"
                      />
                      <span className="text-xs font-mono text-[#6B6152] shrink-0 font-bold">units</span>
                    </div>
                    <p className="text-[11px] text-[#6B6152] font-hand">
                      Jis item ka stock is sankhya se kam (&lt;) hoga, wo admin inventory list mein red alert se highlight hoga.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Admin Password / PIN</label>
                    <input
                      type="text"
                      value={settingsForm.adminPin}
                      onChange={(e) => setSettingsForm({ ...settingsForm, adminPin: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#241F18] bg-[#F1EAD9]/30 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="bg-[#2B4430] hover:bg-[#152A1C] text-[#F1EAD9] px-6 py-3 rounded-[4px_12px_4px_12px] font-bold text-sm border-[1.5px] border-[#241F18] shadow-[3px_3px_0_#241F18] cursor-pointer"
                  >
                    Save Settings (सेटिंग्स सेव करें)
                  </button>
                </div>
              </form>
            )}

          </main>
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[6px_22px_6px_22px] border-[1.5px] border-[#241F18] shadow-[6px_6px_0_#152A1C] p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-[#241F18] pb-3">
              <h3 className="font-display font-bold text-lg text-[#152A1C]">
                {editingProduct ? 'Edit Product Details' : '+ Add New Item to Store'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="w-8 h-8 rounded-full border border-[#241F18] flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              
              {/* Product Name in English */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">
                  Product Name (English) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fortune Mustard Oil / Tata Tea Gold"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#241F18] bg-[#F1EAD9]/30 font-semibold"
                />
              </div>

              {/* Hindi Name */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">
                  Hindi Name (सामान का नाम हिंदी में)
                </label>
                <input
                  type="text"
                  placeholder="e.g. फॉर्च्यून शुद्ध कच्ची घानी सरसों तेल"
                  value={productForm.hindiName}
                  onChange={(e) => setProductForm({ ...productForm, hindiName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#241F18] bg-[#F1EAD9]/30 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Category */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#241F18] bg-white font-bold"
                  >
                    {INITIAL_CATEGORIES.filter(c => c !== 'All Items').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Unit */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Unit / Pack Size</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1 kg / 500 ml / 1 pc"
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#241F18] bg-[#F1EAD9]/30 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* MRP */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">MRP (₹)</label>
                  <input
                    type="number"
                    required
                    value={productForm.mrp}
                    onChange={(e) => setProductForm({ ...productForm, mrp: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#241F18] bg-[#F1EAD9]/30 font-mono"
                  />
                </div>

                {/* Selling Price */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#241F18] bg-[#F1EAD9]/30 font-mono font-bold text-emerald-800"
                  />
                </div>

                {/* Stock Count */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center justify-between">
                    <span>Stock Qty</span>
                    {productForm.stock < lowStockThreshold && (
                      <span className="text-[10px] text-rose-600 font-bold flex items-center gap-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" /> Low
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Math.max(0, Number(e.target.value) || 0) })}
                    className={`w-full px-3 py-2 rounded-xl border bg-[#F1EAD9]/30 font-mono font-bold ${
                      productForm.stock < lowStockThreshold
                        ? 'border-rose-500 text-rose-700'
                        : 'border-[#241F18]'
                    }`}
                  />
                  {productForm.stock < lowStockThreshold && (
                    <p className="text-[10px] text-rose-600 font-medium">
                      Stock &lt; {lowStockThreshold} (Triggers low-stock alert)
                    </p>
                  )}
                </div>
              </div>

              {/* Photo Selector (Upload or URL) */}
              <div className="space-y-2 pt-2 border-t border-dashed border-[#DCD0B4]">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Product Photo</label>
                  <label className="text-[11px] font-bold text-[#2B4430] hover:underline cursor-pointer flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Device Image (गैलरी से फोटो चुनें)</span>
                    <input type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" />
                  </label>
                </div>

                {/* Image Preview & URL */}
                <div className="flex items-center gap-3">
                  <img
                    src={productForm.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'}
                    alt="Preview"
                    className="w-16 h-16 rounded-full object-contain bg-[#F1EAD9] border border-[#241F18] p-1 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div className="flex-1 space-y-1">
                    <input
                      type="url"
                      placeholder="Paste online image URL (e.g. https://...)"
                      value={productForm.image}
                      onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#241F18] text-xs font-mono"
                    />
                    <p className="text-[10px] text-slate-500 font-hand">
                      Aap apne phone/computer se photo upload kar sakte hain ya koi bhi online photo URL paste kar sakte hain.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-[#241F18] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-[4px_10px_4px_10px] border border-[#241F18] font-bold bg-white text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#2B4430] text-[#F1EAD9] px-6 py-2 rounded-[4px_10px_4px_10px] font-bold border-[1.5px] border-[#241F18] shadow-[2px_2px_0_#241F18]"
                >
                  {editingProduct ? 'Save Changes' : '+ Add Product'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
