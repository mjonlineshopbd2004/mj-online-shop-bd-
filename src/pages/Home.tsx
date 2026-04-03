import React, { useEffect, useState, useRef } from 'react';
import { collection, query, where, limit, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { DEMO_PRODUCTS, CATEGORIES } from '../constants';
import { useSettings } from '../contexts/SettingsContext';
import { getProxyUrl } from '../lib/utils';
import HeroSection from '../components/HeroSection';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Quote, Truck, ShieldCheck, RotateCcw, Headphones, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  const { settings } = useSettings();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
        }
      }
    }, 6000); // 4s pause + 2s scroll time approx

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
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

        // All Products
        const allQuery = query(productsRef, orderBy('createdAt', 'desc'), limit(12));
        const allSnap = await getDocs(allQuery);
        const all = allSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));

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
        setFeaturedProducts(DEMO_PRODUCTS.filter(p => p.featured).slice(0, 4));
        setTrendingProducts(DEMO_PRODUCTS.filter(p => p.trending).slice(0, 8));
        setAllProducts(DEMO_PRODUCTS.slice(0, 12));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categoryImages: Record<string, string> = {
    'Bags': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600&h=800',
    'Shoes': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600&h=800',
    'Jewelry': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=600&h=800',
    'Electronics': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600&h=800'
  };

  return (
    <div className="space-y-8 md:space-y-20 pb-20">
      <HeroSection />
      
      {/* Features Bar */}
      <section className="border-b border-gray-100 bg-white">
        <div className="container-custom py-8 md:py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="flex-shrink-0">
                <Truck className="h-8 w-8 md:h-10 md:h-10 text-[#f15a29]" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-xs md:text-base">Fast Delivery</h3>
                <p className="text-[10px] md:text-sm text-gray-500">All over BD</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="flex-shrink-0">
                <ShieldCheck className="h-8 w-8 md:h-10 md:h-10 text-[#f15a29]" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-xs md:text-base">Secure Pay</h3>
                <p className="text-[10px] md:text-sm text-gray-500">bKash, Nagad</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="flex-shrink-0">
                <RotateCcw className="h-8 w-8 md:h-10 md:h-10 text-[#f15a29]" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-xs md:text-base">Easy Returns</h3>
                <p className="text-[10px] md:text-sm text-gray-500">7-day policy</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="flex-shrink-0">
                <Headphones className="h-8 w-8 md:h-10 md:h-10 text-[#f15a29]" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-xs md:text-base">24/7 Support</h3>
                <p className="text-[10px] md:text-sm text-gray-500">WhatsApp</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-custom">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight font-display uppercase">Top Category</h2>
          </div>
          <div className="h-1 w-24 bg-primary rounded-full hidden md:block"></div>
        </div>
        
        <div className="relative group">
          {/* Arrows */}
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg border border-gray-100 hover:bg-white transition-all opacity-0 group-hover:opacity-100 hidden md:block"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg border border-gray-100 hover:bg-white transition-all opacity-0 group-hover:opacity-100 hidden md:block"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>

          {/* Mobile Arrows (always visible) */}
          <div className="md:hidden absolute -left-2 top-1/2 -translate-y-1/2 z-20">
            <button onClick={() => scroll('left')} className="p-1 text-gray-400"><ChevronLeft className="h-4 w-4" /></button>
          </div>
          <div className="md:hidden absolute -right-2 top-1/2 -translate-y-1/2 z-20">
            <button onClick={() => scroll('right')} className="p-1 text-gray-400"><ChevronRight className="h-4 w-4" /></button>
          </div>
          
          <div 
            ref={scrollRef}
            className="flex gap-6 md:gap-10 py-2 overflow-x-auto no-scrollbar scroll-smooth px-4"
          >
            {(settings.categories && settings.categories.length > 0 ? settings.categories : CATEGORIES).map((category, idx) => {
              const name = typeof category === 'string' ? category : category.name;
              const image = typeof category === 'string' ? `https://picsum.photos/seed/${category}/200/200` : category.image;
              
              return (
                <Link
                  key={`${name}-${idx}`}
                  to={`/products?category=${encodeURIComponent(name)}`}
                  className="flex flex-col items-center gap-2 flex-shrink-0"
                >
                  <div className="relative w-16 h-16 md:w-24 md:h-24 overflow-hidden rounded-full border-2 border-gray-100 hover:border-primary transition-all duration-300 shadow-sm">
                    <img
                      src={getProxyUrl(image || `https://picsum.photos/seed/${name}/200/200`)}
                      alt={name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-orange-50/90 py-0.5">
                      <p className="text-[7px] md:text-[9px] font-bold text-orange-600 text-center">From 80৳</p>
                    </div>
                  </div>
                  <h3 className="text-[9px] md:text-xs font-bold text-gray-900 text-center tracking-tight leading-tight max-w-[64px] md:max-w-[96px] truncate">{name}</h3>
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
            <h2 className="section-title">Our Collection</h2>
            <p className="section-subtitle">Explore all our products</p>
          </div>
          <Link to="/products" className="text-orange-600 font-bold flex items-center hover:underline">
            View All <ArrowRight className="ml-2 h-5 w-5" />
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
              <h2 className="section-title">Featured Products</h2>
              <p className="section-subtitle">Handpicked items for you</p>
            </div>
            <Link to="/products" className="text-orange-600 font-bold flex items-center hover:underline">
              View All <ArrowRight className="ml-2 h-5 w-5" />
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

      {/* Trending Products */}
      <section className="container-custom">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white shadow-lg">
              <Star className="h-4 w-4 fill-current" />
            </div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight font-display uppercase">Trending Products</h2>
          </div>
          <Link to="/products" className="bg-primary/5 text-primary px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 hover:bg-primary hover:text-white transition-all">
            View More <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3">
          {loading ? (
            [...Array(12)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl h-[280px]"></div>
            ))
          ) : (
            trendingProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-orange-600 py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 text-white transform -rotate-12"><Quote size={120} /></div>
          <div className="absolute bottom-10 right-10 text-white transform rotate-12"><Quote size={120} /></div>
        </div>
        <div className="container-custom relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4 tracking-tight font-display">What Our Customers Say</h2>
            <div className="flex justify-center space-x-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />)}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Rahat Ahmed', text: 'Amazing quality products! The delivery was super fast, and the customer service was very helpful. Highly recommended!', role: 'Verified Buyer' },
              { name: 'Sumaiya Khan', text: 'I bought a silk saree and it was exactly as shown in the pictures. The fabric is premium and the color is vibrant.', role: 'Fashion Enthusiast' },
              { name: 'Tanvir Hasan', text: 'The electronics collection is great. I got my earbuds within 24 hours in Dhaka. Great experience!', role: 'Tech Lover' }
            ].map((review, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 text-white">
                <p className="text-lg italic mb-6 leading-relaxed">"{review.text}"</p>
                <div>
                  <p className="font-bold text-xl tracking-tight">{review.name}</p>
                  <p className="text-orange-200 text-sm font-bold uppercase tracking-widest">{review.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Join Our Newsletter</h2>
            <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-orange-500 outline-none"
                required
              />
              <button className="bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-lg">
                Subscribe
              </button>
            </form>
          </div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-600/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-600/20 rounded-full blur-3xl"></div>
        </div>
      </section>
    </div>
  );
}
