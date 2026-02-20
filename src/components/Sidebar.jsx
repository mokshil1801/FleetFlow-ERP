import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Truck,
    MapPin,
    Wrench,
    Fuel,
    Users,
    BarChart3,
    Settings,
    LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user } = useAuth();

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['Manager', 'Dispatcher', 'Safety', 'Analyst'] },
        { name: 'Vehicles', path: '/vehicles', icon: Truck, roles: ['Manager', 'Dispatcher'] },
        { name: 'Trips', path: '/trips', icon: MapPin, roles: ['Manager', 'Dispatcher'] },
        { name: 'Maintenance', path: '/maintenance', icon: Wrench, roles: ['Manager', 'Dispatcher'] },
        { name: 'Drivers', path: '/drivers', icon: Users, roles: ['Manager', 'Safety'] },
        { name: 'Financials', path: '/financials', icon: Fuel, roles: ['Manager', 'Analyst'] },
        { name: 'Analytics', path: '/analytics', icon: BarChart3, roles: ['Manager', 'Analyst'] },
        { name: 'Audit Logs', path: '/audit-logs', icon: Settings, roles: ['Manager'] },
    ];

    const filteredItems = navItems.filter(item => item.roles.includes(user?.role));

    return (
        <div className="flex flex-col h-screen w-72 bg-[#0f172a] text-white shadow-2xl z-20 transition-all duration-500">
            <div className="flex items-center px-8 h-24">
                <span className="text-3xl font-black tracking-tighter text-white">
                    Fleet<span className="text-blue-500">Flow</span>
                    <span className="block text-[8px] uppercase tracking-[0.3em] text-blue-400 font-bold mt-1">Strategic Operations</span>
                </span>
            </div>

            <nav className="flex-1 overflow-y-auto mt-4 px-6 space-y-2">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4 ml-2">Main Navigation</p>
                {filteredItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center px-5 py-3.5 text-sm font-bold rounded-2xl transition-all duration-300 group ${isActive
                                ? 'bg-blue-600/10 text-blue-400 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`
                        }
                    >
                        <item.icon className={`h-5 w-5 mr-4 transition-transform group-hover:scale-110`} />
                        {item.name}
                    </NavLink>
                ))}
            </nav>

            <div className="p-6 mt-auto">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="flex items-center">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20">
                            {user?.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="ml-3 overflow-hidden">
                            <p className="text-sm font-bold text-white truncate">{user?.name || 'Administrator'}</p>
                            <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">{user?.role}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
