import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Clock, User, Globe, Activity, Loader2, AlertCircle } from 'lucide-react';

const AuditLogViewer = () => {
    const { api } = useAuth();
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await api.get('/audit/logs');
                setLogs(response.data.data);
                setIsLoading(false);
            } catch (err) {
                setError(err.response?.data?.detail || 'Failed to fetch audit logs');
                setIsLoading(false);
            }
        };

        fetchLogs();
    }, [api]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Retrieving Audit Trail...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="luxury-card border-rose-100 bg-rose-50/50 p-6 flex items-center gap-4 text-rose-700">
                    <AlertCircle className="h-8 w-8 text-rose-500" />
                    <div>
                        <h3 className="text-lg font-bold">Access Denied or Connection Error</h3>
                        <p className="text-sm opacity-80">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 flex items-center gap-3">
                        <Shield className="h-10 w-10 text-blue-600" />
                        Audit <span className="text-blue-600">Trail</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1 uppercase tracking-[0.2em] text-[10px]">Security & Compliance Log</p>
                </div>
            </div>

            <div className="luxury-card overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">User ID</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Event</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Connectivity</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-white transition-colors">
                                            <Clock className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-700">
                                                {new Date(log.timestamp).toLocaleDateString()}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-medium tracking-tight">
                                                {new Date(log.timestamp).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-slate-300" />
                                        <span className="text-sm font-bold text-slate-600">#{log.user_id || 'System'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Activity className="h-4 w-4 text-blue-400" />
                                        <span className="text-sm font-black text-slate-800 tracking-tight">{log.event}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${log.status === 'Success'
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            : 'bg-rose-50 text-rose-600 border-rose-100'
                                        }`}>
                                        {log.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Globe className="h-3 w-3 text-slate-300" />
                                            <span className="text-[10px] font-mono font-bold text-slate-400">{log.ip_address}</span>
                                        </div>
                                        <p className="text-[9px] text-slate-400 truncate max-w-[150px] font-medium italic">
                                            {log.user_agent}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuditLogViewer;
