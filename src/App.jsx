import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ChatInterface from './components/Chatinterface';
import Footer from './components/Footer';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
          <h2 className="text-2xl font-semibold text-pink-300 mb-4">Something went wrong</h2>
          <p className="text-purple-200 mb-6">Please try refreshing the page</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 transition-all"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [showChat, setShowChat] = useState(false);

  return (
    <Router>
      <div className="min-h-screen warm-gradient text-theme-light noise">
        <div className="absolute inset-0 bg-gradient-radial from-theme-accent/5 via-transparent to-transparent" />
        <Navbar setShowChat={setShowChat} />
        
        <div className="container mx-auto px-4 pt-24 pb-16 relative">
          <Routes>
            <Route path="/" element={
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
                      <ChatInterface onClose={() => setShowChat(false)} />
                    </ErrorBoundary>
                  </motion.div>
                )}
              </AnimatePresence>
            } />
            <Route path="/chat" element={
              <ErrorBoundary>
                <ChatInterface onClose={() => setShowChat(false)} />
              </ErrorBoundary>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;