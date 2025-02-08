import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles } from 'lucide-react';

const Hero = ({ onStartChat }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-12 relative"
    >
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <Sparkles className="w-full h-full" />
      </div>
      
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className="relative"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-xl"
          />
        </div>
        <div className="relative">
          <Bot className="w-32 h-32 text-purple-400 relative z-10" />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity
            }}
            className="absolute top-0 right-0"
          >
            <Sparkles className="w-8 h-8 text-purple-300" />
          </motion.div>
        </div>
      </motion.div>
      
      <div className="space-y-6 relative z-10">
        <h1 className="text-6xl md:text-8xl font-bold mb-8 relative">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="block bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent"
          >
            Feeling Alone?
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="block mt-4 text-4xl md:text-6xl text-purple-100/90"
          >
            Don't worry, Echo is here
          </motion.span>
        </h1>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStartChat}
          className="glass-morphism px-12 py-6 rounded-full text-xl font-semibold relative overflow-hidden group"
        >
          <span className="relative z-10 flex items-center gap-2">
            <span>Chat with Echo</span>
            <motion.span
              animate={{
                rotate: [0, 360]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <Sparkles className="w-5 h-5" />
            </motion.span>
          </span>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20"
            animate={{
              scale: [1, 2],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Hero;