import React, { useState, useEffect, useRef } from 'react';
import Chart from 'react-apexcharts';
import { useFleet } from '../../context/FleetContext';
import Skeleton from '../../components/Skeleton';
import { Loader2, Truck, Users, MapPin, DollarSign, Activity, Zap, TrendingUp, Award, ShieldCheck } from 'lucide-react';
import gsap from 'gsap';

const AnalyticsPage = () => {
    const { vehicles, drivers, trips, loading: fleetLoading } = useFleet();
    const [loading, setLoading] = useState(true);
    const containerRef = useRef(null);
    const kpiRef = useRef([]);
    const chartsRef = useRef([]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!loading && !fleetLoading) {
            gsap.fromTo(kpiRef.current,
                { opacity: 0, y: 30, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" }
            );
            gsap.fromTo(chartsRef.current,
                { opacity: 0, scale: 0.98, filter: "blur(10px)" },
                { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1, stagger: 0.2, ease: "expo.out", delay: 0.4 }
            );
        }
    }, [loading, fleetLoading]);

    if (fleetLoading || loading) {
        return (
            <div className="space-y-10 pb-10">
                <div className="flex flex-col gap-4">
                    <Skeleton width="400px" height="48px" />
                    <Skeleton width="300px" height="24px" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} height="120px" className="rounded-3xl" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} height="400px" className="rounded-[2.5rem]" />)}
                </div>
            </div>
        );
    }

    // Strategic Data Aggregation
    const activeVehicles = vehicles.filter(v => v.status === 'On Trip').length;
    const maintenanceVehicles = vehicles.filter(v => v.status === 'In Shop').length;
    const totalMileage = vehicles.reduce((sum, v) => sum + (v.odometer || 0), 0);
    const totalRevenue = trips.filter(t => t.status === 'Completed').length * 45000; // Mock ROI logic
    const avgFuelEfficiency = 14.5; // Mock data for KM/L

    // High-Impact Chart Options
    const utilizationOptions = {
        chart: {
            type: 'donut',
            background: 'transparent',
            animations: { enabled: true, easing: 'easeinout', speed: 1000 }
        },
        labels: ['Operational', 'Mission Active', 'Technical Shop', 'Standby'],
        colors: ['#10B981', '#3B82F6', '#F43F5E', '#94A3B8'],
        stroke: { show: false },
        legend: { position: 'bottom', fontSize: '12px', fontWeight: 900, fontFamily: 'Public Sans', labels: { colors: '#64748b' } },
        dataLabels: { enabled: false },
        plotOptions: {
            pie: {
                donut: {
                    size: '75%',
                    labels: {
                        show: true,
                        total: { show: true, label: 'TOTAL ASSETS', fontSize: '10px', fontWeight: 900, color: '#94a3b8' },
                        value: { fontSize: '24px', fontWeight: 900, color: '#0f172a' }
                    }
                }
            }
        },
    };

    const utilizationSeries = [
        vehicles.filter(v => v.status === 'Available').length,
        activeVehicles,
        maintenanceVehicles,
        vehicles.filter(v => v.status === 'Retired').length,
    ];

    const timelineOptions = {
        chart: { type: 'area', toolbar: { show: false }, sparkline: { enabled: false } },
        stroke: { curve: 'smooth', width: 4 },
        fill: {
            type: 'gradient',
            gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05, stops: [20, 100] }
        },
        xaxis: { categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], labels: { style: { colors: '#94a3b8', fontWeight: 600 } } },
        yaxis: { labels: { style: { colors: '#94a3b8', fontWeight: 600 } } },
        colors: ['#3B82F6'],
        grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
        dataLabels: { enabled: false }
    };

    const timelineSeries = [{
        name: 'Mission Revenue',
        data: [310000, 400000, 280000, 510000, 420000, 109000, 100000]
    }];

    const efficiencyOptions = {
        chart: { type: 'radialBar' },
        plotOptions: {
            radialBar: {
                startAngle: -135,
                endAngle: 135,
                hollow: { size: '65%' },
                track: { background: '#f1f5f9', strokeWidth: '97%' },
                dataLabels: {
                    name: { fontSize: '10px', color: '#94a3b8', offsetY: -10, fontWeight: 900 },
                    value: { offsetY: 5, fontSize: '22px', fontWeight: 900, color: '#0f172a', formatter: (val) => `${val}` },
                }
            }
        },
        fill: {
            type: 'gradient',
            gradient: { shade: 'dark', type: 'horizontal', gradientToColors: ['#3B82F6'], stops: [0, 100] }
        },
        stroke: { lineCap: 'round' },
        labels: ['FUEL EFFICIENCY (KM/L)'],
    };

    return (
        <div ref={containerRef} className="relative space-y-10 pb-10 animate-in fade-in duration-1000 overflow-hidden">
            {/* Background SVG Decor */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-30">
                <svg className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] blur-[120px] fill-blue-500/10">
                    <circle cx="50%" cy="50%" r="30%" />
                </svg>
                <svg className="absolute bottom-[-10%] left-[-5%] w-[60%] h-[60%] blur-[120px] fill-purple-500/10">
                    <circle cx="50%" cy="50%" r="30%" />
                </svg>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black lux-gradient-text tracking-tight italic uppercase">Operational Intelligence</h1>
                    <p className="text-gray-500 font-medium tracking-wide">High-precision fleet metrics & predictive performance synthesis</p>
                </div>
            </div>

            {/* Strategic KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                {[
                    { label: 'Cumulative Revenue', value: `₹${(totalRevenue / 100000).toFixed(1)}L`, icon: DollarSign, color: 'emerald' },
                    { label: 'Active Deployment', value: `${((activeVehicles / vehicles.length) * 100).toFixed(0)}%`, icon: Zap, color: 'blue' },
                    { label: 'Strategic Ops', value: trips.length, icon: Activity, color: 'purple' },
                    { label: 'Fleet Velocity', value: `${(totalMileage / 1000).toFixed(0)}K`, icon: TrendingUp, color: 'orange' },
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
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                            <p className="text-2xl font-black text-gray-900 italic tracking-tighter">{kpi.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Intelligence Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                <div ref={el => chartsRef.current[0] = el} className="luxury-card p-8 bg-gradient-to-br from-white to-gray-50/50 relative overflow-hidden">
                    <div className="absolute bottom-0 right-0 w-48 h-48 -mr-24 -mb-24 opacity-5 pointer-events-none">
                        <svg viewBox="0 0 100 100" className="fill-blue-600">
                            <circle cx="50" cy="50" r="50" />
                        </svg>
                    </div>
                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <div>
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Resource Allocation</p>
                            <h3 className="text-xl font-black text-gray-900 italic uppercase">Asset Utilization Portfolio</h3>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-xl"><Truck className="h-5 w-5 text-blue-600" /></div>
                    </div>
                    <div className="relative z-10">
                        <Chart options={utilizationOptions} series={utilizationSeries} type="donut" height={340} />
                    </div>
                </div>

                <div ref={el => chartsRef.current[1] = el} className="luxury-card p-8 bg-gradient-to-br from-white to-gray-50/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 -mr-32 -mt-32 opacity-[0.03] pointer-events-none rotate-45">
                        <svg viewBox="0 0 100 100" className="fill-emerald-600">
                            <rect width="100" height="100" />
                        </svg>
                    </div>
                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <div>
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Fiscal Trajectory</p>
                            <h3 className="text-xl font-black text-gray-900 italic uppercase">Mission Portfolio Yield</h3>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-xl"><TrendingUp className="h-5 w-5 text-emerald-600" /></div>
                    </div>
                    <div className="relative z-10">
                        <Chart options={timelineOptions} series={timelineSeries} type="area" height={300} />
                    </div>
                </div>
            </div>

            {/* Performance Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                <div ref={el => chartsRef.current[2] = el} className="luxury-card p-8 col-span-1 relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.02] pointer-events-none">
                        <svg viewBox="0 0 100 100" className="fill-orange-600">
                            <path d="M50 0 A50 50 0 0 1 100 50 L50 50 Z" />
                        </svg>
                    </div>
                    <div className="mb-8 relative z-10">
                        <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">Efficiency Metric</p>
                        <h3 className="text-xl font-black text-gray-900 italic uppercase">Fuel Economy Engine</h3>
                    </div>
                    <div className="relative z-10">
                        <Chart options={efficiencyOptions} series={[74]} type="radialBar" height={320} />
                    </div>
                    <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 italic text-[10px] font-bold text-gray-500 text-center uppercase tracking-widest relative z-10">
                        System Optimizing: High efficiency maintained across target fleet
                    </div>
                </div>

                <div ref={el => chartsRef.current[3] = el} className="luxury-card p-8 col-span-1 lg:col-span-2 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-[0.01] pointer-events-none">
                        <svg width="100%" height="100%">
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                            </pattern>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                    </div>
                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <div>
                            <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1">Operator Prestige</p>
                            <h3 className="text-xl font-black text-gray-900 italic uppercase">Executive Safety Leaderboard</h3>
                        </div>
                        <Award className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="space-y-4 relative z-10">
                        {[...drivers].sort((a, b) => (b.safety_score || 0) - (a.safety_score || 0)).slice(0, 4).map((driver, idx) => (
                            <div key={driver.id} className="group relative flex items-center justify-between p-5 bg-white border border-gray-100 rounded-[2rem] hover:shadow-xl hover:border-purple-100 transition-all cursor-default">
                                <div className="flex items-center">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-5 text-lg font-black italic transition-transform group-hover:scale-110 ${idx === 0 ? 'bg-yellow-400 text-yellow-900 shadow-[0_10px_20px_-5px_rgba(250,204,21,0.5)]' : idx === 1 ? 'bg-gray-200 text-gray-600' : 'bg-orange-100 text-orange-700'}`}>
                                        #{idx + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-gray-900 uppercase tracking-tight italic">{driver.name}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Strategic Operative</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-8">
                                    <div className="text-right">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Safety Index</p>
                                        <div className="flex items-center justify-end text-emerald-600 font-black italic text-lg tracking-tighter">
                                            <ShieldCheck className="h-4 w-4 mr-2" />
                                            {driver.safety_score}
                                        </div>
                                    </div>
                                    <div className="text-right min-w-[80px]">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Efficiency</p>
                                        <p className="text-lg font-black text-gray-900 tracking-tighter italic">{driver.trip_completion_rate ?? 100}%</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
