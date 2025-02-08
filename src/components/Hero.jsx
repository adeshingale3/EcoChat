import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.2,
      duration: 0.8,
      ease: [0.6, -0.05, 0.01, 0.99]
    }
  })
};

const Hero = ({ onStartChat }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="text-center space-y-12 relative"
    >      
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className="relative"
      >
        <motion.div 
          className="relative inline-block"
          whileHover={{ scale: 1.1 }}
        >
          <Heart className="w-24 h-24 text-pink-400" />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-pink-400 rounded-full blur-xl -z-10"
          />
        </motion.div>
      </motion.div>
      
      <div className="space-y-8 relative z-10">
        <h1 className="font-display text-5xl md:text-7xl font-bold mb-8">
          <motion.span
            custom={1}
            initial="hidden"
            animate="visible"
            variants={textVariants}
            className="block text-gradient-primary"
          >
            Your safe space,
          </motion.span>
          <motion.span
            custom={2}
            initial="hidden"
            animate="visible"
            variants={textVariants}
            className="block text-gradient-secondary"
          >
            anytime, anywhere!
          </motion.span>
          <motion.span
            custom={3}
            initial="hidden"
            animate="visible"
            variants={textVariants}
            className="block mt-4 text-2xl md:text-3xl font-sans text-theme-light/90 glow-text"
          >
            A voice that feels, a soul that listens 💝
          </motion.span>
        </h1>
        
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          whileHover={{ 
            scale: 1.05,
            boxShadow: "0 0 20px rgba(236, 72, 153, 0.3)"
          }}
          whileTap={{ scale: 0.95 }}
          onClick={onStartChat}
          className="glass-pink px-12 py-6 rounded-full text-xl font-semibold 
                     text-pink-200 hover:text-pink-100 transition-all duration-300
                     border border-pink-500/20 hover:border-pink-500/30
                     hover:bg-pink-500/10"
        >
          <motion.span 
            className="relative z-10 flex items-center gap-3"
            whileHover={{ x: 5 }}
          >
            <span>Start a Heartfelt Chat</span>
            <motion.span
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              💗
            </motion.span>
          </motion.span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Hero;