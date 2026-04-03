import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Phone, 
  MapPin, 
  Mail, 
  Save, 
  Loader2, 
  ChevronLeft 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UserSettings() {
  const { profile, updateUserProfile } = useAuth();
  const navigate = useNavigate();
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
      navigate(-1);
    } catch (error) {
      console.error("Profile update error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) return null;

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
          <h1 className="text-xl font-black text-gray-900 font-display uppercase tracking-tight">Settings</h1>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="mb-8">
          <h2 className="text-lg font-black text-gray-900 font-display uppercase tracking-tight">Settings</h2>
          <p className="text-xs font-bold text-gray-400 mt-1">Update your personal information</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
              <User className="h-3 w-3 mr-2 text-primary" />
              Full Name
            </label>
            <input
              type="text"
              required
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary transition-all font-bold text-gray-900 text-sm"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
              <Mail className="h-3 w-3 mr-2 text-gray-400" />
              Email Address
            </label>
            <input
              type="email"
              disabled
              className="w-full bg-gray-100 border border-transparent rounded-xl px-4 py-3 outline-none font-bold text-gray-500 cursor-not-allowed text-sm"
              value={profile.email}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
              <Phone className="h-3 w-3 mr-2 text-primary" />
              Phone Number
            </label>
            <input
              type="tel"
              required
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary transition-all font-bold text-gray-900 text-sm"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
              <MapPin className="h-3 w-3 mr-2 text-primary" />
              Shipping Address
            </label>
            <textarea
              required
              rows={3}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary transition-all font-bold text-gray-900 text-sm"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter your full shipping address..."
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-primary text-white py-4 rounded-xl font-black text-sm uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
