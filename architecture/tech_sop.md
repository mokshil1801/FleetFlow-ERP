# SOP: Technical Architecture (FleetFlow)

## Component Tree
- `App.js` (Router + Layout Wrapper)
    - `Sidebar` (Navigation)
    - `Navbar` (Search, User Role, Profile)
    - `MainContent`
        - `Dashboard` (KPI Cards + Charts)
        - `VehicleRegistry` (CRUD Table + Modals)
        - `TripDispatcher` (Workflow Forms)
        - `MaintenanceLogs` (Service Health)
        - `DriverCenter` (Compliance + Performance)
        - `Financials` (Fuel + Expense Tracking)
        - `Analytics` (Advanced Reporting)

## State Management
- Use `React Context API` for Role Management and Global Notifications (Toasts).
- Use `Axios` interceptors for role-based API security.
- Local state (Hooks) for form validations and modal toggles.

## UI Components
- `DataTable.js`: Reusable table with sorting/filtering.
- `KpiCard.js`: Large metrics display with trend indicators.
- `StatusPill.js`: Color-coded status labels based on `gemini.md` rules.
- `ValidationBanner.js`: Real-time error alerting for rule violations.

## Rule Enforcement Logic
- Centralize logic in `utils/validators.js` to ensure the same rules apply both in UI validation and API pre-checks.
