// app/components/MoodChart.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface DayData {
  day: string;
  date: string;
  mood: string;
  value: number;
  color: string;
  emoji: string;
}

export default function MoodChart() {
  const [weekData, setWeekData] = useState<DayData[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/moods')
      .then(res => res.json())
      .then(data => {
        if (data.chartData) setWeekData(data.chartData);
        setIsDataLoaded(true);
      })
      .catch((e) => {
        console.error(e);
        setIsDataLoaded(true);
      });
  }, []);

  const maxValue = 100;
  const hasData = weekData.some((d) => d.value > 0);

  if (!isDataLoaded) {
    return <div className="h-full w-full skeleton-loader" style={{ minHeight: '200px' }} />;
  }

  return (
    <div className="h-full flex flex-col relative w-full pt-4">
      {hasData ? (
        <div className="flex-grow flex items-end justify-between gap-4">
          {weekData.map((item, index) => {
            const heightPercent = (item.value / maxValue) * 100;
            const isToday = item.date === new Date().toDateString();

            return (
              <motion.div
                key={item.day + item.date}
                className="flex-1 flex flex-col items-center gap-3 group perspective-1000"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                {/* 3D Bar */}
                <div className="w-full relative h-[160px] flex items-end">
                  {item.value > 0 ? (
                    <motion.div
                      className="w-full rounded-t-[4px] relative overflow-hidden bg-white/5 border-t border-l border-white/10"
                      initial={{ height: 0, rotateX: 10 }}
                      animate={{ height: `${heightPercent}%`, rotateX: 0 }}
                      transition={{
                        delay: 0.1 + index * 0.05,
                        duration: 0.6,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      whileHover={{
                        y: -5,
                        scale: 1.05,
                        boxShadow: `0 20px 40px -10px ${item.color}40`,
                        borderTopColor: item.color,
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10" />
                      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: item.color }} />
                    </motion.div>
                  ) : (
                    <div className="w-full h-[2px] bg-white/10 rounded-full" />
                  )}
                  
                  {/* Tooltip on hover */}
                  {item.value > 0 && (
                     <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-10 translate-y-2 group-hover:translate-y-0">
                       <span className="text-[10px] font-bold px-2 py-1 rounded bg-white text-black shadow-lg">
                         {item.value}%
                       </span>
                     </div>
                  )}
                </div>

                {/* Axis label */}
                <span className={`text-[10px] font-medium tracking-wider uppercase transition-colors ${isToday ? 'text-electric-blue' : 'text-white/40 group-hover:text-white/80'}`}>
                  {item.day}
                </span>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center text-center py-8">
          <p className="text-sm text-white/30 font-light">Insufficient data. Awaiting input.</p>
        </div>
      )}
    </div>
  );
}
