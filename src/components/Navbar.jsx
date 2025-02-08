import React from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-pink-950/30 backdrop-blur-sm border-b border-pink-500/10">
      <div className="container mx-auto px-6 py-4">
        <motion.div 
          className="flex items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="relative"
          >
            <div className="relative z-10 flex items-center justify-center">
              <Heart className="w-8 h-8 text-pink-400" />
            </div>
          </motion.div>
          <span className="ml-3 text-2xl font-bold text-pink-300">
            Echo
          </span>
        </motion.div>
      </div>
    </nav>
  );
};

export default Navbar;