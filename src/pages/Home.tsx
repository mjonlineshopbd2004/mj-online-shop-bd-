import React, { useEffect, useState, useRef } from 'react';
import { collection, query, where, limit, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { DEMO_PRODUCTS, CATEGORIES } from '../constants';
import { useSettings } from '../contexts/SettingsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getProxyUrl } from '../lib/utils';
import HeroSection from '../components/HeroSection';
import ProductCard from '../components/ProductCard';
import FlashSaleTimer from '../components/FlashSaleTimer';
import RecentlyViewed from '../components/RecentlyViewed';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Quote, Truck, ShieldCheck, RotateCcw, Headphones, ChevronLeft, ChevronRight, Layers, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  const { settings } = useSettings();
  const { t, translateCategory } = useLanguage();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const trendingScrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right', ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const categoryInterval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
        }
      }
    }, 6000);

    return () => {
      clearInterval(categoryInterval);
    };
  }, []);

  useEffect(() => {
    const trendingInterval = setInterval(() => {
      if (trendingScrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = trendingScrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          trendingScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          trendingScrollRef.current.scrollBy({ left: 180, behavior: 'smooth' });
        }
      }
    }, 3500);

    return () => {
      clearInterval(trendingInterval);
    };
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      const timeoutId = setTimeout(() => {
        if (loading) {
          console.log("Fetching products timed out, showing demo data");
          setFeaturedProducts(DEMO_PRODUCTS.filter(p => p.featured).slice(0, 4));
          setTrendingProducts(DEMO_PRODUCTS.filter(p => p.trending).slice(0, 8));
          setAllProducts(DEMO_PRODUCTS.slice(0, 12));
          setLoading(false);
        }
      }, 5000); // 5 second timeout

      try {
        const productsRef = collection(db, 'products');
        
        // Featured
        const featuredQuery = query(productsRef, where('featured', '==', true), limit(4));
        const featuredSnap = await getDocs(featuredQuery);
        const featured = featuredSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
        
        // Trending
        const trendingQuery = query(productsRef, where('trending', '==', true), limit(8));
        const trendingSnap = await getDocs(trendingQuery);
        const trending = trendingSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));

        // Flash Sale
        if (settings.flashSale?.active && settings.flashSale.productIds?.length > 0) {
          const flashQuery = query(productsRef, where('__name__', 'in', settings.flashSale.productIds.slice(0, 10)));
          const flashSnap = await getDocs(flashQuery);
          const flash = flashSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
          
          if (flash.length === 0) {
            setFlashSaleProducts(DEMO_PRODUCTS.slice(0, 4));
          } else {
            setFlashSaleProducts(flash);
          }
        } else {
          setFlashSaleProducts([]);
        }

        // All Products
        const allQuery = query(productsRef, orderBy('createdAt', 'desc'), limit(12));
        const allSnap = await getDocs(allQuery);
        const all = allSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));

        clearTimeout(timeoutId);

        if (featured.length === 0) {
          setFeaturedProducts(DEMO_PRODUCTS.filter(p => p.featured).slice(0, 4));
        } else {
          setFeaturedProducts(featured);
        }

        if (trending.length === 0) {
          setTrendingProducts(DEMO_PRODUCTS.filter(p => p.trending).slice(0, 8));
        } else {
          setTrendingProducts(trending);
        }

        if (all.length === 0) {
          setAllProducts(DEMO_PRODUCTS.slice(0, 12));
        } else {
          setAllProducts(all);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        clearTimeout(timeoutId);
        setFeaturedProducts(DEMO_PRODUCTS.filter(p => p.featured).slice(0, 4));
        setTrendingProducts(DEMO_PRODUCTS.filter(p => p.trending).slice(0, 8));
        setAllProducts(DEMO_PRODUCTS.slice(0, 12));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="space-y-4 md:space-y-8">
      <HeroSection />
      
      {/* Flash Sale Section */}
      {settings.flashSale?.active && (
        <section className="container-custom">
          <div className="bg-orange-600 rounded-3xl p-4 md:p-6 relative overflow-hidden shadow-xl shadow-orange-200">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white shadow-lg">
                  <Zap className="h-5 w-5 fill-current" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-black text-white font-display uppercase tracking-tight leading-none">
                    {settings.flashSale.title}
                  </h2>
                  <p className="text-[10px] text-orange-100 font-bold uppercase tracking-widest mt-1">{t('limitedTimeOffer')}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <FlashSaleTimer endTime={settings.flashSale.endTime} />
                <Link 
                  to="/products" 
                  className="hidden md:flex items-center gap-2 bg-white text-orange-600 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-all"
                >
                  {t('viewAll')} <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Flash Sale Products - Horizontal Scroll */}
            {flashSaleProducts.length > 0 && (
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-1">
                {flashSaleProducts.map(product => (
                  <div key={product.id} className="flex-shrink-0 w-[140px] md:w-[180px]">
                    <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 group hover:bg-white/20 transition-all h-full">
                      <ProductCard product={product} variant="compact" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Mobile View All Button */}
            <div className="mt-4 md:hidden">
              <Link 
                to="/products" 
                className="flex items-center justify-center gap-2 bg-white text-orange-600 w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg"
              >
                {t('viewAll')} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features Bar */}
      <section className="hidden md:block bg-white border-y border-gray-100 shadow-sm">
        <div className="container-custom py-3 md:py-8">
          <div className="flex md:grid md:grid-cols-4 gap-1.5 md:gap-8 overflow-x-auto no-scrollbar pb-1 md:pb-0 px-1">
            <div className="flex-shrink-0 flex items-center space-x-1.5 md:space-x-4 bg-gray-50 p-1.5 md:p-3.5 rounded-lg border border-gray-200/60 min-w-[110px] md:min-w-0 shadow-sm">
              <div className="flex-shrink-0 w-6 h-6 md:w-12 md:h-12 bg-white rounded-md shadow-sm flex items-center justify-center border border-gray-100">
                <Truck className="h-3 w-3 md:h-6 md:w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-[7px] md:text-base uppercase tracking-tight whitespace-nowrap">{t('fastDelivery')}</h3>
                <p className="text-[6px] md:text-sm text-gray-500 font-bold">{t('allOverBD')}</p>
              </div>
            </div>
            <div className="flex-shrink-0 flex items-center space-x-1.5 md:space-x-4 bg-gray-50 p-1.5 md:p-3.5 rounded-lg border border-gray-200/60 min-w-[110px] md:min-w-0 shadow-sm">
              <div className="flex-shrink-0 w-6 h-6 md:w-12 md:h-12 bg-white rounded-md shadow-sm flex items-center justify-center border border-gray-100">
                <ShieldCheck className="h-3 w-3 md:h-6 md:w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-[7px] md:text-base uppercase tracking-tight whitespace-nowrap">{t('securePay')}</h3>
                <p className="text-[6px] md:text-sm text-gray-500 font-bold">bKash, Nagad</p>
              </div>
            </div>
            <div className="flex-shrink-0 flex items-center space-x-1.5 md:space-x-4 bg-gray-50 p-1.5 md:p-3.5 rounded-lg border border-gray-200/60 min-w-[110px] md:min-w-0 shadow-sm">
              <div className="flex-shrink-0 w-6 h-6 md:w-12 md:h-12 bg-white rounded-md shadow-sm flex items-center justify-center border border-gray-100">
                <RotateCcw className="h-3 w-3 md:h-6 md:w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-[7px] md:text-base uppercase tracking-tight whitespace-nowrap">{t('easyReturns')}</h3>
                <p className="text-[6px] md:text-sm text-gray-500 font-bold">{t('sevenDayPolicy')}</p>
              </div>
            </div>
            <div className="flex-shrink-0 flex items-center space-x-1.5 md:space-x-4 bg-gray-50 p-1.5 md:p-3.5 rounded-lg border border-gray-200/60 min-w-[110px] md:min-w-0 shadow-sm">
              <div className="flex-shrink-0 w-6 h-6 md:w-12 md:h-12 bg-white rounded-md shadow-sm flex items-center justify-center border border-gray-100">
                <Headphones className="h-3 w-3 md:h-6 md:w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-[7px] md:text-base uppercase tracking-tight whitespace-nowrap">{t('support247')}</h3>
                <p className="text-[6px] md:text-sm text-gray-500 font-bold">WhatsApp</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="container-custom">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white shadow-lg">
              <Star className="h-4 w-4 fill-current" />
            </div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight font-display uppercase">{t('trendingProducts')}</h2>
          </div>
          <Link to="/products" className="bg-primary/5 text-primary px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 hover:bg-primary hover:text-white transition-all">
            {t('viewMore')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        
        <div 
          ref={trendingScrollRef}
          className="flex md:grid md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3 overflow-x-auto no-scrollbar pb-4 md:pb-0 px-1 scroll-smooth"
        >
          {loading ? (
            [...Array(8)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[160px] md:w-auto animate-pulse bg-white rounded-2xl h-[280px]"></div>
            ))
          ) : (
            trendingProducts.map(product => (
              <div key={product.id} className="flex-shrink-0 w-[160px] md:w-auto">
                <ProductCard product={product} />
              </div>
            ))
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="container-custom">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <Layers className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight font-display uppercase">{t('topCategories')}</h2>
          </div>
          <Link to="/categories" className="text-primary font-bold text-xs hover:underline">
            {t('seeAll')}
          </Link>
        </div>
        
        <div className="relative group">
          <div 
            ref={scrollRef}
            className="flex gap-4 md:gap-8 py-2 overflow-x-auto no-scrollbar scroll-smooth px-2"
          >
            {(settings.categories && settings.categories.length > 0 ? settings.categories : CATEGORIES).map((category, idx) => {
              const name = typeof category === 'string' ? category : category.name;
              const image = typeof category === 'string' ? null : category.image;
              const proxyUrl = getProxyUrl(image);
              
              return (
                <Link
                  key={`${name}-${idx}`}
                  to={`/products?category=${encodeURIComponent(name)}`}
                  className="flex flex-col items-center gap-3 flex-shrink-0 group/cat"
                >
                  <div className="relative w-20 h-20 md:w-28 md:h-28 overflow-hidden rounded-2xl border border-gray-100 group-hover/cat:border-primary transition-all duration-500 shadow-sm bg-gray-50">
                    {proxyUrl ? (
                      <img
                        src={proxyUrl}
                        alt={name}
                        className="w-full h-full object-cover group-hover/cat:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const placeholder = document.createElement('div');
                            placeholder.className = 'w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 p-2 text-center';
                            placeholder.innerHTML = `
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image opacity-20 mb-1"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                              <span class="text-[8px] font-bold uppercase tracking-tighter">No Image</span>
                            `;
                            parent.appendChild(placeholder);
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 p-2 text-center">
                        <Layers className="h-8 w-8 opacity-20 mb-1" />
                        <span className="text-[8px] font-bold uppercase tracking-tighter">No Image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/cat:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="text-[10px] md:text-sm font-black text-gray-900 text-center tracking-tight leading-tight max-w-[80px] md:max-w-[112px] truncate uppercase">{translateCategory(name)}</h3>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Collection */}
      <section className="container-custom">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="section-title">{t('shop')}</h2>
            <p className="section-subtitle">Explore all our products</p>
          </div>
          <Link to="/products" className="text-orange-600 font-bold flex items-center hover:underline">
            {t('viewAll')} <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3">
          {loading ? (
            [...Array(12)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl h-[280px]"></div>
            ))
          ) : (
            allProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gray-50 py-20">
        <div className="container-custom">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="section-title">{t('featuredProducts')}</h2>
              <p className="section-subtitle">Handpicked items for you</p>
            </div>
            <Link to="/products" className="text-orange-600 font-bold flex items-center hover:underline">
              {t('viewAll')} <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-2xl h-[280px]"></div>
              ))
            ) : (
              featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Recently Viewed */}
      <RecentlyViewed />

      {/* Reviews */}
      <section className="bg-orange-600 py-12 md:py-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-5 left-5 text-white transform -rotate-12"><Quote size={60} /></div>
          <div className="absolute bottom-5 right-5 text-white transform rotate-12"><Quote size={60} /></div>
        </div>
        <div className="container-custom relative z-10">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight font-display">What Our Customers Say</h2>
            <div className="flex justify-center space-x-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />)}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {[
              { name: 'Rahat Ahmed', text: 'Amazing quality products! Fast delivery and great service.', role: 'Verified Buyer' },
              { name: 'Sumaiya Khan', text: 'Exactly as shown in pictures. Premium fabric and vibrant colors.', role: 'Fashion Enthusiast' },
              { name: 'Tanvir Hasan', text: 'Great electronics collection. Fast delivery in Dhaka.', role: 'Tech Lover' }
            ].map((review, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md p-5 md:p-6 rounded-2xl border border-white/20 text-white">
                <p className="text-sm md:text-base italic mb-4 leading-relaxed">"{review.text}"</p>
                <div>
                  <p className="font-bold text-base tracking-tight">{review.name}</p>
                  <p className="text-orange-200 text-[10px] font-bold uppercase tracking-widest">{review.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
