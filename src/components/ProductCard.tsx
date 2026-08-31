import React, { useState } from 'react';
import { Plus, Check, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../lib/utils';

interface ProductCardProps {
  product: Product;
  quantity: number;
  onAddToCart: (product: Product, quantity: number) => void;
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantity,
  onAddToCart,
  onUpdateQuantity
}) => {
  const [imageError, setImageError] = useState(false);
  const discountPercent = product.mrp > product.price 
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) 
    : 0;

  const isOutOfStock = product.stock <= 0;
  const fallbackImage = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80";

  const isMaxStockReached = quantity >= product.stock;

  return (
    <div className={`bg-white rounded-[4px_14px_4px_14px] sm:rounded-[4px_16px_4px_16px] border-[1.5px] border-[#241F18] p-2.5 sm:p-4 flex flex-col justify-between gap-2 shadow-[2px_2px_0_rgba(36,31,24,0.16)] sm:shadow-[3px_3px_0_rgba(36,31,24,0.16)] sm:hover:shadow-[5px_5px_0_rgba(36,31,24,0.22)] sm:hover:-translate-y-1 transition-all duration-200 relative overflow-hidden ${isOutOfStock ? 'opacity-70' : ''}`}>
      
      {/* Top Circular Thumbnail with Real Photo */}
      <div className="relative w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 mx-auto rounded-full bg-[#F1EAD9] border-[1.5px] border-dashed border-[#6B6152] flex items-center justify-center p-1.5 sm:p-2 overflow-hidden shrink-0 mt-0.5 sm:mt-1">
        <img
          src={imageError ? fallbackImage : (product.image || fallbackImage)}
          alt={product.name}
          onError={() => setImageError(true)}
          className="w-full h-full object-contain rounded-full hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        
        {/* Discount / Stock Flag */}
        {discountPercent > 0 ? (
          <span className="absolute -top-1 -right-1 text-[9px] sm:text-[10px] font-bold bg-[#C68A2E] text-[#241F18] px-1.5 sm:px-2 py-0.2 rounded-full border-[1.5px] border-[#241F18] font-mono shadow-2xs">
            {discountPercent}% OFF
          </span>
        ) : isOutOfStock ? (
          <span className="absolute -top-1 -right-1 text-[8px] sm:text-[9px] font-bold bg-[#B14B2C] text-white px-1.5 py-0.2 rounded-full border-[1.5px] border-[#241F18]">
            Out
          </span>
        ) : product.badge ? (
          <span className="absolute -top-1 -right-1 text-[8px] sm:text-[9px] font-bold bg-[#2B4430] text-white px-1.5 sm:px-2 py-0.2 rounded-full border-[1.5px] border-[#241F18]">
            {product.badge}
          </span>
        ) : (
          <span className="absolute -top-1 -right-1 text-[8px] sm:text-[9px] font-bold bg-[#55642F] text-white px-1.5 py-0.2 rounded-full border-[1.5px] border-[#241F18]">
            Fresh
          </span>
        )}
      </div>

      {/* Product Information */}
      <div className="text-center space-y-0.5 sm:space-y-1 mt-0.5">
        {/* Category Pill */}
        <div className="text-[9px] sm:text-[10px] font-bold text-[#55642F] uppercase tracking-wider truncate">
          {product.category}
        </div>

        {/* Product Name */}
        <h3 className="font-bold text-xs sm:text-sm text-[#241F18] leading-snug line-clamp-2 min-h-[30px] sm:min-h-[36px] break-words">
          {product.name}
        </h3>

        {/* Hindi Name */}
        {product.hindiName && (
          <p className="text-[10px] sm:text-[11px] text-[#6B6152] truncate font-sans">
            {product.hindiName}
          </p>
        )}

        {/* Unit */}
        <div className="font-hand text-[11px] sm:text-xs text-[#6B6152]">
          {product.unit}
        </div>
      </div>

      {/* Price & Stepper Row */}
      <div className="pt-1.5 sm:pt-2 border-t border-dashed border-[#DCD0B4] space-y-1.5 sm:space-y-2">
        <div className="flex items-center justify-between gap-1">
          <div>
            <div className="font-mono text-xs sm:text-base font-bold text-[#2B4430]">
              {formatCurrency(product.price)}
            </div>
            {product.mrp > product.price && (
              <div className="font-mono text-[10px] sm:text-[11px] text-[#6B6152] line-through">
                {formatCurrency(product.mrp)}
              </div>
            )}
          </div>

          {/* Stepper if in cart */}
          {quantity > 0 && !isOutOfStock && (
            <div className="flex items-center border-[1.5px] border-[#241F18] rounded-md overflow-hidden bg-[#F1EAD9]">
              <button
                onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center font-bold text-xs sm:text-sm text-[#2B4430] hover:bg-[#DCD0B4] transition-colors touch-manipulation"
                title="Decrease"
              >
                −
              </button>
              <span className="w-5 sm:w-6 text-center text-[10px] sm:text-xs font-mono font-bold text-[#241F18]">
                {quantity}
              </span>
              <button
                disabled={isMaxStockReached}
                onClick={() => onUpdateQuantity(product.id, Math.min(product.stock, quantity + 1))}
                className={`w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center font-bold text-xs sm:text-sm transition-colors touch-manipulation ${
                  isMaxStockReached
                    ? 'text-slate-300 bg-slate-100 cursor-not-allowed'
                    : 'text-[#2B4430] hover:bg-[#DCD0B4]'
                }`}
                title={isMaxStockReached ? `Max available stock (${product.stock}) reached` : "Increase"}
              >
                +
              </button>
            </div>
          )}
        </div>

        {/* Action Button */}
        {isOutOfStock ? (
          <button 
            disabled
            className="w-full py-1.5 sm:py-2 rounded-[4px_8px_4px_8px] sm:rounded-[4px_10px_4px_10px] bg-slate-200 text-slate-500 font-bold text-[11px] sm:text-xs border border-slate-300 cursor-not-allowed"
          >
            Out of Stock
          </button>
        ) : quantity > 0 ? (
          <button
            disabled={isMaxStockReached}
            onClick={() => onUpdateQuantity(product.id, Math.min(product.stock, quantity + 1))}
            className={`w-full py-1.5 sm:py-2 rounded-[4px_8px_4px_8px] sm:rounded-[4px_10px_4px_10px] font-bold text-[11px] sm:text-xs border-[1.5px] border-[#241F18] transition-all flex items-center justify-center gap-1 touch-manipulation ${
              isMaxStockReached
                ? 'bg-[#152A1C] text-[#DCE6DF] cursor-default'
                : 'bg-[#2E7D42] text-white shadow-[1.5px_1.5px_0_#241F18] sm:shadow-[2px_2px_0_#241F18] cursor-pointer'
            }`}
          >
            <Check className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#C68A2E] shrink-0" />
            <span className="truncate">
              {isMaxStockReached ? `Max (${quantity})` : `In Cart (${quantity}) +`}
            </span>
          </button>
        ) : (
          <button
            onClick={() => onAddToCart(product, 1)}
            className="w-full py-2 sm:py-2.5 rounded-[4px_8px_4px_8px] sm:rounded-[4px_10px_4px_10px] bg-[#2B4430] text-[#F1EAD9] font-bold text-[11px] sm:text-xs border-[1.5px] border-[#241F18] shadow-[1.5px_1.5px_0_#241F18] sm:shadow-[2px_2px_0_#241F18] hover:shadow-[3px_3px_0_#241F18] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 touch-manipulation"
          >
            <ShoppingBag className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#C68A2E] shrink-0" />
            <span>Add to Cart</span>
          </button>
        )}
      </div>

    </div>
  );
};
