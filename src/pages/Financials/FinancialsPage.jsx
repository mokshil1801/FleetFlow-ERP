import React, { useState, useEffect, useRef } from 'react';
import { useFleet } from '../../context/FleetContext';
import Skeleton from '../../components/Skeleton';
import { useToast } from '../../context/ToastContext';
import { Plus, X, Loader2, Fuel, DollarSign, Calendar, Truck, Search, TrendingUp, Activity, PieChart, Wallet, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import gsap from 'gsap';

const StatusBadge = ({ type }) => {
    const colors = {
        'Fuel': 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50',
        'Toll': 'bg-blue-500/10 text-blue-600 border-blue-200/50',
        'Parking': 'bg-indigo-500/10 text-indigo-600 border-indigo-200/50',
        'Insurance': 'bg-purple-500/10 text-purple-600 border-purple-200/50',
        'Fine': 'bg-rose-500/10 text-rose-600 border-rose-200/50',
        'Other': 'bg-gray-500/10 text-gray-600 border-gray-200/50',
    };
    return (
        <span className={`px-3 py-1 rounded-xl border text-[10px] font-black uppercase tracking-widest ${colors[type] || colors.Other}`}>
            {type}
        </span>
    );
};

const FinancialsPage = () => {
    const { vehicles, fuelLogs, expenses, addFuelLog, addExpense, loading: fleetLoading } = useFleet();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('fuel');
    const [showFuelModal, setShowFuelModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const kpiRef = useRef([]);
    const tableRef = useRef(null);
    const rowsRef = useRef([]);

    const [fuelForm, setFuelForm] = useState({
        vehicle_id: '', liters: '', cost: '', date: new Date().toISOString().split('T')[0],
    });
    const [expenseForm, setExpenseForm] = useState({
        vehicle_id: '', type: '', amount: '', date: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!loading && !fleetLoading) {
            gsap.fromTo(kpiRef.current,
                { opacity: 0, y: 30, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" }
            );
            gsap.fromTo(rowsRef.current,
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: "power2.out", delay: 0.5 }
            );
        }
    }, [loading, fleetLoading, activeTab]);

    const getVehicleName = (id) => vehicles.find(v => v.id === id)?.name || `Vehicle #${id}`;

    const totalFuelCost = fuelLogs.reduce((sum, l) => sum + (l.cost || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalLiters = fuelLogs.reduce((sum, l) => sum + (l.liters || 0), 0);

    const handleFuelSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await addFuelLog({
                vehicle_id: parseInt(fuelForm.vehicle_id),
                liters: parseFloat(fuelForm.liters),
                cost: parseFloat(fuelForm.cost),
                date: fuelForm.date,
            });
            addToast('Fuel payload logged successfully.', 'success');
            setShowFuelModal(false);
            setFuelForm({ vehicle_id: '', liters: '', cost: '', date: new Date().toISOString().split('T')[0] });
        } catch (err) {
            addToast(err.response?.data?.detail || 'Fiscal entry failed', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleExpenseSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await addExpense({
                vehicle_id: parseInt(expenseForm.vehicle_id),
                type: expenseForm.type,
                amount: parseFloat(expenseForm.amount),
                date: expenseForm.date,
            });
            addToast('Operational expense authorized.', 'success');
            setShowExpenseModal(false);
            setExpenseForm({ vehicle_id: '', type: '', amount: '', date: new Date().toISOString().split('T')[0] });
        } catch (err) {
            addToast(err.response?.data?.detail || 'Fiscal entry failed', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredFuel = fuelLogs.filter(l =>
        getVehicleName(l.vehicle_id).toLowerCase().includes(searchTerm.toLowerCase())
    );
    const filteredExpenses = expenses.filter(e =>
        getVehicleName(e.vehicle_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.type?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading || fleetLoading) {
        return (
            <div className="space-y-10 pb-10">
                <div className="flex flex-col gap-4">
                    <Skeleton width="400px" height="48px" />
                    <Skeleton width="300px" height="24px" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <Skeleton key={i} height="140px" className="rounded-3xl" />)}
                </div>
                <div className="space-y-6">
                    <Skeleton width="100%" height="500px" className="rounded-[2.5rem]" />
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

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black lux-gradient-text tracking-tight italic uppercase">Fiscal Command Center</h1>
                    <p className="text-gray-500 font-medium tracking-wide">Elite capital deployment & operational yield monitoring</p>
                </div>
                <div className="flex space-x-4">
                    <button
                        onClick={() => setShowFuelModal(true)}
                        className="group relative flex items-center px-6 py-3 bg-white text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl border border-emerald-100 transition-all hover:scale-105 active:scale-95 overflow-hidden"
                    >
                        <Fuel className="h-4 w-4 mr-2" /> Log Fuel
                        <div className="absolute inset-0 bg-emerald-500 opacity-0 group-hover:opacity-5 transition-opacity" />
                    </button>
                    <button
                        onClick={() => setShowExpenseModal(true)}
                        className="group relative flex items-center px-6 py-3 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl transition-all hover:bg-black hover:scale-105 active:scale-95 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <DollarSign className="relative z-10 h-4 w-4 mr-2" />
                        <span className="relative z-10">Authorize Expense</span>
                    </button>
                </div>
            </div>

            {/* Strategic Fiscal KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                {[
                    { label: 'Fuel Capital Deployment', value: `₹${(totalFuelCost / 1000).toFixed(1)}K`, sub: `${totalLiters.toLocaleString()}L Refueled`, icon: Fuel, color: 'emerald', trend: '+12%' },
                    { label: 'Operational Net Burn', value: `₹${(totalExpenses / 1000).toFixed(1)}K`, sub: `${expenses.length} Fiscal Entries`, icon: Wallet, color: 'blue', trend: '-3%' },
                    { label: 'Cumulative Fiscal Load', value: `₹${((totalFuelCost + totalExpenses) / 1000).toFixed(1)}K`, sub: 'Combined Portfolio', icon: TrendingUp, color: 'purple', trend: '+5%' },
                ].map((kpi, idx) => (
                    <div key={idx} ref={el => kpiRef.current[idx] = el} className="luxury-card p-6 flex items-center group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 opacity-10 group-hover:opacity-20 transition-opacity">
                            <svg viewBox="0 0 100 100" className={`fill-${kpi.color}-600`}>
                                <path d="M50 0 L100 50 L50 100 L0 50 Z" />
                            </svg>
                        </div>
                        <div className={`p-4 bg-${kpi.color}-50 rounded-2xl mr-5 group-hover:scale-110 transition-transform relative z-10`}>
                            <kpi.icon className={`h-6 w-6 text-${kpi.color}-600`} />
                        </div>
                        <div className="flex-1 relative z-10">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                                <span className={`text-[10px] font-bold ${kpi.trend.startsWith('+') ? 'text-rose-500' : 'text-emerald-500'}`}>{kpi.trend}</span>
                            </div>
                            <p className="text-2xl font-black text-gray-900 italic tracking-tighter">{kpi.value}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 opacity-60">{kpi.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Interactive Control & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex space-x-1 bg-gray-100/50 backdrop-blur-md p-1.5 rounded-[1.5rem] border border-gray-200/50 w-fit shadow-inner">
                    <button
                        onClick={() => setActiveTab('fuel')}
                        className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-[1.2rem] transition-all ${activeTab === 'fuel' ? 'bg-white text-gray-900 shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Fuel Portfolio ({fuelLogs.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('expenses')}
                        className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-[1.2rem] transition-all ${activeTab === 'expenses' ? 'bg-white text-gray-900 shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Expendiure Ledger ({expenses.length})
                    </button>
                </div>

                <div className="relative group min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search fiscal records..."
                        className="w-full pl-12 pr-6 py-4 bg-white/70 backdrop-blur-md border border-gray-100 rounded-[2rem] text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Luxury Fiscal Ledger */}
            <div className="luxury-card p-2 rounded-[2.5rem] relative z-10 overflow-hidden bg-white/40 backdrop-blur-xl border-white/40">
                <div className="overflow-x-auto">
                    <table className="w-full text-left" ref={tableRef}>
                        <thead>
                            <tr className="border-b border-gray-100/50">
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Strategic Asset</th>
                                {activeTab === 'fuel' ? (
                                    <>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Payload (L)</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction Yield</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Classification</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Capital Amount</th>
                                    </>
                                )}
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fiscal Date</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Reference</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50/50">
                            {(activeTab === 'fuel' ? filteredFuel : filteredExpenses).length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center opacity-20">
                                            <PieChart className="h-16 w-16 mb-4" />
                                            <p className="text-xl font-black italic uppercase tracking-widest">Ledger Balance Zero</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                (activeTab === 'fuel' ? filteredFuel : filteredExpenses).map((log, idx) => (
                                    <tr
                                        key={log.id}
                                        ref={el => rowsRef.current[idx] = el}
                                        className="group hover:bg-white/50 transition-all cursor-default"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center">
                                                <div className="p-3 bg-gray-50 rounded-xl mr-4 group-hover:bg-blue-50 transition-colors">
                                                    <Truck className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                                                </div>
                                                <span className="text-sm font-black text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">{getVehicleName(log.vehicle_id)}</span>
                                            </div>
                                        </td>
                                        {activeTab === 'fuel' ? (
                                            <>
                                                <td className="px-8 py-6 text-center">
                                                    <span className="text-sm font-black italic text-gray-600 bg-gray-100/50 px-3 py-1 rounded-lg">{log.liters.toLocaleString()} L</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center text-emerald-600 font-black italic text-lg tracking-tighter">
                                                        <ArrowUpRight className="h-4 w-4 mr-1 opacity-40" />
                                                        ₹{log.cost?.toLocaleString()}
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-8 py-6"><StatusBadge type={log.type} /></td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center text-rose-600 font-black italic text-lg tracking-tighter">
                                                        <ArrowDownLeft className="h-4 w-4 mr-1 opacity-40" />
                                                        ₹{log.amount?.toLocaleString()}
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                        <td className="px-8 py-6">
                                            <div className="flex items-center text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                                                <Calendar className="h-3 w-3 mr-2 opacity-50" />
                                                {new Date(log.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className="text-[10px] font-black text-gray-300 group-hover:text-gray-900 transition-colors">TR-#{String(log.id).padStart(5, '0')}</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Premium Entry Modals */}
            {[
                {
                    show: showFuelModal,
                    setClose: () => setShowFuelModal(false),
                    title: 'Strategic Fuel Intake',
                    sub: 'Documentation of operational payload',
                    onSubmit: handleFuelSubmit,
                    form: fuelForm,
                    content: (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Asset Allocation</label>
                                <select required className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all cursor-pointer" value={fuelForm.vehicle_id} onChange={(e) => setFuelForm({ ...fuelForm, vehicle_id: e.target.value })}>
                                    <option value="">Select mission asset...</option>
                                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.license_plate})</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fluid Intake (L)</label>
                                    <input type="number" step="0.1" required className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none" placeholder="50.0" value={fuelForm.liters} onChange={(e) => setFuelForm({ ...fuelForm, liters: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Capital Yield (₹)</label>
                                    <input type="number" step="1" required className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none" placeholder="4500" value={fuelForm.cost} onChange={(e) => setFuelForm({ ...fuelForm, cost: e.target.value })} />
                                </div>
                            </div>
                        </div>
                    ),
                    submitText: 'Authorize Fuel Intake',
                    color: 'emerald'
                },
                {
                    show: showExpenseModal,
                    setClose: () => setShowExpenseModal(false),
                    title: 'Operational Expenditure',
                    sub: 'Authorization of fleet capital deployment',
                    onSubmit: handleExpenseSubmit,
                    form: expenseForm,
                    content: (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Asset Attribution</label>
                                <select required className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all cursor-pointer" value={expenseForm.vehicle_id} onChange={(e) => setExpenseForm({ ...expenseForm, vehicle_id: e.target.value })}>
                                    <option value="">Select mission asset...</option>
                                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.license_plate})</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Expense Classification</label>
                                <select required className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all cursor-pointer" value={expenseForm.type} onChange={(e) => setExpenseForm({ ...expenseForm, type: e.target.value })}>
                                    <option value="">Select classification...</option>
                                    <option value="Toll">Strategic Toll</option>
                                    <option value="Parking">Secure Parking</option>
                                    <option value="Insurance">Asset Insurance</option>
                                    <option value="Fine">Regulatory Fine</option>
                                    <option value="Other">Operational Other</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Capital Amount (₹)</label>
                                    <input type="number" step="1" required className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none" placeholder="1250" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fiscal Date</label>
                                    <input type="date" required className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} />
                                </div>
                            </div>
                        </div>
                    ),
                    submitText: 'Commit Expenditure',
                    color: 'blue'
                },
            ].map((modal, i) => modal.show && (
                <div key={i} className="fixed inset-0 bg-gray-900/40 backdrop-blur-xl flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
                    <div className="luxury-card max-w-2xl w-full overflow-hidden rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-white/20">
                        <div className="p-10 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                            <div>
                                <h3 className="text-3xl font-black text-gray-900 tracking-tighter italic uppercase">{modal.title}</h3>
                                <p className="text-gray-500 font-bold tracking-widest text-[10px] uppercase mt-1">{modal.sub}</p>
                            </div>
                            <button onClick={modal.setClose} className="p-3 bg-gray-100 rounded-2xl text-gray-400 hover:text-gray-940 hover:bg-gray-200 transition-all">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={modal.onSubmit} className="p-10 space-y-8 bg-white/80">
                            {modal.content}
                            <div className="pt-6 flex space-x-4">
                                <button type="button" onClick={modal.setClose} className="flex-1 px-8 py-5 bg-gray-100 text-gray-940 rounded-3xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all">Abort</button>
                                <button type="submit" disabled={submitting} className={`flex-1 px-8 py-5 bg-gray-900 text-white rounded-3xl text-xs font-black uppercase tracking-widest hover:bg-black hover:scale-[1.02] active:scale-[0.98] shadow-2xl transition-all disabled:opacity-50`}>
                                    {submitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto text-white" /> : modal.submitText}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FinancialsPage;
