import React from 'react';
import { Package, Truck, CheckSquare, Warehouse, UserCheck } from 'lucide-react';
import { cn } from '../lib/utils';

interface TrackingStatusProps {
  status: string;
  className?: string;
}

const steps = [
  { id: 'pending', label: 'Pending', icon: Package },
  { id: 'processing', label: 'Processing', icon: Warehouse },
  { id: 'shipped', label: 'Shipped', icon: Truck },
  { id: 'delivered', label: 'Delivered', icon: CheckSquare },
];

export default function TrackingStatus({ status, className }: TrackingStatusProps) {
  // Map internal status to step index
  const getActiveStepIndex = (currentStatus: string) => {
    switch (currentStatus.toLowerCase()) {
      case 'pending': return 0;
      case 'processing': return 1;
      case 'shipped': return 2;
      case 'out_for_delivery': return 2; // Treat as shipped for UI progress
      case 'delivered': return 3;
      default: return -1;
    }
  };

  const activeIndex = getActiveStepIndex(status);

  if (status === 'cancelled') {
    return (
      <div className={cn("flex items-center justify-center py-2 text-red-500 font-bold text-xs", className)}>
        Order Cancelled
      </div>
    );
  }

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="relative flex justify-between items-center">
        {/* Progress Line Background */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
        
        {/* Active Progress Line */}
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-500"
          style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index <= activeIndex;
          const isCurrent = index === activeIndex;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div 
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                  isActive ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-gray-100 text-gray-400",
                  isCurrent && "ring-4 ring-primary/10 scale-110"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span 
                className={cn(
                  "text-[10px] font-black mt-2 whitespace-nowrap uppercase tracking-tighter",
                  isActive ? "text-primary" : "text-gray-400"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
