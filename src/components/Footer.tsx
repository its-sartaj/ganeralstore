import React from 'react';
import { 
  PhoneCall, 
  Mail, 
  MapPin, 
  Clock, 
  Store, 
  Lock 
} from 'lucide-react';
import { StoreSettings } from '../types';
import { cleanPhoneNumber, sanitizeUrl } from '../lib/utils';

interface FooterProps {
  settings: StoreSettings;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onOpenAdmin
}) => {
  return (
    <footer id="contact" className="bg-[#152A1C] text-[#DCE6DF] mt-12 border-t-[1.5px] border-[#241F18]">
      
      {/* Top Awning Stripe */}
      <div className="awning-stripe" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
          
          {/* Store Info & Address */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-[3px_10px_3px_10px] bg-white text-[#2B4430] flex items-center justify-center font-bold border border-[#241F18]">
                <Store className="w-5 h-5" />
              </div>
              <h4 className="font-display text-lg font-bold text-white tracking-tight">
                {settings.storeName}
              </h4>
            </div>

            <p className="text-xs sm:text-sm text-[#AFC0B4] leading-relaxed">
              {settings.address}, {settings.cityState}
            </p>

            {/* Google Maps Location & Delivery Radius Card */}
            <div className="bg-white/10 p-3 rounded-xl border border-white/15 space-y-2">
              <a
                href={sanitizeUrl(settings.googleMapsUrl, 'https://maps.app.goo.gl/eYQJgkGnchc1DfPr8')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-[#B14B2C] hover:bg-[#8F371C] text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-[#241F18] shadow-xs transition-colors"
                title="View Khurshid General Store on Google Maps"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>📍 View Location on Google Maps (नक्शा) ↗</span>
              </a>

              <div className="text-[11px] text-[#F1EAD9] font-mono flex items-center gap-1.5">
                <span className="text-[#C68A2E]">🛵 Delivery Area:</span>
                <span className="font-bold bg-[#152A1C] px-1.5 py-0.5 rounded text-white border border-white/20">
                  Strictly up to {settings.deliveryRadiusKm ?? 1} km radius only
                </span>
              </div>
            </div>

            <div className="space-y-1.5 pt-1 text-xs font-mono">
              <div className="flex items-center gap-2 text-white">
                <PhoneCall className="w-3.5 h-3.5 text-[#C68A2E]" />
                <a href={`tel:${cleanPhoneNumber(settings.phone1)}`} className="hover:text-[#C68A2E]">
                  +91 {settings.phone1} (Primary)
                </a>
              </div>

              {settings.phone2 && (
                <div className="flex items-center gap-2 text-[#DCE6DF]">
                  <PhoneCall className="w-3.5 h-3.5 text-[#9FB2CE]" />
                  <a href={`tel:${cleanPhoneNumber(settings.phone2)}`} className="hover:text-white">
                    +91 {settings.phone2} (Secondary)
                  </a>
                </div>
              )}

              {settings.email && (
                <div className="flex items-center gap-2 text-[#DCE6DF]">
                  <Mail className="w-3.5 h-3.5 text-[#C68A2E]" />
                  <a href={`mailto:${settings.email}`} className="hover:text-white">
                    {settings.email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Store Hours */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider text-[#C68A2E] flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Store Hours (दुकान का समय)</span>
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#AFC0B4] font-mono bg-white/5 p-4 rounded-xl border border-white/10">
              <li className="flex justify-between items-center py-1 border-b border-white/10">
                <span className="text-white">Monday – Saturday</span>
                <span className="text-[#C68A2E] font-bold">6:00 AM – 9:00 PM</span>
              </li>
              <li className="flex justify-between items-center py-1">
                <span className="text-white">Sunday (रविवार)</span>
                <span className="text-[#C68A2E] font-bold">6:00 AM – 9:00 PM</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright & Discreet Merchant Access */}
        <div className="mt-8 pt-4 border-t border-dashed border-white/20 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8FA095] gap-2">
          <div className="font-hand">
            © {new Date().getFullYear()} {settings.storeName}. Order karein, payment WhatsApp par confirm karein.
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAdmin}
              className="opacity-30 hover:opacity-100 transition-opacity text-[10px] text-white/50 hover:text-[#C68A2E] flex items-center gap-1 cursor-pointer"
              title="Shop Owner Login (#admin)"
            >
              <Lock className="w-2.5 h-2.5" />
              <span>Staff / Owner</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
