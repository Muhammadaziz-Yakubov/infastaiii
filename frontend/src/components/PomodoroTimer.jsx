import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Timer, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';

const PomodoroTimer = ({ taskId, taskTitle, onComplete }) => {
  const { isDark } = useTheme();
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  const WORK_TIME = 25; // 25 daqiqa ishlash
  const SHORT_BREAK = 5; // 5 daqiqa qisqa dam olish
  const LONG_BREAK = 15; // 15 daqiqa uzoq dam olish

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev === 0) {
            if (minutes === 0) {
              handleTimerComplete();
              return 0;
            }
            setMinutes((prevMin) => prevMin - 1);
            return 59;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, minutes]);

  const handleTimerComplete = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    
    if (!isBreak) {
      // Ishlash vaqti tugadi
      setCompletedPomodoros((prev) => prev + 1);
      toast.success('🎉 Pomodoro yakunlandi! Dam olish vaqti!', {
        duration: 5000,
        icon: '☕',
      });
      
      // Qisqa yoki uzoq dam olish
      const breakTime = completedPomodoros > 0 && completedPomodoros % 4 === 0 ? LONG_BREAK : SHORT_BREAK;
      setIsBreak(true);
      setMinutes(breakTime);
      setSeconds(0);
      
      // Browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Pomodoro yakunlandi!', {
          body: `${breakTime} daqiqa dam oling`,
          icon: '/favicon.ico',
        });
      }
    } else {
      // Dam olish vaqti tugadi
      toast.success('✅ Dam olish yakunlandi! Ishga qaytish vaqti!', {
        duration: 5000,
        icon: '💪',
      });
      setIsBreak(false);
      setMinutes(WORK_TIME);
      setSeconds(0);
      
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Dam olish yakunlandi!', {
          body: 'Ishga qaytish vaqti',
          icon: '/favicon.ico',
        });
      }
    }
  };

  const toggleTimer = () => {
    if (!isRunning && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setIsBreak(false);
    setMinutes(WORK_TIME);
    setSeconds(0);
  };

  const skipBreak = () => {
    setIsBreak(false);
    setMinutes(WORK_TIME);
    setSeconds(0);
    setIsRunning(false);
  };

  const progress = isBreak 
    ? ((WORK_TIME - minutes) / WORK_TIME) * 100
    : ((WORK_TIME - minutes) / WORK_TIME) * 100;

  const formatTime = (min, sec) => {
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-xl border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isBreak ? 'bg-green-500/20 text-green-500' : 'bg-orange-500/20 text-orange-500'}`}>
            {isBreak ? <Coffee className="w-5 h-5" /> : <Timer className="w-5 h-5" />}
          </div>
          <div>
            <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {isBreak ? 'Dam Olish' : 'Pomodoro Timer'}
            </h3>
            {taskTitle && (
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {taskTitle}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {completedPomodoros > 0 && (
            <div className="flex items-center gap-1">
              {[...Array(Math.min(completedPomodoros, 4))].map((_, i) => (
                <CheckCircle key={i} className="w-4 h-4 text-green-500" />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Circular Progress */}
      <div className="relative w-48 h-48 mx-auto mb-6">
        <svg className="transform -rotate-90 w-48 h-48">
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke={isDark ? '#374151' : '#e5e7eb'}
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke={isBreak ? '#10b981' : '#f97316'}
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 88}`}
            strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatTime(minutes, seconds)}
            </div>
            <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {isBreak ? 'Dam oling' : 'Ishlash vaqti'}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={toggleTimer}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
            isRunning
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : `bg-gradient-to-r ${isBreak ? 'from-green-500 to-emerald-500' : 'from-orange-500 to-amber-500'} hover:from-orange-600 hover:to-amber-600 text-white`
          } shadow-lg hover:shadow-xl`}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5" />
              To'xtatish
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Boshlash
            </>
          )}
        </button>
        
        <button
          onClick={resetTimer}
          className="p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
          title="Qayta boshlash"
        >
          <RotateCcw className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>

        {isBreak && (
          <button
            onClick={skipBreak}
            className="px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium text-gray-700 dark:text-gray-300 transition-colors"
          >
            O'tkazib yuborish
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {completedPomodoros}
            </p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Bajarilgan
            </p>
          </div>
          <div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {Math.floor((completedPomodoros * WORK_TIME) / 60)}
            </p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Soat ishlash
            </p>
          </div>
          <div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {isBreak ? 'Dam olish' : 'Ishlash'}
            </p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Holat
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;

