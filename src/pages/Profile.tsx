import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Phone, MapPin, Mail, Save, Loader2, LogOut } from 'lucide-react';
import { motion } from 'motion/react';

export default function Profile() {
  const { profile, updateUserProfile, logout } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        phone: profile.phone || '',
        address: profile.address || '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUserProfile(formData);
    } catch (error) {
      console.error("Profile update error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-orange-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-100"
      >
        <div className="bg-gray-900 px-8 py-12 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-4xl font-black mb-2">Account Settings</h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Manage your personal information</p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
        </div>

        <div className="p-8 sm:p-12">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Name */}
              <div className="space-y-3">
                <label className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center">
                  <User className="h-4 w-4 mr-2 text-orange-600" />
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-gray-900"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                />
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-3">
                <label className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  className="w-full bg-gray-100 border-2 border-transparent rounded-2xl px-6 py-4 outline-none font-bold text-gray-500 cursor-not-allowed"
                  value={profile.email}
                />
                <p className="text-[10px] text-gray-400 font-bold italic">* Email cannot be changed</p>
              </div>

              {/* Phone */}
              <div className="space-y-3">
                <label className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-orange-600" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-gray-900"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              {/* Role (Read-only) */}
              <div className="space-y-3">
                <label className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-400" />
                  Account Type
                </label>
                <div className="w-full bg-gray-100 border-2 border-transparent rounded-2xl px-6 py-4 font-black text-gray-500 uppercase tracking-widest text-sm">
                  {profile.role}
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-3">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-orange-600" />
                Shipping Address
              </label>
              <textarea
                required
                rows={4}
                className="w-full bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-gray-900"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter your full shipping address..."
              />
            </div>

            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
              <button
                type="button"
                onClick={() => logout()}
                className="bg-gray-100 text-gray-600 px-8 py-5 rounded-2xl font-black text-lg hover:bg-gray-200 transition-all flex items-center justify-center space-x-3"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
              
              <button
                type="submit"
                disabled={isSaving}
                className="bg-orange-600 text-white px-12 py-5 rounded-2xl font-black text-xl shadow-xl shadow-orange-100 hover:bg-orange-700 transition-all flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-6 w-6" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
