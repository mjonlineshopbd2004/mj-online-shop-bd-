import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Clock, 
  Package, 
  Truck, 
  ShoppingBag, 
  ChevronLeft 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UserDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { name: 'Pending', count: 1, icon: Clock, bgColor: 'bg-indigo-50', iconColor: 'text-indigo-500', iconBg: 'bg-indigo-100' },
    { name: 'Processing', count: 2, icon: Package, bgColor: 'bg-yellow-50', iconColor: 'text-yellow-500', iconBg: 'bg-yellow-100' },
    { name: 'Shipped', count: 0, icon: Truck, bgColor: 'bg-green-50', iconColor: 'text-green-500', iconBg: 'bg-green-100' },
    { name: 'Delivered', count: 0, icon: ShoppingBag, bgColor: 'bg-pink-50', iconColor: 'text-pink-500', iconBg: 'bg-pink-100' },
  ];

  const getFormattedDate = () => {
    const date = new Date();
    const day = date.getDate();
    const month = date.toLocaleDateString('en-GB', { month: 'short' });
    const year = date.getFullYear();
    
    const getOrdinal = (n: number) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    return `${getOrdinal(day)} ${month} ${year}`;
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
          <h1 className="text-xl font-black text-gray-900 font-display uppercase tracking-tight">Account</h1>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-lg font-black text-gray-900 font-display uppercase tracking-tight tracking-widest">My Account</h2>
            <p className="text-xs font-bold text-gray-400 mt-1">Order Statistics</p>
          </div>
          <p className="text-xs font-bold text-gray-500">
            {getFormattedDate()}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <div key={stat.name} className={`${stat.bgColor} rounded-2xl p-5 shadow-sm border border-white/50`}>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-2xl font-black text-gray-900">{stat.count}</p>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-tighter">{stat.name}</p>
                </div>
                <div className={`${stat.iconBg} p-2.5 rounded-xl ${stat.iconColor}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
