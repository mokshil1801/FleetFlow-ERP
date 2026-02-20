import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { mockVehicles, mockDrivers, mockTrips, mockMaintenanceLogs, mockFuelLogs, mockExpenses } from '../utils/mockData';

const FleetContext = createContext();

export const FleetProvider = ({ children }) => {
    const [vehicles, setVehicles] = useState(mockVehicles);
    const [drivers, setDrivers] = useState(mockDrivers);
    const [trips, setTrips] = useState(mockTrips);
    const [maintenanceLogs, setMaintenanceLogs] = useState(mockMaintenanceLogs);
    const [fuelLogs, setFuelLogs] = useState(mockFuelLogs);
    const [expenses, setExpenses] = useState(mockExpenses);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ── Mock Initial Fetch (Simulation) ──────────────────────────
    const refetchAll = useCallback(async () => {
        setLoading(true);
        // Simulate network delay
        setTimeout(() => {
            setLoading(false);
        }, 1000); // 1 second delay to see skeletons
    }, []);

    useEffect(() => {
        refetchAll();
    }, [refetchAll]);

    // ── Vehicle CRUD ────────────────────────────────────────────
    const addVehicle = async (vehicleData) => {
        const newVehicle = { ...vehicleData, id: uuidv4() };
        setVehicles(prev => [...prev, newVehicle]);
        return newVehicle;
    };

    const updateVehicle = async (id, vehicleData) => {
        setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...vehicleData } : v));
        return { success: true };
    };

    const deleteVehicle = async (id) => {
        setVehicles(prev => prev.filter(v => v.id !== id));
        return { success: true };
    };

    const updateVehicleStatus = async (id, status) => {
        setVehicles(prev => prev.map(v => v.id === id ? { ...v, status } : v));
        return { success: true };
    };

    // ── Driver CRUD ─────────────────────────────────────────────
    const addDriver = async (driverData) => {
        const newDriver = { ...driverData, id: uuidv4() };
        setDrivers(prev => [...prev, newDriver]);
        return newDriver;
    };

    const updateDriver = async (id, driverData) => {
        setDrivers(prev => prev.map(d => d.id === id ? { ...d, ...driverData } : d));
        return { success: true };
    };

    // ── Trip lifecycle ──────────────────────────────────────────
    const createTrip = async (tripData) => {
        const newTrip = { ...tripData, id: 'T-' + Math.floor(Math.random() * 10000), status: 'Draft' };
        setTrips(prev => [...prev, newTrip]);
        return newTrip;
    };

    const dispatchTrip = async (tripId) => {
        setTrips(prev => prev.map(t => {
            if (t.id === tripId) {
                // Also update vehicle and driver status
                updateVehicleStatus(t.vehicle_id, 'On Trip');
                setDrivers(dPrev => dPrev.map(d => d.id === t.driver_id ? { ...d, status: 'On Duty' } : d));
                return { ...t, status: 'Dispatched' };
            }
            return t;
        }));
        return { success: true };
    };

    const completeTrip = async (tripId, endOdometer) => {
        setTrips(prev => prev.map(t => {
            if (t.id === tripId) {
                updateVehicle(t.vehicle_id, { status: 'Available', odometer: endOdometer });
                setDrivers(dPrev => dPrev.map(d => d.id === t.driver_id ? { ...d, status: 'Off Duty' } : d));
                return { ...t, status: 'Completed' };
            }
            return t;
        }));
        return { success: true };
    };

    const cancelTrip = async (tripId) => {
        setTrips(prev => prev.map(t => t.id === tripId ? { ...t, status: 'Cancelled' } : t));
        return { success: true };
    };

    // ── Maintenance ─────────────────────────────────────────────
    const addMaintenanceLog = async (logData) => {
        const newLog = { ...logData, id: uuidv4(), date: new Date().toISOString().split('T')[0] };
        setMaintenanceLogs(prev => [...prev, newLog]);
        updateVehicleStatus(logData.vehicle_id, 'In Shop');
        return newLog;
    };

    // ── Fuel & Expenses ─────────────────────────────────────────
    const addFuelLog = async (fuelData) => {
        const newLog = { ...fuelData, id: uuidv4(), date: new Date().toISOString().split('T')[0] };
        setFuelLogs(prev => [...prev, newLog]);
        return newLog;
    };

    const addExpense = async (expenseData) => {
        const newLog = { ...expenseData, id: uuidv4(), date: new Date().toISOString().split('T')[0] };
        setExpenses(prev => [...prev, newLog]);
        return newLog;
    };

    return (
        <FleetContext.Provider value={{
            // Data
            vehicles,
            drivers,
            trips,
            maintenanceLogs,
            fuelLogs,
            expenses,
            loading,
            error,

            // Vehicle ops
            addVehicle,
            updateVehicle,
            deleteVehicle,
            updateVehicleStatus,

            // Driver ops
            addDriver,
            updateDriver,

            // Trip ops
            createTrip,
            dispatchTrip,
            completeTrip,
            cancelTrip,

            // Maintenance ops
            addMaintenanceLog,

            // Financial ops
            addFuelLog,
            addExpense,

            // Utility
            refetchAll,
        }}>
            {children}
        </FleetContext.Provider>
    );
};

export const useFleet = () => useContext(FleetContext);
