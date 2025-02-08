import React from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <footer className="fixed bottom-0 w-full py-4 bg-pink-950/30 backdrop-blur-sm border-t border-pink-500/10">
      <div className="container mx-auto px-6">
        <motion.div 
          className="flex items-center justify-center gap-2 text-pink-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-sm">Made with</span>
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <Heart className="w-4 h-4 text-pink-400 inline" />
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;