import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Gift, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { getProxyUrl } from '../lib/utils';

export default function OfferPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const { settings } = useSettings();

  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem('hasSeenOfferPopup');
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000); // Show after 3 seconds
      return () => clearTimeout(timer);
    }
  }, []);

  const closePopup = () => {
    setIsOpen(false);
    sessionStorage.setItem('hasSeenOfferPopup', 'true');
  };

  if (!isOpen || !settings.enableOfferPopup) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-[320px] md:max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl"
        >
          <button
            onClick={closePopup}
            className="absolute top-3 right-3 z-10 p-1.5 bg-white/80 backdrop-blur-md rounded-full text-gray-800 hover:bg-white transition-colors shadow-lg"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="relative h-32 md:h-56">
            <img
              src={getProxyUrl(settings.offerPopupImage || "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=800")}
              alt="Special Offer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-3 left-4 md:bottom-4 md:left-6">
              <div className="flex items-center gap-1.5 bg-primary text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[8px] md:text-xs font-black uppercase tracking-widest mb-1 md:mb-2 shadow-lg">
                <Gift className="h-2.5 w-2.5 md:h-3 md:w-3" /> Special Offer
              </div>
              <h2 className="text-lg md:text-2xl font-black text-white uppercase tracking-tight font-display">{settings.offerPopupTitle}</h2>
            </div>
          </div>

          <div className="p-5 md:p-8 text-center">
            <p className="text-gray-600 text-xs md:text-sm font-medium mb-4 md:mb-6 leading-relaxed">
              {settings.offerPopupSubtitle}
            </p>
            
            <div className="space-y-2 md:space-y-3">
              <Link
                to={settings.offerPopupLink || "/products"}
                onClick={closePopup}
                className="flex items-center justify-center w-full py-3 md:py-4 bg-primary text-white font-black rounded-xl md:rounded-2xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 group uppercase tracking-widest text-xs md:text-base"
              >
                Shop Now <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={closePopup}
                className="text-gray-400 text-[10px] md:text-sm font-bold hover:text-gray-600 transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
