import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

interface FlashSaleTimerProps {
  endTime: string;
}

export default function FlashSaleTimer({ endTime }: FlashSaleTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(endTime) - +new Date();
      let timeLeft = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      };

      if (difference > 0) {
        timeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }

      return timeLeft;
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="flex items-center gap-1.5 sm:gap-3">
      <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
        <span className="text-white font-black text-sm sm:text-base">{formatNumber(timeLeft.days)}</span>
        <span className="text-[8px] font-black text-white/70 uppercase tracking-tighter">D</span>
      </div>
      <span className="text-white/50 font-black text-xs">:</span>
      <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
        <span className="text-white font-black text-sm sm:text-base">{formatNumber(timeLeft.hours)}</span>
        <span className="text-[8px] font-black text-white/70 uppercase tracking-tighter">H</span>
      </div>
      <span className="text-white/50 font-black text-xs">:</span>
      <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
        <span className="text-white font-black text-sm sm:text-base">{formatNumber(timeLeft.minutes)}</span>
        <span className="text-[8px] font-black text-white/70 uppercase tracking-tighter">M</span>
      </div>
      <span className="text-white/50 font-black text-xs">:</span>
      <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
        <span className="text-white font-black text-sm sm:text-base">{formatNumber(timeLeft.seconds)}</span>
        <span className="text-[8px] font-black text-white/70 uppercase tracking-tighter">S</span>
      </div>
    </div>
  );
}
