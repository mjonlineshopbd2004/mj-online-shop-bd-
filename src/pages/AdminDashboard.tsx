import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order } from '../types';
import { formatPrice, cn } from '../lib/utils';
import { 
  ShoppingBag, Users, DollarSign, Package, 
  RefreshCcw, Clock, Layers, Calendar, CheckCircle2, Loader2,
  TrendingUp, ArrowRight, Plus, Settings, CreditCard, Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  format, startOfMonth, endOfMonth, 
  startOfDay, subDays, isWithinInterval 
} from 'date-fns';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    yesterdayOrders: 0,
    yesterdayRevenue: 0,
    thisMonthOrders: 0,
    thisMonthRevenue: 0,
    lastMonthOrders: 0,
    lastMonthRevenue: 0,
    allTimeOrders: 0,
    allTimeRevenue: 0,
    pendingOrders: 0,
    processingOrders: 0,
    deliveredOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const ordersSnap = await getDocs(collection(db, 'orders'));
      const productsSnap = await getDocs(collection(db, 'products'));
      const usersSnap = await getDocs(collection(db, 'users'));

      const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      
      const now = new Date();
      const today = startOfDay(now);
      const yesterday = startOfDay(subDays(now, 1));
      const startOfThisMonth = startOfMonth(now);
      const endOfThisMonth = endOfMonth(now);
      const startOfLastMonth = startOfMonth(subDays(startOfThisMonth, 1));
      const endOfLastMonth = endOfMonth(subDays(startOfThisMonth, 1));

      const getStatsForInterval = (start: Date, end: Date) => {
        const filtered = orders.filter(o => {
          const date = new Date(o.createdAt);
          return isWithinInterval(date, { start, end });
        });
        return {
          count: filtered.length,
          revenue: filtered.reduce((sum, o) => sum + o.total, 0)
        };
      };

      const todayStats = getStatsForInterval(today, now);
      const yesterdayStats = getStatsForInterval(yesterday, subDays(today, 0.0001));
      const thisMonthStats = getStatsForInterval(startOfThisMonth, endOfThisMonth);
      const lastMonthStats = getStatsForInterval(startOfLastMonth, endOfLastMonth);

      setStats({
        todayOrders: todayStats.count,
        todayRevenue: todayStats.revenue,
        yesterdayOrders: yesterdayStats.count,
        yesterdayRevenue: yesterdayStats.revenue,
        thisMonthOrders: thisMonthStats.count,
        thisMonthRevenue: thisMonthStats.revenue,
        lastMonthOrders: lastMonthStats.count,
        lastMonthRevenue: lastMonthStats.revenue,
        allTimeOrders: orders.length,
        allTimeRevenue: orders.reduce((sum, o) => sum + o.total, 0),
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        processingOrders: orders.filter(o => o.status === 'processing').length,
        deliveredOrders: orders.filter(o => o.status === 'delivered').length,
        totalProducts: productsSnap.size,
        totalUsers: usersSnap.size,
      });

      const recentQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5));
      const recentSnap = await getDocs(recentQuery);
      setRecentOrders(recentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#111111]">
        <Loader2 className="h-12 w-12 text-emerald-500 animate-spin" />
      </div>
    );
  }

  const mainStats = [
    { label: 'Today Revenue', value: formatPrice(stats.todayRevenue), icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Today Orders', value: stats.todayOrders, icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  const detailedStats = [
    { label: 'Yesterday', rev: stats.yesterdayRevenue, ord: stats.yesterdayOrders },
    { label: 'This Month', rev: stats.thisMonthRevenue, ord: stats.thisMonthOrders },
    { label: 'Last Month', rev: stats.lastMonthRevenue, ord: stats.lastMonthOrders },
    { label: 'All Time', rev: stats.allTimeRevenue, ord: stats.allTimeOrders },
  ];

  return (
    <div className="p-4 sm:p-8 bg-[#0a0a0a] min-h-screen text-white space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Dashboard Overview</h1>
          <p className="text-gray-400 font-bold">Welcome back! Here's what's happening with your store today.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchStats}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white"
          >
            <RefreshCcw className="h-5 w-5" />
          </button>
          <Link 
            to="/admin/products/new"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-black transition-all shadow-lg shadow-emerald-600/20"
          >
            <Plus className="h-5 w-5" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/[0.07] transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.bg} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <TrendingUp className="h-4 w-4 text-emerald-500 opacity-50" />
            </div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-1">{card.label}</p>
            <h3 className="text-2xl font-black">{card.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Detailed Revenue Breakdown */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[2rem] p-8">
          <h2 className="text-xl font-black mb-8 flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-emerald-500" />
            Revenue Breakdown
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {detailedStats.map((item) => (
              <div key={item.label} className="bg-white/5 p-6 rounded-2xl border border-white/5 flex justify-between items-center">
                <div>
                  <p className="text-gray-400 font-bold text-xs mb-1 uppercase tracking-wider">{item.label}</p>
                  <p className="text-xl font-black text-white">{formatPrice(item.rev)}</p>
                  <p className="text-xs text-gray-500 font-bold">{item.ord} Orders</p>
                </div>
                <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status Summary */}
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
          <h2 className="text-xl font-black mb-8 flex items-center gap-3">
            <Package className="h-5 w-5 text-emerald-500" />
            Order Status
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Pending', value: stats.pendingOrders, color: 'text-orange-500', bg: 'bg-orange-500/10' },
              { label: 'Processing', value: stats.processingOrders, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { label: 'Delivered', value: stats.deliveredOrders, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            ].map((status) => (
              <div key={status.label} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${status.color.replace('text', 'bg')}`} />
                  <span className="font-bold text-gray-300 text-sm">{status.label}</span>
                </div>
                <span className={`text-lg font-black ${status.color}`}>{status.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden">
          <div className="p-8 flex items-center justify-between border-b border-white/10">
            <h2 className="text-xl font-black">Recent Orders</h2>
            <Link to="/admin/orders" className="text-emerald-500 font-bold hover:underline flex items-center gap-2 text-sm">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 text-[10px] uppercase tracking-widest font-black border-b border-white/10">
                  <th className="px-8 py-6">Order ID</th>
                  <th className="px-8 py-6">Customer</th>
                  <th className="px-8 py-6">Total</th>
                  <th className="px-8 py-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-6 font-mono text-xs text-gray-400">#{order.id.slice(-6).toUpperCase()}</td>
                    <td className="px-8 py-6">
                      <p className="font-bold text-white group-hover:text-emerald-500 transition-colors text-sm">{order.customerName}</p>
                      <p className="text-[10px] text-gray-500">{order.phone}</p>
                    </td>
                    <td className="px-8 py-6 font-black text-white text-sm">{formatPrice(order.total)}</td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                        order.status === 'delivered' ? "bg-emerald-500/10 text-emerald-500" :
                        order.status === 'processing' ? "bg-blue-500/10 text-blue-500" :
                        "bg-orange-500/10 text-orange-500"
                      )}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
            <h2 className="text-xl font-black mb-8">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Products', icon: Package, link: '/admin/products', color: 'bg-blue-500' },
                { label: 'Orders', icon: ShoppingBag, link: '/admin/orders', color: 'bg-orange-500' },
                { label: 'Transactions', icon: CreditCard, link: '/admin/transactions', color: 'bg-emerald-500' },
                { label: 'Reviews', icon: Star, link: '/admin/reviews', color: 'bg-yellow-500' },
                { label: 'Users', icon: Users, link: '/admin/users', color: 'bg-purple-500' },
                { label: 'Settings', icon: Settings, link: '/admin/settings', color: 'bg-gray-500' },
              ].map((action) => (
                <Link
                  key={action.label}
                  to={action.link}
                  className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group"
                >
                  <div className={`${action.color} p-3 rounded-xl mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-bold text-xs text-gray-300">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-emerald-600 rounded-[2rem] p-8 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-xl font-black mb-2">Need Help?</h3>
              <p className="text-emerald-100 font-bold text-xs mb-6">Check out our documentation or contact support.</p>
              <button className="bg-white text-emerald-600 px-6 py-3 rounded-xl font-black hover:bg-emerald-50 transition-all text-sm">
                Contact Support
              </button>
            </div>
            <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform">
              <Settings className="h-32 w-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
