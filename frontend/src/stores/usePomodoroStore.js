import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const DEFAULT_TIMES = {
    focus: 25,
    short: 5,
    long: 15
};

export const AMBIENT_SOUNDS = [
    { id: 'none', label: 'Ovoz yo\'q', url: null },
    { id: 'rain', label: 'Yomg\'ir', url: 'https://assets.mixkit.co/active_storage/sfx/2464/2464-preview.mp3' },
    { id: 'forest', label: 'O\'rmon', url: 'https://assets.mixkit.co/active_storage/sfx/2458/2458-preview.mp3' },
];

export const THEMES = [
    { id: 'gradient', label: 'Gradient', bg: 'bg-gradient-to-br from-[#2E3192] to-[#1BFFFF]' },
    { id: 'midnight', label: 'Tun', bg: 'bg-slate-900', image: 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?q=80&w=2072&auto=format&fit=crop' },
    { id: 'nature', label: 'Tabiat', bg: 'bg-green-900', image: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2070&auto=format&fit=crop' },
    { id: 'lofi', label: 'Lofi', bg: 'bg-purple-900', image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop' },
    { id: 'coffee', label: 'Qahva', bg: 'bg-amber-900', image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2071&auto=format&fit=crop' },
    { id: 'rainy_window', label: 'Yomg\'ir', bg: 'bg-gray-800', image: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=2070&auto=format&fit=crop' },
    { id: 'mountain', label: 'Tog\'lar', bg: 'bg-blue-900', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop' },
    { id: 'minimal_dark', label: 'Minimal Dark', bg: 'bg-zinc-900', image: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?q=80&w=2076&auto=format&fit=crop' },
    { id: 'space', label: 'Koinot', bg: 'bg-indigo-950', image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2022&auto=format&fit=crop' },
    { id: 'forest_fog', label: 'Tumanli O\'rmon', bg: 'bg-teal-900', image: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=2070&auto=format&fit=crop' },
    { id: 'abstract_waves', label: 'To\'lqinlar', bg: 'bg-blue-800', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop' },
    { id: 'northern_lights', label: 'Yorug\'lik', bg: 'bg-emerald-900', image: 'https://images.unsplash.com/photo-1579033461380-adb47c3eb938?q=80&w=1964&auto=format&fit=crop' },
    { id: 'city_night', label: 'Tungi shahar', bg: 'bg-violet-900', image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1964&auto=format&fit=crop' },
    { id: 'cozy_room', label: 'Xona', bg: 'bg-rose-950', image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=2127&auto=format&fit=crop' }
];

export const usePomodoroStore = create(
    persist(
        (set, get) => ({
            // Timer State
            mode: { id: 'focus', label: 'Diqqat', time: 25 },
            timeLeft: 25 * 60,
            isActive: false,
            endTime: null,

            // Settings
            durations: { ...DEFAULT_TIMES },
            autoStartRuns: true, // Auto start breaks?
            autoStartFocus: false, // Auto start focus?

            // Media & Appearance
            isMuted: false, // For alarm
            volume: 0.5,
            ambientSound: 'none',
            ambientVolume: 0.3,
            currentTheme: 'gradient',

            // Features
            currentGoal: '',
            history: [],
            isOverlayVisible: false,

            // Actions
            setMode: (modeId) => {
                const { durations } = get();
                const time = durations[modeId];
                const label = modeId === 'focus' ? 'Diqqat' : modeId === 'short' ? 'Qisqa tanaffus' : 'Uzun tanaffus';

                set({
                    mode: { id: modeId, label, time },
                    timeLeft: time * 60,
                    isActive: false,
                    endTime: null
                });
            },

            updateDuration: (modeId, newTime) => set((state) => {
                const newDurations = { ...state.durations, [modeId]: Number(newTime) };
                // If currently in that mode and not active, update timeleft immediately
                if (state.mode.id === modeId && !state.isActive) {
                    return { durations: newDurations, mode: { ...state.mode, time: newTime }, timeLeft: newTime * 60 };
                }
                return { durations: newDurations };
            }),

            setGoal: (goal) => set({ currentGoal: goal }),
            setTheme: (themeId) => set({ currentTheme: themeId }),
            setAmbientSound: (soundId) => set({ ambientSound: soundId }),

            toggleTimer: () => {
                const { isActive, timeLeft, endTime } = get();
                if (!isActive) {
                    const newEndTime = Date.now() + timeLeft * 1000;
                    set({ isActive: true, endTime: newEndTime });
                } else {
                    if (endTime) {
                        const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
                        set({ isActive: false, timeLeft: remaining, endTime: null });
                    } else {
                        set({ isActive: false, endTime: null });
                    }
                }
            },

            resetTimer: () => {
                const { mode } = get();
                set({ isActive: false, timeLeft: mode.time * 60, endTime: null });
            },

            toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
            toggleAutoStartRuns: () => set((state) => ({ autoStartRuns: !state.autoStartRuns })),
            setOverlayVisible: (visible) => set({ isOverlayVisible: visible }),

            tick: () => {
                const { isActive, endTime, mode, history, currentGoal, autoStartRuns, autoStartFocus, durations } = get();

                if (isActive && endTime) {
                    const now = Date.now();
                    const remaining = Math.ceil((endTime - now) / 1000);

                    if (remaining > 0) {
                        set({ timeLeft: remaining });
                    } else {
                        // Timer Finished
                        const { isMuted } = get();
                        if (!isMuted) {
                            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                            audio.volume = 0.5;
                            audio.play().catch(e => console.error(e));
                        }

                        // Save History
                        if (mode.id === 'focus') {
                            set({
                                history: [{
                                    id: Date.now(),
                                    date: new Date().toISOString(),
                                    duration: mode.time,
                                    goal: currentGoal || 'Maqsadsiz',
                                    completed: true
                                }, ...history]
                            });
                        }

                        // Transition Logic
                        let nextModeId = 'focus';
                        if (mode.id === 'focus') nextModeId = 'short'; // Default to short break

                        const nextTime = durations[nextModeId];
                        const nextLabel = nextModeId === 'focus' ? 'Diqqat' : 'Qisqa tanaffus';

                        set({
                            mode: { id: nextModeId, label: nextLabel, time: nextTime },
                            timeLeft: nextTime * 60,
                            isActive: false,
                            endTime: null
                        });

                        // Auto Start Logic
                        const shouldAutoStart = (mode.id === 'focus' && autoStartRuns) || (mode.id !== 'focus' && autoStartFocus);

                        if (shouldAutoStart) {
                            setTimeout(() => {
                                const startTime = durations[nextModeId] * 60 * 1000;
                                set({ isActive: true, endTime: Date.now() + startTime });
                            }, 1000);
                        }
                    }
                } else if (isActive && !endTime) {
                    // Fallback
                    const { timeLeft } = get();
                    if (timeLeft > 0) set({ timeLeft: timeLeft - 1 });
                    else set({ isActive: false });
                }
            },

            sync: () => {
                const { isActive, endTime } = get();
                if (isActive && endTime) {
                    const now = Date.now();
                    const remaining = Math.ceil((endTime - now) / 1000);
                    if (remaining <= 0) {
                        set({ isActive: false, timeLeft: 0, endTime: null });
                    } else {
                        set({ timeLeft: remaining });
                    }
                }
            }
        }),
        {
            name: 'pomodoro-storage-v2', // bumped version to reset/handle new structure
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                durations: state.durations,
                mode: state.mode,
                timeLeft: state.timeLeft,
                isActive: state.isActive,
                isMuted: state.isMuted,
                ambientSound: state.ambientSound,
                currentTheme: state.currentTheme,
                endTime: state.endTime,
                history: state.history,
                currentGoal: state.currentGoal,
                autoStartRuns: state.autoStartRuns,
                autoStartFocus: state.autoStartFocus
            }),
        }
    )
);
