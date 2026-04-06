import React from 'react';
import { motion } from 'motion/react';
import { Store, ShieldCheck, Star, Package, MapPin } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export default function Vendors() {
  const { settings } = useSettings();

  const vendors = [
    {
      id: '1',
      name: settings.storeName,
      logo: settings.logoUrl,
      rating: 4.9,
      reviews: 1250,
      location: 'Dhaka, Bangladesh',
      joined: '2023',
      products: 450,
      isVerified: true,
      description: `Welcome to ${settings.storeName}, your trusted destination for quality products. We pride ourselves on excellent customer service and authentic items.`
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container-custom">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Our Trusted Vendors</h1>
          <p className="text-gray-500 max-w-2xl mx-auto font-medium">
            We work with the best vendors to ensure you get high-quality products and reliable service.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vendors.map((vendor) => (
            <motion.div
              key={vendor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="h-32 bg-primary/5 relative">
                <div className="absolute -bottom-10 left-8">
                  <div className="w-20 h-20 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center overflow-hidden">
                    {vendor.logo ? (
                      <img src={vendor.logo} alt={vendor.name} className="w-full h-full object-contain p-2" />
                    ) : (
                      <Store className="h-10 w-10 text-primary" />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="pt-14 p-8">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-xl font-bold text-gray-900">{vendor.name}</h2>
                  {vendor.isVerified && (
                    <ShieldCheck className="h-5 w-5 text-emerald-500 fill-emerald-50" />
                  )}
                </div>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-bold text-gray-900">{vendor.rating}</span>
                  </div>
                  <span className="text-gray-300">|</span>
                  <span className="text-sm font-bold text-gray-500">{vendor.reviews} Reviews</span>
                </div>

                <p className="text-gray-600 text-sm leading-relaxed mb-8 line-clamp-3">
                  {vendor.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-2 text-gray-500">
                    <MapPin className="h-4 w-4" />
                    <span className="text-xs font-bold">{vendor.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Package className="h-4 w-4" />
                    <span className="text-xs font-bold">{vendor.products}+ Products</span>
                  </div>
                </div>

                <button className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-lg shadow-gray-200">
                  Visit Store
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
