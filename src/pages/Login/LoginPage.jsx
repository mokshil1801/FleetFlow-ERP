import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, User, Loader2, AlertCircle } from 'lucide-react';

const LoginPage = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('Manager');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
 
        let result;
        if (isRegister) {
            result = await register(email, password, name, role);
        } else {
            result = await login(email, password);
        }

        setIsLoading(false);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }
    };

    const toggleMode = () => {
        setIsRegister(!isRegister);
        setError('');
    };

    return (
        <div className="relative min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
            {/* Background SVG Decor */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 opacity-40">
                <svg className="absolute top-[-10%] right-[-5%] w-[70%] h-[70%] blur-[120px] fill-blue-500/20">
                    <circle cx="50%" cy="50%" r="30%" />
                </svg>
                <svg className="absolute bottom-[-10%] left-[-5%] w-[70%] h-[70%] blur-[120px] fill-indigo-500/20">
                    <circle cx="50%" cy="50%" r="30%" />
                </svg>
            </div>

            <div className="luxury-card max-w-md w-full space-y-8 p-10 relative z-10 border-white/40 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)]">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        FleetFlow Portal
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {isRegister
                            ? 'Create your account to get started'
                            : 'Enter your credentials to access the control tower'}
                    </p>
                </div>

                {error && (
                    <div className="flex items-center gap-4 p-5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 animate-in shake duration-500 shadow-xl shadow-rose-200/20">
                        <div className="p-2 bg-rose-100 rounded-xl">
                            <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-0.5">Authentication Error</p>
                            <p className="text-sm font-bold tracking-tight">{error}</p>
                        </div>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-3">
                        {isRegister && (
                            <div className="relative">
                                <User className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    className="appearance-none relative block w-full px-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                    placeholder="Full name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        )}
                        <div className="relative">
                            <Mail className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                            <input
                                type="email"
                                required
                                className="appearance-none relative block w-full px-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                            <input
                                type="password"
                                required
                                className="appearance-none relative block w-full px-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {isRegister && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    <option value="Manager">Manager</option>
                                    <option value="Dispatcher">Dispatcher</option>
                                    <option value="Safety">Safety Officer</option>
                                    <option value="Analyst">Financial Analyst</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {!isRegister && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                                <label className="ml-2 block text-sm text-gray-900">Remember me</label>
                            </div>
                            <div className="text-sm">
                                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">Forgot password?</a>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : isRegister ? (
                            'Create Account'
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="text-center text-sm">
                    <span className="text-gray-600">
                        {isRegister ? 'Already have an account?' : "Don't have an account?"}
                    </span>{' '}
                    <button
                        onClick={toggleMode}
                        className="font-medium text-blue-600 hover:text-blue-500"
                    >
                        {isRegister ? 'Sign In' : 'Register'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
