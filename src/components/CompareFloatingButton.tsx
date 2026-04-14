import React from 'react';
import { Link } from 'react-router-dom';
import { GitCompare, X } from 'lucide-react';
import { useCompare } from '../contexts/CompareContext';
import { motion, AnimatePresence } from 'motion/react';

export default function CompareFloatingButton() {
  const { compareItems, removeFromCompare } = useCompare();

  if (compareItems.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-36 right-4 z-40"
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 flex items-center gap-4">
          <div className="flex -space-x-3">
            {compareItems.map((product) => (
              <div key={product.id} className="relative group">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm"
                />
                <button
                  onClick={() => removeFromCompare(product.id)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-2 w-2" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="h-8 w-[1px] bg-gray-100" />
          
          <Link
            to="/compare"
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
          >
            <GitCompare className="h-4 w-4" />
            Compare ({compareItems.length})
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
