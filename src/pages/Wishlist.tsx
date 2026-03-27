import React from 'react';
import { useWishlist } from '../contexts/WishlistContext';
import ProductCard from '../components/ProductCard';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Wishlist() {
  const { items } = useWishlist();

  if (items.length === 0) {
    return (
      <div className="container-custom py-24 text-center">
        <div className="bg-gray-50 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8">
          <Heart className="h-16 w-16 text-gray-300" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-4">Your wishlist is empty</h1>
        <p className="text-gray-500 text-lg mb-10 max-w-md mx-auto">
          Save items you love to your wishlist and they'll show up here.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center bg-orange-600 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-orange-700 transition-all"
        >
          Explore Products
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-gray-500 font-medium">{items.length} items saved</p>
        </div>
        <Link
          to="/products"
          className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center"
        >
          <ShoppingBag className="mr-2 h-5 w-5" />
          Continue Shopping
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {items.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
