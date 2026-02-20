import React, { useState, useEffect, useRef } from 'react';
import { useFleet } from '../../context/FleetContext';
import Skeleton from '../../components/Skeleton';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit2, Search, X, Loader2, Shield, Star, TrendingUp, User2, Calendar } from 'lucide-react';
import { gsap } from 'gsap';

const StatusDot = ({ status }) => {
    const colors = {
        'On Duty': 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]',
        'Off Duty': 'bg-slate-400',
        'Suspended': 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]',
    };
    return (
        <div className="flex items-center bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
            <span className={`h-2 w-2 rounded-full mr-2 ${colors[status] || 'bg-gray-400'}`}></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{status}</span>
        </div>
    );
};

const DriverCenter = () => {
    const { drivers, addDriver, updateDriver, loading } = useFleet();
    const { addToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingDriver, setEditingDriver] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const cardsRef = useRef([]);

    const [formData, setFormData] = useState({
        name: '',
        license_expiry: '',
        safety_score: 100,
        trip_completion_rate: 100,
        status: 'Off Duty',
    });

    useEffect(() => {
        if (!loading && drivers.length > 0) {
            gsap.fromTo(cardsRef.current,
                { opacity: 0, y: 30, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: "power3.out" }
            );
        }
    }, [loading, drivers.length]);

    const filteredDrivers = drivers.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    // ... existing modal handlers ...
    const openAddModal = () => {
        setEditingDriver(null);
        setFormData({ name: '', license_expiry: '', safety_score: 100, trip_completion_rate: 100, status: 'Off Duty' });
        setShowModal(true);
    };

    const openEditModal = (driver) => {
        setEditingDriver(driver);
        setFormData({
            name: driver.name,
            license_expiry: driver.license_expiry,
            safety_score: driver.safety_score,
            trip_completion_rate: driver.trip_completion_rate,
            status: driver.status,
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                safety_score: parseFloat(formData.safety_score),
                trip_completion_rate: parseFloat(formData.trip_completion_rate),
            };

            if (editingDriver) {
                await updateDriver(editingDriver.id, payload);
                addToast('Driver updated successfully!', 'success');
            } else {
                await addDriver(payload);
                addToast('Driver added successfully!', 'success');
            }
            setShowModal(false);
        } catch (err) {
            const msg = err.response?.data?.detail || 'Operation failed';
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
                        <Skeleton width="240px" height="40px" />
                        <Skeleton width="340px" height="20px" />
                    </div>
                    <Skeleton width="160px" height="48px" />
                </div>
                <Skeleton width="300px" height="48px" className="rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="luxury-card p-8">
                            <div className="flex items-center mb-8">
                                <Skeleton circle width="56px" height="56px" className="mr-5" />
                                <div className="space-y-3 flex-1">
                                    <Skeleton width="70%" height="24px" />
                                    <Skeleton width="40%" height="16px" />
                                </div>
                            </div>
                            <div className="space-y-6 pt-6 border-t border-gray-100">
                                <Skeleton width="100%" height="24px" />
                                <Skeleton width="100%" height="24px" />
                                <Skeleton width="100%" height="24px" />
                            </div>
                        </div>
                    ))}
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
                <svg className="absolute bottom-[-10%] left-[-5%] w-[60%] h-[60%] blur-[120px] fill-purple-500/10">
                    <circle cx="50%" cy="50%" r="30%" />
                </svg>
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black lux-gradient-text tracking-tight">Driver Center</h1>
                    <p className="text-gray-500 font-medium tracking-wide">Strategic oversight of your world-class logistics team</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="group relative flex items-center px-6 py-3.5 bg-gray-900 text-white rounded-2xl text-sm font-bold shadow-2xl transition-all hover:bg-black hover:scale-105 active:scale-95 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Plus className="relative z-10 h-5 w-5 mr-3" />
                    <span className="relative z-10">Recruit Driver</span>
                </button>
            </div>

            <div className="relative w-80 group">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Locate operator..."
                    className="pl-12 pr-6 py-3.5 w-full bg-white/50 backdrop-blur-md border border-gray-200 rounded-2xl text-sm font-semibold shadow-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Driver Cards */}
            {filteredDrivers.length === 0 ? (
                <div className="luxury-card p-20 text-center animate-in zoom-in-95 duration-500">
                    <User2 className="h-16 w-16 text-gray-200 mx-auto mb-6" />
                    <p className="text-gray-400 font-bold text-xl">No active operators found</p>
                    <button onClick={openAddModal} className="mt-4 text-blue-500 font-bold hover:underline">Start recruitment</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredDrivers.map((driver, index) => (
                        <div
                            key={driver.id}
                            ref={el => cardsRef.current[index] = el}
                            className="luxury-card p-8 group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-blue-500/10" />

                            <div className="flex items-start justify-between mb-8 relative z-10">
                                <div className="flex items-center">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-[0_10px_30px_-10px_rgba(59,130,246,0.5)] transform transition-transform group-hover:rotate-6 group-hover:scale-110">
                                        {driver.name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                    <div className="ml-5">
                                        <h3 className="font-black text-xl text-gray-900 leading-tight mb-1">{driver.name}</h3>
                                        <StatusDot status={driver.status} />
                                    </div>
                                </div>
                                <button
                                    onClick={() => openEditModal(driver)}
                                    className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                >
                                    <Edit2 className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-5 pt-8 border-t border-gray-100 relative z-10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        <Shield className="h-4 w-4 mr-2 text-blue-500" />
                                        Safety Compliance
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-24 h-2 bg-gray-100 rounded-full mr-3 overflow-hidden shadow-inner">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(var(--color-shadow),0.4)] ${driver.safety_score >= 90 ? 'bg-emerald-500' : driver.safety_score >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                                                    }`}
                                                style={{ width: `${driver.safety_score}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-black text-gray-900">{driver.safety_score} <span className="text-[10px] text-gray-400 font-bold">PT</span></span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        <TrendingUp className="h-4 w-4 mr-2 text-emerald-500" />
                                        Success Rate
                                    </div>
                                    <span className="text-sm font-black text-gray-900">{driver.trip_completion_rate ?? 100}%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                                        Certification End
                                    </div>
                                    <span className="text-sm font-black text-gray-900">{driver.license_expiry}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingDriver ? 'Edit Driver' : 'Add New Driver'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g. John Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">License Expiry</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.license_expiry}
                                    onChange={(e) => setFormData({ ...formData, license_expiry: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Safety Score (0-100)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        required
                                        className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.safety_score}
                                        onChange={(e) => setFormData({ ...formData, safety_score: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Completion Rate (%)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        required
                                        className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.trip_completion_rate}
                                        onChange={(e) => setFormData({ ...formData, trip_completion_rate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                                <select
                                    className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="Off Duty">Off Duty</option>
                                    <option value="On Duty">On Duty</option>
                                    <option value="Suspended">Suspended</option>
                                </select>
                            </div>
                            <div className="pt-4 flex space-x-3">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200">Cancel</button>
                                <button type="submit" disabled={submitting} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 disabled:opacity-50">
                                    {submitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : editingDriver ? 'Save Changes' : 'Add Driver'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DriverCenter;
