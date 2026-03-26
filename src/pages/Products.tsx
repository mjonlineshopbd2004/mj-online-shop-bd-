import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { DEMO_PRODUCTS } from '../constants';
import ProductCard from '../components/ProductCard';
import { Filter, ChevronDown, Search, SlidersHorizontal, X, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSettings } from '../contexts/SettingsContext';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const { settings } = useSettings();
  
  const categoryFilter = searchParams.get('category');
  const searchQuery = searchParams.get('search');
  const sortBy = searchParams.get('sort') || 'newest';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const productsRef = collection(db, 'products');
        let q = query(productsRef);

        if (categoryFilter) {
          q = query(productsRef, where('category', '==', categoryFilter));
        }

        const querySnapshot = await getDocs(q);
        let results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

        // Client-side search and sort
        if (searchQuery) {
          results = results.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        if (sortBy === 'price-low') {
          results.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        } else if (sortBy === 'price-high') {
          results.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        } else if (sortBy === 'rating') {
          results.sort((a, b) => b.rating - a.rating);
        } else {
          results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }

        setProducts(results);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts(DEMO_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryFilter, searchQuery, sortBy]);

  const toggleCategory = (category: string) => {
    if (categoryFilter === category) {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            {categoryFilter ? `${categoryFilter} Collection` : searchQuery ? `Search: ${searchQuery}` : 'All Products'}
          </h1>
          <p className="text-gray-500 font-medium">{products.length} products found</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative hidden sm:block">
            <select
              className="appearance-none bg-white border border-gray-200 rounded-xl px-6 py-3 pr-12 font-bold text-gray-700 focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer"
              value={sortBy}
              onChange={(e) => {
                searchParams.set('sort', e.target.value);
                setSearchParams(searchParams);
              }}
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
            <ChevronDown className="absolute right-4 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all"
          >
            <SlidersHorizontal className="h-5 w-5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters */}
        <aside className={cn(
          "lg:w-64 space-y-10 lg:block",
          showFilters ? "fixed inset-0 z-50 bg-white p-8 overflow-y-auto" : "hidden"
        )}>
          {showFilters && (
            <div className="flex justify-between items-center mb-8 lg:hidden">
              <h2 className="text-2xl font-black">Filters</h2>
              <button onClick={() => setShowFilters(false)}><X className="h-8 w-8" /></button>
            </div>
          )}

          <div>
            <h3 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-wider">Categories</h3>
            <div className="space-y-3">
              {settings.categories.map(category => {
                const name = typeof category === 'string' ? category : category.name;
                return (
                  <button
                    key={name}
                    onClick={() => toggleCategory(name)}
                    className={cn(
                      "flex items-center justify-between w-full px-4 py-3 rounded-xl font-bold transition-all",
                      categoryFilter === name ? "bg-orange-600 text-white shadow-lg shadow-orange-200" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    <span>{name}</span>
                    {categoryFilter === name && <X className="h-4 w-4" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-wider">Price Range</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <input type="number" placeholder="Min" className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500" />
                <span className="text-gray-400">-</span>
                <input type="number" placeholder="Max" className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500" />
              </div>
              <button className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-all">Apply Price</button>
            </div>
          </div>
          
          {showFilters && (
            <button
              onClick={() => setShowFilters(false)}
              className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl lg:hidden"
            >
              Show {products.length} Results
            </button>
          )}
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-100 rounded-3xl h-[450px]"></div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-[3rem]">
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Search className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-8">Try adjusting your filters or search query</p>
              <button
                onClick={() => setSearchParams({})}
                className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-700 transition-all"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
