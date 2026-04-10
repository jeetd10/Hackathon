// app/components/AmbientSoundboard.tsx
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudRain, Waves, TreePine, Flame, Wind, Radio, Volume2, VolumeX } from 'lucide-react';

interface SoundConfig {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  description: string;
}

const sounds: SoundConfig[] = [
  { id: 'rain', name: 'Rain', icon: CloudRain, color: '#9CAD8A', description: 'Gentle rainfall' },
  { id: 'ocean', name: 'Ocean', icon: Waves, color: '#D6A08A', description: 'Ocean waves' },
  { id: 'forest', name: 'Forest', icon: TreePine, color: '#8BA88A', description: 'Forest ambience' },
  { id: 'fire', name: 'Fire', icon: Flame, color: '#E5C3A6', description: 'Crackling fire' },
  { id: 'wind', name: 'Wind', icon: Wind, color: '#D3C4B3', description: 'Gentle breeze' },
  { id: 'whitenoise', name: 'Static', icon: Radio, color: '#A0969A', description: 'White noise' },
];

interface ActiveSound {
  source: AudioBufferSourceNode | OscillatorNode | null;
  gainNode: GainNode;
  nodes: AudioNode[];
  volume: number;
}

interface AmbientSoundboardProps {
  onSoundToggle?: (activeSoundsCount: number) => void;
}

export default function AmbientSoundboard({ onSoundToggle }: AmbientSoundboardProps) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeSoundsRef = useRef<Map<string, ActiveSound>>(new Map());
  const [activeSoundIds, setActiveSoundIds] = useState<Set<string>>(new Set());
  const [volumes, setVolumes] = useState<Record<string, number>>({});
  const [masterMuted, setMasterMuted] = useState(false);
  const masterGainRef = useRef<GainNode | null>(null);

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
      masterGainRef.current = audioCtxRef.current.createGain();
      masterGainRef.current.connect(audioCtxRef.current.destination);
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      activeSoundsRef.current.forEach((sound) => {
        sound.nodes.forEach((n) => { try { n.disconnect(); } catch {} });
        try { sound.source?.stop(); } catch {}
      });
      try { audioCtxRef.current?.close(); } catch {}
    };
  }, []);

  const createNoise = useCallback((ctx: AudioContext, duration: number = 2): AudioBuffer => {
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }, []);

  const startSound = useCallback((soundId: string) => {
    const ctx = getAudioCtx();
    const masterGain = masterGainRef.current!;
    const nodes: AudioNode[] = [];

    const gainNode = ctx.createGain();
    gainNode.gain.value = volumes[soundId] ?? 0.5;
    nodes.push(gainNode);

    let source: AudioBufferSourceNode | OscillatorNode | null = null;

    switch (soundId) {
      case 'rain': {
        const noiseBuffer = createNoise(ctx, 2);
        const src = ctx.createBufferSource();
        src.buffer = noiseBuffer;
        src.loop = true;

        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 4000;
        nodes.push(hp);

        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 8000;
        nodes.push(lp);

        // Subtle volume modulation for rain effect
        const modGain = ctx.createGain();
        modGain.gain.value = 0.7;
        nodes.push(modGain);

        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.3;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.3;
        lfo.connect(lfoGain);
        lfoGain.connect(modGain.gain);
        lfo.start();
        nodes.push(lfo, lfoGain);

        src.connect(hp);
        hp.connect(lp);
        lp.connect(modGain);
        modGain.connect(gainNode);
        source = src;
        break;
      }
      case 'ocean': {
        const noiseBuffer = createNoise(ctx, 4);
        const src = ctx.createBufferSource();
        src.buffer = noiseBuffer;
        src.loop = true;

        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 600;
        nodes.push(lp);

        // Slow sweeping for wave-like feel
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.08;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 400;
        lfo.connect(lfoGain);
        lfoGain.connect(lp.frequency);
        lfo.start();
        nodes.push(lfo, lfoGain);

        // Volume modulation for swell
        const volLfo = ctx.createOscillator();
        volLfo.type = 'sine';
        volLfo.frequency.value = 0.06;
        const volLfoGain = ctx.createGain();
        volLfoGain.gain.value = 0.3;
        volLfo.connect(volLfoGain);
        volLfoGain.connect(gainNode.gain);
        volLfo.start();
        nodes.push(volLfo, volLfoGain);

        src.connect(lp);
        lp.connect(gainNode);
        source = src;
        break;
      }
      case 'forest': {
        // Layered: base hiss + chirpy oscillators
        const noiseBuffer = createNoise(ctx, 2);
        const src = ctx.createBufferSource();
        src.buffer = noiseBuffer;
        src.loop = true;

        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 3000;
        bp.Q.value = 2;
        nodes.push(bp);

        const baseGain = ctx.createGain();
        baseGain.gain.value = 0.15;
        nodes.push(baseGain);

        src.connect(bp);
        bp.connect(baseGain);
        baseGain.connect(gainNode);

        // Bird chirps via oscillators
        for (let i = 0; i < 3; i++) {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.value = 2000 + Math.random() * 3000;
          const birdGain = ctx.createGain();
          birdGain.gain.value = 0;
          // Intermittent chirping via modulation
          const birdLfo = ctx.createOscillator();
          birdLfo.type = 'square';
          birdLfo.frequency.value = 0.5 + Math.random() * 2;
          const birdLfoGain = ctx.createGain();
          birdLfoGain.gain.value = 0.02;
          birdLfo.connect(birdLfoGain);
          birdLfoGain.connect(birdGain.gain);
          birdLfo.start();
          osc.connect(birdGain);
          birdGain.connect(gainNode);
          osc.start();
          nodes.push(osc, birdGain, birdLfo, birdLfoGain);
        }

        source = src;
        break;
      }
      case 'fire': {
        const noiseBuffer = createNoise(ctx, 2);
        const src = ctx.createBufferSource();
        src.buffer = noiseBuffer;
        src.loop = true;

        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 1200;
        nodes.push(lp);

        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 200;
        nodes.push(hp);

        // Crackle modulation
        const lfo = ctx.createOscillator();
        lfo.type = 'sawtooth';
        lfo.frequency.value = 8;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.4;
        lfo.connect(lfoGain);
        lfoGain.connect(gainNode.gain);
        lfo.start();
        nodes.push(lfo, lfoGain);

        src.connect(hp);
        hp.connect(lp);
        lp.connect(gainNode);
        source = src;
        break;
      }
      case 'wind': {
        const noiseBuffer = createNoise(ctx, 4);
        const src = ctx.createBufferSource();
        src.buffer = noiseBuffer;
        src.loop = true;

        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 800;
        bp.Q.value = 0.5;
        nodes.push(bp);

        // Slow sweeping bandpass
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.04;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 600;
        lfo.connect(lfoGain);
        lfoGain.connect(bp.frequency);
        lfo.start();
        nodes.push(lfo, lfoGain);

        src.connect(bp);
        bp.connect(gainNode);
        source = src;
        break;
      }
      case 'whitenoise': {
        const noiseBuffer = createNoise(ctx, 2);
        const src = ctx.createBufferSource();
        src.buffer = noiseBuffer;
        src.loop = true;

        src.connect(gainNode);
        source = src;
        break;
      }
    }

    gainNode.connect(masterGain);

    if (source && 'start' in source) {
      source.start();
    }

    activeSoundsRef.current.set(soundId, {
      source,
      gainNode,
      nodes,
      volume: volumes[soundId] ?? 0.5,
    });

    setActiveSoundIds((prev) => new Set(prev).add(soundId));
  }, [getAudioCtx, createNoise, volumes]);

  const stopSound = useCallback((soundId: string) => {
    const sound = activeSoundsRef.current.get(soundId);
    if (sound) {
      // Fade out gracefully
      sound.gainNode.gain.linearRampToValueAtTime(0, audioCtxRef.current!.currentTime + 0.3);
      setTimeout(() => {
        sound.nodes.forEach((n) => { try { n.disconnect(); } catch {} });
        try { sound.source?.stop(); } catch {}
        activeSoundsRef.current.delete(soundId);
      }, 350);
    }
    setActiveSoundIds((prev) => {
      const next = new Set(prev);
      next.delete(soundId);
      return next;
    });
  }, []);

  const toggleSound = useCallback((soundId: string) => {
    if (activeSoundIds.has(soundId)) {
      stopSound(soundId);
    } else {
      startSound(soundId);
      // Count will be current + 1 since startSound hasn't updated state yet
      onSoundToggle?.(activeSoundIds.size + 1);
    }
  }, [activeSoundIds, startSound, stopSound, onSoundToggle]);

  const handleVolumeChange = useCallback((soundId: string, value: number) => {
    setVolumes((prev) => ({ ...prev, [soundId]: value }));
    const sound = activeSoundsRef.current.get(soundId);
    if (sound) {
      sound.gainNode.gain.linearRampToValueAtTime(
        value,
        audioCtxRef.current!.currentTime + 0.1
      );
    }
  }, []);

  const toggleMasterMute = useCallback(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      const newMuted = !masterMuted;
      masterGainRef.current.gain.linearRampToValueAtTime(
        newMuted ? 0 : 1,
        audioCtxRef.current.currentTime + 0.2
      );
      setMasterMuted(newMuted);
    }
  }, [masterMuted]);

  return (
    <div className="flex flex-col gap-5">
      {/* Header with master mute */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-white/30 uppercase tracking-wider font-semibold">
          {activeSoundIds.size > 0
            ? `${activeSoundIds.size} layer${activeSoundIds.size > 1 ? 's' : ''} active`
            : 'Select ambient layers'}
        </p>
        {activeSoundIds.size > 0 && (
          <motion.button
            id="soundboard-master-mute"
            onClick={toggleMasterMute}
            className="size-7 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {masterMuted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
          </motion.button>
        )}
      </div>

      {/* Sound Grid */}
      <div className="grid grid-cols-3 gap-3">
        {sounds.map((sound, i) => {
          const isActive = activeSoundIds.has(sound.id);
          const Icon = sound.icon;

          return (
            <motion.div
              key={sound.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex flex-col gap-2"
            >
              <motion.button
                id={`soundboard-${sound.id}`}
                onClick={() => toggleSound(sound.id)}
                className={`relative flex flex-col items-center justify-center gap-2.5 p-5 rounded-xl cursor-pointer transition-all duration-300 overflow-hidden ${
                  isActive
                    ? 'border-opacity-40'
                    : 'border-opacity-100'
                }`}
                style={{
                  background: isActive ? `${sound.color}15` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isActive ? `${sound.color}40` : 'rgba(255,255,255,0.06)'}`,
                }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                {/* Active glow */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{
                      boxShadow: `inset 0 0 30px ${sound.color}15, 0 0 20px ${sound.color}10`,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  />
                )}

                {/* Animated waveform bars */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-6 flex items-end justify-center gap-[2px] px-3 pointer-events-none overflow-hidden">
                    {Array.from({ length: 12 }).map((_, j) => (
                      <motion.div
                        key={j}
                        className="w-[3px] rounded-full"
                        style={{ backgroundColor: `${sound.color}60` }}
                        animate={{
                          height: [3, 6 + Math.random() * 12, 3],
                        }}
                        transition={{
                          duration: 0.6 + Math.random() * 0.8,
                          repeat: Infinity,
                          repeatType: 'reverse',
                          delay: j * 0.05,
                          ease: 'easeInOut',
                        }}
                      />
                    ))}
                  </div>
                )}

                <div className="relative z-10">
                  <Icon
                    className="size-6 transition-colors duration-300"
                    style={{ color: isActive ? sound.color : 'rgba(255,255,255,0.4)' }}
                  />
                </div>
                <span
                  className="text-[10px] font-semibold tracking-wider uppercase relative z-10 transition-colors duration-300"
                  style={{ color: isActive ? sound.color : 'rgba(255,255,255,0.35)' }}
                >
                  {sound.name}
                </span>
              </motion.button>

              {/* Volume slider for active sounds */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="px-1"
                  >
                    <input
                      id={`soundboard-volume-${sound.id}`}
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volumes[sound.id] ?? 0.5}
                      onChange={(e) => handleVolumeChange(sound.id, parseFloat(e.target.value))}
                      className="w-full h-1 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${sound.color} 0%, ${sound.color} ${(volumes[sound.id] ?? 0.5) * 100}%, rgba(255,255,255,0.1) ${(volumes[sound.id] ?? 0.5) * 100}%, rgba(255,255,255,0.1) 100%)`,
                        accentColor: sound.color,
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
