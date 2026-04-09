// components/ResourcesGrid.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, Moon, Activity, Sun, BookText, Brain, X, Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

const resources = [
  {
    id: 1, type: 'audio', title: 'Deep Work Focus', category: 'Audio', duration: '45 mins',
    icon: PlayCircle, color: '#D6A08A',
    creator: 'Dr. Andrew Huberman Foundation',
    description: 'Binaural beats engineered to lock your cognitive state into high-flow deep work. Frequencies target alpha wave entrainment, blocking out erratic distractions.',
    content: ''
  },
  {
    id: 2, type: 'audio', title: 'REM Sleep Cycle', category: 'Ambient', duration: '2 hours',
    icon: Moon, color: '#9CAD8A',
    creator: 'Aura Soundscapes',
    description: 'A 2-hour ambient soundscape designed to guide your brainwaves down through Delta and into restorative REM sleep. Leave playing safely overnight.',
    content: ''
  },
  {
    id: 3, type: 'audio', title: 'Anxiety Override', category: 'Exercise', duration: '10 mins',
    icon: Activity, color: '#D3C4B3',
    creator: 'Clinical Neuroscience Team',
    description: 'A rapid physiological sigh protocol designed to drastically drop cortisol levels in under 10 minutes when facing an acute panic response or extreme stress.',
    content: ''
  },
  {
    id: 4, type: 'read', title: 'Circadian Reset', category: 'Guide', duration: 'Read',
    icon: Sun, color: '#E5C3A6',
    creator: 'Dr. Matthew Walker Group',
    description: 'How to perfectly align your biological clock with the natural movement of the sun.',
    content: `<p>The circadian rhythm is an internal clock that governs your sleep-wake cycle, operating on a roughly 24-hour schedule. Modern artificial lighting deeply disrupt this delicate clock, leading to lethargy, systemic anxiety, and poor cognitive function.</p>
    <br/>
    <h2>Step 1: Early Light Exposure</h2>
    <p>Viewing sunlight within 30-60 minutes of waking triggers a massive release of healthy cortisol. This is a crucial "wake-up signal" for the brain, establishing a definitive start to your biological day.</p>
    <br/>
    <h2>Step 2: The Caffeine Delay</h2>
    <p>Delaying caffeine intake by 90-120 minutes after waking prevents the notorious "afternoon crash" by allowing adenosine receptors to clear naturally before blocking them chemically.</p>
    <br/>
    <h2>Step 3: Evening Dimming</h2>
    <p>Post 8:00 PM, shift your environment to dim, low-lying lights. Overhead bright lights strongly suppress melatonin production. Switch to red or amber spectrums where possible to simulate firelight.</p>
    `
  },
  {
    id: 5, type: 'read', title: 'Stoic Principles', category: 'Philosophy', duration: 'Audiobook',
    icon: BookText, color: '#A0969A',
    creator: 'Marcus Aurelius Records',
    description: 'Core concepts of ancient philosophy applied to highly-stressed modern software and knowledge workers.',
    content: `<p>The core concept of Stoicism is the Dichotomy of Control. As Epictetus formalized it, "Some things are in our control and others not." This simple logical division is the strongest tool against modern anxiety.</p>
    <br/>
    <p>You cannot control the market. You cannot control your boss's reaction. You cannot control network latency. If you attach your emotional stability to these outcomes, you will forever be fragile.</p>
    <br/>
    <p>What you control is your own response. Your own architecture. Your own habits. Focus 100% of your energy on the internal parameters. The external variables will resolve however they naturally intend to.</p>`
  },
  {
    id: 6, type: 'audio', title: 'Cognitive Reset', category: 'Meditation', duration: '15 mins',
    icon: Brain, color: '#73626A',
    creator: 'Vipassana Institute',
    description: 'A structural guided meditation stripping away spiritual fluff to focus on raw awareness, sensation tracking, and default-mode network suppression.',
    content: ''
  },
];

export default function ResourcesGrid() {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    // Lock body scroll when modal is open
    if (selectedId !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedId]);

  const selectedData = resources.find(r => r.id === selectedId);

  return (
    <>
      {/* ─── Grid ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {resources.map((resource, i) => (
          <motion.div
            key={`card-${resource.id}`}
            layoutId={`card-container-${resource.id}`}
            onClick={() => setSelectedId(resource.id)}
            className="group relative rounded-2xl glass p-5 cursor-pointer flex flex-col justify-between min-h-[140px]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: i * 0.05 + 0.2 }}
            whileHover={{ y: -4, scale: 1.02, zIndex: 10 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex justify-between items-start mb-4 relative z-10 pointer-events-none">
              <motion.div 
                layoutId={`card-icon-${resource.id}`}
                className="size-10 rounded-[10px] flex items-center justify-center border border-white/5"
                style={{ backgroundColor: `${resource.color}20`, color: resource.color }}
              >
                <resource.icon className="size-5" />
              </motion.div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/30 group-hover:text-white/60 transition-colors">
                {resource.duration}
              </span>
            </div>
            
            <div className="relative z-10 pointer-events-none">
              <motion.h3 layoutId={`card-title-${resource.id}`} className="text-[15px] font-semibold tracking-tight text-white/90 mb-1 leading-tight group-hover:text-white transition-colors">
                {resource.title}
              </motion.h3>
              <p className="text-xs text-white/40">{resource.category}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ─── Expansion Modal ─── */}
      <AnimatePresence>
        {selectedId && selectedData && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop Blur */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-xl pointer-events-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedId(null)}
            />

            {/* Expanded Card */}
            <motion.div
              layoutId={`card-container-${selectedData.id}`}
              className="relative w-full max-w-2xl bg-[#0A0A0A] rounded-[32px] overflow-hidden pointer-events-auto shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/10"
              style={{ maxHeight: '90vh' }}
              initial={{ borderRadius: 32 }}
            >
              {/* Dynamic Header Banner */}
              <div className="relative h-48 w-full flex items-end p-8 overflow-hidden">
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{ background: `linear-gradient(135deg, ${selectedData.color}, transparent)` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
                
                <div className="relative z-10 flex items-center gap-4 w-full">
                  <motion.div 
                    layoutId={`card-icon-${selectedData.id}`}
                    className="size-16 rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl shrink-0 backdrop-blur-md"
                    style={{ backgroundColor: `${selectedData.color}40`, color: selectedData.color }}
                  >
                    <selectedData.icon className="size-8" />
                  </motion.div>
                  <div className="flex flex-col">
                    <motion.h3 layoutId={`card-title-${selectedData.id}`} className="text-3xl font-bold tracking-tight text-white mb-1">
                      {selectedData.title}
                    </motion.h3>
                    <p className="text-sm text-white/50">{selectedData.creator}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedId(null)}
                  className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all backdrop-blur-md z-20"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Scrollable Content Area */}
              <div className="p-8 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 192px)' }}>
                {/* Description block */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[11px] font-semibold text-white/60 tracking-wider uppercase">
                    {selectedData.category}
                  </div>
                  <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[11px] font-semibold text-white/60 tracking-wider uppercase">
                    {selectedData.duration}
                  </div>
                </div>

                <p className="text-base text-white/70 leading-relaxed font-light mb-10">
                  {selectedData.description}
                </p>

                {/* Sub-Interfaces based on Type */}
                {selectedData.type === 'audio' ? (
                  <AudioPlayerSimulator color={selectedData.color} />
                ) : (
                  <div 
                    className="prose prose-invert prose-p:text-white/60 prose-p:font-light prose-p:leading-relaxed prose-h2:text-white/90 prose-h2:font-semibold prose-h2:tracking-tight max-w-none pb-8"
                    dangerouslySetInnerHTML={{ __html: selectedData.content }}
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Sub-Components ───

function AudioPlayerSimulator({ color }: { color: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    const i = setInterval(() => {
      setProgress(p => (p >= 100 ? 0 : p + 0.5));
    }, 1000);
    return () => clearInterval(i);
  }, [isPlaying]);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
      <div className="flex flex-col items-center justify-center mb-8 gap-2">
        <div className="relative w-full h-1.5 bg-white/10 rounded-full cursor-pointer group">
           <motion.div 
             className="absolute top-0 left-0 h-full rounded-full" 
             style={{ backgroundColor: color, width: `${progress}%` }} 
             layout
           />
           {/* Invisible hover area for seeker */}
           <div className="absolute inset-y-[-10px] inset-x-0" />
        </div>
        <div className="flex justify-between w-full text-[10px] text-white/30 font-mono">
           <span>{Math.floor(progress / 10)}:{Math.floor(progress % 10)}0</span>
           <span>- {(100 - progress).toFixed(0)}:00</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-8">
        <button className="text-white/40 hover:text-white transition-colors"><Volume2 className="size-5" /></button>
        <div className="flex items-center gap-6">
          <button className="text-white/60 hover:text-white transition-colors" onClick={() => setProgress(0)}>
            <SkipBack className="size-6" fill="currentColor" />
          </button>
          <motion.button 
             onClick={() => setIsPlaying(!isPlaying)}
             className="size-16 rounded-full flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
             style={{ backgroundColor: color }}
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
          >
            {isPlaying ? <Pause className="size-7 text-white" fill="white" /> : <Play className="size-7 text-white ml-1" fill="white" />}
          </motion.button>
          <button className="text-white/60 hover:text-white transition-colors" onClick={() => setProgress(100)}>
            <SkipForward className="size-6" fill="currentColor" />
          </button>
        </div>
        <button className="text-white/40 border border-white/20 rounded px-2 py-0.5 text-[10px] uppercase font-bold hover:text-white transition-colors">1x</button>
      </div>
    </div>
  );
}