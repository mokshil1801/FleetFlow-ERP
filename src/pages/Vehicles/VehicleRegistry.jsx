import React, { useState, useEffect, useRef } from 'react';
import { useFleet } from '../../context/FleetContext';
import Skeleton from '../../components/Skeleton';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit2, Trash2, XCircle, Search, Filter, X, Loader2, Truck, DollarSign, Activity, Percent, Maximize2, Gauge } from 'lucide-react';
import gsap from 'gsap';

const StatusBadge = ({ status }) => {
    const colors = {
        'Available': 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50',
        'On Trip': 'bg-blue-500/10 text-blue-600 border-blue-200/50',
        'In Shop': 'bg-rose-500/10 text-rose-600 border-rose-200/50',
        'Retired': 'bg-gray-500/10 text-gray-600 border-gray-200/50',
    };
    return (
        <span className={`px-3 py-1 rounded-xl border text-[10px] font-black uppercase tracking-widest ${colors[status] || colors.Retired}`}>
            {status}
        </span>
    );
};

const VehicleRegistry = () => {
    const { vehicles, addVehicle, updateVehicle, deleteVehicle, loading } = useFleet();
    const { addToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const cardsRef = useRef([]);
    const kpiRef = useRef([]);

    const [formData, setFormData] = useState({
        name: '',
        license_plate: '',
        max_capacity: '',
        odometer: 0,
        status: 'Available',
    });

    useEffect(() => {
        if (!loading && vehicles.length > 0) {
            gsap.fromTo(kpiRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }
            );
            gsap.fromTo(cardsRef.current,
                { opacity: 0, y: 30, scale: 0.98 },
                { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.05, ease: "power3.out", delay: 0.3 }
            );
        }
    }, [loading, vehicles.length]);

    const filteredVehicles = vehicles.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.license_plate.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Strategic KPIs
    const totalFleetValue = vehicles.reduce((sum, v) => sum + (v.acquisition_cost || 0), 0);
    const deploymentRate = ((vehicles.filter(v => v.status === 'On Trip').length / vehicles.length) * 100).toFixed(1);
    const fleetCapacity = vehicles.reduce((sum, v) => sum + (v.max_capacity || 0), 0);

    const openAddModal = () => {
        setEditingVehicle(null);
        setFormData({ name: '', license_plate: '', max_capacity: '', odometer: 0, status: 'Available' });
        setShowModal(true);
    };

    const openEditModal = (vehicle) => {
        setEditingVehicle(vehicle);
        setFormData({
            name: vehicle.name,
            license_plate: vehicle.license_plate,
            max_capacity: vehicle.max_capacity,
            odometer: vehicle.odometer,
            status: vehicle.status,
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                max_capacity: parseFloat(formData.max_capacity),
                odometer: parseFloat(formData.odometer),
            };

            if (editingVehicle) {
                await updateVehicle(editingVehicle.id, payload);
                addToast('Asset intelligence updated!', 'success');
            } else {
                await addVehicle(payload);
                addToast('Elite asset enrolled!', 'success');
            }
            setShowModal(false);
        } catch (err) {
            const msg = err.response?.data?.detail || 'Operation failed';
            addToast(msg, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (vehicle) => {
        if (!window.confirm(`Decommission asset "${vehicle.name}"? This action is permanent.`)) return;
        try {
            await deleteVehicle(vehicle.id);
            addToast('Asset decommissioned successfully.', 'warning');
        } catch (err) {
            const msg = err.response?.data?.detail || 'Decommission failed';
            addToast(msg, 'error');
        }
    };

    if (loading) {
        return (
            <div className="space-y-10 pb-10">
                <div className="flex justify-between items-end">
                    <Skeleton width="300px" height="48px" />
                    <Skeleton width="180px" height="48px" className="rounded-2xl" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <Skeleton key={i} height="140px" className="rounded-3xl" />)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} height="280px" className="rounded-[2.5rem]" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="relative space-y-10 pb-10 animate-in fade-in duration-1000 overflow-hidden">
            {/* Background SVG Decor */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-30">
                <svg className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] blur-[120px] fill-emerald-500/10">
                    <circle cx="50%" cy="50%" r="30%" />
                </svg>
                <svg className="absolute bottom-[-10%] left-[-5%] w-[60%] h-[60%] blur-[120px] fill-blue-500/10">
                    <circle cx="50%" cy="50%" r="30%" />
                </svg>
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black lux-gradient-text tracking-tight italic uppercase">Elite Asset Inventory</h1>
                    <p className="text-gray-500 font-medium tracking-wide">High-performance fleet resource management</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="group relative flex items-center px-8 py-4 bg-gray-900 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-2xl transition-all hover:bg-black hover:scale-105 active:scale-95 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Plus className="relative z-10 h-4 w-4 mr-3" />
                    <span className="relative z-10 text-white">Enroll New Asset</span>
                </button>
            </div>

            {/* Strategic KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div ref={el => kpiRef.current[0] = el} className="luxury-card p-6 flex items-center group">
                    <div className="p-4 bg-emerald-50 rounded-2xl mr-5 group-hover:scale-110 transition-transform">
                        <DollarSign className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Fleet Value</p>
                        <p className="text-2xl font-black text-gray-900 italic tracking-tighter">₹{(totalFleetValue / 10000000).toFixed(2)} Cr</p>
                    </div>
                </div>
                <div ref={el => kpiRef.current[1] = el} className="luxury-card p-6 flex items-center group">
                    <div className="p-4 bg-blue-50 rounded-2xl mr-5 group-hover:scale-110 transition-transform">
                        <Activity className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Deployment Rate</p>
                        <p className="text-2xl font-black text-gray-900 italic tracking-tighter">{deploymentRate}%</p>
                    </div>
                </div>
                <div ref={el => kpiRef.current[2] = el} className="luxury-card p-6 flex items-center group">
                    <div className="p-4 bg-purple-50 rounded-2xl mr-5 group-hover:scale-110 transition-transform">
                        <Maximize2 className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Fleet Capacity</p>
                        <p className="text-2xl font-black text-gray-900 italic tracking-tighter">{(fleetCapacity / 1000).toFixed(0)} Tons</p>
                    </div>
                </div>
            </div>

            {/* Elite Table View */}
            <div className="luxury-card rounded-[2.5rem] overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-50/30">
                    <div className="relative max-w-sm w-full group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search asset identification..."
                            className="pl-12 pr-4 py-4 w-full bg-white border-2 border-gray-100 rounded-[2rem] text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center px-6 py-4 bg-white border-2 border-gray-100 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-600 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm">
                        <Filter className="h-4 w-4 mr-2" /> Applied Filters
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-[10px] uppercase tracking-[0.2em] font-black text-gray-400">
                                <th className="px-8 py-6">Asset Nomenclature</th>
                                <th className="px-8 py-6">Registry ID</th>
                                <th className="px-8 py-6">Payload Capacity</th>
                                <th className="px-8 py-6">Deployment Metric</th>
                                <th className="px-8 py-6">Operational Status</th>
                                <th className="px-8 py-6 text-right">Strategic Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/50">
                            {filteredVehicles.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <Truck className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                                        <p className="text-sm font-black text-gray-400 uppercase tracking-widest italic">No matching assets in registry</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredVehicles.map((vehicle, index) => (
                                    <tr
                                        key={vehicle.id}
                                        ref={el => cardsRef.current[index] = el}
                                        className="group hover:bg-gray-50/50 transition-all duration-300"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                                    <Truck className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-gray-900 tracking-tight italic uppercase">{vehicle.name}</div>
                                                    <div className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Elite Class Asset</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 font-mono text-xs font-black text-gray-500 tracking-tighter">
                                            {vehicle.license_plate}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center">
                                                <Maximize2 className="h-3 w-3 text-gray-400 mr-2" />
                                                <span className="text-xs font-black text-gray-900">{vehicle.max_capacity?.toLocaleString()} <span className="text-[10px] text-gray-400 ml-0.5">kg</span></span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center">
                                                <Gauge className="h-3 w-3 text-gray-400 mr-2" />
                                                <span className="text-xs font-black text-gray-900">{vehicle.odometer?.toLocaleString()} <span className="text-[10px] text-gray-400 ml-0.5">km</span></span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <StatusBadge status={vehicle.status} />
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                <button
                                                    onClick={() => openEditModal(vehicle)}
                                                    className="p-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(vehicle)}
                                                    className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all shadow-sm"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Elite Enrollment Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xl flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
                    <div className="luxury-card max-w-2xl w-full overflow-hidden rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] border-white/20">
                        <div className="p-10 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                            <div>
                                <h3 className="text-3xl font-black text-gray-900 tracking-tighter italic uppercase leading-none">
                                    {editingVehicle ? 'Update Asset Intelligence' : 'Enroll Elite Asset'}
                                </h3>
                                <p className="text-gray-500 font-bold tracking-[0.2em] text-[10px] uppercase mt-2">Precision Fleet Configuration</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-3 bg-gray-100 rounded-2xl text-gray-400 hover:text-gray-940 hover:bg-gray-200 transition-all">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-10 space-y-8 bg-white/80">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Asset Nomenclature</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300"
                                        placeholder="e.g. Scania G450 Highline"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Registry Identifier (License)</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-6 py-4 text-sm font-black tracking-widest focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300 font-mono"
                                        placeholder="MH-12-PQ-4567"
                                        value={formData.license_plate}
                                        onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Operational Capacity (kg)</label>
                                    <div className="relative">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 p-1.5 bg-amber-50 rounded-lg"><Maximize2 className="h-3.5 w-3.5 text-amber-600" /></div>
                                        <input
                                            type="number"
                                            required
                                            className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl pl-16 pr-6 py-4 text-sm font-bold focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all"
                                            placeholder="Specify payload limit..."
                                            value={formData.max_capacity}
                                            onChange={(e) => setFormData({ ...formData, max_capacity: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Deployment Odometer (km)</label>
                                    <div className="relative">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 p-1.5 bg-blue-50 rounded-lg"><Gauge className="h-3.5 w-3.5 text-blue-600" /></div>
                                        <input
                                            type="number"
                                            className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl pl-16 pr-6 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-mono"
                                            placeholder="Current metrics..."
                                            value={formData.odometer}
                                            onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            {editingVehicle && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Deployment Status</label>
                                    <select
                                        className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all cursor-pointer"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="Available">🟢 Available for Dispatch</option>
                                        <option value="On Trip">🔵 Currently Deployed</option>
                                        <option value="In Shop">🔴 Maintenance Required</option>
                                        <option value="Retired">⚪ Retired from Active Duty</option>
                                    </select>
                                </div>
                            )}
                            <div className="pt-6 flex space-x-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-8 py-5 bg-gray-100 text-gray-940 rounded-3xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all">Abort</button>
                                <button type="submit" disabled={submitting} className="flex-1 px-8 py-5 bg-gray-900 text-white rounded-3xl text-xs font-black uppercase tracking-widest hover:bg-black hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-blue-500/30 transition-all disabled:opacity-50">
                                    {submitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto text-white" /> : editingVehicle ? 'Commit Changes' : 'Confirm Enrollment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VehicleRegistry;
