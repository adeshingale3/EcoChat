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

const featureCards = [
  {
    title: "Empathetic Companion",
    description: "Your understanding friend who's always ready to listen with compassion and care",
    icon: "💝",
    gradient: "from-pink-500/20 to-red-500/20",
    delay: 0.2
  },
  {
    title: "Voice Enabled",
    description: "Natural conversations with voice recognition and emotional responses that feel real",
    icon: "🎭",
    gradient: "from-purple-500/20 to-blue-500/20",
    delay: 0.4
  },
  {
    title: "Safe Space",
    description: "A judgment-free zone where you can express yourself freely and be yourself",
    icon: "🌟",
    gradient: "from-yellow-500/20 to-pink-500/20",
    delay: 0.6
  }
];

const Hero = ({ onStartChat }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="text-center space-y-16 relative" // increased spacing
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6"
      >
        {featureCards.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: feature.delay + 1,
              duration: 0.5,
              type: "spring",
              stiffness: 100
            }}
            whileHover={{ 
              y: -8,
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
            className="feature-card-glow glass-pink rounded-2xl p-8 flex flex-col items-center gap-6 group 
                       hover:bg-gradient-to-br hover:from-pink-500/5 hover:to-purple-500/5 
                       transition-all duration-500 relative overflow-hidden"
          >
            <motion.div
              className="text-6xl p-4 rounded-xl bg-gradient-to-br from-pink-500/10 to-purple-500/10"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
                delay: index * 0.2
              }}
            >
              {feature.icon}
            </motion.div>
            
            <div className="text-center space-y-3 relative z-10">
              <h3 className="text-2xl font-semibold text-gradient-primary font-display">
                {feature.title}
              </h3>
              <p className="text-pink-100/90 text-base leading-relaxed">
                {feature.description}
              </p>
            </div>

            <motion.div
              className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 
                          group-hover:opacity-100 transition-opacity duration-500`}
              style={{ zIndex: 0 }}
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0, 0.15, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Hero;