import { v4 as uuidv4 } from 'uuid';

export const mockVehicles = [
    { id: uuidv4(), name: 'Tata Prima G.35 K', license_plate: 'MH-12-PQ-4567', max_capacity: 35000, odometer: 125000, status: 'Available', revenue: 450000, acquisition_cost: 3200000, next_service_odometer: 130000 },
    { id: uuidv4(), name: 'Ashok Leyland Captain', license_plate: 'KA-01-RS-8901', max_capacity: 25000, odometer: 45000, status: 'On Trip', revenue: 210000, acquisition_cost: 2800000, next_service_odometer: 48000 },
    { id: uuidv4(), name: 'BharatBenz 3523R', license_plate: 'TN-07-TU-2345', max_capacity: 28000, odometer: 89000, status: 'In Shop', revenue: 380000, acquisition_cost: 3500000, next_service_odometer: 90000 },
    { id: uuidv4(), name: 'Mahindra Blazo X 49', license_plate: 'DL-01-VW-6789', max_capacity: 49000, odometer: 210000, status: 'Available', revenue: 620000, acquisition_cost: 4200000, next_service_odometer: 212000 },
    { id: uuidv4(), name: 'Eicher Pro 6028', license_plate: 'GJ-05-AB-1234', max_capacity: 28000, odometer: 67000, status: 'On Trip', revenue: 155000, acquisition_cost: 2600000, next_service_odometer: 75000 },
    { id: uuidv4(), name: 'Scania R 500', license_plate: 'TS-09-CD-5678', max_capacity: 40000, odometer: 12000, status: 'Available', revenue: 45000, acquisition_cost: 5500000, next_service_odometer: 20000 },
];

export const mockDrivers = [
    { id: uuidv4(), name: 'Arjun Sharma', license_expiry: '2026-12-31', safety_score: 95, trip_completion_rate: 98, status: 'Off Duty' },
    { id: uuidv4(), name: 'Priya Patel', license_expiry: '2025-05-15', safety_score: 92, trip_completion_rate: 94, status: 'On Duty' },
    { id: uuidv4(), name: 'Rajesh Kumar', license_expiry: '2027-08-20', safety_score: 75, trip_completion_rate: 85, status: 'Suspended' },
    { id: uuidv4(), name: 'Sunita Rao', license_expiry: '2026-03-10', safety_score: 98, trip_completion_rate: 99, status: 'On Duty' },
    { id: uuidv4(), name: 'Vikram Singh', license_expiry: '2024-11-25', safety_score: 88, trip_completion_rate: 90, status: 'Off Duty' },
    { id: uuidv4(), name: 'Ananya Gupta', license_expiry: '2025-09-12', safety_score: 85, trip_completion_rate: 92, status: 'Off Duty' },
];

export const mockTrips = [
    { id: 'T-9001', vehicle_id: mockVehicles[1].id, driver_id: mockDrivers[1].id, cargo_weight: 18000, status: 'Dispatched' },
    { id: 'T-9002', vehicle_id: mockVehicles[4].id, driver_id: mockDrivers[3].id, cargo_weight: 22000, status: 'Dispatched' },
    { id: 'T-9003', vehicle_id: mockVehicles[0].id, driver_id: mockDrivers[0].id, cargo_weight: 30000, status: 'Draft' },
    { id: 'T-9004', vehicle_id: mockVehicles[3].id, driver_id: mockDrivers[4].id, cargo_weight: 45000, status: 'Draft' },
];
export const mockMaintenanceLogs = [
    { id: uuidv4(), vehicle_id: mockVehicles[2].id, service_type: 'Brake Pad Replacement', cost: 12500, date: '2026-02-15', status: 'Completed' },
    { id: uuidv4(), vehicle_id: mockVehicles[0].id, service_type: 'Oil Change', cost: 4500, date: '2026-02-10', status: 'Completed' },
];

export const mockFuelLogs = [
    { id: uuidv4(), vehicle_id: mockVehicles[1].id, type: 'Fuel', amount: 8500, liters: 75, date: '2026-02-20' },
    { id: uuidv4(), vehicle_id: mockVehicles[4].id, type: 'Fuel', amount: 12000, liters: 110, date: '2026-02-19' },
];

export const mockExpenses = [
    { id: uuidv4(), vehicle_id: mockVehicles[0].id, type: 'Other', amount: 2500, date: '2026-02-18', note: 'Toll Fees' },
];
