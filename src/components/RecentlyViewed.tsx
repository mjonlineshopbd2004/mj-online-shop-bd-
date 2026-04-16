import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import ProductCard from './ProductCard';
import { useLanguage } from '../contexts/LanguageContext';
import { Clock } from 'lucide-react';

export default function RecentlyViewed() {
  const { recentIds } = useRecentlyViewed();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchRecentProducts = async () => {
      if (recentIds.length === 0) {
        setProducts([]);
        return;
      }

      setLoading(true);
      try {
        const productsRef = collection(db, 'products');
        // Firestore 'in' query supports up to 10 IDs
        const q = query(productsRef, where('__name__', 'in', recentIds.slice(0, 10)));
        const snap = await getDocs(q);
        const fetched = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
        
        // Sort to match the order in recentIds
        const sorted = recentIds
          .map(id => fetched.find(p => p.id === id))
          .filter((p): p is Product => p !== undefined);
          
        setProducts(sorted);
      } catch (error) {
        console.error('Error fetching recent products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentProducts();
  }, [recentIds]);

  if (products.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50/50">
      <div className="container-custom">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <Clock className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
            {t('recentlyViewed')}
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
