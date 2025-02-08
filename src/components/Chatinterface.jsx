import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, MessageSquare, Bot, Sparkles } from 'lucide-react';
import useMeasure from 'react-use-measure';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const fetchAccessToken = async () => {
  const response = await fetch(TOKEN_URL);
  const data = await response.json();
  return data.accessToken;
};

const speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = speechRecognition ? new speechRecognition() : null;
const synthesis = window.speechSynthesis;

if (recognition) {
  recognition.continuous = false; // Change to false to stop after final result
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  // Add shorter silence threshold
  recognition.maxAlternatives = 1;
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
  const speechSynthesisSupported = !!window.speechSynthesis;
  
  if (!speechRecognitionSupported || !speechSynthesisSupported) {
    console.warn('Speech features not fully supported');
    return false;
  }
  
  return true;
};

const ChatInterface = () => {
  // State definitions
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ref, bounds] = useMeasure();
  const [sessionId] = useState(() => 'session_' + Date.now());
  const [transcript, setTranscript] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [voiceGender, setVoiceGender] = useState('female');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  // Define startListening first since other functions depend on it
  const startListening = useCallback(() => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser');
      return;
    }
    
    try {
      recognition.start();
      setIsListening(true);
    } catch (error) {
      console.error('Recognition start error:', error);
      setIsListening(false);
      alert('Could not start listening. Please try again.');
    }
  }, []);

  // Now define speakResponse after startListening
  const speakResponse = useCallback(async (text) => {
    if (!isVoiceMode || !text || typeof text !== 'string') return;

    try {
      if (synthesis) {
        synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance();
        let voices = synthesis.getVoices();
        
        // Force refresh voices if empty
        if (!voices.length) {
          await new Promise(resolve => {
            synthesis.addEventListener('voiceschanged', () => {
              voices = synthesis.getVoices();
              resolve();
            }, { once: true });
          });
        }

        // Update the voice preferences in speakResponse
        const preferredVoices = voiceGender === 'female' ? [
          { name: 'Microsoft Zira Desktop', lang: 'en-US' },
          { name: 'Google US English Female', lang: 'en-US' },
          { name: 'Samantha', lang: 'en-US' },
          { name: 'Victoria', lang: 'en-US' },
        ] : [
          { name: 'Microsoft David Desktop', lang: 'en-US' },
          { name: 'Google US English Male', lang: 'en-US' },
          { name: 'Alex', lang: 'en-US' },
          { name: 'Daniel', lang: 'en-US' },
        ];

        // Update voice finding logic
        let selectedVoice = voices.find(voice => 
          preferredVoices.some(pv => 
            voice.name === pv.name && voice.lang.startsWith(pv.lang)
          )
        );

        // If no exact match, try partial matches
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => 
            voice.lang.startsWith('en') && (
              voiceGender === 'female' ? (
                voice.name.toLowerCase().includes('female') ||
                voice.name.toLowerCase().includes('woman') ||
                /\b(zira|samantha|victoria|lisa|amy)\b/i.test(voice.name)
              ) : (
                voice.name.toLowerCase().includes('male') ||
                voice.name.toLowerCase().includes('man') ||
                /\b(david|james|daniel|alex|tom)\b/i.test(voice.name)
              )
            )
          );
        }

        if (selectedVoice) {
          console.log(`Selected ${voiceGender} voice:`, selectedVoice.name);
          utterance.voice = selectedVoice;
          utterance.pitch = voiceGender === 'female' ? 1.1 : 0.9;
        }

        // Clean up emojis and special characters while maintaining meaning
        const processedText = text
          // Remove emojis but keep their meaning
          .replace(/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g, '')
          // Add natural pauses at punctuation
          .replace(/([.!?])\s+/g, '$1 ')
          .replace(/,\s+/g, ', ')
          // Clean up any remaining special characters
          .replace(/[^\w\s.,!?-]/g, '')
          .trim();

        utterance.text = processedText;
        
        // Adjust for more natural speech
        utterance.rate = 0.9;    // Slightly slower for clarity
        utterance.volume = 1.0;  // Full volume

        // Adjust pitch based on voice gender
        if (selectedVoice) {
          utterance.pitch = voiceGender === 'female' ? 1.1 : 0.9;
        }

        // Add dynamic rate changes for emphasis
        utterance.onboundary = (event) => {
          if (event.name === 'word') {
            const word = event.target.text.slice(
              event.charIndex,
              event.charIndex + event.charLength
            ).toLowerCase();

            // Adjust rate and pitch for emotional words
            if (/^(great|amazing|wonderful|excellent|fantastic)/.test(word)) {
              utterance.rate = 0.85;  // Enthusiastic
              utterance.pitch *= 1.1;
            } else if (/^(sad|sorry|unfortunately)/.test(word)) {
              utterance.rate = 0.8;   // Somber
              utterance.pitch *= 0.9;
            } else if (/^(careful|warning|caution)/.test(word)) {
              utterance.rate = 0.75;  // Cautionary
              utterance.pitch *= 1.05;
            } else if (/[.!?]$/.test(word)) {
              utterance.rate = 0.8;   // Sentence endings
            } else {
              utterance.rate = 0.9;   // Reset to normal
              utterance.pitch = voiceGender === 'female' ? 1.1 : 0.9;
            }
          }
        };

        // Add speech end handler
        utterance.onend = () => {
          if (isVoiceMode && !isListening && !isReplying) {
            startListening();
          }
        };

        synthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Speech synthesis error:', error);
    }
  }, [isVoiceMode, isListening, isReplying, startListening, voiceGender]);

  // Define handleSend after both startListening and speakResponse
  const handleSend = useCallback(async (text = inputText) => {
    const messageText = text.trim();
    if (!messageText) return;

    const userMessage = { text: messageText, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    try {
      setIsReplying(true); // Set replying state before speech
      if (recognition && isListening) {
        recognition.stop(); // Stop listening while replying
        setIsListening(false);
      }

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
    } finally {
      setIsReplying(false); // Reset replying state after speech
      // Don't auto-start listening after response
      // User needs to click to start listening again
    }
  }, [inputText, sessionId, isVoiceMode, speakResponse, isListening, startListening]);

  // Define handleVoiceResult after handleSend
  const handleVoiceResult = useCallback((event) => {
    if (isReplying) return; // Ignore results while bot is replying

    const results = Array.from(event.results);
    const current = results.map(result => result[0].transcript).join('');
    setTranscript(current);
    
    // If this is a final result, submit after a short pause
    if (results[results.length - 1].isFinal) {
      setInputText(current);
      // Stop listening and send message
      if (recognition) {
        recognition.stop();
        setIsListening(false);
      }
      handleSend(current);
      setTranscript('');
    }
  }, [handleSend, isReplying]);

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
      setIsListening(false);
    }
  }, [transcript, handleSend]);

  useEffect(() => {
    if (recognition) {
      recognition.onresult = handleVoiceResult;
      recognition.onend = () => {
        if (!isReplying) { // Only reset listening state if not replying
          setIsListening(false);
        }
      };
    }
    return () => {
      if (recognition) {
        recognition.onresult = null;
        recognition.onend = null;
      }
    };
  }, [handleVoiceResult, isReplying]);

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

  // Update toggleVoiceMode to be simpler
  const toggleVoiceMode = useCallback(() => {
    if (!checkVoiceSupport()) {
      alert('Voice features are not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    if (!isVoiceMode) {
      setIsVoiceModalOpen(true); // Show voice selection modal when enabling voice mode
    } else {
      // Stop everything when switching back to text mode
      setIsVoiceMode(false);
      setIsListening(false);
      if (synthesis.speaking) {
        synthesis.cancel();
      }
      if (recognition && isListening) {
        recognition.stop();
      }
    }
  }, [isVoiceMode, isListening]);

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

  // Add voice selection modal component
  const VoiceSelectionModal = ({ isOpen, onClose, onSelect }) => {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-r from-purple-900/90 to-fuchsia-900/90 p-6 rounded-2xl shadow-xl max-w-sm w-full mx-4"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-white mb-4">Select Voice Type</h3>
              <div className="space-y-4">
                <button
                  onClick={() => {
                    onSelect('female');
                    onClose();
                  }}
                  className="w-full p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    👩
                  </div>
                  Female Voice
                </button>
                <button
                  onClick={() => {
                    onSelect('male');
                    onClose();
                  }}
                  className="w-full p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    👨
                  </div>
                  Male Voice
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
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
                    <span className="text-sm">Click to speak</span>
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
      <VoiceSelectionModal 
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSelect={(gender) => {
          setVoiceGender(gender);
          setIsVoiceMode(true);
          setIsVoiceModalOpen(false);
        }}
      />
    </motion.div>
  );
};

export default ChatInterface;