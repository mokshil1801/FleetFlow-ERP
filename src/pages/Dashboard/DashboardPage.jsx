import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Chart from 'react-apexcharts';
import { Truck, AlertTriangle, BarChart3, Package, ArrowUpRight, ArrowDownRight, Loader2, Download } from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import Skeleton from '../../components/Skeleton';
import { generateDashboardPDF, generateStructuredPDF } from '../../utils/exportEngine';
import { useToast } from '../../context/ToastContext';

const KpiCard = ({ title, value, icon: Icon, trend, trendValue, color }) => (
    <div className="luxury-card p-6 group">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-2xl shadow-lg ${color} bg-opacity-90 transform group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
            {trend && (
                <div className={`flex items-center px-2 py-1 rounded-full text-xs font-bold ${trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {trend === 'up' ? <ArrowUpRight className="h-3.5 w-3.5 mr-1" /> : <ArrowDownRight className="h-3.5 w-3.5 mr-1" />}
                    {trendValue}
                </div>
            )}
        </div>
        <h3 className="text-gray-400 text-sm font-semibold tracking-wide uppercase">{title}</h3>
        <p className="text-3xl font-extrabold text-gray-900 mt-2 tracking-tight">{value}</p>
    </div>
);

const DashboardPage = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { vehicles, trips, drivers, loading: fleetLoading } = useFleet();
    const [exporting, setExporting] = useState(false);
    const analytics = null;
    const analyticsLoading = false;

    const isLoading = fleetLoading || analyticsLoading;

    // Derived KPIs
    const activeFleet = analytics?.on_trip_vehicles ?? vehicles.filter(v => v.status === 'On Trip').length;
    const maintenanceAlerts = analytics?.in_shop_vehicles ?? vehicles.filter(v => v.status === 'In Shop').length;
    const totalVehicles = analytics?.total_vehicles ?? vehicles.length;
    const utilizationRate = totalVehicles > 0 ? Math.round((activeFleet / totalVehicles) * 100) : 0;
    const pendingCargo = trips.filter(t => t.status === 'Draft').length;

    const chartOptions = {
        chart: {
            id: 'status-pie',
            toolbar: { show: false },
            animations: { enabled: true, easing: 'easeinout', speed: 1000 },
            sparkline: { enabled: false }
        },
        labels: ['Available', 'On Trip', 'In Shop', 'Retired'],
        colors: ['#10B981', '#3B82F6', '#F43F5E', '#94A3B8'],
        legend: { show: false },
        stroke: { show: true, width: 2, colors: ['#ffffff'] }, // Restore subtle gaps for better definition
        plotOptions: {
            pie: {
                expandOnClick: true,
                donut: {
                    size: '80%',
                    labels: {
                        show: true,
                        name: { show: true, fontSize: '11px', fontWeight: 700, color: '#94A3B8', offsetY: -12 },
                        value: { show: true, fontSize: '26px', fontWeight: 800, color: '#0f172a', offsetY: 8 },
                        total: {
                            show: true,
                            label: 'TOTAL ASSETS',
                            fontSize: '9px',
                            fontWeight: 800,
                            color: '#94A3B8',
                            formatter: () => totalVehicles
                        }
                    }
                }
            }
        },
        dataLabels: { enabled: false },
        padding: { top: 20, bottom: 20, left: 10, right: 10 }
    };

    const chartSeries = [
        analytics?.available_vehicles ?? vehicles.filter(v => v.status === 'Available').length,
        activeFleet,
        maintenanceAlerts,
        vehicles.filter(v => v.status === 'Retired').length
    ];

    const areaChartOptions = {
        chart: {
            id: 'performance-area',
            toolbar: { show: false },
            sparkline: { enabled: false },
            zoom: { enabled: false },
            dropShadow: { enabled: true, top: 12, left: 0, blur: 5, opacity: 0.1 },
            padding: { left: 10, right: 10, top: 0, bottom: 0 }
        },
        colors: ['#3B82F6'],
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.5,
                opacityTo: 0.05,
                stops: [0, 95]
            }
        },
        stroke: { curve: 'smooth', width: 4, lineCap: 'round', connectNulls: true },
        grid: {
            show: true,
            borderColor: '#f1f5f9',
            strokeDashArray: 4,
            xaxis: { lines: { show: false } },
            yaxis: { lines: { show: true } },
            padding: { top: 10, right: 20, bottom: 10, left: 10 }
        },
        xaxis: {
            categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: { style: { colors: '#94A3B8', fontWeight: 700, fontSize: '11px' }, offsetY: 5 },
            crosshairs: { show: true, stroke: { color: '#3B82F6', width: 1, dashArray: 4 } }
        },
        yaxis: {
            labels: { style: { colors: '#94A3B8', fontWeight: 700, fontSize: '11px' } },
            min: 0,
            forceNiceScale: true
        },
        dataLabels: { enabled: false },
        markers: { size: 0, hover: { size: 6, sizeOffset: 3 } },
        tooltip: { theme: 'light', x: { show: false }, y: { formatter: (val) => `${val} Trips` } }
    };

    const radialChartOptions = {
        chart: { type: 'radialBar', sparkline: { enabled: true }, offsetY: -10 },
        plotOptions: {
            radialBar: {
                startAngle: -135,
                endAngle: 135,
                hollow: { size: '65%', margin: 15, background: 'transparent' },
                track: { background: "#f8fafc", strokeWidth: '100%', margin: 15 },
                dataLabels: {
                    name: { offsetY: -10, color: "#94A3B8", fontSize: "11px", fontWeight: 800 },
                    value: { offsetY: 5, color: "#0f172a", fontSize: "32px", fontWeight: 800, show: true }
                }
            }
        },
        fill: {
            type: 'gradient',
            gradient: { shade: 'dark', type: 'horizontal', gradientToColors: ['#6366f1'], stops: [0, 100] }
        },
        stroke: { lineCap: 'round' },
        labels: ['CAPACITY']
    };

    const areaChartSeries = [{
        name: 'Weekly Trips',
        data: [12, 18, 15, 25, 22, 30, 28] // Mocked for visual impact
    }];

    if (isLoading) {
        return (
            <div className="space-y-8 animate-in fade-in duration-700">
                <div className="flex items-center justify-between">
                    <div className="space-y-3">
                        <Skeleton width="240px" height="40px" />
                        <Skeleton width="340px" height="20px" />
                    </div>
                    <div className="flex space-x-4">
                        <Skeleton width="120px" height="48px" />
                        <Skeleton width="160px" height="48px" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="luxury-card p-8">
                            <Skeleton circle width="52px" height="52px" className="mb-6" />
                            <Skeleton width="70%" height="18px" className="mb-3" />
                            <Skeleton width="50%" height="32px" />
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 luxury-card p-8 h-[400px]">
                        <Skeleton width="180px" height="28px" className="mb-6" />
                        <Skeleton width="100%" height="300px" />
                    </div>
                    <div className="luxury-card p-8 h-[400px]">
                        <Skeleton width="180px" height="28px" className="mb-6" />
                        <Skeleton circle width="220px" height="220px" className="mx-auto mt-8" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div id="executive-dashboard-content" className="relative space-y-10 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 overflow-hidden">
            {/* Background SVG Decor */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-30">
                <svg className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] blur-[120px] fill-blue-500/10">
                    <circle cx="50%" cy="50%" r="30%" />
                </svg>
                <svg className="absolute bottom-[-10%] left-[-5%] w-[60%] h-[60%] blur-[120px] fill-emerald-500/10">
                    <circle cx="50%" cy="50%" r="30%" />
                </svg>
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black lux-gradient-text tracking-tight">Executive Dashboard</h1>
                    <p className="text-gray-500 font-medium tracking-wide">Strategic oversight of your global fleet operations</p>
                </div>
                <div className="flex items-center space-x-3 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
                    <button
                        onClick={async () => {
                            setExporting(true);

                            // Prepare structured data for the report
                            const topDriver = drivers.length > 0 ? [...drivers].sort((a, b) => (b.safety_score || 0) - (a.safety_score || 0))[0] : null;

                            const reportData = {
                                kpis: {
                                    activeFleet,
                                    maintenanceAlerts,
                                    utilizationRate,
                                    pendingCargo
                                },
                                insights: [
                                    {
                                        category: 'Vehicle Status',
                                        text: maintenanceAlerts > 0 ? `Action Needed: ${maintenanceAlerts} vehicles need a check-up soon to avoid breakdowns.` : 'All Good: Every vehicle in your fleet is currently in top shape.'
                                    },
                                    {
                                        category: 'Top Performer',
                                        text: topDriver ? `Safety Hero: ${topDriver.name} is your safest driver this week. Great job!` : 'Safety: Your team is driving carefully and following all rules.'
                                    },
                                    {
                                        category: 'Efficiency',
                                        text: utilizationRate > 80 ? 'Busy Fleet: Your vehicles are being used very efficiently right now.' : 'Room to Grow: You have some vehicles ready and waiting for more work.'
                                    }
                                ],
                                alerts: vehicles.filter(v => v.next_service_odometer && v.next_service_odometer - v.odometer < 2000),
                                analytics: analytics
                            };

                            const result = await generateStructuredPDF(reportData);

                            if (result.success) {
                                addToast('Executive Intelligence Brief generated!', 'success');
                            } else {
                                addToast(`Export Failed: ${result.error || 'Unknown Error'}`, 'error');
                            }
                            setExporting(false);
                        }}
                        disabled={exporting}
                        className="group flex items-center px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-xl shadow-gray-200 transition-all hover:bg-black disabled:opacity-50"
                    >
                        {exporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                        {exporting ? 'Generating...' : 'Export Report'}
                    </button>
                    <button
                        onClick={() => navigate('/analytics')}
                        className="px-5 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold transition-all hover:bg-blue-100"
                    >
                        View Analytics
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <KpiCard title="Active Fleet" value={activeFleet} icon={Truck} trend="up" trendValue="15%" color="bg-blue-600" />
                <KpiCard title="Alerts" value={maintenanceAlerts} icon={AlertTriangle} trend="down" trendValue="4%" color="bg-rose-500" />
                <KpiCard title="Utilization" value={`${utilizationRate}%`} icon={BarChart3} trend="up" trendValue="12%" color="bg-emerald-500" />
                <KpiCard title="Pending" value={pendingCargo} icon={Package} color="bg-orange-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                <div className="luxury-card p-8 flex flex-col h-[480px]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-gray-900">Operational Performance</h3>
                            <p className="text-sm text-gray-400 font-medium">Weekly trip volume analytics</p>
                        </div>
                        <div className="px-4 py-1.5 bg-blue-50 rounded-full">
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Live Metrics</span>
                        </div>
                    </div>
                    <div className="flex-1 min-h-0">
                        <Chart options={areaChartOptions} series={areaChartSeries} type="area" height="100%" />
                    </div>
                </div>

                <div className="luxury-card p-8 flex flex-col h-[480px]">
                    <div className="mb-4">
                        <h3 className="text-xl font-black text-gray-900">Fleet Efficiency</h3>
                        <p className="text-sm text-gray-400 font-medium">Asset distribution & state</p>
                    </div>
                    <div className="flex-1 flex items-center justify-center min-h-0">
                        <Chart options={chartOptions} series={chartSeries} type="donut" height={360} />
                    </div>
                </div>
            </div>

            {/* Priority Alerts Feed */}
            <div className="luxury-card p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-black text-gray-900">Priority Alerts</h3>
                        <p className="text-sm text-gray-400 font-medium tracking-wide">Critical operational triggers requiring oversight</p>
                    </div>
                    <AlertTriangle className="h-6 w-6 text-rose-500 animate-pulse" />
                </div>

                <div className="space-y-4">
                    {vehicles.filter(v => v.next_service_odometer && v.next_service_odometer - v.odometer < 2000).length > 0 ? (
                        vehicles
                            .filter(v => v.next_service_odometer && v.next_service_odometer - v.odometer < 2000)
                            .slice(0, 3)
                            .map(v => (
                                <div key={v.id} className="flex items-center justify-between p-5 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all group">
                                    <div className="flex items-center">
                                        <div className={`p-3 rounded-xl mr-4 ${v.next_service_odometer - v.odometer < 500 ? 'bg-rose-100' : 'bg-amber-100'}`}>
                                            <AlertTriangle className={`h-5 w-5 ${v.next_service_odometer - v.odometer < 500 ? 'text-rose-600' : 'text-amber-600'}`} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-900 uppercase italic tracking-tight">{v.name}</p>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                                                Maintenance Due: <span className="text-gray-900">{v.next_service_odometer - v.odometer} km remaining</span>
                                            </p>
                                        </div>
                                    </div>
                                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all">
                                        Action Required
                                    </button>
                                </div>
                            ))
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No active alerts. Fleet health is optimal.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Cost Summary */}
            {analytics && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Fuel Cost</h4>
                        <p className="text-2xl font-black text-gray-900">${analytics.total_fuel_cost?.toLocaleString() ?? '0'}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Maintenance Cost</h4>
                        <p className="text-2xl font-black text-gray-900">${analytics.total_maintenance_cost?.toLocaleString() ?? '0'}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Avg. Fuel Efficiency</h4>
                        <p className="text-2xl font-black text-gray-900">{analytics.avg_fuel_efficiency ? `${analytics.avg_fuel_efficiency} km/L` : 'N/A'}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
