import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { formatPrice, cn } from '../lib/utils';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck } from 'lucide-react';

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal, toggleSelection, toggleAllSelection, selectedSubtotal, selectedItems } = useCart();
  const navigate = useNavigate();

  const allSelected = items.length > 0 && items.every(item => item.selected);

  if (items.length === 0) {
    return (
      <div className="container-custom py-24 text-center">
        <div className="bg-gray-50 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8">
          <ShoppingBag className="h-16 w-16 text-gray-300" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">Your cart is empty</h1>
        <p className="text-gray-500 text-lg mb-10 max-w-md mx-auto">
          Looks like you haven't added anything to your cart yet. Explore our latest collections and find something you love!
        </p>
        <Link
          to="/products"
          className="inline-flex items-center bg-orange-600 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-orange-700 transition-all"
        >
          Start Shopping
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Shopping Cart</h1>
        <div className="flex items-center space-x-3 bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => toggleAllSelection(e.target.checked)}
            className="w-5 h-5 rounded-lg border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
          />
          <span className="text-sm font-bold text-gray-900 uppercase tracking-widest">Select All</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Cart Items */}
        <div className="flex-1 space-y-6">
          {items.map((item) => (
            <div
              key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
              className={cn(
                "bg-white rounded-3xl p-6 shadow-sm border transition-all flex flex-col sm:flex-row items-center gap-6",
                item.selected ? "border-orange-200 ring-1 ring-orange-100" : "border-gray-100 opacity-75"
              )}
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={item.selected}
                  onChange={() => toggleSelection(item.id, item.selectedSize, item.selectedColor)}
                  className="w-6 h-6 rounded-lg border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                />
              </div>

              <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0">
                <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl font-bold tracking-tight text-gray-900 mb-1">{item.name}</h3>
                <p className="text-orange-600 font-bold text-sm mb-2 uppercase tracking-widest">{item.category}</p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm font-bold text-gray-500">
                  {item.selectedSize && <span>Size: <span className="text-gray-900">{item.selectedSize}</span></span>}
                  {item.selectedColor && <span>Color: <span className="text-gray-900">{item.selectedColor}</span></span>}
                </div>
              </div>

              <div className="flex flex-col items-center sm:items-end gap-4">
                <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize, item.selectedColor)}
                    className="p-2 text-gray-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center font-bold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize, item.selectedColor)}
                    className="p-2 text-gray-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-xl font-bold tracking-tight text-gray-900">
                    {formatPrice((item.discountPrice || item.price) * item.quantity)}
                  </span>
                  <button
                    onClick={() => removeItem(item.id, item.selectedSize, item.selectedColor)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <aside className="lg:w-96">
          <div className="bg-gray-900 text-white rounded-[2.5rem] p-8 shadow-2xl sticky top-24">
            <h2 className="text-2xl font-bold tracking-tight mb-8">Order Summary</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-400 font-bold">
                <span>Items Selected</span>
                <span className="text-white">{selectedItems.length}</span>
              </div>
              <div className="flex justify-between text-gray-400 font-bold">
                <span>Subtotal</span>
                <span className="text-white">{formatPrice(selectedSubtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-400 font-bold">
                <span>Delivery Charge</span>
                <span className="text-white">Calculated at checkout</span>
              </div>
              <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                <span className="text-xl font-bold tracking-tight">Total</span>
                <span className="text-3xl font-bold tracking-tight text-orange-500">{formatPrice(selectedSubtotal)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => navigate('/checkout')}
                disabled={selectedItems.length === 0}
                className="w-full bg-orange-600 text-white py-5 rounded-2xl font-bold text-xl shadow-xl hover:bg-orange-700 transition-all flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Checkout Now</span>
                <ArrowRight className="h-6 w-6" />
              </button>
              <Link
                to="/products"
                className="w-full flex items-center justify-center py-4 text-gray-400 font-bold hover:text-white transition-colors"
              >
                Continue Shopping
              </Link>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10 flex items-center space-x-3 text-gray-400">
              <Truck className="h-5 w-5 text-orange-500" />
              <p className="text-xs font-bold uppercase tracking-wider">Free delivery on orders over ৳5000</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
