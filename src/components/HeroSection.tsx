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
    <div className="container-custom py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[500px]">
        {/* Main Left Banner */}
        <div className="lg:col-span-2 relative overflow-hidden bg-[#f3f9fb] group rounded-none">
          <div className="absolute inset-0 z-0">
            <img
              src={banners[0]?.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000"}
              alt={banners[0]?.title || "Grocery Deals"}
              className="w-full h-full object-cover object-right group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <div className="relative z-10 h-full flex flex-col justify-end px-8 md:px-16 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {banners[0]?.topText && (
                <p className="text-primary font-black uppercase tracking-[0.3em] text-xs mb-4 bg-white/90 backdrop-blur-sm inline-block px-4 py-1.5 rounded-full shadow-sm">
                  {banners[0].topText}
                </p>
              )}
              <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
                {banners[0]?.title || "Premium Collection"}
              </h2>
              <Link
                to={banners[0]?.link || "/products"}
                className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-bold text-lg hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 group/btn"
              >
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Right Side Banner */}
        <div className="relative overflow-hidden bg-[#fde1b6] p-10 flex flex-col justify-end group rounded-none">
          <div className="absolute inset-0 z-0">
            <img
              src={smallBanners[0]?.image || "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&q=80&w=600"}
              alt={smallBanners[0]?.title || "Weekend Discount"}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="relative z-10">
            {smallBanners[0]?.topText && (
              <p className="text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-3 bg-white/90 backdrop-blur-sm inline-block px-3 py-1 rounded-full shadow-sm">
                {smallBanners[0].topText}
              </p>
            )}
            <h3 className="text-2xl font-black text-gray-900 mb-4">
              {smallBanners[0]?.title || "Weekend Discount"}
            </h3>
            <Link
              to={smallBanners[0]?.link || "/products"}
              className="inline-flex items-center gap-2 text-gray-900 font-bold hover:text-primary transition-colors group/link"
            >
              <div className="w-8 h-8 bg-primary flex items-center justify-center text-white group-hover/link:scale-110 transition-transform">
                <Plus className="h-4 w-4" />
              </div>
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
