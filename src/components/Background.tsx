import React from 'react';
import { motion, useMotionValue, useMotionTemplate, useSpring } from 'motion/react';
import { useEffect } from 'react';

export default function Background() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 40, stiffness: 100, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const backgroundGradient = useMotionTemplate`radial-gradient(1000px circle at ${smoothX}px ${smoothY}px, rgba(16, 185, 129, 0.04), transparent 80%)`;
  const subtleGlow = useMotionTemplate`radial-gradient(400px circle at ${smoothX}px ${smoothY}px, rgba(168, 85, 247, 0.03), transparent 60%)`;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#02040a]">
      <motion.div 
        className="absolute inset-0 transition-opacity duration-300"
        style={{ background: backgroundGradient }}
      />
      <motion.div 
        className="absolute inset-0 transition-opacity duration-300 mix-blend-screen"
        style={{ background: subtleGlow }}
      />
      
      {/* Noise overlay for cinematic texture */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px'
        }}
      />

      {/* Abstract geometric orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/5 blur-[150px]" />
    </div>
  );
}
