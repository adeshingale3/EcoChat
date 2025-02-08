import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, MessageSquare, Bot, Sparkles } from 'lucide-react';
import useMeasure from 'react-use-measure';

const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api/chat'
  : 'https://your-deployed-backend-url/api/chat';

const VoiceWaveform = () => {
  const bars = 5;
  return (
    <div className="flex items-center gap-1 h-6">
      {[...Array(bars)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-purple-400"
          animate={{
            height: [8, 24, 8],
            backgroundColor: [
              "rgb(192, 132, 252)",
              "rgb(216, 180, 254)",
              "rgb(192, 132, 252)"
            ]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [ref, bounds] = useMeasure();

  const handleSend = async () => {
    if (inputText.trim()) {
      // Add user message immediately
      const userMessage = { text: inputText, isUser: true };
      setMessages(prev => [...prev, userMessage]);
      const currentInput = inputText;
      setInputText('');

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ message: currentInput }),
          mode: 'cors',
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setMessages(prev => [...prev, {
          text: data.reply || "I apologize, but I couldn't process that properly.",
          isUser: false
        }]);
      } catch (error) {
        console.error('Error:', error);
        setMessages(prev => [...prev, {
          text: "I'm having trouble connecting. Please try again later.",
          isUser: false
        }]);
      }
    }
  };

  const toggleVoiceMode = () => {
    setIsVoiceMode(!isVoiceMode);
    setIsListening(false);
  };

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md mx-auto glass-morphism rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/10"
      style={{ height: '80vh' }}
      ref={ref}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/50 via-fuchsia-900/50 to-pink-900/50 p-6">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
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
              <Bot className="w-8 h-8 text-purple-300" />
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
                className="absolute -top-1 -right-1"
              >
                <Sparkles className="w-3 h-3 text-purple-300" />
              </motion.div>
            </motion.div>
            <div>
              <h2 className="text-xl font-semibold">Echo</h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-purple-200">Online</span>
              </div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleVoiceMode}
            className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
          >
            {isVoiceMode ? <MessageSquare size={20} /> : <Mic size={20} />}
          </motion.button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex flex-col h-[calc(100%-8rem)]">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence>
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-center text-purple-200/70 space-y-4"
              >
                <Bot className="w-16 h-16 mb-4 text-purple-300/50" />
                <p className="text-lg">Hi, I'm Echo! I'm here to listen and chat.</p>
                <p className="text-sm">Feel free to share anything that's on your mind.</p>
              </motion.div>
            )}
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} items-end gap-2`}
              >
                {!message.isUser && (
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-purple-300" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-4 ${
                    message.isUser
                      ? 'bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl rounded-br-none shadow-lg shadow-purple-500/20'
                      : 'bg-white/10 backdrop-blur-sm rounded-2xl rounded-bl-none'
                  }`}
                >
                  {message.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white/5 backdrop-blur-md border-t border-white/10">
          <div className="flex items-center gap-3">
            {isVoiceMode ? (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleListening}
                className={`p-4 rounded-full ${
                  isListening 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-500 shadow-lg shadow-purple-500/20' 
                    : 'bg-white/10 hover:bg-white/20'
                } w-full flex items-center justify-center`}
              >
                {isListening ? <VoiceWaveform /> : (
                  <div className="flex items-center gap-2">
                    <Mic size={24} />
                    <span className="text-sm">Tap to speak</span>
                  </div>
                )}
              </motion.button>
            ) : (
              <>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-4 rounded-2xl bg-white/10 border border-white/20 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all placeholder-white/50 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSend}
                  className="p-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 shadow-lg shadow-purple-500/20"
                >
                  <Send size={24} />
                </motion.button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatInterface;