import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function OfflineNotice() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowBackOnline(true);
      setTimeout(() => setShowBackOnline(false), 3000);
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 z-50 md:left-auto md:right-8 md:w-80"
        >
          <div className="bg-red-600 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-red-500/20 backdrop-blur-lg">
            <div className="bg-white/20 p-2 rounded-xl">
              <WifiOff className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm">You are offline</p>
              <p className="text-xs text-red-100">Please check your connection</p>
            </div>
          </div>
        </motion.div>
      )}

      {showBackOnline && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 z-50 md:left-auto md:right-8 md:w-80"
        >
          <div className="bg-green-600 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-green-500/20 backdrop-blur-lg">
            <div className="bg-white/20 p-2 rounded-xl">
              <Wifi className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm">Back online</p>
              <p className="text-xs text-green-100">Connection restored</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
