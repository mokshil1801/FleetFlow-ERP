# FleetFlow Project Constitution (gemini.md)

## Data Schemas

### Vehicle
```json
{
  "id": "uuid",
  "name": "string",
  "license_plate": "string (unique)",
  "max_capacity": "number",
  "odometer": "number",
  "status": "Available | On Trip | In Shop | Retired"
}
```

### Driver
```json
{
  "id": "uuid",
  "name": "string",
  "license_expiry": "date",
  "safety_score": "number (0-100)",
  "trip_completion_rate": "number (%)",
  "status": "On Duty | Off Duty | Suspended"
}
```

### Trip
```json
{
  "id": "uuid",
  "vehicle_id": "uuid",
  "driver_id": "uuid",
  "cargo_weight": "number",
  "status": "Draft | Dispatched | Completed | Cancelled"
}
```

### Maintenance Log
```json
{
  "id": "uuid",
  "vehicle_id": "uuid",
  "service_type": "string",
  "cost": "number",
  "date": "date",
  "status": "Scheduled | In Progress | Completed"
}
```

### Financial Log (Fuel/Expenses)
```json
{
  "id": "uuid",
  "vehicle_id": "uuid",
  "type": "Fuel | Maintenance | Other",
  "amount": "number",
  "liters": "number (if fuel)",
  "date": "date"
}
```

### User
```json
{
  "id": "uuid",
  "email": "string (unique)",
  "password_hash": "string",
  "name": "string",
  "role": "Manager | Dispatcher | Safety | Analyst",
  "status": "Active | Inactive | Locked",
  "last_login": "date",
  "created_at": "date"
}
```

### Audit Log
```json
{
  "id": "uuid",
  "user_id": "uuid (nullable)",
  "event": "Login | Registration | Logout | Failed Login | Password Reset",
  "status": "Success | Failure",
  "ip_address": "string",
  "user_agent": "string",
  "timestamp": "date"
}
```

## Behavioral Rules

1. **Capacity Guard:** `Trip.cargo_weight` > `Vehicle.max_capacity` -> Block Dispatch + Red Banner.
2. **License Guard:** `Driver.license_expiry` < `Today` -> Block Assignment + Red Badge.
3. **Maintenance Hook:**
    - Adding `Maintenance Log` -> Set `Vehicle.status` = `In Shop`.
    - `In Shop` vehicles must be HIDDEN/DISABLED in Trip Creation.
4. **Dispatch Lifecycle:**
    - `Trip.status` -> `Dispatched`:
        - `Vehicle.status` = `On Trip`.
        - `Driver.status` = `On Duty`.
    - `Trip.status` -> `Completed`:
        - Prompt for `Odometer` update.
        - `Vehicle.status` = `Available`.
        - `Driver.status` = `Off Duty` (or Available).
5. **RBAC Rules:**
    - `Manager`: CRUD All, Full Analytics, Audit Log Access.
    - `Dispatcher`: Trip + Vehicle Management.
    - `Safety Officer`: Driver + Compliance views.
    - `Financial Analyst`: Analytics + Expense logging.
6. **Auth Sovereignty:**
    - Every Auth event (Login/Failure/Register) MUST generate an `Audit Log` entry.
    - Passwords MUST be hashed with `bcrypt` (Salted).
    - Session JWTs MUST expire in 24h.

## Architectural Invariants
- Frontend: React.js + Tailwind + Axios.
- Backend: FastAPI + SQLAlchemy + PostgreSQL.
- Visualization: ReactCharts + ApexCharts.
- UI Design: Luxury ERP (Glassmorphism & Satin Depth).

## Maintenance Log
- 2026-02-20: Initialized Constitution.
- 2026-02-20: Expanded Schemas for all pages (Fuel, Expenses, Maintenance, Analytics).
- 2026-02-21: Integrated Multi-Entity Auth & Audit Log definitions.
