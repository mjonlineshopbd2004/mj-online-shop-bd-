import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PromoBanner() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative h-[300px] md:h-[400px] rounded-[2rem] overflow-hidden shadow-2xl group"
      >
        <img 
          src="https://picsum.photos/seed/promo/1920/600" 
          alt="Promotional Banner" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex items-center">
          <div className="p-8 md:p-16 max-w-xl">
            <span className="inline-block px-4 py-1.5 bg-orange-600 text-white rounded-full text-xs font-bold mb-4 tracking-widest uppercase">
              Limited Time Offer
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight font-display tracking-tight">
              Summer Sale is <span className="text-orange-500">LIVE!</span>
            </h2>
            <p className="text-gray-200 text-lg mb-8 font-medium font-sans">
              Get up to 70% off on all summer essentials. Don't miss out on our biggest sale of the year.
            </p>
            <Link 
              to="/products"
              className="inline-flex items-center px-8 py-4 bg-white text-gray-900 rounded-xl font-bold text-lg hover:bg-orange-600 hover:text-white transition-all shadow-lg transform hover:-translate-y-1 font-sans"
            >
              Shop the Sale
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
        
        {/* Decorative badge */}
        <div className="absolute top-8 right-8 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-full w-32 h-32 flex flex-col items-center justify-center text-white transform rotate-12 group-hover:rotate-0 transition-transform duration-500">
          <span className="text-3xl font-bold tracking-tight">70%</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">OFF</span>
        </div>
      </motion.div>
    </div>
  );
}
