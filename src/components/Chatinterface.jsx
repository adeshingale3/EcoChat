import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, MessageSquare, Bot, Sparkles } from 'lucide-react';
import useMeasure from 'react-use-measure';

const API_URL = `http://localhost:3000/api/chat`;
const SPEECHIFY_API_KEY = import.meta.env.VITE_SPEECHIFY_API_KEY;
const SPEECHIFY_API_URL = import.meta.env.VITE_SPEECHIFY_API_URL;

const speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = speechRecognition ? new speechRecognition() : null;
const synthesis = window.speechSynthesis;

if (recognition) {
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
}

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

const checkVoiceSupport = () => {
  const speechRecognitionSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  const speechifyConfigured = !!SPEECHIFY_API_KEY;
  
  if (!speechRecognitionSupported) {
    console.warn('Speech recognition not supported');
    return false;
  }
  
  if (!speechifyConfigured) {
    console.warn('Speechify API key not configured');
    return false;
  }
  
  return true;
};

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(() => checkVoiceSupport());
  const [isListening, setIsListening] = useState(false);
  const [ref, bounds] = useMeasure();
  const [sessionId] = useState(() => 'session_' + Date.now());
  const [transcript, setTranscript] = useState('');

  // Define speakResponse first since other functions depend on it
  const speakResponse = useCallback(async (text) => {
    if (!isVoiceMode || !text?.trim()) return;
  
    try {
      const response = await fetch('https://texttospeech.speechify.com/api/generateAudioFiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${SPEECHIFY_API_KEY}`
        },
        body: JSON.stringify({
          text: text,
          audioFormat: 'mp3',
          voiceParams: {
            name: 'kristy', // Specify Kristy voice
            engine: 'neural',
            speakingRate: '1.0',
            pitch: '1.0'
          },
          quality: 'high',
          platform: 'web',
          preserveParagraphs: true,
          paragraphBreaks: true
        })
      });

      if (!response.ok) {
        throw new Error(`Speechify error: ${response.status}`);
      }

      const data = await response.json();
      const audioUrl = data.audioUrl;
      const audio = new Audio(audioUrl);

      // Add natural fade in/out
      audio.addEventListener('timeupdate', () => {
        const fadePoint = 0.1;
        if (audio.currentTime < fadePoint) {
          audio.volume = audio.currentTime / fadePoint;
        }
        if (audio.duration - audio.currentTime < fadePoint) {
          audio.volume = (audio.duration - audio.currentTime) / fadePoint;
        }
      });

      await audio.play();

      // Cleanup
      audio.onended = () => {
        console.log('Audio playback completed');
      };

    } catch (error) {
      console.error('Speechify API error:', error);
      // Fallback to browser's speech synthesis
      if (synthesis) {
        const utterance = new SpeechSynthesisUtterance(text);
        synthesis.speak(utterance);
      }
    }
  }, [isVoiceMode]);

  // Now define handleSend after speakResponse
  const handleSend = useCallback(async (text = inputText) => {
    const messageText = text.trim();
    if (!messageText) return;

    const userMessage = { text: messageText, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          message: messageText,
          sessionId: sessionId
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setMessages(prev => [...prev, {
        text: data.reply,
        isUser: false
      }]);

      if (isVoiceMode) {
        await speakResponse(data.reply);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        text: "I apologize, but I'm having trouble responding right now. Please try again in a moment.",
        isUser: false
      }]);
    }
  }, [inputText, sessionId, isVoiceMode, speakResponse]);

  const handleVoiceResult = useCallback((event) => {
    const current = Array.from(event.results).map(result => result[0].transcript).join('');
    setTranscript(current);
    setInputText(current);
  }, []);

  const startListening = useCallback(() => {
    if (!recognition) return;
    
    try {
      recognition.start();
      setIsListening(true);
    } catch (error) {
      console.error('Recognition start error:', error);
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(async () => {
    if (!recognition) return;
    
    try {
      recognition.stop();
      setIsListening(false);
      
      if (transcript?.trim()) {
        await handleSend(transcript);
        setTranscript('');
      }
    } catch (error) {
      console.error('Recognition stop error:', error);
    }
  }, [transcript, handleSend, recognition]);

  useEffect(() => {
    if (recognition) {
      recognition.onresult = handleVoiceResult;
      recognition.onend = () => setIsListening(false);
    }
    return () => {
      if (recognition) {
        recognition.onresult = null;
        recognition.onend = null;
      }
    };
  }, [handleVoiceResult]);

  useEffect(() => {
    const loadVoices = () => {
      const voices = synthesis.getVoices();
      console.log('Available voices:', voices.map(v => v.name));
    };

    if (synthesis) {
      synthesis.addEventListener('voiceschanged', loadVoices);
      return () => synthesis.removeEventListener('voiceschanged', loadVoices);
    }
  }, []);

  useEffect(() => {
    const verifyApiKey = async () => {
      try {
        const response = await fetch('https://texttospeech.speechify.com/api/healthCheck', {
          headers: {
            'Authorization': `Token ${SPEECHIFY_API_KEY}`
          }
        });
        
        if (!response.ok) {
          console.error('Speechify API key verification failed');
          setIsVoiceMode(false);
        }
      } catch (error) {
        console.error('Failed to verify Speechify API key:', error);
        setIsVoiceMode(false);
      }
    };

    if (isVoiceMode) {
      verifyApiKey();
    }
  }, []);

  const toggleVoiceMode = () => {
    if (!checkVoiceSupport()) {
      alert('Voice features are not supported in your browser. Please use Chrome or Edge.');
      return;
    }
    setIsVoiceMode(!isVoiceMode);
    setIsListening(false);
    if (synthesis.speaking) {
      synthesis.cancel();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  }, [handleSend]);

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
                {isListening ? (
                  <>
                    <VoiceWaveform />
                    <span className="ml-2 text-sm">
                      {transcript || "Listening..."}
                    </span>
                  </>
                ) : (
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
                  onKeyPress={handleKeyPress}
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