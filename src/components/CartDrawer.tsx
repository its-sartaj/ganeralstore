import React from 'react';
import { MessageCircle, Receipt, Truck, MapPin } from 'lucide-react';
import { CartItem, StoreSettings } from '../types';
import { formatCurrency, cleanPhoneNumber, sanitizeUrl, getOptimizedImageUrl } from '../lib/utils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  settings: StoreSettings;
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onProceedToBill: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  settings,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToBill
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const totalMrp = items.reduce((sum, item) => sum + (item.product.mrp * item.quantity), 0);
  const totalDiscount = Math.max(0, totalMrp - subtotal);
  const isFreeDelivery = subtotal >= settings.minFreeDelivery;
  const deliveryFee = items.length === 0 ? 0 : (isFreeDelivery ? 0 : settings.deliveryFee);
  const grandTotal = subtotal + deliveryFee;

  const handleWhatsAppCheckout = () => {
    if (items.length === 0) return;
    let msg = `Namaste ${settings.storeName}! 🙏\nMujhe ye saaman order karna hai:\n\n`;
    items.forEach((item, idx) => {
      msg += `${idx + 1}. *${item.product.name}* (${item.product.unit}) x ${item.quantity} = ₹${item.product.price * item.quantity}\n`;
    });
    msg += `\n*Subtotal:* ₹${subtotal}\n`;
    if (totalDiscount > 0) msg += `*Total Savings:* ₹${totalDiscount}\n`;
    msg += `*Delivery Fee:* ${deliveryFee === 0 ? 'FREE' : '₹' + deliveryFee}\n`;
    msg += `*Grand Total:* ₹${grandTotal}\n\n`;
    msg += `Kripya order confirm karein aur delivery ki jaankari dein. Dhanyavaad!`;

    const cleanPhone = cleanPhoneNumber(settings.phone1);
    window.open(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-[#141914]/50 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 xs:pl-4 sm:pl-10">
        <div className="w-screen max-w-full xs:max-w-md bg-[#F1EAD9] shadow-2xl flex flex-col justify-between border-l-[1.5px] border-[#241F18] animate-slide-left">
          
          {/* Drawer Head */}
          <div className="p-5 border-b-[1.5px] border-dashed border-[#6B6152] flex items-center justify-between bg-white/70">
            <div>
              <h2 className="font-display text-xl font-bold text-[#152A1C]">
                Your Cart (सामान की टोकरी)
              </h2>
              <p className="font-hand text-xs text-[#6B6152]">
                {items.length} {items.length === 1 ? 'item' : 'items'} in your list
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={onClearCart}
                  aria-label="Clear all items from cart"
                  className="font-hand text-xs text-[#B14B2C] hover:underline font-bold px-2.5 py-2 min-h-[48px] flex items-center cursor-pointer"
                >
                  Clear all
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close cart drawer"
                className="w-10 h-10 rounded-full border border-[#241F18] bg-white flex items-center justify-center text-[#4E4639] hover:text-[#241F18] font-bold text-sm min-w-[48px] min-h-[48px] cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Free Delivery Bar */}
          {items.length > 0 && (
            <div className="bg-[#2B4430] text-[#F1EAD9] px-4 py-2 text-xs flex items-center justify-between border-b border-[#241F18]">
              <span className="flex items-center gap-1.5 font-medium">
                <Truck aria-hidden="true" className="w-3.5 h-3.5 text-[#C68A2E]" />
                {isFreeDelivery ? (
                  <span className="font-bold text-[#C68A2E]">🎉 FREE Home Delivery Active!</span>
                ) : (
                  <span>Add ₹{settings.minFreeDelivery - subtotal} more for <strong>FREE Delivery</strong></span>
                )}
              </span>
              <span className="font-mono text-[11px] text-[#9FB2CE]">
                Min ₹{settings.minFreeDelivery}
              </span>
            </div>
          )}

          {/* Drawer Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-white border-[1.5px] border-dashed border-[#4E4639] flex items-center justify-center text-3xl" aria-hidden="true">
                  🧺
                </div>
                <h3 className="font-hand text-lg text-[#152A1C] font-bold">
                  Aapka cart khaali hai.
                </h3>
                <p className="text-xs text-[#4E4639] max-w-xs leading-relaxed">
                  Dukaan se apna manpasand ration, oil, chawal ya masala add karein.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Start shopping groceries now"
                  className="mt-2 bg-[#2B4430] text-[#F1EAD9] px-5 py-2.5 rounded-[4px_12px_4px_12px] font-bold text-xs border-[1.5px] border-[#241F18] shadow-[2px_2px_0_#241F18] min-h-[48px] inline-flex items-center justify-center cursor-pointer"
                >
                  Shop Now (दुकान देखें)
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div 
                  key={item.product.id} 
                  className="flex gap-3 py-3 border-b border-dashed border-[#DCD0B4] items-center bg-white/60 p-2.5 rounded-xl"
                >
                  {/* Thumb */}
                  <div className="w-12 h-12 rounded-full bg-white border-[1.5px] border-dashed border-[#4E4639] flex items-center justify-center p-1 shrink-0 overflow-hidden">
                    <img 
                      src={getOptimizedImageUrl(item.product.image || "https://images.unsplash.com/photo-1542838132-92c53300491e", 96, 'webp')} 
                      alt={item.product.name} 
                      width="48"
                      height="48"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getOptimizedImageUrl("https://images.unsplash.com/photo-1542838132-92c53300491e", 96, 'webp');
                      }}
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs sm:text-sm text-[#241F18] truncate">
                      {item.product.name}
                    </div>
                    <div className="font-hand text-xs text-[#4E4639]">
                      {item.product.unit} · Qty {item.quantity}
                    </div>
                    <div className="font-mono text-xs font-bold text-[#2B4430] mt-0.5">
                      {formatCurrency(item.product.price * item.quantity)}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="flex items-center border-[1.5px] border-[#241F18] rounded-md overflow-hidden bg-white">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        aria-label={`Decrease quantity of ${item.product.name}`}
                        className="min-w-[48px] min-h-[48px] flex items-center justify-center font-bold text-base text-[#2B4430] hover:bg-[#F1EAD9] cursor-pointer touch-manipulation"
                        title="Decrease"
                      >
                        −
                      </button>
                      <span 
                        className="w-6 text-center text-xs font-mono font-bold text-[#241F18]"
                        aria-label={`Current quantity ${item.quantity}`}
                      >
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        disabled={item.quantity >= item.product.stock}
                        onClick={() => onUpdateQuantity(item.product.id, Math.min(item.product.stock, item.quantity + 1))}
                        aria-label={`Increase quantity of ${item.product.name}`}
                        className={`min-w-[48px] min-h-[48px] flex items-center justify-center font-bold text-base touch-manipulation ${
                          item.quantity >= item.product.stock
                            ? 'text-slate-300 bg-slate-100 cursor-not-allowed'
                            : 'text-[#2B4430] hover:bg-[#F1EAD9] cursor-pointer'
                        }`}
                        title={item.quantity >= item.product.stock ? `Max stock (${item.product.stock})` : "Increase"}
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.product.id)}
                      aria-label={`Remove ${item.product.name} from cart`}
                      className="text-xs font-bold text-[#B14B2C] hover:underline min-h-[48px] px-2 py-1 cursor-pointer flex items-center justify-center"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Foot (Receipt Style) */}
          {items.length > 0 && (
            <div className="p-5 border-t-[1.5px] border-dashed border-[#6B6152] bg-white/90 space-y-3">
              
              {/* Receipt Subtotal */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between font-mono text-slate-700">
                  <span>Items Subtotal:</span>
                  <span className="font-bold">{formatCurrency(subtotal)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between font-mono text-[#2E7D42] font-bold">
                    <span>Total Savings:</span>
                    <span>- {formatCurrency(totalDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-mono text-slate-700">
                  <span>Delivery Charge:</span>
                  <span className="font-bold">{deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}</span>
                </div>
                <div className="flex justify-between font-mono text-base font-bold text-[#152A1C] pt-2 border-t border-[#241F18]">
                  <span>Total Payable:</span>
                  <span className="text-lg text-[#2B4430]">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              {/* 1 KM Delivery Location Notice */}
              <div className="bg-amber-50 border border-amber-300 rounded-[4px_10px_4px_10px] p-2.5 text-xs text-amber-900 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#B14B2C]" />
                    <span>Home Delivery Area Limit:</span>
                  </span>
                  <span className="bg-[#B14B2C] text-white text-[10px] font-mono px-1.5 py-0.2 rounded">
                    Max {settings.deliveryRadiusKm ?? 1} KM
                  </span>
                </div>
                <p className="text-[11px] leading-tight text-amber-800">
                  Dukaan se <strong>1 km ke daayre mein</strong> delivery charge keval <strong>₹{settings.deliveryFee ?? 10}</strong> hai. (Min ₹{settings.minFreeDelivery} par Free delivery).
                </p>
                <div className="pt-0.5">
                  <a
                    href={sanitizeUrl(settings.googleMapsUrl, 'https://maps.app.goo.gl/eYQJgkGnchc1DfPr8')}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="View Shop Location on Google Maps"
                    className="text-[11px] font-bold text-[#8F371C] hover:underline inline-flex items-center gap-1 min-h-[48px]"
                  >
                    <span>📍 View Shop on Google Maps (दुकान का नक्शा देखें) ↗</span>
                  </a>
                </div>
              </div>

              {/* Checkout Buttons */}
              <div className="space-y-2 pt-1">
                {/* WhatsApp Checkout */}
                <button
                  type="button"
                  onClick={handleWhatsAppCheckout}
                  aria-label={`Checkout on WhatsApp for total ${formatCurrency(grandTotal)}`}
                  className="w-full min-h-[48px] bg-[#25D366] text-[#0e3d1e] border-[1.5px] border-[#241F18] p-3.5 rounded-[5px_14px_5px_14px] font-bold text-sm flex items-center justify-center gap-2 shadow-[3px_3px_0_#241F18] hover:shadow-[4px_4px_0_#241F18] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer touch-manipulation"
                >
                  <MessageCircle aria-hidden="true" className="w-4 h-4" />
                  <span>Checkout on WhatsApp</span>
                </button>

                {/* Generate Tax Invoice / Cash Memo */}
                <button
                  type="button"
                  onClick={onProceedToBill}
                  aria-label="Generate Computerized Bill or Cash Memo"
                  className="w-full min-h-[48px] bg-[#2B4430] text-[#F1EAD9] border-[1.5px] border-[#241F18] p-3 rounded-[5px_14px_5px_14px] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[3px_3px_0_#241F18] hover:bg-[#152A1C] transition-colors cursor-pointer touch-manipulation"
                >
                  <Receipt aria-hidden="true" className="w-4 h-4 text-[#C68A2E]" />
                  <span>Generate Computerized Bill / पर्ची</span>
                </button>
              </div>

              <div className="font-hand text-xs text-[#6B6152] text-center pt-1">
                Aap WhatsApp par redirect ho jayenge, order details pehle se bhari hongi.
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
