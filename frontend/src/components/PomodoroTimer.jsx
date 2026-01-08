import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, X, Coffee, Brain, Battery, Volume2, VolumeX, Minimize2, Maximize2 } from 'lucide-react';

const MODES = {
  FOCUS: { id: 'focus', label: 'Diqqat', time: 25, color: 'text-blue-500', bg: 'bg-blue-500', icon: Brain },
  SHORT_BREAK: { id: 'short', label: 'Qisqa tanaffus', time: 5, color: 'text-green-500', bg: 'bg-green-500', icon: Coffee },
  LONG_BREAK: { id: 'long', label: 'Uzun tanaffus', time: 15, color: 'text-purple-500', bg: 'bg-purple-500', icon: Battery },
};

const PomodoroTimer = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState(MODES.FOCUS);
  const [timeLeft, setTimeLeft] = useState(mode.time * 60);
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  const timerRef = useRef(null);

  // Audio for timer completion (simple beep)
  const playSound = () => {
    if (isMuted) return;
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Audio error:', e));
  };

  useEffect(() => {
    setTimeLeft(mode.time * 60);
    setIsActive(false);
  }, [mode]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (isActive) {
        playSound();
        if (mode.id === 'focus') {
          setCompletedSessions(prev => prev + 1);
        }
        setIsActive(false);
      }
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft, mode, isMuted]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode.time * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateProgress = () => {
    const totalSeconds = mode.time * 60;
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          width: isMinimized ? 'auto' : '100%',
          maxWidth: isMinimized ? '300px' : '480px'
        }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        className={`fixed ${isMinimized ? 'bottom-24 right-6' : 'inset-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2'} z-50 flex items-center justify-center p-4 md:p-0 pointer-events-none`}
      >
        <div className={`pointer-events-auto w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden relative ${isMinimized ? 'p-4' : 'p-8'}`}>
          {/* Background Gradient Blur */}
          <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500`}></div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

          {/* Header Controls */}
          <div className="flex justify-between items-center mb-6 relative z-10">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-xl ${mode.bg} bg-opacity-10`}>
                <mode.icon className={`w-5 h-5 ${mode.color}`} />
              </div>
              {!isMinimized && <h3 className="font-bold text-gray-800 dark:text-white text-lg">{mode.label}</h3>}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500"
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500"
              >
                {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 rounded-full transition-colors text-gray-500"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {!isMinimized ? (
            /* Full View */
            <div className="relative z-10">
              {/* Mode Tabs */}
              <div className="flex p-1 bg-gray-100 dark:bg-gray-700/50 rounded-xl mb-8">
                {Object.values(MODES).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m)}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode.id === m.id
                        ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                      }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Timer Display */}
              <div className="flex flex-col items-center justify-center mb-8 relative">
                {/* Progress Ring */}
                <svg className="w-64 h-64 transform -rotate-90">
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-100 dark:text-gray-700"
                  />
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 120}
                    strokeDashoffset={2 * Math.PI * 120 * (1 - calculateProgress() / 100)}
                    className={`transition-all duration-1000 ease-linear ${mode.color} drop-shadow-lg`}
                    strokeLinecap="round"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div
                    key={timeLeft}
                    initial={{ y: 10, opacity: 0.5 }}
                    animate={{ y: 0, opacity: 1 }}
                    className={`text-6xl font-bold tracking-tighter ${mode.color}`}
                  >
                    {formatTime(timeLeft)}
                  </motion.div>
                  <p className="text-gray-400 dark:text-gray-500 mt-2 font-medium tracking-widest uppercase text-xs">
                    {isActive ? 'Jarayon' : 'Pauza'}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={resetTimer}
                  className="p-4 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <RotateCcw size={24} />
                </button>

                <button
                  onClick={toggleTimer}
                  className={`p-6 rounded-3xl ${mode.bg} text-white shadow-lg hover:opacity-90 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center`}
                >
                  {isActive ? (
                    <Pause size={32} fill="currentColor" />
                  ) : (
                    <Play size={32} fill="currentColor" className="ml-1" />
                  )}
                </button>
              </div>

              {/* Stats Footer */}
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Bugun <span className="font-bold text-gray-800 dark:text-white">{completedSessions}</span> ta pomodoro tugatildi
                </p>
              </div>
            </div>
          ) : (
            /* Minimized View */
            <div className="flex flex-col items-center z-10 relative">
              <div className={`text-4xl font-bold tracking-tight ${mode.color} mb-2`}>
                {formatTime(timeLeft)}
              </div>
              <div className="flex gap-3">
                <button onClick={toggleTimer} className={`p-2 rounded-full ${mode.bg} text-white`}>
                  {isActive ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button onClick={resetTimer} className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500">
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Backdrop for mobile/desktop modal mode */}
        {!isMinimized && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
            onClick={onClose}
          ></div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default PomodoroTimer;
