
import React, { useState, useEffect } from 'react';

interface CountdownProps {
  targetDate: string;
}

const Countdown: React.FC<CountdownProps> = ({ targetDate }) => {
  const weddingDate = new Date(targetDate).getTime();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = weddingDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const items = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 md:gap-8 max-w-2xl mx-auto py-12 px-4">
      {items.map((item) => (
        <div key={item.label} className="text-center group">
          <div className="relative">
            <div className="w-16 h-16 md:w-24 md:h-24 mx-auto flex items-center justify-center rounded-full border border-teal-100 bg-white/50 backdrop-blur-sm shadow-sm group-hover:scale-110 transition-transform duration-300">
              <span className="text-2xl md:text-4xl font-serif-elegant text-[#008080]">{String(item.value).padStart(2, '0')}</span>
            </div>
            <p className="mt-3 text-[10px] md:text-xs uppercase tracking-widest text-stone-500 font-medium">{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Countdown;
