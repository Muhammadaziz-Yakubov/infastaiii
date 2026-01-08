import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast'; // Import Toast
import {
    Play, Pause, RotateCcw, ArrowLeft,
    Volume2, VolumeX, Minimize2, Target, History,
    Calendar, CheckCircle2, Zap, Settings, Image as ImageIcon, Music, X, Plus
} from 'lucide-react';
import { usePomodoroStore, THEMES, AMBIENT_SOUNDS } from '../stores/usePomodoroStore';

const Pomodoro = () => {
    const navigate = useNavigate();
    const {
        mode,
        timeLeft,
        isActive,
        isMuted,
        currentGoal,
        history,
        autoStartRuns,
        currentTheme,
        ambientSound,
        durations,
        setMode,
        toggleTimer,
        resetTimer,
        toggleMute,
        setOverlayVisible,
        setGoal,
        toggleAutoStartRuns,
        setTheme,
        setAmbientSound,
        updateDuration
    } = usePomodoroStore();

    const [showHistory, setShowHistory] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showThemes, setShowThemes] = useState(false);
    const [showSoundDropdown, setShowSoundDropdown] = useState(false);
    const [isEditingGoal, setIsEditingGoal] = useState(!currentGoal); // Default to edit if no goal

    const audioRef = useRef(null);

    // Background styles
    const activeTheme = THEMES.find(t => t.id === currentTheme) || THEMES[0];

    // Sync editing state with goal emptiness
    useEffect(() => {
        if (!currentGoal) setIsEditingGoal(true);
    }, [currentGoal]);

    // Ambient Sound Logic
    useEffect(() => {
        if (audioRef.current) {
            const sound = AMBIENT_SOUNDS.find(s => s.id === ambientSound);
            if (sound && sound.url) {
                if (audioRef.current.src !== sound.url) {
                    audioRef.current.src = sound.url;
                }
                if (audioRef.current.paused) {
                    audioRef.current.play().catch(e => console.log("Auto-play prevented", e));
                }
            } else {
                audioRef.current.pause();
                audioRef.current.src = "";
            }
        }
    }, [ambientSound]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleMinimize = () => {
        setOverlayVisible(true);
        navigate('/dashboard');
    };

    const handleBack = () => {
        if (isActive) setOverlayVisible(true);
        navigate('/dashboard');
    };

    const handleStartWithGoal = () => {
        if (!currentGoal.trim()) {
            toast.error("Iltimos, avval maqsad yozing!");
            return;
        }

        setIsEditingGoal(false); // Switch to display mode

        if (!isActive) {
            toggleTimer();
            toast.success("Maqsad qabul qilindi va taymer ishga tushdi! 🚀");
        } else {
            toast.success("Maqsad yangilandi! ✨");
        }
    };


    return (
        <div className="min-h-screen w-full relative overflow-hidden transition-all duration-1000 ease-in-out font-sans">
            {/* Background Layer with Overlay */}
            {activeTheme.image ? (
                <div
                    className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-105"
                    style={{ backgroundImage: `url(${activeTheme.image})` }}
                >
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
                    {/* Vignette Effect */}
                    <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/60"></div>
                </div>
            ) : (
                <div className={`absolute inset-0 ${activeTheme.bg} transition-all duration-1000`}></div>
            )}

            {/* Hidden Audio Player */}
            <audio ref={audioRef} loop className="hidden" />

            {/* Top Navigation Bar */}
            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 transition-all duration-300 font-medium group hover:scale-105 shadow-lg shadow-black/5"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Orqaga</span>
                </button>

                <div className="flex items-center gap-3">
                    {/* Ambient Sound Selector */}
                    {/* Ambient Sound Selector - Custom Dropdown */}
                    <div className="relative hidden md:block">
                        <button
                            onClick={() => setShowSoundDropdown(!showSoundDropdown)}
                            className="flex items-center gap-2 bg-black/40 backdrop-blur-xl rounded-full px-4 py-2 border border-white/10 shadow-lg group hover:border-white/20 hover:bg-black/50 transition-all"
                        >
                            <Music size={14} className="text-white/70 group-hover:text-white transition-colors" />
                            <span className="text-sm font-medium text-white min-w-[60px] text-left">
                                {AMBIENT_SOUNDS.find(s => s.id === ambientSound)?.label || 'Ovoz'}
                            </span>
                        </button>

                        {/* Dropdown Menu */}
                        {showSoundDropdown && (
                            <div className="absolute top-full mt-2 left-0 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fade-in-up z-50">
                                {AMBIENT_SOUNDS.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => {
                                            setAmbientSound(s.id);
                                            setShowSoundDropdown(false);
                                        }}
                                        className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between ${ambientSound === s.id
                                            ? 'bg-white/10 text-white font-medium'
                                            : 'text-white/60 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        {s.label}
                                        {ambientSound === s.id && <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Backdrop to close dropdown */}
                        {showSoundDropdown && (
                            <div className="fixed inset-0 z-40" onClick={() => setShowSoundDropdown(false)}></div>
                        )}
                    </div>

                    {/* Action Buttons Group */}
                    <div className="flex items-center gap-2 p-1.5 bg-black/20 backdrop-blur-xl rounded-full border border-white/10 shadow-lg">
                        <button
                            onClick={() => setShowThemes(!showThemes)}
                            className={`p-2.5 rounded-full transition-all duration-300 ${showThemes ? 'bg-white text-black shadow-md transform scale-105' : 'text-white hover:bg-white/10'}`}
                            title="Mavzular"
                        >
                            <ImageIcon size={18} />
                        </button>
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className={`p-2.5 rounded-full transition-all duration-300 ${showSettings ? 'bg-white text-black shadow-md transform scale-105' : 'text-white hover:bg-white/10'}`}
                            title="Sozlamalar"
                        >
                            <Settings size={18} />
                        </button>
                        <div className="w-px h-6 bg-white/20 mx-1"></div>
                        <button
                            onClick={handleMinimize}
                            className="p-2.5 rounded-full text-white hover:bg-white/10 transition-all duration-300"
                            title="Kichiklashtirish"
                        >
                            <Minimize2 size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Center Content */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full max-w-5xl px-6 mx-auto">

                {/* Mode Selector Tabs */}
                <div className="flex gap-1 p-1.5 bg-black/30 backdrop-blur-2xl rounded-2xl mb-10 border border-white/10 shadow-2xl">
                    {[
                        { id: 'focus', label: 'Diqqat', icon: Zap },
                        { id: 'short', label: 'Qisqa', icon: Volume2 }, // Using dummy icons for now or remove if prefer clean text
                        { id: 'long', label: 'Uzun', icon: Volume2 }
                    ].map((m) => (
                        <button
                            key={m.id}
                            onClick={() => setMode(m.id)}
                            className={`px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-500 flex items-center gap-2 ${mode.id === m.id
                                ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] transform scale-105'
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>

                {/* Premium Goal Input / Display */}
                <div className="mb-12 w-full max-w-2xl relative group z-30 min-h-[80px] flex items-center justify-center">
                    {isEditingGoal ? (
                        <>
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700"></div>

                            <div className="relative w-full bg-black/30 backdrop-blur-2xl border border-white/10 rounded-3xl p-2 flex items-center transition-all duration-300 group-focus-within:border-white/30 group-focus-within:bg-black/40 shadow-2xl animate-fade-in-up">
                                <div className="pl-4 text-white/50 group-focus-within:text-indigo-400 transition-colors duration-500">
                                    <Target size={24} className={currentGoal ? "text-indigo-400" : ""} />
                                </div>

                                <input
                                    type="text"
                                    value={currentGoal}
                                    onChange={(e) => setGoal(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.currentTarget.blur();
                                            handleStartWithGoal();
                                        }
                                    }}
                                    placeholder="Bugun nima maqsadda ishlayapsiz?"
                                    className="w-full bg-transparent border-none py-4 px-4 text-xl md:text-2xl text-white placeholder-white/20 focus:outline-none focus:ring-0 font-bold tracking-tight text-center md:text-left selection:bg-indigo-500/30"
                                    autoComplete="off"
                                    autoFocus
                                />

                                <div className="flex items-center gap-2 pr-2">
                                    {currentGoal && (
                                        <button onClick={() => setGoal('')} className="p-2 text-white/30 hover:text-white/80 transition-colors rounded-full hover:bg-white/5">
                                            <X size={18} />
                                        </button>
                                    )}
                                    <button
                                        onClick={handleStartWithGoal}
                                        className={`p-3 rounded-2xl transition-all duration-300 flex items-center justify-center ${currentGoal
                                            ? 'bg-indigo-500 text-white shadow-lg hover:bg-indigo-600 hover:scale-105'
                                            : 'bg-white/5 text-white/20 cursor-not-allowed'
                                            }`}
                                        disabled={!currentGoal}
                                        title="Maqsadni belgilash"
                                    >
                                        <Plus size={24} />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div
                            onClick={() => setIsEditingGoal(true)}
                            className="cursor-pointer group/text relative px-8 py-4 animate-fade-in-up"
                        >
                            <div className="absolute inset-0 bg-white/5 rounded-2xl blur-xl opacity-0 group-hover/text:opacity-100 transition-opacity duration-500"></div>
                            <h2 className="text-3xl md:text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70 tracking-tight leading-tight select-none group-hover/text:scale-105 transition-transform duration-300">
                                {currentGoal}
                            </h2>
                            <p className="text-center text-xs text-white/30 mt-2 uppercase tracking-[0.2em] font-medium opacity-0 group-hover/text:opacity-100 transition-all transform translate-y-2 group-hover/text:translate-y-0">
                                Tahrirlash uchun bosing
                            </p>
                        </div>
                    )}
                </div>

                {/* Massive Timer Display */}
                <div className="relative mb-14 select-none flex flex-col items-center justify-center">
                    {/* Ambient Glow */}
                    <div className={`absolute inset-0 bg-white/5 blur-[100px] rounded-full transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-30'}`}></div>

                    <div className="relative z-10 text-[10rem] sm:text-[13rem] md:text-[16rem] font-bold leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 drop-shadow-2xl font-mono tabular-nums transition-all duration-300 hover:scale-[1.01] cursor-pointer" onClick={toggleTimer}>
                        {formatTime(timeLeft)}
                    </div>

                    <div className={`mt-4 px-6 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-sm font-bold tracking-[0.3em] uppercase text-white/80 transition-all duration-500 ${isActive ? 'shadow-[0_0_30px_rgba(255,255,255,0.1)] border-white/30' : ''}`}>
                        {isActive ? (
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                Jarayonda
                            </span>
                        ) : 'Pauza'}
                    </div>
                </div>

                {/* Primary Controls */}
                <div className="flex items-center gap-8">
                    <button
                        onClick={resetTimer}
                        className="p-7 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 text-white/80 hover:bg-white/10 hover:text-white hover:border-white/30 transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg group"
                        title="Qayta boshlash"
                    >
                        <RotateCcw size={28} className="group-hover:-rotate-90 transition-transform duration-500" />
                    </button>

                    <button
                        onClick={toggleTimer}
                        className={`h-32 w-32 rounded-[2.5rem] flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-[0_0_60px_rgba(255,255,255,0.15)] ${isActive
                            ? 'bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20'
                            : 'bg-white text-black hover:bg-gray-100'}`}
                    >
                        {isActive ? (
                            <Pause size={48} fill="currentColor" />
                        ) : (
                            <Play size={48} fill="currentColor" className="ml-2" />
                        )}
                    </button>

                    <button
                        onClick={() => setShowHistory(true)}
                        className="p-7 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 text-white/80 hover:bg-white/10 hover:text-white hover:border-white/30 transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg relative group"
                        title="Tarix"
                    >
                        <History size={28} className="group-hover:rotate-12 transition-transform duration-300" />
                        {history.length > 0 && <span className="absolute top-5 right-5 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-black/20"></span>}
                    </button>
                </div>

            </div>

            {/* ---------------- DRAWERS & MODALS ---------------- */}

            {/* Themes Drawer (Bottom Slide-up) */}
            <div className={`absolute bottom-0 left-0 w-full h-auto bg-black/60 backdrop-blur-3xl border-t border-white/10 p-8 transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) z-40 ${showThemes ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="flex items-center justify-between mb-6 max-w-6xl mx-auto">
                    <div>
                        <h3 className="text-white font-bold text-2xl tracking-tight">Mavzular</h3>
                        <p className="text-white/50 text-sm">Kayfiyatingizga mos muhitni tanlang</p>
                    </div>
                    <button onClick={() => setShowThemes(false)} className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex gap-5 overflow-x-auto pb-6 pt-2 max-w-6xl mx-auto scrollbar-hide snap-x">
                    {THEMES.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTheme(t.id)}
                            className={`flex-shrink-0 w-48 h-32 rounded-2xl overflow-hidden border-2 transition-all duration-300 snap-center relative group ${currentTheme === t.id
                                ? 'border-white scale-100 shadow-[0_0_30px_rgba(255,255,255,0.3)]'
                                : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'}`}
                        >
                            {t.image ? (
                                <div className="w-full h-full relative">
                                    <img src={t.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={t.label} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                </div>
                            ) : (
                                <div className={`w-full h-full ${t.bg} relative`}>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                </div>
                            )}
                            <span className="absolute bottom-3 left-4 text-base font-bold text-white shadow-black drop-shadow-md tracking-wide">{t.label}</span>
                            {currentTheme === t.id && <div className="absolute top-3 right-3 bg-white text-black p-1 rounded-full"><CheckCircle2 size={12} /></div>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Settings Modal (Center Fade-in) */}
            {showSettings && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={() => setShowSettings(false)}></div>
                    <div className="bg-[#1a1a1a] border border-white/10 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-fade-in-up relative z-10 overflow-hidden">
                        {/* Glass Shine */}
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>

                        <div className="flex justify-between items-center mb-8 relative z-20">
                            <h2 className="text-2xl font-bold text-white tracking-tight">Sozlamalar</h2>
                            <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-white/10 rounded-xl text-white/70 hover:text-white transition-colors cursor-pointer"><X size={20} /></button>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <label className="block text-sm font-semibold text-white/60 mb-4 uppercase tracking-wider">Taymer (daqiqa)</label>
                                <div className="grid grid-cols-3 gap-4">
                                    {['focus', 'short', 'long'].map((key) => (
                                        <div key={key} className="relative group">
                                            <input
                                                type="number"
                                                value={durations[key]}
                                                onChange={(e) => updateDuration(key, e.target.value)}
                                                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-center text-white font-bold text-lg focus:outline-none focus:border-indigo-500/50 focus:bg-black/50 transition-all"
                                            />
                                            <label className="text-xs text-center block mt-2 text-white/40 group-hover:text-white/70 transition-colors">
                                                {key === 'focus' ? 'Diqqat' : key === 'short' ? 'Qisqa' : 'Uzun'}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${autoStartRuns ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'}`}>
                                            <Zap size={20} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-white font-medium">Avtomatik start</p>
                                            <p className="text-xs text-white/40">Tanaffuslar avtomatik boshlanadi</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={toggleAutoStartRuns}
                                        className={`w-12 h-7 rounded-full transition-all duration-300 relative ${autoStartRuns ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-white/20'}`}
                                    >
                                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-sm ${autoStartRuns ? 'translate-x-6' : 'translate-x-1'}`}></div>
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${!isMuted ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/10 text-white/40'}`}>
                                            {!isMuted ? <Volume2 size={20} /> : <VolumeX size={20} />}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-white font-medium">Signal ovozi</p>
                                            <p className="text-xs text-white/40">Vaqt tugaganda signal</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={toggleMute}
                                        className={`w-12 h-7 rounded-full transition-all duration-300 relative ${!isMuted ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-white/20'}`}
                                    >
                                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-sm ${!isMuted ? 'translate-x-6' : 'translate-x-1'}`}></div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* History Sidebar (Right Slide-in) */}
            {showHistory && (
                <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-[#0a0a0a]/95 backdrop-blur-2xl shadow-2xl z-[60] p-8 flex flex-col transform transition-transform animate-fade-in-left border-l border-white/10">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                                <History className="text-indigo-400" /> Tarix
                            </h3>
                            <p className="text-white/40 text-sm mt-1">Bugungi muvaffaqiyatlaringiz</p>
                        </div>
                        <button onClick={() => setShowHistory(false)} className="p-2 rounded-full hover:bg-white/10 text-white"><X size={20} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-white/20 hover:scrollbar-thumb-white/40">
                        {history.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-center">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                    <Calendar size={32} className="text-white/30" />
                                </div>
                                <p className="text-white/60 font-medium">Hali seanslar yo'q</p>
                                <p className="text-white/30 text-sm mt-1">Ishni boshlang va tarix yarating!</p>
                            </div>
                        ) : (
                            history.map((session) => (
                                <div key={session.id} className="group bg-white/5 hover:bg-white/10 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300">
                                    <div className="flex items-start justify-between mb-3">
                                        <span className="font-semibold text-white text-lg line-clamp-1 group-hover:text-indigo-300 transition-colors">{session.goal}</span>
                                        <span className="text-xs font-mono text-white/40 bg-white/5 px-2 py-1 rounded-md">
                                            {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-green-400/90 font-medium">
                                        <CheckCircle2 size={16} />
                                        <span>{session.duration} daqiqa fokus</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Footer Quote */}
            <div className="absolute bottom-6 left-0 w-full text-center z-10 pointer-events-none">
                <p className="text-white/30 text-xs font-bold tracking-[0.3em] uppercase opacity-70">
                    FOCUS • CREATE • EVOLVE
                </p>
            </div>
        </div>
    );
};

export default Pomodoro;
