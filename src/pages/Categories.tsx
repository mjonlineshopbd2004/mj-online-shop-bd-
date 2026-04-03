import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { CATEGORIES } from '../constants';
import { getProxyUrl } from '../lib/utils';
import { ChevronRight } from 'lucide-react';

export default function Categories() {
  const { settings } = useSettings();
  const categories = settings.categories && settings.categories.length > 0 ? settings.categories : CATEGORIES;

  return (
    <div className="container-custom py-8 pb-24">
      <h1 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-tight font-display">All Categories</h1>
      
      <div className="grid grid-cols-1 gap-4">
        {categories.map((category) => {
          const name = typeof category === 'string' ? category : category.name;
          const image = typeof category === 'string' ? `https://picsum.photos/seed/${category}/400/400` : category.image;
          
          return (
            <Link
              key={name}
              to={`/products?category=${encodeURIComponent(name)}`}
              className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-gray-50">
                <img 
                  src={getProxyUrl(image || `https://picsum.photos/seed/${name}/400/400`)} 
                  alt={name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg group-hover:text-primary transition-colors">{name}</h3>
                <p className="text-xs text-gray-400 font-medium">Explore premium {name.toLowerCase()}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
