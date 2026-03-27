import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, ShoppingBag, Star } from 'lucide-react';
import { Product } from '../types';
import { formatPrice, calculateDiscount, cn } from '../lib/utils';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const discount = calculateDiscount(product.price, product.discountPrice);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    navigate('/checkout');
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist(product);
    if (isInWishlist(product.id)) {
      toast.info('Removed from wishlist');
    } else {
      toast.success('Added to wishlist');
    }
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider">
              -{discount}%
            </span>
          )}
          {product.featured && (
            <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider">
              Featured
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute bottom-4 left-0 right-0 px-3 translate-y-12 group-hover:translate-y-0 transition-transform duration-300 flex gap-2">
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-white text-gray-900 py-2.5 rounded-xl font-bold shadow-lg flex items-center justify-center hover:bg-orange-50 transition-colors border border-gray-100"
            title="Add to Cart"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 bg-orange-600 text-white py-2.5 rounded-xl font-bold shadow-lg flex items-center justify-center hover:bg-orange-700 transition-colors"
            title="Buy Now"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
          <button
            onClick={handleWishlist}
            className={cn(
              "flex-1 py-2.5 rounded-xl shadow-lg flex items-center justify-center transition-all",
              isInWishlist(product.id) ? "bg-red-500 text-white" : "bg-white text-gray-700 hover:text-red-500 border border-gray-100"
            )}
            title="Wishlist"
          >
            <Heart className={cn("h-4 w-4", isInWishlist(product.id) && "fill-current")} />
          </button>
        </div>

        <button
          onClick={handleWishlist}
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full shadow-md transition-all",
            isInWishlist(product.id) ? "bg-red-500 text-white" : "bg-white text-gray-400 hover:text-red-500"
          )}
        >
          <Heart className={cn("h-5 w-5", isInWishlist(product.id) && "fill-current")} />
        </button>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-1.5 font-sans">{product.category}</p>
        <h3 className="text-gray-900 font-bold line-clamp-2 mb-2 group-hover:text-primary transition-colors font-display tracking-tight leading-snug">
          {product.name}
        </h3>
        
        <div className="flex items-center space-x-1 mb-3">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={cn("h-3 w-3 fill-current", i >= Math.floor(product.rating) && "text-gray-200")} />
            ))}
          </div>
          <span className="text-[10px] font-bold text-gray-400 font-sans">({product.reviewsCount})</span>
        </div>

        <div className="mt-auto flex items-center space-x-2">
          <span className="text-xl font-bold text-gray-900 font-display tracking-tight">
            {formatPrice(product.discountPrice || product.price)}
          </span>
          {product.discountPrice && (
            <span className="text-sm text-gray-400 line-through font-medium font-sans">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
