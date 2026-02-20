import React, { useState, useEffect, useRef } from 'react';
import { useFleet } from '../../context/FleetContext';
import Skeleton from '../../components/Skeleton';
import { useToast } from '../../context/ToastContext';
import { Plus, Wrench, Search, X, Loader2, Calendar, DollarSign, Truck, AlertTriangle, CheckCircle2, History } from 'lucide-react';
import { gsap } from 'gsap';

const MaintenancePage = () => {
    const { vehicles, maintenanceLogs, addMaintenanceLog, loading } = useFleet();
    const { addToast } = useToast();
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const tableRowsRef = useRef([]);

    const [formData, setFormData] = useState({
        vehicle_id: '',
        service_type: '',
        cost: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    useEffect(() => {
        if (!loading && maintenanceLogs.length > 0) {
            gsap.fromTo(tableRowsRef.current,
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: 0.5, stagger: 0.05, ease: "power2.out" }
            );
        }
    }, [loading, maintenanceLogs.length]);

    const getVehicleName = (id) => vehicles.find(v => v.id === id)?.name || `Vehicle #${id}`;

    const filteredLogs = maintenanceLogs.filter(log =>
        getVehicleName(log.vehicle_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.service_type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalMaintenanceCost = maintenanceLogs.reduce((sum, log) => sum + (log.cost || 0), 0);
    const pendingServices = vehicles.filter(v => v.status === 'In Shop').length;

    const maintenanceAlerts = vehicles
        .filter(v => v.next_service_odometer && v.next_service_odometer - v.odometer < 2000)
        .map(v => ({
            ...v,
            remaining: v.next_service_odometer - v.odometer,
            severity: v.next_service_odometer - v.odometer < 500 ? 'critical' : 'warning'
        }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await addMaintenanceLog({
                vehicle_id: formData.vehicle_id,
                service_type: formData.service_type,
                cost: parseFloat(formData.cost),
                date: formData.date,
                notes: formData.notes || null,
            });
            addToast('Maintenance log created! Vehicle moved to "In Shop".', 'success');
            setShowModal(false);
            setFormData({ vehicle_id: '', service_type: '', cost: '', date: new Date().toISOString().split('T')[0], notes: '' });
        } catch (err) {
            const msg = err.response?.data?.detail || 'Failed to create log';
            addToast(msg, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-10 animate-in fade-in duration-700 pb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <Skeleton width="280px" height="40px" />
                        <Skeleton width="380px" height="20px" />
                    </div>
                    <Skeleton width="180px" height="48px" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => <Skeleton key={i} height="120px" className="rounded-3xl" />)}
                </div>
                <Skeleton height="500px" className="rounded-3xl" />
            </div>
        );
    }

    return (
        <div className="relative space-y-10 pb-10 animate-in fade-in duration-1000 overflow-hidden">
            {/* Background SVG Decor */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-30">
                <svg className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] blur-[120px] fill-amber-500/10">
                    <circle cx="50%" cy="50%" r="30%" />
                </svg>
                <svg className="absolute bottom-[-10%] left-[-5%] w-[60%] h-[60%] blur-[120px] fill-emerald-500/10">
                    <circle cx="50%" cy="50%" r="30%" />
                </svg>
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black lux-gradient-text tracking-tight italic">Maintenance Hub</h1>
                    <p className="text-gray-500 font-medium tracking-wide">Fleet health monitoring and lifecycle management</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="group relative flex items-center px-6 py-3.5 bg-gray-900 text-white rounded-2xl text-sm font-bold shadow-2xl transition-all hover:bg-black hover:scale-105 active:scale-95 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Plus className="relative z-10 h-5 w-5 mr-3" />
                    <span className="relative z-10">Log Premium Service</span>
                </button>
            </div>

            {/* Preventive Alerts Banner */}
            {maintenanceAlerts.length > 0 && (
                <div className="grid grid-cols-1 gap-6">
                    {maintenanceAlerts.map(alert => (
                        <div key={alert.id} className={`flex flex-col md:flex-row md:items-center justify-between p-8 rounded-[2.5rem] border backdrop-blur-md relative overflow-hidden shadow-2xl animate-in slide-in-from-right duration-700 ${alert.severity === 'critical' ? 'bg-rose-50/80 border-rose-200' : 'bg-amber-50/80 border-amber-200'}`}>
                            {/* Accent Glow */}
                            <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-20 ${alert.severity === 'critical' ? 'bg-rose-500' : 'bg-amber-500'}`} />

                            <div className="flex items-start md:items-center relative z-10">
                                <div className={`p-4 rounded-2xl mr-6 ${alert.severity === 'critical' ? 'bg-rose-100' : 'bg-amber-100'}`}>
                                    <AlertTriangle className={`h-8 w-8 ${alert.severity === 'critical' ? 'text-rose-600' : 'text-amber-600'}`} />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center space-x-3">
                                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md ${alert.severity === 'critical' ? 'bg-rose-600 text-rose-50' : 'bg-amber-600 text-amber-50'}`}>
                                            {alert.severity}
                                        </span>
                                        <p className="font-black text-gray-900 tracking-tight italic text-lg uppercase">Preventive Intelligence: {alert.name}</p>
                                    </div>
                                    <p className="text-sm font-bold text-gray-600 uppercase tracking-widest mt-1 opacity-80">
                                        Strategic intervention required in <span className={`underline decoration-2 ${alert.severity === 'critical' ? 'text-rose-700' : 'text-amber-700'}`}>{alert.remaining.toLocaleString()} km</span>
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 md:mt-0 relative z-10">
                                <button
                                    onClick={() => {
                                        setFormData({ ...formData, vehicle_id: alert.id, service_type: 'General Inspection' });
                                        setShowModal(true);
                                    }}
                                    className={`w-full md:w-auto px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all transform hover:scale-[1.05] active:scale-[0.98] shadow-xl ${alert.severity === 'critical' ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200' : 'bg-amber-600 text-white hover:bg-amber-700 shadow-amber-200'}`}
                                >
                                    Authorize Service
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Maintenance KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="luxury-card p-8 group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 blur-2xl" />
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-50 rounded-2xl"><DollarSign className="h-6 w-6 text-blue-600" /></div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">MTD Spend</span>
                    </div>
                    <p className="text-3xl font-black text-gray-900">₹{totalMaintenanceCost.toLocaleString()}</p>
                    <p className="text-xs font-bold text-gray-500 mt-2 uppercase tracking-tight">Total Maintenance Cost</p>
                </div>
                <div className="luxury-card p-8 group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full -mr-12 -mt-12 blur-2xl" />
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-50 rounded-2xl"><AlertTriangle className="h-6 w-6 text-orange-600" /></div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Issues</span>
                    </div>
                    <p className="text-3xl font-black text-gray-900">{pendingServices}</p>
                    <p className="text-xs font-bold text-gray-500 mt-2 uppercase tracking-tight">Vehicles Currently In-Shop</p>
                </div>
                <div className="luxury-card p-8 group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-12 -mt-12 blur-2xl" />
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-emerald-50 rounded-2xl"><CheckCircle2 className="h-6 w-6 text-emerald-600" /></div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fleet Health</span>
                    </div>
                    <p className="text-3xl font-black text-gray-900">92%</p>
                    <p className="text-xs font-bold text-gray-500 mt-2 uppercase tracking-tight">Optimal Operational State</p>
                </div>
            </div>

            <div className="relative w-80 group">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search service history..."
                    className="pl-12 pr-6 py-3.5 w-full bg-white/50 backdrop-blur-md border border-gray-200 rounded-2xl text-sm font-semibold shadow-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Premium Table */}
            <div className="luxury-card overflow-hidden shadow-2xl relative">
                <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
                    <div className="flex items-center">
                        <History className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm font-black text-gray-900 uppercase tracking-widest">Service Log Archive</span>
                    </div>
                    <div className="flex space-x-2">
                        <div className="h-2 w-2 rounded-full bg-amber-400" />
                        <div className="h-2 w-2 rounded-full bg-emerald-400" />
                        <div className="h-2 w-2 rounded-full bg-blue-400" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
                                <th className="px-8 py-5">Asset Identification</th>
                                <th className="px-8 py-5">Operational Service</th>
                                <th className="px-8 py-5">Investment</th>
                                <th className="px-8 py-5">Timestamp</th>
                                <th className="px-8 py-5">Strategic Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <Wrench className="h-12 w-12 text-gray-200 mb-4" />
                                            <p className="text-gray-400 font-bold text-lg italic">The archive is currently pristine</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log, index) => (
                                    <tr
                                        key={log.id}
                                        ref={el => tableRowsRef.current[index] = el}
                                        className="hover:bg-blue-50/30 transition-all group"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 group-hover:bg-blue-100 transition-all">
                                                    <Truck className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                                                </div>
                                                <span className="font-black text-gray-900 tracking-tight">{getVehicleName(log.vehicle_id)}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center">
                                                <div className="px-3 py-1 bg-amber-50 border border-amber-100 rounded-full">
                                                    <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">{log.service_type}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center text-sm font-black text-gray-900">
                                                <span className="text-emerald-500 mr-1 italic">₹</span>
                                                {log.cost?.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center text-xs font-bold text-gray-500 tracking-tight">
                                                <Calendar className="h-3.5 w-3.5 text-gray-300 mr-2" />
                                                {log.date}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-xs font-medium text-gray-400 italic max-w-xs truncate group-hover:text-gray-600 transition-colors">
                                            {log.notes || 'No executive notes provided'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Luxury Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] max-w-xl w-full overflow-hidden border border-white/20">
                        <div className="p-10 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 italic tracking-tighter uppercase">Service Enrollment</h3>
                                <p className="text-xs font-bold text-gray-400 tracking-widest mt-1">INITIATE VEHICLE DEPLOYMENT TO SHOP</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-12 h-12 flex items-center justify-center bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 hover:border-gray-900 transition-all">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-10 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Strategic Asset</label>
                                    <select
                                        required
                                        className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        value={formData.vehicle_id}
                                        onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                                    >
                                        <option value="">Select Asset...</option>
                                        {vehicles.map(v => (
                                            <option key={v.id} value={v.id}>{v.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Maintenance Type</label>
                                    <select
                                        required
                                        className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        value={formData.service_type}
                                        onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                                    >
                                        <option value="">Select Protocol...</option>
                                        <option value="Oil Change">Lubrication Review</option>
                                        <option value="Brake Inspection">Safety Audit (Brakes)</option>
                                        <option value="Tire Rotation">Traction Management</option>
                                        <option value="Engine Repair">Powerplant Restoration</option>
                                        <option value="Transmission Service">Drivetrain Optimization</option>
                                        <option value="General Inspection">Tactical Assessment</option>
                                        <option value="Other">Custom Directive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Investment (₹)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-4 h-4 w-4 text-emerald-500" />
                                        <input
                                            type="number"
                                            required
                                            className="w-full bg-gray-50 border-none rounded-2xl p-4 pl-10 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                            placeholder="Capital allocated..."
                                            value={formData.cost}
                                            onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Deployment Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all uppercase"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Strategic Briefing</label>
                                <textarea
                                    rows={3}
                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none transition-all"
                                    placeholder="Enter additional directive notes..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>
                            <div className="pt-6 flex space-x-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-8 py-5 bg-gray-100 text-gray-940 rounded-3xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all">Dismiss</button>
                                <button type="submit" disabled={submitting} className="flex-1 px-8 py-5 bg-gray-900 text-white rounded-3xl text-xs font-black uppercase tracking-widest hover:bg-black hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-blue-500/20 transition-all disabled:opacity-50">
                                    {submitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto text-white" /> : 'Confirm Log'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaintenancePage;
