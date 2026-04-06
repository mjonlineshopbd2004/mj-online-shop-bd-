import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Plus } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { getProxyUrl } from '../lib/utils';

export default function HeroSection() {
  const { settings } = useSettings();
  const [bannerError, setBannerError] = React.useState(false);
  const [smallBannerError, setSmallBannerError] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const banners = settings.banners || [];
  const smallBanners = settings.smallBanners || [];

  // Auto-slide effect
  React.useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const currentBanner = banners[currentIndex] || {
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000",
    title: "Premium Collection",
    subtitle: "Quality products for your lifestyle",
    topText: "New Arrival",
    link: "/products"
  };

  return (
    <div className="container-custom pt-4 pb-4 md:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 h-auto lg:h-[500px]">
        {/* Main Left Banner */}
        <div className="lg:col-span-2 relative overflow-hidden bg-[#f3f9fb] group rounded-2xl md:rounded-none h-[220px] md:h-[400px] lg:h-full">
          <div className="absolute inset-0 z-0">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full h-full"
            >
              <img
                src={getProxyUrl(currentBanner.image && !bannerError ? currentBanner.image : "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000")}
                alt={currentBanner.title}
                className="w-full h-full object-cover object-right group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
                onError={() => setBannerError(true)}
              />
            </motion.div>
            {/* Gradient Overlay for better readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
          </div>
          
          <div className="relative z-10 h-full flex flex-col justify-end px-6 md:px-16 py-8 md:py-12">
            <motion.div
              key={`content-${currentIndex}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {currentBanner.topText && (
                <p className="text-primary font-bold uppercase tracking-[0.3em] text-[8px] md:text-xs mb-2 md:mb-4 bg-white inline-block px-3 py-1 md:px-4 md:py-1.5 rounded-sm shadow-sm">
                  {currentBanner.topText}
                </p>
              )}
              <h2 
                className="text-2xl md:text-4xl font-bold mb-2 md:mb-4 leading-[1.2] tracking-tight text-white drop-shadow-lg font-display"
              >
                {currentBanner.title}
              </h2>
              {currentBanner.subtitle && (
                <p 
                  className="text-sm md:text-2xl font-medium mb-4 md:mb-8 max-w-lg text-white/90 drop-shadow-md font-sans"
                >
                  {currentBanner.subtitle}
                </p>
              )}
              <Link
                to={currentBanner.link || "/products"}
                className="inline-flex items-center justify-center px-6 py-2.5 md:px-10 md:py-4 bg-primary text-white font-bold text-sm md:text-lg hover:bg-primary-dark transition-all shadow-2xl shadow-primary/40 group/btn rounded-sm font-sans"
              >
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Dots Indicator */}
          {banners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentIndex === idx ? 'bg-primary w-6' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Side Banner */}
        <div className="hidden lg:flex relative overflow-hidden bg-[#fde1b6] p-8 md:p-10 flex flex-col justify-end group rounded-2xl md:rounded-none h-[250px] md:h-[500px] lg:h-full">
          <div className="absolute inset-0 z-0">
            <img
              src={getProxyUrl(smallBanners[0]?.image && !smallBannerError ? smallBanners[0].image : "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&q=80&w=600")}
              alt={smallBanners[0]?.title || "Weekend Discount"}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              referrerPolicy="no-referrer"
              onError={() => setSmallBannerError(true)}
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
