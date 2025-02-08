import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Github } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ setShowChat }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const goToHome = () => {
    // Reset chat visibility
    setShowChat(false);
    // Navigate to home
    navigate('/');
    // Scroll to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 50, damping: 20 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-pink-950/80 to-transparent backdrop-blur-sm border-b border-pink-500/10"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <motion.div 
            className="flex items-center gap-2 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={goToHome}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <Heart className="w-6 h-6 text-pink-400" />
            </motion.div>
            <span className="text-xl font-semibold bg-gradient-to-r from-pink-300 to-purple-300 text-transparent bg-clip-text hover:from-pink-200 hover:to-purple-200 transition-all duration-300">
              Echo
            </span>
          </motion.div>

          <div className="flex items-center gap-4">
            <motion.a
              href="https://github.com/yourusername/EchoChat"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Github className="w-5 h-5" />
            </motion.a>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;