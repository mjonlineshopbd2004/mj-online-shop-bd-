import React from 'react';
import { useCompare } from '../contexts/CompareContext';
import { useCart } from '../contexts/CartContext';
import { motion } from 'motion/react';
import { X, ShoppingCart, ArrowLeft, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Compare() {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();
  const { addItem } = useCart();

  if (compareItems.length === 0) {
    return (
      <div className="container-custom py-20 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-4 uppercase font-display">No products to compare</h2>
          <p className="text-gray-500 mb-8 font-medium">Add some products to the comparison list to see them side by side.</p>
          <Link
            to="/products"
            className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 uppercase tracking-widest"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8 md:py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <Link to="/products" className="inline-flex items-center text-primary font-bold mb-2 hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Shop
          </Link>
          <h1 className="text-3xl font-black text-gray-900 uppercase font-display tracking-tight">Product Comparison</h1>
        </div>
        <button
          onClick={clearCompare}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors"
        >
          <Trash2 className="h-5 w-5" /> Clear All
        </button>
      </div>

      <div className="overflow-x-auto no-scrollbar pb-8">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden border border-gray-200 rounded-3xl bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Features</th>
                  {compareItems.map(product => (
                    <th key={product.id} className="px-6 py-4 text-center min-w-[250px]">
                      <div className="relative group">
                        <button
                          onClick={() => removeFromCompare(product.id)}
                          className="absolute -top-2 -right-2 p-1.5 bg-white rounded-full shadow-md text-gray-400 hover:text-red-500 transition-colors z-10"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-32 h-32 object-cover rounded-2xl mx-auto mb-4 border border-gray-100 shadow-sm"
                        />
                        <h3 className="text-sm font-black text-gray-900 line-clamp-2 uppercase tracking-tight">{product.name}</h3>
                        <p className="text-primary font-black mt-2">৳{product.price}</p>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm font-black text-gray-900 bg-gray-50/50">Category</td>
                  {compareItems.map(product => (
                    <td key={product.id} className="px-6 py-4 text-center text-sm text-gray-600 font-medium">
                      {product.category}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-black text-gray-900 bg-gray-50/50">Vendor</td>
                  {compareItems.map(product => (
                    <td key={product.id} className="px-6 py-4 text-center text-sm text-gray-600 font-medium">
                      {product.vendor || 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-black text-gray-900 bg-gray-50/50">Stock</td>
                  {compareItems.map(product => (
                    <td key={product.id} className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-black text-gray-900 bg-gray-50/50">Action</td>
                  {compareItems.map(product => (
                    <td key={product.id} className="px-6 py-4 text-center">
                      <button
                        onClick={() => addItem(product)}
                        disabled={product.stock === 0}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-black rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-widest"
                      >
                        <ShoppingCart className="h-4 w-4" /> Add to Cart
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
