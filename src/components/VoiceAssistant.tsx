import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, MemoryFact } from '../types';
import { voiceController } from '../lib/audio';
import { Mic, MicOff, Send, Volume2, VolumeX, Sparkles, Search, MapPin, Brain, Zap, Globe, CornerDownLeft, RefreshCw, AudioWaveform, Cpu } from 'lucide-react';
import { SynapsesMind3D } from './SynapsesMind3D';

interface VoiceAssistantProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, options?: { enableThinking?: boolean; enableSearch?: boolean; enableMaps?: boolean; lowLatency?: boolean }) => Promise<void>;
  isOpenMicActive: boolean;
  onToggleOpenMic: () => void;
  memoryFacts: MemoryFact[];
  isThinking: boolean;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  messages,
  onSendMessage,
  isOpenMicActive,
  onToggleOpenMic,
  memoryFacts,
  isThinking
}) => {
  const [inputText, setInputText] = useState('');
  const [isMicListening, setIsMicListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSpeakingText, setIsSpeakingText] = useState(false);
  
  // Intelligence Feature Toggles
  const [enableThinking, setEnableThinking] = useState(false);
  const [enableSearch, setEnableSearch] = useState(true);
  const [enableMaps, setEnableMaps] = useState(false);
  const [lowLatency, setLowLatency] = useState(false);
  const [show3DMind, setShow3DMind] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat thread
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking, interimTranscript]);

  // Voice controller callbacks
  useEffect(() => {
    voiceController.setCallbacks({
      onWakeWordDetected: () => {
        console.log('Wake word "Hey Trillion" detected!');
      },
      onTranscript: (transcript: string, isFinal: boolean) => {
        if (isFinal && transcript.trim()) {
          setInterimTranscript('');
          setInputText('');
          onSendMessage(transcript.trim(), { enableThinking, enableSearch, enableMaps, lowLatency });
          voiceController.speak('Processing prompt...');
        } else {
          setInterimTranscript(transcript);
        }
      },
      onStatusChange: (status) => {
        setIsMicListening(status === 'listening' || status === 'wake_word_detected');
      }
    });
  }, [enableThinking, enableSearch, enableMaps, lowLatency, onSendMessage]);

  // Automatically speak last assistant message if generated
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.sender === 'trillion' && lastMsg.text) {
      voiceController.speak(lastMsg.text, () => setIsSpeakingText(false));
      setIsSpeakingText(true);
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText.trim();
    setInputText('');
    setInterimTranscript('');
    await onSendMessage(textToSend, { enableThinking, enableSearch, enableMaps, lowLatency });
  };

  const toggleMicManual = () => {
    if (isMicListening) {
      voiceController.stopListening();
      setIsMicListening(false);
    } else {
      const started = voiceController.startListening(isOpenMicActive);
      if (started) setIsMicListening(true);
    }
  };

  const handleSpeakMessage = (text: string) => {
    if (isSpeakingText) {
      voiceController.stopSpeaking();
      setIsSpeakingText(false);
    } else {
      voiceController.speak(text, () => setIsSpeakingText(false));
      setIsSpeakingText(true);
    }
  };

  return (
    <div id="voice-assistant-view" className="flex flex-col h-[calc(100vh-4rem)] max-w-6xl mx-auto p-4 gap-4">
      
      {/* Top Visualizer Header & Orb */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Glow backdrop */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Trillion Soundwave Orb */}
        <div className="flex items-center space-x-6 relative z-10">
          <div className="relative group cursor-pointer" onClick={toggleMicManual}>
            {/* Animated Ring 1 */}
            <div className={`absolute -inset-3 rounded-full blur-md opacity-75 transition-all duration-700 ${
              isThinking
                ? 'bg-gradient-to-r from-amber-500 to-indigo-500 animate-spin'
                : isMicListening
                ? 'bg-gradient-to-r from-emerald-400 to-cyan-500 animate-pulse'
                : isSpeakingText
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 animate-bounce'
                : 'bg-indigo-600/40'
            }`}></div>

            {/* Orb Center */}
            <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-slate-950 border-2 border-indigo-500/50 shadow-2xl">
              {isThinking ? (
                <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
              ) : isSpeakingText ? (
                <AudioWaveform className="w-8 h-8 text-pink-400 animate-pulse" />
              ) : isMicListening ? (
                <Mic className="w-8 h-8 text-emerald-400 animate-pulse" />
              ) : (
                <Sparkles className="w-8 h-8 text-indigo-400" />
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-white tracking-tight">Trillion Assistant</h1>
              {isOpenMicActive && (
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                  Wake-Word Active ("Hey Trillion")
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isThinking
                ? 'High thinking reasoning in progress...'
                : isSpeakingText
                ? 'Trillion speaking...'
                : isMicListening
                ? 'Listening... say "Hey Trillion" or ask anything'
                : 'Voice-first AI assistant ready. Tap orb or mic to speak.'}
            </p>
          </div>
        </div>

        {/* Intelligence Mode Toggles */}
        <div className="flex flex-wrap items-center gap-2 relative z-10 bg-slate-950/70 p-2 rounded-2xl border border-slate-800">
          <button
            id="toggle-thinking-mode"
            onClick={() => setEnableThinking(!enableThinking)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              enableThinking
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20'
                : 'text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Enable High Thinking Level (gemini-3.1-pro-preview)"
          >
            <Brain className="w-3.5 h-3.5 text-amber-400" />
            <span>High Thinking</span>
          </button>

          <button
            id="toggle-search-grounding"
            onClick={() => setEnableSearch(!enableSearch)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              enableSearch
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-sm shadow-blue-500/20'
                : 'text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Enable Live Google Search Grounding"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>Search</span>
          </button>

          <button
            id="toggle-maps-grounding"
            onClick={() => setEnableMaps(!enableMaps)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              enableMaps
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                : 'text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Enable Live Google Maps Grounding"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Maps</span>
          </button>

          <button
            id="toggle-low-latency"
            onClick={() => setLowLatency(!lowLatency)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              lowLatency
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-500/20'
                : 'text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Fast Response Mode (gemini-3.1-flash-lite)"
          >
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span>Fast Lite</span>
          </button>

          <button
            id="toggle-3d-mind"
            onClick={() => setShow3DMind(!show3DMind)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              show3DMind
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm shadow-indigo-500/20'
                : 'text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Toggle 100M Synapses 3D Mind Visualizer"
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>3D Mind</span>
          </button>
        </div>

      </div>

      {/* 3D Mind Canvas if enabled */}
      {show3DMind && (
        <SynapsesMind3D
          compact
          isThinking={isThinking}
          isMicListening={isMicListening}
          isSpeakingText={isSpeakingText}
        />
      )}

      {/* Main Chat Thread */}
      <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-3xl p-4 overflow-y-auto space-y-4 shadow-inner flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/20">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Hello, I'm Trillion</h3>
            <p className="text-xs max-w-md text-slate-400 mt-1">
              Your voice-first AI Desktop Assistant. Talk to me using your mic or try one of the prompt starters below.
            </p>

            {/* Prompt Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6 max-w-xl w-full">
              <button
                onClick={() => onSendMessage('Hey Trillion, search for the latest tech news today', { enableSearch: true })}
                className="p-3 text-left rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-200 hover:border-indigo-500/50 hover:bg-slate-800 transition-all"
              >
                <div className="font-semibold text-indigo-300 mb-0.5">🌐 Live Search Grounding</div>
                <div className="text-[11px] text-slate-400">"Search for the latest AI news today"</div>
              </button>

              <button
                onClick={() => onSendMessage('Hey Trillion, what are the top coffee places near downtown?', { enableMaps: true })}
                className="p-3 text-left rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-200 hover:border-emerald-500/50 hover:bg-slate-800 transition-all"
              >
                <div className="font-semibold text-emerald-300 mb-0.5">📍 Google Maps Grounding</div>
                <div className="text-[11px] text-slate-400">"Find top coffee shops near me"</div>
              </button>

              <button
                onClick={() => onSendMessage('Plan my desktop app packaging workflow in detail', { enableThinking: true })}
                className="p-3 text-left rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-200 hover:border-amber-500/50 hover:bg-slate-800 transition-all"
              >
                <div className="font-semibold text-amber-300 mb-0.5">🧠 High Thinking Mode</div>
                <div className="text-[11px] text-slate-400">"Solve complex architecture & packaging strategy"</div>
              </button>

              <button
                onClick={() => onSendMessage('What do you remember about my preferences?', { enableSearch: false })}
                className="p-3 text-left rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-200 hover:border-purple-500/50 hover:bg-slate-800 transition-all"
              >
                <div className="font-semibold text-purple-300 mb-0.5">💾 Long-Term Memory</div>
                <div className="text-[11px] text-slate-400">"Review my stored memory facts & preferences"</div>
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-3xl rounded-2xl p-4 shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-slate-800/90 border border-slate-700/70 text-slate-100 rounded-bl-none'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 gap-2">
                  <span className="font-bold uppercase tracking-wider text-indigo-300">
                    {msg.sender === 'user' ? 'You' : 'Trillion'}
                  </span>
                  <div className="flex items-center space-x-2">
                    {msg.modelUsed && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-900/80 text-[10px] text-slate-300">
                        {msg.modelUsed}
                      </span>
                    )}
                    <span>{msg.timestamp}</span>
                  </div>
                </div>

                {/* Thinking Badge */}
                {msg.thinking && (
                  <div className="mb-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-center space-x-1.5">
                    <Brain className="w-3.5 h-3.5 text-amber-400" />
                    <span>{msg.thinking}</span>
                  </div>
                )}

                {/* Text Content */}
                <div className="text-sm whitespace-pre-wrap leading-relaxed">
                  {msg.text}
                </div>

                {/* Sources if search grounding was used */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-700/50 text-xs">
                    <div className="font-semibold text-blue-300 mb-1 flex items-center space-x-1">
                      <Search className="w-3 h-3" />
                      <span>Search Grounding Sources:</span>
                    </div>
                    <ul className="space-y-1">
                      {msg.sources.map((src, i) => (
                        <li key={i}>
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline underline-offset-2 flex items-center space-x-1"
                          >
                            <span>• {src.title}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Audio Speak Control */}
                {msg.sender === 'trillion' && (
                  <div className="mt-2 flex items-center justify-end">
                    <button
                      onClick={() => handleSpeakMessage(msg.text)}
                      className="flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-semibold bg-slate-900/80 text-indigo-300 hover:text-white hover:bg-slate-900 transition-colors"
                      title="Read response aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Speak</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Interim Voice Transcript indicator */}
        {interimTranscript && (
          <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs italic flex items-center space-x-2 animate-pulse">
            <Mic className="w-4 h-4 text-emerald-400" />
            <span>Listening: "{interimTranscript}"</span>
          </div>
        )}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex items-center space-x-2 text-xs text-indigo-300 p-2">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
            <span>Trillion is reasoning and synthesizing response...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Console */}
      <form onSubmit={handleSend} className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 flex items-center space-x-2 shadow-lg">
        <button
          type="button"
          id="mic-input-btn"
          onClick={toggleMicManual}
          className={`p-3 rounded-xl transition-all ${
            isMicListening
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 animate-pulse'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
          title={isMicListening ? 'Stop Mic' : 'Start Mic Voice Input'}
        >
          {isMicListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        <input
          type="text"
          id="chat-text-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isOpenMicActive ? 'Say "Hey Trillion..." or type here...' : 'Ask Trillion anything or request a tool...'}
          className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none"
        />

        <button
          type="submit"
          id="send-chat-btn"
          disabled={!inputText.trim() || isThinking}
          className="p-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-600/20"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>

    </div>
  );
};
