// app/components/Navbar.tsx
'use client';

import Link from 'next/link';
import { UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 24, stiffness: 140, delay: 0.1 }}
      className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-glass-border px-6 py-4"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div
            className="relative size-9 rounded-[10px] bg-electric-blue flex items-center justify-center shadow-[0_0_15px_-3px_rgba(214,160,138,0.4)] overflow-hidden"
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="relative z-10">
              <rect x="3" y="3" width="18" height="18" rx="4" stroke="white" strokeWidth="2" />
              <circle cx="12" cy="12" r="3" fill="white" />
            </svg>
          </motion.div>
          <div className="flex flex-col">
            <span className="font-semibold text-base text-white tracking-tight leading-none">
              Aura OS
            </span>
          </div>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-2">
          {['Dashboard', 'Breathe', 'Journal', 'Resources'].map((item, i) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="px-4 py-2 text-[13px] font-medium text-white/50 hover:text-white rounded-lg transition-colors duration-200"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
              whileTap={{ scale: 0.96 }}
            >
              {item}
            </motion.a>
          ))}
        </div>

        {/* User Avatar */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            className="relative size-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer group"
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
            whileTap={{ scale: 0.92 }}
          >
            <UserCircle className="size-4.5 text-white/70 group-hover:text-white transition-colors" />
          </motion.button>
        </motion.div>
      </div>
    </motion.nav>
  );
}