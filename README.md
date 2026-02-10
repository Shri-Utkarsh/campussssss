# Campus Maintenance Management App

A production-ready mobile application for managing campus infrastructure issues, featuring role-based access (Faculty, Worker, Admin), gamification for workers, and real-time status tracking.

## Technology Stack
- **Frontend**: React Native (Expo)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Storage**: Cloudinary (Image Uploads)
- **Authentication**: JWT (JSON Web Tokens)

## Features
- **Faculty**: Report issues (Electrical, Plumbing, etc.), Upload photos, Track status, Rate workers.
- **Workers**: Claim jobs, Upload completion proof, Earn points (Gamification), Leaderboard.
- **Admin**: Dashboard analytics, Manage tickets/users, View audit logs.
- **System**: Duplicate ticket detection, SLA deadline tracking, Automated Notifications.

## Setup Instructions

### Backend
1. Navigate to `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Update `.env` file with your credentials:
   - `MONGO_URI`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
4. Start server:
   ```bash
   npm run dev
   ```

### Frontend
1. Navigate to `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npx expo install
   ```
3. Start Expo:
   ```bash
   npx expo start
   ```
   - Scan QR code with Expo Go app on Android/iOS.
   - For Android Emulator: Press `a`.

## API Endpoints
- **Auth**: `/api/auth/register`, `/api/auth/login`
- **Tickets**: `/api/tickets` (GET, POST), `/api/tickets/:id` (PATCH)
- **Admin**: `/api/admin/stats`
- **Notifications**: `/api/notifications`

## Gamification
Workers earn points based on task priority:
- Urgent: +50 pts
- High: +30 pts
- Normal: +10 pts
