import React, { useEffect, useState } from 'react';
import { collection, query, where, limit, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { DEMO_PRODUCTS, CATEGORIES } from '../constants';
import { useSettings } from '../contexts/SettingsContext';
import HeroSection from '../components/HeroSection';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Quote, Truck, ShieldCheck, RotateCcw, Headphones } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  const { settings } = useSettings();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsRef = collection(db, 'products');
        
        // Featured
        const featuredQuery = query(productsRef, where('featured', '==', true), limit(4));
        const featuredSnap = await getDocs(featuredQuery);
        const featured = featuredSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        
        // Trending
        const trendingQuery = query(productsRef, where('trending', '==', true), limit(8));
        const trendingSnap = await getDocs(trendingQuery);
        const trending = trendingSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

        // All Products
        const allQuery = query(productsRef, orderBy('createdAt', 'desc'), limit(12));
        const allSnap = await getDocs(allQuery);
        const all = allSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

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
    <div className="space-y-20 pb-20">
      <HeroSection />

      {/* Features Bar */}
      <section className="border-b border-gray-100 bg-white">
        <div className="container-custom py-6 md:py-10">
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
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle italic">Explore our wide range of premium products</p>
          </div>
          <div className="h-1 w-24 bg-primary rounded-full"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {(settings.categories && settings.categories.length > 0 ? settings.categories : CATEGORIES).map((category, idx) => {
            const name = typeof category === 'string' ? category : category.name;
            const image = typeof category === 'string' ? `https://picsum.photos/seed/${category}/600/800` : category.image;
            
            return (
              <Link
                key={name}
                to={`/products?category=${encodeURIComponent(name)}`}
                className="group relative h-64 md:h-80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2rem]"
              >
                <img
                  src={image || `https://picsum.photos/seed/${name}/600/800`}
                  alt={name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:translate-x-1 transition-transform tracking-tight">{name}</h3>
                  <div className="h-1 w-12 bg-primary group-hover:w-full transition-all duration-500"></div>
                </div>
              </Link>
            );
          })}
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
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            [...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl h-[450px]"></div>
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
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-2xl h-[450px]"></div>
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
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="section-title">Trending Now</h2>
            <p className="section-subtitle">What everyone is buying right now</p>
          </div>
          <Link to="/products" className="text-orange-600 font-bold flex items-center hover:underline">
            View All <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            [...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl h-[450px]"></div>
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
