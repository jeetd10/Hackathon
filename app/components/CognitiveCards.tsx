// app/components/CognitiveCards.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle2 } from 'lucide-react';

interface CognitiveDistortion {
  id: number;
  name: string;
  emoji: string;
  example: string;
  definition: string;
  challenge: string;
  color: string;
}

const distortions: CognitiveDistortion[] = [
  {
    id: 1,
    name: 'Catastrophizing',
    emoji: '🌪️',
    example: '"If I fail this exam, my entire career is over."',
    definition: 'Jumping to the worst-case scenario without evidence. You magnify the importance of a negative event until it feels like an irreversible disaster.',
    challenge: 'Ask: "What is the most *realistic* outcome?" Rate the actual probability of your feared scenario from 1-10.',
    color: '#D6A08A',
  },
  {
    id: 2,
    name: 'Black & White Thinking',
    emoji: '⚫',
    example: '"I didn\'t finish my workout, so the whole day is wasted."',
    definition: 'Seeing things in only two extreme categories — all good or all bad — with no middle ground. Also called "All-or-Nothing" thinking.',
    challenge: 'Find the gray: "What did I accomplish today, even if it wasn\'t everything?"',
    color: '#9CAD8A',
  },
  {
    id: 3,
    name: 'Mind Reading',
    emoji: '🔮',
    example: '"They didn\'t text back — they must hate me."',
    definition: 'Assuming you know what others are thinking without any real evidence. You treat your guesses about their inner state as facts.',
    challenge: 'Ask: "Do I have actual evidence, or am I guessing?" Consider 3 alternative explanations.',
    color: '#E5C3A6',
  },
  {
    id: 4,
    name: 'Emotional Reasoning',
    emoji: '💭',
    example: '"I feel stupid, therefore I am stupid."',
    definition: 'Using your emotions as proof that something is true. Because you feel a certain way, you assume reality matches that feeling.',
    challenge: 'Separate feelings from facts: "I *feel* X, but the evidence actually shows Y."',
    color: '#D3C4B3',
  },
  {
    id: 5,
    name: 'Overgeneralization',
    emoji: '♾️',
    example: '"I got rejected once. I\'ll always be rejected."',
    definition: 'Taking a single event and using words like "always" or "never" to apply it to all situations. One data point becomes an eternal pattern.',
    challenge: 'Replace "always/never" with "this time." Track counterexamples from your own past.',
    color: '#A0969A',
  },
  {
    id: 6,
    name: 'Should Statements',
    emoji: '📋',
    example: '"I should be further along by now."',
    definition: 'Rigid rules about how you or others must behave. "Should" creates guilt when directed at yourself, and resentment when directed at others.',
    challenge: 'Replace "should" with "it would be nice if" or "I prefer." Notice how it changes the emotional weight.',
    color: '#73626A',
  },
  {
    id: 7,
    name: 'Personalization',
    emoji: '🎯',
    example: '"The team failed because of me."',
    definition: 'Taking excessive responsibility for events outside your control. You believe you are the cause of negative external outcomes.',
    challenge: 'List all contributing factors. What percentage was genuinely within your control vs. external?',
    color: '#D6A08A',
  },
  {
    id: 8,
    name: 'Mental Filter',
    emoji: '🔍',
    example: '"I got 9 compliments and 1 criticism — the criticism is all I can think about."',
    definition: 'Focusing exclusively on a single negative detail while ignoring the overwhelming positive evidence. Like a filter that only lets through the bad.',
    challenge: 'Write down 3 positive things from the same situation. Force the mental filter into balance.',
    color: '#9CAD8A',
  },
  {
    id: 9,
    name: 'Fortune Telling',
    emoji: '🎱',
    example: '"There\'s no point in applying — I know I won\'t get it."',
    definition: 'Predicting the future negatively and treating your prediction as an established fact, then using it as a reason not to try.',
    challenge: 'Ask: "How many of my past predictions actually came true?" Test the prediction instead of accepting it.',
    color: '#E5C3A6',
  },
  {
    id: 10,
    name: 'Labeling',
    emoji: '🏷️',
    example: '"I\'m a failure" instead of "I failed at this one thing."',
    definition: 'Attaching a fixed, global label to yourself or others based on a single action. It collapses an entire identity into one word.',
    challenge: 'Replace the label with a description of the specific behavior: "I made a mistake" instead of "I\'m an idiot."',
    color: '#D3C4B3',
  },
];

const STORAGE_KEY = 'aura-cognitive-cards-reviewed';

interface CognitiveCardsProps {
  onCardReviewed?: () => void;
}

export default function CognitiveCards({ onCardReviewed }: CognitiveCardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewed, setReviewed] = useState<Set<number>>(new Set());
  const [direction, setDirection] = useState(0);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setReviewed(new Set(JSON.parse(stored)));
      }
    } catch {}
  }, []);

  const markReviewed = (id: number) => {
    setReviewed((prev) => {
      const next = new Set(prev).add(id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  const goToCard = (newIndex: number, dir: number) => {
    // Mark current as reviewed
    const wasReviewed = reviewed.has(distortions[currentIndex].id);
    markReviewed(distortions[currentIndex].id);
    if (!wasReviewed) onCardReviewed?.();
    setIsFlipped(false);
    setDirection(dir);
    setCurrentIndex(newIndex);
  };

  const nextCard = () => {
    const next = (currentIndex + 1) % distortions.length;
    goToCard(next, 1);
  };

  const prevCard = () => {
    const prev = (currentIndex - 1 + distortions.length) % distortions.length;
    goToCard(prev, -1);
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 80) {
      prevCard();
    } else if (info.offset.x < -80) {
      nextCard();
    }
  };

  const resetProgress = () => {
    setReviewed(new Set());
    localStorage.removeItem(STORAGE_KEY);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const card = distortions[currentIndex];
  const isCardReviewed = reviewed.has(card.id);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
      rotateY: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      rotateY: 0,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
      rotateY: 0,
      scale: 0.9,
    }),
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-grow flex gap-1">
          {distortions.map((d, i) => (
            <motion.div
              key={d.id}
              className="h-1 flex-1 rounded-full cursor-pointer"
              style={{
                backgroundColor: reviewed.has(d.id)
                  ? d.color
                  : i === currentIndex
                    ? `${card.color}60`
                    : 'rgba(255,255,255,0.08)',
              }}
              onClick={() => goToCard(i, i > currentIndex ? 1 : -1)}
              whileHover={{ scaleY: 2 }}
              transition={{ duration: 0.15 }}
            />
          ))}
        </div>
        <span className="text-[11px] text-white/30 font-mono shrink-0">
          {reviewed.size}/{distortions.length}
        </span>
        {reviewed.size > 0 && (
          <motion.button
            id="cognitive-cards-reset"
            onClick={resetProgress}
            className="size-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
            whileHover={{ scale: 1.1, rotate: -90 }}
            whileTap={{ scale: 0.9 }}
            title="Reset progress"
          >
            <RotateCcw className="size-3" />
          </motion.button>
        )}
      </div>

      {/* Card container */}
      <div className="relative" style={{ perspective: '1200px' }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', damping: 30, stiffness: 250 }}
            style={{ x, rotate, opacity }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer select-none"
          >
            <div
              className="relative rounded-3xl overflow-hidden transition-all duration-500"
              style={{
                transformStyle: 'preserve-3d',
                minHeight: '280px',
              }}
            >
              {/* Front / Back flip */}
              <AnimatePresence mode="wait">
                {!isFlipped ? (
                  <motion.div
                    key="front"
                    initial={{ rotateY: -90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: 90, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="relative rounded-3xl p-8 flex flex-col justify-between border"
                    style={{
                      background: `linear-gradient(145deg, ${card.color}12, rgba(255,255,255,0.02))`,
                      borderColor: `${card.color}25`,
                      minHeight: '280px',
                    }}
                  >
                    {/* Card front content */}
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{card.emoji}</span>
                          <span
                            className="text-[10px] font-bold tracking-widest uppercase"
                            style={{ color: card.color }}
                          >
                            Distortion #{card.id}
                          </span>
                        </div>
                        {isCardReviewed && (
                          <CheckCircle2 className="size-5" style={{ color: card.color }} />
                        )}
                      </div>

                      <h3 className="text-2xl font-bold text-white tracking-tight mb-4">
                        {card.name}
                      </h3>

                      <div
                        className="rounded-xl p-4 border"
                        style={{
                          background: `${card.color}08`,
                          borderColor: `${card.color}15`,
                        }}
                      >
                        <p className="text-[13px] text-white/60 font-light italic leading-relaxed">
                          {card.example}
                        </p>
                      </div>
                    </div>

                    <p className="text-[11px] text-white/25 text-center mt-6 uppercase tracking-widest">
                      Tap to flip → Learn to challenge
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="back"
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: -90, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="relative rounded-3xl p-8 flex flex-col justify-between border"
                    style={{
                      background: `linear-gradient(145deg, ${card.color}08, rgba(255,255,255,0.01))`,
                      borderColor: `${card.color}20`,
                      minHeight: '280px',
                    }}
                  >
                    <div>
                      <span
                        className="text-[10px] font-bold tracking-widest uppercase mb-4 block"
                        style={{ color: card.color }}
                      >
                        Understanding {card.name}
                      </span>

                      <p className="text-[14px] text-white/70 font-light leading-relaxed mb-6">
                        {card.definition}
                      </p>

                      <div
                        className="rounded-xl p-4 border"
                        style={{
                          background: `${card.color}10`,
                          borderColor: `${card.color}20`,
                        }}
                      >
                        <span
                          className="text-[10px] font-bold tracking-widest uppercase mb-2 block"
                          style={{ color: card.color }}
                        >
                          How to challenge it
                        </span>
                        <p className="text-[13px] text-white/80 font-light leading-relaxed">
                          {card.challenge}
                        </p>
                      </div>
                    </div>

                    <p className="text-[11px] text-white/25 text-center mt-6 uppercase tracking-widest">
                      Tap to flip back · Swipe for next
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation controls */}
      <div className="flex items-center justify-center gap-4">
        <motion.button
          id="cognitive-cards-prev"
          onClick={prevCard}
          className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronLeft className="size-5" />
        </motion.button>

        <span className="text-[12px] font-mono text-white/30 min-w-[60px] text-center">
          {currentIndex + 1} / {distortions.length}
        </span>

        <motion.button
          id="cognitive-cards-next"
          onClick={nextCard}
          className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronRight className="size-5" />
        </motion.button>
      </div>
    </div>
  );
}
