import React from 'react';
import { Truck, Phone, Mail } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { Link } from 'react-router-dom';

export default function TopBanner() {
  const { settings } = useSettings();

  return (
    <div className="bg-gray-900 text-white py-2 px-4">
      <div className="container-custom flex flex-col sm:flex-row justify-between items-center text-[10px] sm:text-xs font-bold uppercase tracking-widest">
        <div className="flex items-center space-x-4 mb-2 sm:mb-0">
          <div className="flex items-center space-x-1">
            <Truck className="h-3 w-3 text-orange-500" />
            {settings.topBannerLink ? (
              <Link 
                to={settings.topBannerLink} 
                className="hover:text-orange-500 transition-colors"
                style={{ color: settings.bannerTextColor || '#ffffff' }}
              >
                {settings.topBannerText}
              </Link>
            ) : (
              <span style={{ color: settings.bannerTextColor || '#ffffff' }}>{settings.topBannerText}</span>
            )}
          </div>
          <div className="hidden md:flex items-center space-x-1">
            <Phone className="h-3 w-3 text-orange-500" />
            <span>{settings.phone}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Mail className="h-3 w-3 text-orange-500" />
            <span>{settings.email}</span>
          </div>
          <div className="hidden sm:block">
            <span className="text-orange-500">Cash on Delivery Available</span>
          </div>
        </div>
      </div>
    </div>
  );
}
