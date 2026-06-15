# Healthcare Appointment Portal

A full-stack healthcare appointment management system built with React + Vite (frontend) and Node.js + Express (backend).

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, React Router, Recharts, Lucide Icons
- **Backend**: Node.js, Express.js, MongoDB + Mongoose, JWT auth
- **Database**: MongoDB Atlas (configurable via MONGO_URI env var)

## Project Structure
```
/
├── frontend/          # React + Vite app (port 5000)
│   ├── src/
│   │   ├── pages/     # All page components
│   │   ├── components/# Shared components (Navbar)
│   │   ├── context/   # Auth context
│   │   └── utils/     # API utility (axios)
│   └── vite.config.js
└── backend/           # Express API (port 5001)
    ├── models/        # Mongoose models
    ├── routes/        # API routes
    └── middleware/    # Auth middleware
```

## Environment Variables
Create `backend/.env` with:
```
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret
PORT=5001
```

## User Roles
- **Patient**: Find doctors, book appointments, view prescriptions
- **Doctor**: Manage appointments, write prescriptions
- **Admin**: Platform analytics and user management

## Features
- JWT authentication with role-based access
- Doctor search with specialization filters
- Appointment booking with priority levels (Normal/Urgent/Critical)
- Prescription management with download
- AI Symptom Checker
- Admin analytics dashboard with charts

## User Preferences
- Code should be clean, component-based, and follow existing file structure
- Tailwind CSS for all styling
- Keep frontend on port 5000, backend on port 5001
