import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { logout, user } = useAuth();

    return (
        <header className="h-20 bg-white/60 backdrop-blur-xl border-b border-white/20 flex items-center justify-between px-10 sticky top-0 z-10 shadow-sm">
            <div className="flex items-center bg-gray-50/50 px-4 py-2.5 rounded-2xl border border-gray-100 w-[500px] shadow-inner focus-within:bg-white transition-all duration-300">
                <Search className="h-4 w-4 text-gray-400 mr-3" />
                <input
                    type="text"
                    placeholder="Global Fleet Search..."
                    className="bg-transparent border-none focus:ring-0 text-sm w-full font-medium"
                />
            </div>

            <div className="flex items-center space-x-8">
                <button className="relative text-gray-400 hover:text-blue-600 transition-all transform hover:scale-110">
                    <Bell className="h-6 w-6" />
                    <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
                </button>

                <div className="flex items-center space-x-4 bg-white/40 p-1.5 pr-4 rounded-2xl border border-white group cursor-pointer hover:bg-white transition-all duration-300" onClick={logout}>
                    <div className="h-9 w-9 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300 shadow-sm">
                        <User className="h-5 w-5 text-gray-500 group-hover:text-white" />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-black text-gray-900 leading-none">{user?.name || 'Admin User'}</p>
                        <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mt-1">Logout</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
