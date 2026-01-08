import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Play, Pause, X, Maximize2 } from 'lucide-react';
import { usePomodoroStore } from '../stores/usePomodoroStore';

const PomodoroOverlay = () => {
    const {
        mode,
        timeLeft,
        isActive,
        isMuted,
        tick,
        sync, // Import sync
        toggleTimer,
        resetTimer,
        isOverlayVisible,
        setOverlayVisible
    } = usePomodoroStore();

    const location = useLocation();
    const navigate = useNavigate();

    // Check for running timer on mount (e.g. reload or returning tab)
    useEffect(() => {
        sync();
    }, [sync]);

    // Close overlay if we are on the full page
    useEffect(() => {
        if (location.pathname === '/pomodoro') {
            setOverlayVisible(false);
        }
    }, [location.pathname, setOverlayVisible]);

    // Global Timer Logic
    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(tick, 1000);
        } else if (timeLeft === 0 && isActive) {
            // Timer finished
            if (!isMuted) {
                try {
                    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                    audio.volume = 0.5;
                    audio.play();
                } catch (e) {
                    console.error("Audio play failed", e);
                }
            }
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, tick, isMuted]);

    // Don't show overlay if we are on the full page
    if (location.pathname === '/pomodoro') return null;

    // Show if explicitly visible OR if timer is running
    // If user minimized, we likely set isOverlayVisible to true.
    // If timer is running, we also likely want to see it.
    const shouldShow = isOverlayVisible || isActive;

    if (!shouldShow) return null;

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const currentModeColor =
        mode.id === 'focus' ? 'bg-indigo-600' :
            mode.id === 'short' ? 'bg-teal-600' : 'bg-blue-600';

    const handleClose = () => {
        setOverlayVisible(false);
        if (!isActive) {
            resetTimer(); // Optional: reset if allowed to close while paused
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[60] animate-fade-in-up">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4 w-72 backdrop-blur-lg bg-opacity-90">

                {/* Progress Circle / Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold ${currentModeColor} shrink-0`}>
                    {Math.floor(timeLeft / 60)}'
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-0.5">
                        {mode.label}
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white font-mono leading-none">
                        {formatTime(timeLeft)}
                    </p>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={toggleTimer}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200 transition-colors"
                    >
                        {isActive ? <Pause size={20} /> : <Play size={20} />}
                    </button>

                    <button
                        onClick={() => {
                            navigate('/pomodoro');
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200 transition-colors"
                    >
                        <Maximize2 size={20} />
                    </button>

                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PomodoroOverlay;
