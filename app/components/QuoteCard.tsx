// components/QuoteCard.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const quotes = [
  "Clarity comes from within. Silence is the ultimate diagnostic tool.",
  "System optimal. You are functioning exactly as intended.",
  "Progress is an iterative loop, not a linear progression.",
  "Acknowledge the exception. Handle the process.",
  "Your architecture is resilient by design."
];

export default function QuoteCard() {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    // Deterministic quote based on the day
    const day = new Date().getDay();
    setQuote(quotes[day % quotes.length]);
  }, []);

  if (!quote) return <div className="h-32 w-full skeleton-loader rounded-2xl" />;

  return (
    <motion.div 
      className="glass-hover rounded-2xl p-6 relative overflow-hidden group perspective-1000"
      whileHover={{ y: -2, rotateX: 2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="absolute top-0 right-0 p-6 opacity-10 transform translate-x-4 -translate-y-4 group-hover:translate-x-2 group-hover:-translate-y-2 group-hover:opacity-20 transition-all duration-500">
        <Sparkles className="size-16" />
      </div>

      <p className="text-xl font-medium tracking-tight text-white mb-4 relative z-10 font-heading leading-tight max-w-[90%]">
        "{quote}"
      </p>
      
      <div className="flex items-center gap-2 text-white/30 relative z-10">
        <div className="w-4 h-[1px] bg-electric-blue" />
        <span className="text-[10px] uppercase tracking-widest font-semibold">System Insight</span>
      </div>
    </motion.div>
  );
}
