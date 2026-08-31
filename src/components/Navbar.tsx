import React from 'react';
import { 
  PhoneCall, 
  MessageCircle, 
  Search, 
  Store, 
  MapPin 
} from 'lucide-react';
import { StoreSettings } from '../types';
import { formatCurrency, cleanPhoneNumber, sanitizeUrl } from '../lib/utils';

interface NavbarProps {
  settings: StoreSettings;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  cartCount,
  cartTotal,
  onOpenCart,
  searchTerm,
  onSearchChange
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#F1EAD9] border-b-[1.5px] border-[#241F18] shadow-xs">
      
      {/* Top Notice / Contact Strip */}
      <div className="bg-[#152A1C] text-[#DCE6DF] text-xs py-1.5 px-3 border-b border-[#241F18]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          
          {/* Left info */}
          <div className="flex items-center gap-1.5 font-medium truncate">
            <span className="w-2 h-2 rounded-full bg-[#55642F] shrink-0" />
            <span className="hidden sm:inline truncate">🏪 {settings.tagline || 'Roz ka saaman, apni gali se'} |</span>
            <span className="bg-[#C68A2E]/20 text-[#C68A2E] border border-[#C68A2E]/40 px-2 py-0.5 rounded-full font-bold text-[10px] sm:text-[11px] shrink-0">
              🛵 Delivery: Within {settings.deliveryRadiusKm ?? 1} KM (₹{settings.deliveryFee ?? 10})
            </span>
          </div>

          {/* Right contact links */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs shrink-0 font-mono">
            {/* Google Maps Link Button (Hidden on tiny screens to prevent wrap) */}
            <a
              href={sanitizeUrl(settings.googleMapsUrl, 'https://maps.app.goo.gl/eYQJgkGnchc1DfPr8')}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1 bg-white/10 hover:bg-white/20 text-[#F1EAD9] hover:text-white px-2 py-0.5 rounded-full font-bold transition-all border border-white/20"
              title="Open shop location on Google Maps"
            >
              <MapPin className="w-3.5 h-3.5 text-[#B14B2C]" />
              <span className="font-sans">📍 Maps</span>
            </a>

            <a 
              href={`tel:${cleanPhoneNumber(settings.phone1)}`} 
              className="flex items-center gap-1 text-[#F1EAD9] hover:text-[#C68A2E] transition-colors"
              title="Call Store"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#C68A2E]" />
              <span className="hidden xs:inline">{settings.phone1}</span>
              <span className="xs:hidden">Call</span>
            </a>

            <a 
              href={`https://wa.me/91${cleanPhoneNumber(settings.phone1)}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1 bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366] hover:text-[#0e3d1e] px-2 py-0.5 rounded-full font-bold transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>

        </div>
      </div>

      {/* Main Header Inner */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-6">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-[3px_11px_3px_11px] sm:rounded-[3px_13px_3px_13px] p-1 border-[1.5px] border-[#241F18] shadow-[2px_2px_0_#152A1C] sm:shadow-[3px_3px_0_#152A1C] flex items-center justify-center shrink-0">
              <Store className="w-5 h-5 sm:w-7 sm:h-7 text-[#2B4430]" />
            </div>
            <div className="min-w-0">
              <a href="#shop" className="block truncate">
                <div className="font-display font-bold text-sm sm:text-lg lg:text-xl text-[#152A1C] leading-tight tracking-tight truncate">
                  {settings.storeName}
                </div>
                <div className="font-hand text-[11px] sm:text-xs text-[#6B6152] leading-tight truncate">
                  {settings.tagline}
                </div>
              </a>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6152]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search Atta, Rice, Ghee, Masala, Tea, Biscuits..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border-[1.5px] border-[#241F18] rounded-[4px_12px_4px_12px] focus:outline-hidden focus:ring-2 focus:ring-[#C68A2E] shadow-[2px_2px_0_rgba(36,31,24,0.1)] placeholder:text-[#6B6152]"
              />
              {searchTerm && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6B6152] hover:text-[#241F18] font-bold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Navigation Links & Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-1.5 sm:gap-2 bg-[#2B4430] text-[#F1EAD9] border-[1.5px] border-[#241F18] px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-[4px_10px_4px_10px] sm:rounded-[4px_12px_4px_12px] font-bold text-xs sm:text-sm shadow-[2px_2px_0_#241F18] sm:shadow-[3px_3px_0_#241F18] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer touch-manipulation"
            >
              <span>🧺</span>
              <span className="hidden xs:inline">Cart</span>
              <span className="bg-[#C68A2E] text-[#241F18] rounded-full min-w-4 sm:min-w-5 h-4 sm:h-5 px-1 text-[10px] sm:text-xs font-mono font-bold flex items-center justify-center">
                {cartCount}
              </span>
              {cartTotal > 0 && (
                <span className="hidden sm:inline font-mono text-xs text-[#DCE6DF] border-l border-[#DCE6DF]/30 pl-1.5">
                  {formatCurrency(cartTotal)}
                </span>
              )}
            </button>

          </div>

        </div>

        {/* Mobile Search Bar */}
        <div className="mt-2 md:hidden">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6152]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search Atta, Rice, Dal, Tel, Ghee, Masala..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border-[1.5px] border-[#241F18] rounded-[4px_10px_4px_10px] focus:outline-hidden focus:ring-1 focus:ring-[#C68A2E]"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#6B6152] font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Signature Awning Stripe */}
      <div className="awning-stripe" />
    </header>
  );
};
