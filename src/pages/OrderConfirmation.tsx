import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order } from '../types';
import { CheckCircle2, Package, Truck, ShoppingBag, ArrowRight, MapPin, Phone, User, XCircle } from 'lucide-react';
import { formatPrice, cn, getProxyUrl } from '../lib/utils';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function OrderConfirmation() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const paymentStatus = searchParams.get('payment');

  useEffect(() => {
    if (paymentStatus === 'success') {
      toast.success('Payment successful!');
    } else if (paymentStatus === 'failed') {
      toast.error('Payment failed. Please try again or choose another method.');
    } else if (paymentStatus === 'cancelled') {
      toast.error('Payment was cancelled.');
    }
  }, [paymentStatus]);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      try {
        const orderDoc = await getDoc(doc(db, 'orders', id));
        if (orderDoc.exists()) {
          setOrder({ id: orderDoc.id, ...orderDoc.data() } as Order);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="container-custom py-24 text-center">
        <div className="animate-spin h-12 w-12 border-4 border-orange-600 border-t-transparent rounded-full mx-auto"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-custom py-24 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Order Not Found</h1>
        <Link to="/" className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100"
      >
        <div className={cn(
          "p-12 text-center text-white relative overflow-hidden",
          paymentStatus === 'failed' || paymentStatus === 'cancelled' ? "bg-red-600" : "bg-orange-600"
        )}>
          <div className="relative z-10">
            <div className="bg-white/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
              {paymentStatus === 'failed' || paymentStatus === 'cancelled' ? (
                <XCircle className="h-12 w-12 text-white" />
              ) : (
                <CheckCircle2 className="h-12 w-12 text-white" />
              )}
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              {paymentStatus === 'failed' || paymentStatus === 'cancelled' ? 'Order Issue' : 'Thank You!'}
            </h1>
            <p className="text-orange-100 text-lg font-bold">
              {paymentStatus === 'failed' || paymentStatus === 'cancelled' 
                ? 'There was an issue with your payment.' 
                : 'Your order has been placed successfully.'}
            </p>
            <p className="mt-4 text-orange-200 font-bold uppercase tracking-widest text-sm">Order ID: #{order.id}</p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        </div>

        <div className="p-8 md:p-12 space-y-12">
          {/* Order Status */}
          <div className="flex flex-wrap justify-between gap-8 py-8 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="bg-orange-50 p-4 rounded-2xl"><Package className="h-8 w-8 text-orange-600" /></div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Status</p>
                <p className="text-xl font-bold tracking-tight text-gray-900 capitalize">{order.status}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-orange-50 p-4 rounded-2xl"><Truck className="h-8 w-8 text-orange-600" /></div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Delivery</p>
                <p className="text-xl font-bold tracking-tight text-gray-900 capitalize">{order.deliveryArea.replace('-', ' ')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-orange-50 p-4 rounded-2xl"><ShoppingBag className="h-8 w-8 text-orange-600" /></div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Amount</p>
                <p className="text-xl font-bold tracking-tight text-gray-900">{formatPrice(order.total)}</p>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-xl font-bold tracking-tight text-gray-900 flex items-center">
                <User className="mr-2 h-6 w-6 text-orange-600" />
                Customer Details
              </h3>
              <div className="space-y-4 bg-gray-50 p-6 rounded-3xl">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Name</p>
                  <p className="font-bold text-gray-900">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Phone</p>
                  <p className="font-bold text-gray-900">{order.phone}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Email</p>
                  <p className="font-bold text-gray-900">{order.customerEmail}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-bold tracking-tight text-gray-900 flex items-center">
                <MapPin className="mr-2 h-6 w-6 text-orange-600" />
                Shipping Address
              </h3>
              <div className="bg-gray-50 p-6 rounded-3xl h-full">
                <p className="font-bold text-gray-900 leading-relaxed">{order.address}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold tracking-tight text-gray-900">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-6 bg-white border border-gray-100 p-4 rounded-2xl">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                    <img src={getProxyUrl(item.images[0])} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{item.name}</p>
                    <p className="text-sm text-gray-500 font-bold">
                      {item.selectedSize && `Size: ${item.selectedSize}`} 
                      {item.selectedColor && ` | Color: ${item.selectedColor}`}
                    </p>
                    <p className="text-sm text-orange-600 font-bold">Qty: {item.quantity} × {formatPrice(item.discountPrice || item.price)}</p>
                  </div>
                  <p className="font-bold text-gray-900">{formatPrice((item.discountPrice || item.price) * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-900 text-white p-8 rounded-[2rem] space-y-4">
            <div className="flex justify-between text-gray-400 font-bold">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-400 font-bold">
              <span>Delivery Charge</span>
              <span>{formatPrice(order.deliveryCharge)}</span>
            </div>
            <div className="border-t border-white/10 pt-4 flex justify-between items-center">
              <span className="text-xl font-bold tracking-tight">Total Paid</span>
              <span className="text-3xl font-bold tracking-tight text-orange-500">{formatPrice(order.total)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-8">
            <Link
              to="/orders"
              className="flex-1 bg-gray-100 text-gray-900 py-4 rounded-2xl font-bold text-center hover:bg-gray-200 transition-all"
            >
              View Order History
            </Link>
            <Link
              to="/products"
              className="flex-1 bg-orange-600 text-white py-4 rounded-2xl font-bold text-center hover:bg-orange-700 transition-all flex items-center justify-center space-x-2"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
