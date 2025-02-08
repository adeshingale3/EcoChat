import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ChatInterface from './components/Chatinterface';

// import ChatInterface from './components/ChatInterface';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh the page.</div>;
    }
    return this.props.children;
  }
}

function App() {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="min-h-screen night-sky text-white">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-pink-900/20" />
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12 relative">
        <AnimatePresence mode="wait">
          {!showChat ? (
            <motion.div
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center min-h-[80vh]"
            >
              <Hero onStartChat={() => setShowChat(true)} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
              className="flex justify-center items-center min-h-[80vh]"
            >
              <ErrorBoundary>
                <ChatInterface />
              </ErrorBoundary>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App