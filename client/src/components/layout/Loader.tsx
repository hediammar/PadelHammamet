import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Loader = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Prevent scrolling during loader
    document.body.style.overflow = 'hidden';

    // Hide loader after animation completes (slightly longer for racket animation)
    const timer = setTimeout(() => {
      setIsVisible(false);
      document.body.style.overflow = '';
    }, 3300);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, []);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, visibility: 'hidden' }}
          transition={{ duration: 0.5, delay: 2.5 }}
          className="fixed inset-0 bg-[var(--color-dark-bg)] z-[9999] flex items-center justify-center overflow-hidden"
          style={{ pointerEvents: 'none' }}
        >
          {/* Animated Background Gradient */}
          <motion.div
            className="absolute inset-0 opacity-20"
            animate={{
              background: [
                'radial-gradient(circle at 20% 50%, var(--color-padel-green) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 50%, var(--color-electric-blue) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 50%, var(--color-padel-green) 0%, transparent 50%)',
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Padel Ball with Rotation and Glow */}
          <motion.div
            className="relative w-20 h-20 rounded-full"
            style={{
              background: 'radial-gradient(circle at 35% 35%, #ffffdd 0%, #DFFF00 40%, #aacc00 100%)',
              boxShadow: 'inset -5px -5px 15px rgba(0,0,0,0.2), 0 0 30px rgba(0,255,136,0.3)',
              willChange: 'transform, opacity, filter',
              backfaceVisibility: 'hidden',
            }}
            initial={{ opacity: 0, scale: 0.1, rotate: 0, filter: 'blur(0px)' }}
            animate={{
              scale: [0.1, 1, 0.9, 40],
              opacity: [0, 1, 1, 1],
              filter: ['blur(0px)', 'blur(0px)', 'blur(0px)', 'blur(4px)'],
              rotate: [0, 180, 360, 720], // Ball spins as it smashes
            }}
            transition={{
              duration: 1.5,
              times: [0, 0.2, 0.6, 1],
              ease: [0.7, 0, 0.84, 0],
            }}
          >
            {/* Ball Seam */}
            <div
              className="absolute inset-0 rounded-full border-4 border-white/70"
              style={{
                transform: 'rotate(45deg) scale(0.94)',
                clipPath: 'ellipse(50% 35% at 50% 50%)',
                pointerEvents: 'none',
              }}
            />
          </motion.div>

          {/* Impact Ripple Waves - Green */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--color-padel-green)]/50"
            initial={{ width: 0, height: 0, opacity: 0.8 }}
            animate={{
              width: [0, 200, 400, 600],
              height: [0, 200, 400, 600],
              opacity: [0.8, 0.4, 0.2, 0],
            }}
            transition={{
              duration: 0.8,
              delay: 1.2,
              times: [0, 0.3, 0.6, 1],
            }}
          />

          {/* Impact Ripple Waves - Blue */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--color-electric-blue)]/50"
            initial={{ width: 0, height: 0, opacity: 0.6 }}
            animate={{
              width: [0, 300, 500, 700],
              height: [0, 300, 500, 700],
              opacity: [0.6, 0.3, 0.1, 0],
            }}
            transition={{
              duration: 1,
              delay: 1.3,
              times: [0, 0.3, 0.6, 1],
            }}
          />

          {/* Impact Flash with Color Gradient */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 1, 0.5, 0],
            }}
            transition={{
              duration: 0.4,
              delay: 1.2,
              times: [0, 0.3, 0.6, 1],
            }}
            style={{
              background: 'radial-gradient(circle at center, white 0%, rgba(0,255,136,0.3) 50%, transparent 100%)',
            }}
          />

          {/* Camera Shake Effect Container */}
          <motion.div
            className="absolute inset-0"
            animate={{
              x: [0, -2, 2, -1, 1, 0],
              y: [0, -1, 1, -2, 2, 0],
            }}
            transition={{
              duration: 0.3,
              delay: 1.2,
              times: [0, 0.2, 0.4, 0.6, 0.8, 1],
            }}
          >
            {/* Logo - Padel Hammamet with Gradient and Glow */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10 pointer-events-none"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: [0.8, 1.1, 1], // Pop with slight overshoot
              }}
              transition={{
                duration: 0.8,
                delay: 1.3,
                ease: [0.34, 1.56, 0.64, 1],
              }}
            >
              <motion.h1
                className="font-black text-4xl sm:text-5xl md:text-6xl uppercase tracking-[5px] mt-2.5"
                style={{
                 
                  background: 'black',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
                animate={{
                  filter: [
                    'drop-shadow(0 0 10px rgba(0,255,136,0.5))',
                    'drop-shadow(0 0 20px rgba(0,255,136,0.8))',
                    'drop-shadow(0 0 10px rgba(0,255,136,0.5))',
                  ],
                }}
                transition={{
                  duration: 1.5,
                  delay: 1.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                Padel Hammamet
              </motion.h1>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Loader;

