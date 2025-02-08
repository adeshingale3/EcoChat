import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

const Hero = ({ onStartChat }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-12 relative"
    >      
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className="relative"
      >
        <div className="relative">
          <div className="flex justify-center items-center">
            <Heart className="w-24 h-24 text-pink-400" />
          </div>
        </div>
      </motion.div>
      
      <div className="space-y-8 relative z-10">
        <h1 className="text-5xl md:text-7xl font-bold mb-8 relative">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="block text-pink-300"
          >
            Your safe space, anytime, anywhere !
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="block mt-4 text-3xl md:text-3xl text-pink-200/90"
          >
            A voice that feels, a soul that listens 💝
          </motion.span>
        </h1>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStartChat}
          className="glass-pink px-12 py-6 rounded-full text-xl font-semibold 
                     text-pink-200 hover:text-pink-100 transition-colors
                     border border-pink-500/20 hover:border-pink-500/30"
        >
          <span className="relative z-10 flex items-center gap-3">
            <span>Start a Heartfelt Chat</span>
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              💗
            </motion.span>
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Hero;