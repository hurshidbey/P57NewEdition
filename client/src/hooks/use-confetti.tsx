import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiParticle {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
}

const COLORS = ['#FF4F30', '#FFB800', '#00D4AA', '#0066FF', '#9333EA', '#EF4444'];

export function useConfetti() {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  const [isActive, setIsActive] = useState(false);

  const createParticles = useCallback((count: number = 50) => {
    const newParticles: ConfettiParticle[] = [];
    
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: `particle-${i}-${Date.now()}`,
        x: Math.random() * window.innerWidth,
        y: -20,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
      });
    }
    
    return newParticles;
  }, []);

  const trigger = useCallback(() => {
    if (isActive) return; // Prevent multiple triggers
    
    const newParticles = createParticles();
    setParticles(newParticles);
    setIsActive(true);
    
    // Clean up after animation
    setTimeout(() => {
      setParticles([]);
      setIsActive(false);
    }, 3000);
  }, [createParticles, isActive]);

  const ConfettiRenderer = useCallback(() => (
    <div 
      className="fixed inset-0 pointer-events-none z-50"
      style={{ overflow: 'hidden' }}
    >
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute"
            style={{
              backgroundColor: particle.color,
              width: particle.size,
              height: particle.size,
              borderRadius: '2px',
            }}
            initial={{ 
              x: particle.x, 
              y: particle.y,
              rotate: particle.rotation,
              opacity: 1
            }}
            animate={{ 
              y: window.innerHeight + 100,
              x: particle.x + (Math.random() - 0.5) * 200,
              rotate: particle.rotation + particle.rotationSpeed * 60,
              opacity: 0
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 2.5 + Math.random() * 1,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  ), [particles]);

  return { trigger, ConfettiRenderer, isActive };
}