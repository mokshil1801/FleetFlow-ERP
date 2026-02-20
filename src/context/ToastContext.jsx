import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X, Bell } from 'lucide-react';
import gsap from 'gsap';

const ToastContext = createContext();

const LuxuryToast = ({ toast, onRemove }) => {
    const toastRef = useRef(null);
    const progressRef = useRef(null);

    useEffect(() => {
        // Entrance Animation
        gsap.fromTo(toastRef.current,
            { x: 100, opacity: 0, scale: 0.9 },
            { x: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
        );

        // Progress Bar Animation
        gsap.to(progressRef.current, {
            width: "0%",
            duration: 5,
            ease: "none"
        });

        return () => {
            // Exit Animation (handled before removal)
        };
    }, []);

    const handleRemove = () => {
        gsap.to(toastRef.current, {
            x: 50,
            opacity: 0,
            scale: 0.9,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => onRemove(toast.id)
        });
    };

    const getColors = () => {
        switch (toast.type) {
            case 'success': return {
                bg: 'bg-emerald-50/90',
                border: 'border-emerald-100',
                icon: 'text-emerald-600',
                progress: 'bg-emerald-500',
                accent: 'bg-emerald-100'
            };
            case 'error': return {
                bg: 'bg-rose-50/90',
                border: 'border-rose-100',
                icon: 'text-rose-600',
                progress: 'bg-rose-500',
                accent: 'bg-rose-100'
            };
            case 'warning': return {
                bg: 'bg-amber-50/90',
                border: 'border-amber-100',
                icon: 'text-amber-600',
                progress: 'bg-amber-500',
                accent: 'bg-amber-100'
            };
            default: return {
                bg: 'bg-blue-50/90',
                border: 'border-blue-100',
                icon: 'text-blue-600',
                progress: 'bg-blue-500',
                accent: 'bg-blue-100'
            };
        }
    };

    const colors = getColors();

    return (
        <div
            ref={toastRef}
            className={`flex items-start p-5 rounded-[1.5rem] shadow-2xl border backdrop-blur-xl min-w-[340px] max-w-[400px] relative overflow-hidden group ${colors.bg} ${colors.border}`}
        >
            <div className={`p-2 rounded-xl mr-4 ${colors.accent}`}>
                {toast.type === 'success' && <CheckCircle className={`h-5 w-5 ${colors.icon}`} />}
                {toast.type === 'error' && <AlertCircle className={`h-5 w-5 ${colors.icon}`} />}
                {toast.type === 'warning' && <Bell className={`h-5 w-5 ${colors.icon}`} />}
                {toast.type === 'info' && <Info className={`h-5 w-5 ${colors.icon}`} />}
            </div>

            <div className="flex-1 pr-4">
                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${colors.icon}`}>
                    {toast.type} notification
                </p>
                <p className="text-sm font-bold text-gray-900 tracking-tight leading-tight">
                    {toast.message}
                </p>
            </div>

            <button
                onClick={handleRemove}
                className="p-1.5 hover:bg-white/50 rounded-lg transition-colors text-gray-400 hover:text-gray-900"
            >
                <X className="h-4 w-4" />
            </button>

            {/* Progress Countdown Bar */}
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gray-200/20">
                <div
                    ref={progressRef}
                    className={`h-full w-full ${colors.progress}`}
                />
            </div>
        </div>
    );
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto-remove is handled by the timeout but synced with GSAP progress
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5100); // Slightly longer than GSAP to avoid race conditions
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-8 right-8 z-[100] space-y-4 flex flex-col items-end">
                {toasts.map(toast => (
                    <LuxuryToast
                        key={toast.id}
                        toast={toast}
                        onRemove={removeToast}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
