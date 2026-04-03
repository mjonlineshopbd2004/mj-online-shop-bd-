import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Order } from '../types';
import { formatPrice, getProxyUrl } from '../lib/utils';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Package, 
  ChevronLeft, 
  MoreVertical, 
  Trash2, 
  Eye, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RefreshCcw, 
  AlertCircle, 
  AlertTriangle 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import Modal from '../components/Modal';

export default function OrderHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'completed' | 'pending' | 'cancelled'>('pending');
  const [showOptions, setShowOptions] = useState<string | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        setOrders(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'completed') return order.status === 'delivered';
    if (activeTab === 'pending') return ['pending', 'processing', 'shipped'].includes(order.status);
    if (activeTab === 'cancelled') return order.status === 'cancelled';
    return false;
  });

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    try {
      await deleteDoc(doc(db, 'orders', orderToDelete));
      setOrders(orders.filter(o => o.id !== orderToDelete));
      toast.success('Order removed from history');
    } catch (error) {
      toast.error('Failed to remove order');
    } finally {
      setOrderToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">Pending</span>;
      case 'processing': return <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">Processing</span>;
      case 'shipped': return <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">Shipped</span>;
      case 'delivered': return <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">Completed</span>;
      case 'cancelled': return <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Cancelled</span>;
      default: return <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="container-custom py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-black text-gray-900 font-display uppercase tracking-tight">Order History</h1>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreVertical className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="container-custom flex items-center gap-2 py-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('completed')}
            className={cn(
              "px-6 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
              activeTab === 'completed' ? "bg-green-500 text-white shadow-lg shadow-green-100" : "bg-gray-100 text-gray-500"
            )}
          >
            Completed
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={cn(
              "px-6 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
              activeTab === 'pending' ? "bg-orange-500 text-white shadow-lg shadow-orange-100" : "bg-gray-100 text-gray-500"
            )}
          >
            Pending
          </button>
          <button
            onClick={() => setActiveTab('cancelled')}
            className={cn(
              "px-6 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
              activeTab === 'cancelled' ? "bg-red-500 text-white shadow-lg shadow-red-100" : "bg-gray-100 text-gray-500"
            )}
          >
            Cancel
          </button>
        </div>
      </div>

      <div className="container-custom py-6">
        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="space-y-3">
                {order.items.map((item, idx) => (
                  <div
                    key={`${order.id}-${idx}`}
                    className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-100 relative"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                      <img 
                        src={getProxyUrl(item.images[0])} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-bold text-gray-900 line-clamp-1 leading-tight">
                          {item.name}
                        </h3>
                        <div className="relative">
                          <button 
                            onClick={() => setShowOptions(showOptions === `${order.id}-${idx}` ? null : `${order.id}-${idx}`)}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="h-4 w-4 text-gray-400" />
                          </button>
                          
                          <AnimatePresence>
                            {showOptions === `${order.id}-${idx}` && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-xl border border-gray-100 z-40 py-1 overflow-hidden"
                              >
                                <Link
                                  to={`/order-confirmation/${order.id}`}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                  <Eye className="h-4 w-4" />
                                  View Products
                                </Link>
                                <button
                                  onClick={() => {
                                    setOrderToDelete(order.id);
                                    setShowOptions(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs font-black text-gray-900">
                          {formatPrice(item.discountPrice || item.price)}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      
                      <div className="flex justify-end mt-2">
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Package className="h-10 w-10 text-gray-200" />
            </div>
            <h2 className="text-xl font-black text-gray-900 font-display uppercase tracking-tight">No orders found</h2>
            <p className="text-xs font-bold text-gray-400 mt-2">
              You don't have any {activeTab} orders at the moment.
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!orderToDelete}
        onClose={() => setOrderToDelete(null)}
        title="Confirm for delete?"
      >
        <div className="text-center">
          <p className="text-sm font-bold text-gray-600 mb-8">
            Are you sure you want to delete this order from your history?
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => setOrderToDelete(null)}
              className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteOrder}
              className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-100 hover:bg-red-600 transition-all"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
