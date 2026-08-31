import React from 'react';
import { 
  PhoneCall, 
  MessageCircle, 
  MapPin, 
  Store
} from 'lucide-react';
import { StoreSettings } from '../types';
import { cleanPhoneNumber } from '../lib/utils';

interface HeroBannerProps {
  settings: StoreSettings;
  onScrollToProducts: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  settings,
  onScrollToProducts
}) => {
  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-8 pb-6 sm:pb-10 w-full overflow-hidden">
      
      <div className="grid lg:grid-cols-12 gap-5 lg:gap-10 items-center">
        
        {/* Left Column: Hero Text & Actions */}
        <div className="lg:col-span-7 space-y-3.5 sm:space-y-5">
          
          {/* Eyebrow badge */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <div className="inline-flex items-center gap-1.5 bg-white text-[#152A1C] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold border-[1.5px] border-dashed border-[#6B6152] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#55642F] shrink-0" />
              <span>Open Now · Same-Day Delivery</span>
            </div>

            {/* 1 KM Delivery Radius Pill */}
            <div className="inline-flex items-center gap-1 bg-[#C68A2E]/15 text-[#8A5A12] px-2.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold border border-[#C68A2E]/40">
              <span>🛵 Delivery:</span>
              <span className="bg-[#8A5A12] text-white px-1.5 py-0.2 rounded-full text-[10px] font-mono">₹{settings.deliveryFee ?? 10} (Within {settings.deliveryRadiusKm ?? 1} KM)</span>
            </div>
          </div>

          {/* Main Display Headline */}
          <h1 className="font-display text-xl xs:text-2xl sm:text-4xl lg:text-5xl font-bold text-[#152A1C] leading-[1.2] sm:leading-[1.1] tracking-tight break-words">
            Ration se lekar <em className="not-italic text-[#B14B2C] underline decoration-[#C68A2E] decoration-wavy decoration-2">rozmarra</em> tak, sab kuch yahin.
          </h1>

          {/* Lead Paragraph with Delivery limit callout */}
          <p className="text-xs sm:text-base text-[#6B6152] leading-relaxed max-w-xl font-medium break-words">
            Grocery, dairy, snacks aur ghar ki zaroorat ka har saamaan — dukaan se <strong>{settings.deliveryRadiusKm ?? 1} km ke daayre mein</strong> superfast home delivery, ya dukaan par counter pickup karein.
          </p>

          {/* CTAs */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:flex sm:flex-wrap gap-2.5 sm:gap-3 pt-1 w-full">
            <button
              onClick={onScrollToProducts}
              className="w-full sm:w-auto bg-[#2B4430] text-[#F1EAD9] px-4 sm:px-6 py-2.5 sm:py-3 rounded-[5px_12px_5px_12px] sm:rounded-[5px_16px_5px_16px] font-bold text-xs sm:text-base border-[1.5px] border-[#241F18] shadow-[2.5px_2.5px_0_#241F18] sm:shadow-[4px_4px_0_#241F18] hover:shadow-[4px_4px_0_#241F18] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer text-center touch-manipulation"
            >
              Shop Now (सामान देखें) →
            </button>

            {/* Google Maps Location Button */}
            <a
              href={settings.googleMapsUrl || 'https://maps.app.goo.gl/eYQJgkGnchc1DfPr8'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-[#B14B2C] text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-[5px_12px_5px_12px] sm:rounded-[5px_16px_5px_16px] font-bold text-xs sm:text-base border-[1.5px] border-[#241F18] shadow-[2.5px_2.5px_0_#241F18] sm:shadow-[4px_4px_0_#241F18] hover:bg-[#8F371C] transition-all cursor-pointer touch-manipulation text-center"
              title="Open Khurshid General Store Location on Google Maps"
            >
              <MapPin className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-white shrink-0" />
              <span>📍 View on Maps</span>
            </a>
          </div>

          {/* Dual Phone Numbers Quick Access Strip */}
          <div className="pt-1 flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-mono w-full">
            <a 
              href={`tel:${cleanPhoneNumber(settings.phone1)}`}
              className="inline-flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-[4px_8px_4px_8px] border-[1.5px] border-[#241F18] shadow-[1.5px_1.5px_0_#241F18] font-bold text-[#152A1C] hover:bg-[#F1EAD9] touch-manipulation shrink-0"
            >
              <PhoneCall className="w-3 h-3 text-[#2B4430]" />
              <span>📞 {settings.phone1}</span>
            </a>

            <a 
              href={`https://wa.me/91${cleanPhoneNumber(settings.phone1)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 bg-[#25D366] text-[#0e3d1e] px-2.5 py-1.5 rounded-[4px_8px_4px_8px] border-[1.5px] border-[#241F18] shadow-[1.5px_1.5px_0_#241F18] font-bold touch-manipulation shrink-0"
            >
              <MessageCircle className="w-3 h-3" />
              <span>WhatsApp Helpline</span>
            </a>

            {settings.phone2 && (
              <a 
                href={`tel:${cleanPhoneNumber(settings.phone2)}`}
                className="inline-flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-[4px_8px_4px_8px] border-[1.5px] border-[#241F18] shadow-[1.5px_1.5px_0_rgba(36,31,24,0.15)] font-bold text-[#152A1C] hover:bg-[#F1EAD9] touch-manipulation shrink-0"
              >
                <PhoneCall className="w-3 h-3 text-[#C68A2E]" />
                <span>Alt: {settings.phone2}</span>
              </a>
            )}
          </div>

          {/* Social Proof Stats */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-6 pt-2.5 sm:pt-4 border-t-[1.5px] border-dashed border-[#DCD0B4] w-full">
            <div className="border-l-2 border-dashed border-[#6B6152] pl-2 sm:pl-3">
              <div className="font-display text-base sm:text-2xl font-bold text-[#152A1C]">500+</div>
              <div className="font-hand text-[10px] sm:text-xs text-[#6B6152] leading-tight">In stock</div>
            </div>
            <div className="border-l-2 border-dashed border-[#6B6152] pl-2 sm:pl-3">
              <div className="font-display text-base sm:text-2xl font-bold text-[#152A1C]">10+ yrs</div>
              <div className="font-hand text-[10px] sm:text-xs text-[#6B6152] leading-tight">Bharosa</div>
            </div>
            <div className="border-l-2 border-dashed border-[#6B6152] pl-2 sm:pl-3">
              <div className="font-display text-base sm:text-2xl font-bold text-[#152A1C]">Instant</div>
              <div className="font-hand text-[10px] sm:text-xs text-[#6B6152] leading-tight">WhatsApp Bill</div>
            </div>
          </div>

        </div>

        {/* Right Column: Authentic Signboard Card */}
        <div className="lg:col-span-5 w-full">
          <div className="relative bg-[#2B4430] rounded-[6px_16px_6px_16px] sm:rounded-[6px_22px_6px_22px] p-3.5 sm:p-7 text-white border-[1.5px] border-[#241F18] shadow-[3.5px_3.5px_0_#241F18] sm:shadow-[6px_6px_0_#241F18] overflow-hidden w-full">
            
            {/* Signboard Top Gold Awning Stripe */}
            <div className="absolute top-0 left-0 right-0 h-2 sm:h-3 bg-[repeating-linear-gradient(45deg,#C68A2E_0_10px,#2B4430_10px_20px)] border-b-[1.5px] border-[#241F18]" />

            {/* Emblem Badge on Signboard */}
            <div className="w-full max-w-[240px] bg-white text-[#241F18] rounded-[5px_12px_5px_12px] p-2 sm:p-3.5 my-2 sm:my-3 border-[1.5px] border-[#241F18] shadow-[2px_2px_0_rgba(0,0,0,0.3)]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg bg-[#2B4430] text-white flex items-center justify-center font-bold shrink-0">
                  <Store className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <div className="font-display font-black text-[11px] sm:text-sm text-[#152A1C] leading-tight uppercase truncate">
                    {settings.storeName}
                  </div>
                  <div className="text-[8px] sm:text-[10px] font-bold text-[#55642F] uppercase tracking-wider truncate">
                    ★ General Kirana & Ration ★
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] sm:text-sm text-[#DCE6DF] leading-relaxed mb-2.5 sm:mb-4">
              Aapke mohalle ki apni dukaan — taaza saaman, sahi daam, poora bharosa. Chawal, Atta, Dals, Tel, Ghee se lekar sabhi daily essentials.
            </p>

            {/* Store Hours Table */}
            <div className="space-y-1 sm:space-y-2 text-[11px] sm:text-xs font-mono border-t border-dashed border-white/30 pt-2 sm:pt-3">
              <div className="flex justify-between items-center text-[#F1EAD9] gap-1">
                <span className="shrink-0">Mon – Sat:</span>
                <span className="font-bold text-[#C68A2E] text-right truncate">6:00 AM – 9:00 PM</span>
              </div>
              <div className="flex justify-between items-center text-[#F1EAD9] gap-1">
                <span className="shrink-0">Sunday:</span>
                <span className="font-bold text-[#C68A2E] text-right truncate">6:00 AM – 9:00 PM</span>
              </div>
            </div>

            {/* Direct Helpline Buttons */}
            <div className="mt-2.5 pt-2 sm:pt-3 border-t border-dashed border-white/30 grid grid-cols-2 gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
              <a
                href={`tel:${cleanPhoneNumber(settings.phone1)}`}
                className="flex items-center justify-center gap-1 bg-[#F1EAD9] text-[#152A1C] py-1.5 sm:py-2 rounded-[4px_8px_4px_8px] font-bold border border-[#241F18] hover:bg-white transition-colors touch-manipulation text-center"
              >
                <PhoneCall className="w-3 h-3 text-[#2B4430] shrink-0" />
                <span>Call Store</span>
              </a>

              <a
                href={`https://wa.me/91${cleanPhoneNumber(settings.phone1)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 bg-[#25D366] text-[#0e3d1e] py-1.5 sm:py-2 rounded-[4px_8px_4px_8px] font-bold border border-[#241F18] hover:bg-[#20ba59] transition-colors touch-manipulation text-center"
              >
                <MessageCircle className="w-3 h-3 shrink-0" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Address & Direct Maps link on Signboard */}
            <div className="mt-2.5 pt-2 border-t border-dashed border-white/20 space-y-1.5 w-full">
              <a
                href={settings.googleMapsUrl || 'https://maps.app.goo.gl/eYQJgkGnchc1DfPr8'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] sm:text-[11px] text-[#F1EAD9] hover:text-[#C68A2E] flex items-center justify-between gap-1 bg-black/20 px-2 py-1.5 rounded-lg border border-white/10 hover:border-[#C68A2E] transition-all group w-full overflow-hidden"
                title="Open location in Google Maps"
              >
                <div className="flex items-center gap-1 min-w-0 flex-1 truncate">
                  <MapPin className="w-3 h-3 text-[#C68A2E] shrink-0" />
                  <span className="truncate">{settings.address}</span>
                </div>
                <span className="text-[9px] sm:text-[10px] font-mono underline text-[#C68A2E] shrink-0 font-bold ml-1">Maps ↗</span>
              </a>

              <div className="flex flex-wrap items-center justify-between gap-1 text-[9px] sm:text-[10px] font-mono text-[#DCE6DF] bg-[#152A1C]/60 px-2 py-1 rounded w-full">
                <span>🛵 Delivery Charge:</span>
                <span className="font-bold text-[#C68A2E]">₹{settings.deliveryFee ?? 10} (Within {settings.deliveryRadiusKm ?? 1} KM)</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </section>
  );
};
