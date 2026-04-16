import React, { useState } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order } from '../types';
import { Search, Package, ChevronLeft, Phone, Hash, Calendar, MapPin, CreditCard } from 'lucide-react';
import { cn, formatPrice } from '../lib/utils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import TrackingStatus from '../components/TrackingStatus';

export default function TrackOrder() {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !phone) {
      toast.error('অর্ডার আইডি এবং ফোন নম্বর উভয়ই প্রদান করুন');
      return;
    }

    setLoading(true);
    setSearched(true);
    setOrder(null);

    try {
      // Clean order ID (remove # if present)
      const cleanId = orderId.replace('#', '').trim();
      
      const q = query(
        collection(db, 'orders'),
        where('id', '==', cleanId),
        where('phone', '==', phone.trim()),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        setOrder({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as Order);
      } else {
        toast.error('অর্ডারটি খুঁজে পাওয়া যায়নি। আইডি এবং ফোন নম্বর পুনরায় চেক করুন।');
      }
    } catch (error) {
      console.error("Error tracking order:", error);
      toast.error('কিছু ভুল হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="container-custom py-4 flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="h-6 w-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-black text-gray-900 font-display uppercase tracking-tight">অর্ডার ট্র্যাক করুন</h1>
        </div>
      </div>

      <div className="container-custom py-12 max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="h-10 w-10 text-orange-600" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 font-display uppercase tracking-tight mb-2">Track Order</h2>
          <p className="text-sm font-bold text-gray-400">আপনার অর্ডারের বর্তমান অবস্থা দেখতে নিচের তথ্যগুলো দিন</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleTrack} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-black/5 border border-gray-100 mb-12">
          <div className="space-y-6">
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-2">অর্ডার আইডি (Order ID)</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="যেমন: #123456"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-orange-500 rounded-2xl pl-12 pr-6 py-4 outline-none transition-all font-bold text-gray-900"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-2">ফোন নম্বর (Phone Number)</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  placeholder="যেমন: 017XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-orange-500 rounded-2xl pl-12 pr-6 py-4 outline-none transition-all font-bold text-gray-900"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-orange-100 hover:bg-orange-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-6 w-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Search className="h-6 w-6" />
                  ট্র্যাক করুন
                </>
              )}
            </button>
          </div>
        </form>

        {/* Results */}
        {searched && order && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-black/5 border border-gray-100">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">বর্তমান অবস্থা</p>
                  <h3 className="text-2xl font-black text-orange-600 uppercase tracking-tight">{order.status}</h3>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">অর্ডার আইডি</p>
                  <p className="text-lg font-black text-gray-900 uppercase">#{order.id}</p>
                </div>
              </div>

              <TrackingStatus status={order.status} className="mb-12" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-50 p-3 rounded-2xl">
                    <Calendar className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">অর্ডারের তারিখ</p>
                    <p className="text-sm font-bold text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-gray-50 p-3 rounded-2xl">
                    <CreditCard className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">মোট টাকা</p>
                    <p className="text-sm font-bold text-orange-600">{formatPrice(order.total)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-gray-50 p-3 rounded-2xl">
                    <MapPin className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ডেলিভারি ঠিকানা</p>
                    <p className="text-sm font-bold text-gray-900 line-clamp-1">{order.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-gray-50 p-3 rounded-2xl">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">পণ্য সংখ্যা</p>
                    <p className="text-sm font-bold text-gray-900">{order.items.length} টি</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate(`/order-confirmation/${order.id}`)}
              className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-black/10 hover:bg-black transition-all flex items-center justify-center gap-3"
            >
              বিস্তারিত দেখুন
            </button>
          </div>
        )}

        {searched && !order && !loading && (
          <div className="text-center py-12 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200">
            <Package className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-bold">এই তথ্য দিয়ে কোনো অর্ডার পাওয়া যায়নি।</p>
            <p className="text-xs text-gray-400 mt-2">দয়া করে আপনার অর্ডার আইডি এবং ফোন নম্বর পুনরায় চেক করুন।</p>
          </div>
        )}
      </div>
    </div>
  );
}
