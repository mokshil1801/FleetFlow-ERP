import React, { useState, useEffect, useRef } from 'react';
import { useFleet } from '../../context/FleetContext';
import Skeleton from '../../components/Skeleton';
import { useToast } from '../../context/ToastContext';
import { Plus, Play, CheckCircle, XCircle, Search, X, Loader2, Truck, User2, Package, MapPin, Navigation } from 'lucide-react';
import gsap from 'gsap';

const StatusBadge = ({ status }) => {
    const colors = {
        'Draft': 'bg-amber-500/10 text-amber-600 border-amber-200/50',
        'Dispatched': 'bg-blue-500/10 text-blue-600 border-blue-200/50',
        'Completed': 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50',
        'Cancelled': 'bg-rose-500/10 text-rose-600 border-rose-200/50',
    };
    return (
        <span className={`px-3 py-1 rounded-xl border text-[10px] font-black uppercase tracking-widest ${colors[status] || colors.Draft}`}>
            {status}
        </span>
    );
};

const TripDispatcher = () => {
    const { vehicles, drivers, trips, createTrip, dispatchTrip, completeTrip, cancelTrip, loading } = useFleet();
    const { addToast } = useToast();
    const [showModal, setShowModal] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [completingTrip, setCompletingTrip] = useState(null);
    const [endOdometer, setEndOdometer] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const cardsRef = useRef([]);
    const [formData, setFormData] = useState({
        vehicle_id: '',
        driver_id: '',
        cargo_weight: '',
        start_odometer: 0,
    });

    useEffect(() => {
        if (!loading && trips.length > 0) {
            gsap.fromTo(cardsRef.current,
                { opacity: 0, y: 30, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: "power3.out" }
            );
        }
    }, [loading, trips.length]);

    const availableVehicles = vehicles.filter(v => v.status === 'Available');
    const availableDrivers = drivers.filter(d => d.status === 'On Duty' || d.status === 'Off Duty');

    const filteredTrips = trips.filter(t =>
        String(t.id).includes(searchTerm) ||
        t.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getVehicleName = (id) => vehicles.find(v => v.id === id)?.name || `Vehicle #${id}`;
    const getDriverName = (id) => drivers.find(d => d.id === id)?.name || `Driver #${id}`;

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                vehicle_id: parseInt(formData.vehicle_id),
                driver_id: parseInt(formData.driver_id),
                cargo_weight: parseFloat(formData.cargo_weight),
                start_odometer: parseFloat(formData.start_odometer) || 0,
            };
            await createTrip(payload);
            addToast('Trip created as Draft!', 'success');
            setShowModal(false);
            setFormData({ vehicle_id: '', driver_id: '', cargo_weight: '', start_odometer: 0 });
        } catch (err) {
            const msg = err.response?.data?.detail || 'Failed to create trip';
            addToast(msg, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDispatch = async (trip) => {
        try {
            await dispatchTrip(trip.id);
            addToast('Trip dispatched!', 'success');
        } catch (err) {
            const msg = err.response?.data?.detail || 'Dispatch failed';
            addToast(msg, 'error');
        }
    };

    const handleCompleteOpen = (trip) => {
        setCompletingTrip(trip);
        setEndOdometer('');
        setShowCompleteModal(true);
    };

    const handleComplete = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await completeTrip(completingTrip.id, parseFloat(endOdometer));
            addToast('Trip completed!', 'success');
            setShowCompleteModal(false);
        } catch (err) {
            const msg = err.response?.data?.detail || 'Complete failed';
            addToast(msg, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = async (trip) => {
        if (!window.confirm('Cancel this mission?')) return;
        try {
            await cancelTrip(trip.id);
            addToast('Mission cancelled.', 'warning');
        } catch (err) {
            const msg = err.response?.data?.detail || 'Cancel failed';
            addToast(msg, 'error');
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => <Skeleton key={i} height="240px" className="rounded-[2.5rem]" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="relative space-y-10 pb-10 animate-in fade-in duration-1000 overflow-hidden">
            {/* Background SVG Decor */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-30">
                <svg className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] blur-[120px] fill-blue-500/10">
                    <circle cx="50%" cy="50%" r="30%" />
                </svg>
                <svg className="absolute bottom-[-10%] left-[-5%] w-[60%] h-[60%] blur-[120px] fill-indigo-500/10">
                    <circle cx="50%" cy="50%" r="30%" />
                </svg>
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black lux-gradient-text tracking-tight italic uppercase">Strategic Dispatch Center</h1>
                    <p className="text-gray-500 font-medium tracking-wide">Orchestrating high-value fleet operations</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="group relative flex items-center px-8 py-4 bg-gray-900 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-2xl transition-all hover:bg-black hover:scale-105 active:scale-95 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Navigation className="relative z-10 h-4 w-4 mr-3" />
                    <span className="relative z-10 text-white">Initiate Mission</span>
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                    type="text"
                    placeholder="Search mission profiles..."
                    className="block w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-[2rem] text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Trip Cards */}
            {filteredTrips.length === 0 ? (
                <div className="luxury-card p-20 text-center rounded-[3rem]">
                    <Package className="h-16 w-16 text-gray-200 mx-auto mb-6" />
                    <p className="text-xl font-black text-gray-400 uppercase tracking-widest italic">Inventory Zero: No active missions found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredTrips.map((trip, index) => (
                        <div
                            key={trip.id}
                            ref={el => cardsRef.current[index] = el}
                            className="luxury-card p-8 group relative overflow-hidden flex flex-col justify-between min-h-[380px]"
                        >
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-blue-500/10 transition-colors" />

                            <div>
                                <div className="flex items-center justify-between mb-8 relative z-10">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Mission Profile</p>
                                        <h2 className="text-2xl font-black text-gray-900 tracking-tighter italic">#{String(trip.id).padStart(4, '0')}</h2>
                                    </div>
                                    <StatusBadge status={trip.status} />
                                </div>

                                <div className="space-y-4 relative z-10">
                                    <div className="flex items-center group/item transition-all hover:translate-x-1">
                                        <div className="p-2 bg-gray-50 rounded-xl mr-4 group-hover/item:bg-blue-50 transition-colors">
                                            <Truck className="h-4 w-4 text-gray-400 group-hover/item:text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Assigned Support</p>
                                            <p className="text-sm font-black text-gray-900 truncate max-w-[180px]">{getVehicleName(trip.vehicle_id)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center group/item transition-all hover:translate-x-1">
                                        <div className="p-2 bg-gray-50 rounded-xl mr-4 group-hover/item:bg-emerald-50 transition-colors">
                                            <User2 className="h-4 w-4 text-gray-400 group-hover/item:text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Strategic Operative</p>
                                            <p className="text-sm font-black text-gray-900 truncate max-w-[180px]">{getDriverName(trip.driver_id)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center group/item transition-all hover:translate-x-1">
                                        <div className="p-2 bg-gray-50 rounded-xl mr-4 group-hover/item:bg-amber-50 transition-colors">
                                            <Package className="h-4 w-4 text-gray-400 group-hover/item:text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Payload Weight</p>
                                            <p className="text-sm font-black text-gray-900 uppercase italic tracking-tighter">
                                                {trip.cargo_weight?.toLocaleString()} kg
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center space-x-4 relative z-10 text-gray-600">
                                {trip.status === 'Draft' && (
                                    <>
                                        <button
                                            onClick={() => handleDispatch(trip)}
                                            className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-900 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-blue-500/20"
                                        >
                                            <Play className="h-3 w-3 mr-2" /> Dispatch mission
                                        </button>
                                        <button
                                            onClick={() => handleCancel(trip)}
                                            className="p-3 text-rose-600 bg-rose-50 rounded-2xl hover:bg-rose-100 transition-all hover:scale-105 active:scale-95"
                                        >
                                            <XCircle className="h-4 w-4" />
                                        </button>
                                    </>
                                )}
                                {trip.status === 'Dispatched' && (
                                    <>
                                        <button
                                            onClick={() => handleCompleteOpen(trip)}
                                            className="flex-1 flex items-center justify-center px-4 py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-emerald-500/20"
                                        >
                                            <CheckCircle className="h-3 w-3 mr-2" /> Finalize mission
                                        </button>
                                        <button
                                            onClick={() => handleCancel(trip)}
                                            className="p-3 text-rose-600 bg-rose-50 rounded-2xl hover:bg-rose-100 transition-all hover:scale-105 active:scale-95"
                                        >
                                            <XCircle className="h-4 w-4" />
                                        </button>
                                    </>
                                )}
                                {(trip.status === 'Completed' || trip.status === 'Cancelled') && (
                                    <div className="w-full text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 text-gray-400">Mission Terminated</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Trip Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xl flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
                    <div className="luxury-card max-w-2xl w-full overflow-hidden rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-white/20">
                        <div className="p-10 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                            <div>
                                <h3 className="text-3xl font-black text-gray-900 tracking-tighter italic uppercase">Initiate Strategic Mission</h3>
                                <p className="text-gray-500 font-bold tracking-widest text-[10px] uppercase mt-1">Directing High-Value Fleet Deployment</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-3 bg-gray-100 rounded-2xl text-gray-400 hover:text-gray-940 hover:bg-gray-200 transition-all">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-10 space-y-8 bg-white/80">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fleet Selection</label>
                                    <select
                                        required
                                        className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all cursor-pointer"
                                        value={formData.vehicle_id}
                                        onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                                    >
                                        <option value="">Select mission asset...</option>
                                        {availableVehicles.map(v => (
                                            <option key={v.id} value={v.id}>{v.name} ({v.license_plate})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Operative Assignment</label>
                                    <select
                                        required
                                        className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all cursor-pointer"
                                        value={formData.driver_id}
                                        onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                                    >
                                        <option value="">Select mission operative...</option>
                                        {availableDrivers.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Payload Weight (kg)</label>
                                    <div className="relative">
                                        <Package className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                                        <input
                                            type="number"
                                            required
                                            className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl pl-16 pr-6 py-4 text-sm font-bold focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all"
                                            placeholder="Specify payload..."
                                            value={formData.cargo_weight}
                                            onChange={(e) => setFormData({ ...formData, cargo_weight: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Deployment Odometer</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                                        <input
                                            type="number"
                                            className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl pl-16 pr-6 py-4 text-sm font-bold focus:ring-4 focus:ring-gray-900/10 focus:border-gray-900 outline-none transition-all font-mono"
                                            placeholder="Current reading..."
                                            value={formData.start_odometer}
                                            onChange={(e) => setFormData({ ...formData, start_odometer: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="pt-6 flex space-x-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-8 py-5 bg-gray-100 text-gray-940 rounded-3xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all">Abort</button>
                                <button type="submit" disabled={submitting} className="flex-1 px-8 py-5 bg-gray-900 text-white rounded-3xl text-xs font-black uppercase tracking-widest hover:bg-black hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-blue-500/20 transition-all disabled:opacity-50">
                                    {submitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto text-white" /> : 'Confirm Deployment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Complete Trip Modal */}
            {showCompleteModal && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xl flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
                    <div className="luxury-card max-w-md w-full overflow-hidden rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)]">
                        <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tighter italic uppercase">Finalize Mission Profile</h3>
                            <p className="text-gray-500 font-bold tracking-widest text-[10px] uppercase mt-1">Verification of Asset Return</p>
                        </div>
                        <form onSubmit={handleComplete} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Return Odometer Reading</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-mono"
                                    placeholder="Final metrics..."
                                    value={endOdometer}
                                    onChange={(e) => setEndOdometer(e.target.value)}
                                />
                            </div>
                            <div className="flex space-x-3">
                                <button type="button" onClick={() => setShowCompleteModal(false)} className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all">Cancel</button>
                                <button type="submit" disabled={submitting} className="flex-1 px-6 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-200 disabled:opacity-50 transition-all">
                                    {submitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto text-white" /> : 'Mission Accomplished'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TripDispatcher;
