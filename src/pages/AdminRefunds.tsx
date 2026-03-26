import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, where, updateDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order } from '../types';
import { formatPrice, cn } from '../lib/utils';
import { RefreshCcw, CheckCircle, XCircle, Clock, Search, Filter, ChevronRight, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminRefunds() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [processing, setProcessing] = useState(false);

  const fetchRefundOrders = async () => {
    setLoading(true);
    try {
      // Fetch orders that have a refundRequest or are already refunded
      const q = query(
        collection(db, 'orders'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const allOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      
      // Filter in memory for simplicity since Firestore doesn't support complex OR queries easily without indexes
      const refundOrders = allOrders.filter(order => order.refundRequest || order.status === 'refunded');
      setOrders(refundOrders);
    } catch (error) {
      console.error("Error fetching refund orders:", error);
      toast.error('Failed to load refund requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefundOrders();
  }, []);

  const handleProcessRefund = async (orderId: string, status: 'approved' | 'rejected') => {
    setProcessing(true);
    try {
      const orderRef = doc(db, 'orders', orderId);
      const updateData: any = {
        'refundRequest.status': status,
        'refundRequest.processedAt': new Date().toISOString(),
      };

      if (status === 'approved') {
        updateData.status = 'refunded';
        updateData.paymentStatus = 'pending'; // Or a new 'refunded' payment status
      }

      await updateDoc(orderRef, updateData);
      toast.success(`Refund ${status} successfully`);
      setSelectedOrder(null);
      fetchRefundOrders();
    } catch (error) {
      console.error("Error processing refund:", error);
      toast.error('Failed to process refund');
    } finally {
      setProcessing(false);
    }
  };

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.phone.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px] bg-[#0a0a0a]">
        <RefreshCcw className="h-8 w-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 bg-[#0a0a0a] min-h-screen text-white space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2 text-white">Refund Management</h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Process and track customer refunds</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by Order ID, Customer Name or Phone..."
            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-emerald-500 transition-all font-bold text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Refunds Table */}
      <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 text-[10px] uppercase tracking-widest font-black border-b border-white/10">
                <th className="px-8 py-6">Order Details</th>
                <th className="px-8 py-6">Refund Reason</th>
                <th className="px-8 py-6">Amount</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-gray-500 font-bold">
                    No refund requests found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="font-black text-white group-hover:text-emerald-500 transition-colors">#{order.id.slice(-6).toUpperCase()}</p>
                      <p className="text-sm text-gray-400 font-bold">{order.customerName}</p>
                      <p className="text-xs text-gray-500">{order.phone}</p>
                    </td>
                    <td className="px-8 py-6 max-w-xs">
                      <p className="text-sm text-gray-400 font-medium line-clamp-2">
                        {order.refundRequest?.reason || 'Manual Refund'}
                      </p>
                    </td>
                    <td className="px-8 py-6 font-black text-white">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                        order.status === 'refunded' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                        order.refundRequest?.status === 'pending' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                        order.refundRequest?.status === 'rejected' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                        "bg-blue-500/10 text-blue-500 border-blue-500/20"
                      )}>
                        {order.status === 'refunded' ? 'Refunded' : order.refundRequest?.status || 'No Request'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-3 bg-white/5 hover:bg-emerald-500/10 text-gray-500 hover:text-emerald-500 rounded-xl transition-all border border-white/5"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refund Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#111111] rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-white/10"
            >
              <div className="p-8 sm:p-12 space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-black text-white mb-2">Process Refund</h2>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Order #{selectedOrder.id.slice(-6).toUpperCase()}</p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-3 bg-white/5 hover:bg-white/10 text-gray-500 rounded-2xl transition-all group"
                  >
                    <XCircle className="h-6 w-6 group-hover:text-white" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-emerald-500/5 p-6 rounded-3xl border border-emerald-500/10">
                    <div className="flex items-start gap-4">
                      <AlertCircle className="h-6 w-6 text-emerald-500 mt-1" />
                      <div>
                        <p className="text-emerald-500 font-black mb-1 uppercase tracking-widest text-[10px]">Refund Reason</p>
                        <p className="text-gray-300 font-bold">{selectedOrder.refundRequest?.reason || 'No reason provided.'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                      <p className="text-gray-500 font-black uppercase tracking-widest text-[10px] mb-1">Total Amount</p>
                      <p className="text-2xl font-black text-white">{formatPrice(selectedOrder.total)}</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                      <p className="text-gray-500 font-black uppercase tracking-widest text-[10px] mb-1">Payment Method</p>
                      <p className="text-xl font-black text-white uppercase">{selectedOrder.paymentMethod}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-white font-black text-lg">Customer Information</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 text-gray-400">
                        <Clock className="h-5 w-5 text-emerald-500" />
                        <span className="font-bold">Requested: {new Date(selectedOrder.refundRequest?.requestedAt || selectedOrder.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-400">
                        <Search className="h-5 w-5 text-emerald-500" />
                        <span className="font-bold">TXID: {selectedOrder.transactionId || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={() => handleProcessRefund(selectedOrder.id, 'approved')}
                    disabled={processing || selectedOrder.status === 'refunded'}
                    className="flex-1 bg-emerald-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    <CheckCircle className="h-6 w-6" />
                    <span>Approve Refund</span>
                  </button>
                  <button
                    onClick={() => handleProcessRefund(selectedOrder.id, 'rejected')}
                    disabled={processing || selectedOrder.status === 'refunded'}
                    className="flex-1 bg-red-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-red-600/20 hover:bg-red-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    <XCircle className="h-6 w-6" />
                    <span>Reject Request</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
