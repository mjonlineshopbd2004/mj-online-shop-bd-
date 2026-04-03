import React from 'react';
import { ChevronLeft, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Payments() {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="container-custom py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft className="h-6 w-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-black text-gray-900 font-display uppercase tracking-tight">Payments</h1>
        </div>
      </div>
      <div className="container-custom py-12 text-center">
        <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <CreditCard className="h-10 w-10 text-gray-200" />
        </div>
        <h2 className="text-xl font-black text-gray-900 font-display uppercase tracking-tight">Payment Methods</h2>
        <p className="text-xs font-bold text-gray-400 mt-2">Manage your saved payment methods here.</p>
      </div>
    </div>
  );
}
