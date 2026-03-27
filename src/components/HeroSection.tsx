import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Plus } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export default function HeroSection() {
  const { settings } = useSettings();
  const banners = settings.banners || [];
  const smallBanners = settings.smallBanners || [];

  return (
    <div className="container-custom py-4 md:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 h-auto lg:h-[500px]">
        {/* Main Left Banner */}
        <div className="lg:col-span-2 relative overflow-hidden bg-[#f3f9fb] group rounded-2xl md:rounded-none h-[350px] md:h-[500px] lg:h-full">
          <div className="absolute inset-0 z-0">
            <img
              src={banners[0]?.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000"}
              alt={banners[0]?.title || "Grocery Deals"}
              className="w-full h-full object-cover object-right group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            {/* Gradient Overlay for better readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
          </div>
          
          <div className="relative z-10 h-full flex flex-col justify-end px-8 md:px-16 py-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {banners[0]?.topText && (
                <p className="text-primary font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs mb-4 bg-white inline-block px-4 py-1.5 rounded-sm shadow-sm">
                  {banners[0].topText}
                </p>
              )}
              <h2 
                className="text-3xl md:text-4xl font-bold mb-4 leading-[1.2] tracking-tight text-white drop-shadow-lg font-display"
              >
                {banners[0]?.title || "Premium Collection"}
              </h2>
              {banners[0]?.subtitle && (
                <p 
                  className="text-lg md:text-2xl font-medium mb-8 max-w-lg text-white/90 drop-shadow-md font-sans"
                >
                  {banners[0].subtitle}
                </p>
              )}
              <Link
                to={banners[0]?.link || "/products"}
                className="inline-flex items-center justify-center px-10 py-4 bg-primary text-white font-bold text-lg hover:bg-primary-dark transition-all shadow-2xl shadow-primary/40 group/btn rounded-sm font-sans"
              >
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Right Side Banner */}
        <div className="relative overflow-hidden bg-[#fde1b6] p-8 md:p-10 flex flex-col justify-end group rounded-2xl md:rounded-none h-[250px] md:h-[500px] lg:h-full">
          <div className="absolute inset-0 z-0">
            <img
              src={smallBanners[0]?.image || "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&q=80&w=600"}
              alt={smallBanners[0]?.title || "Weekend Discount"}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            {/* Overlay for small banner */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          </div>

          <div className="relative z-10">
            {smallBanners[0]?.topText && (
              <p className="text-primary font-bold uppercase tracking-[0.2em] text-[9px] mb-3 bg-white inline-block px-3 py-1 rounded-sm shadow-sm font-sans">
                {smallBanners[0].topText}
              </p>
            )}
            <h3 
              className="text-3xl font-bold mb-2 text-white drop-shadow-md font-display"
            >
              {smallBanners[0]?.title || "Weekend Discount"}
            </h3>
            {smallBanners[0]?.subtitle && (
              <p 
                className="text-base font-medium mb-6 text-white/90 drop-shadow-sm font-sans"
              >
                {smallBanners[0].subtitle}
              </p>
            )}
            <Link
              to={smallBanners[0]?.link || "/products"}
              className="inline-flex items-center gap-3 text-white font-bold hover:text-primary transition-colors group/link font-sans"
            >
              <div className="w-10 h-10 bg-primary flex items-center justify-center text-white group-hover/link:scale-110 transition-transform shadow-lg">
                <Plus className="h-5 w-5" />
              </div>
              <span className="text-lg">Shop Now</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
