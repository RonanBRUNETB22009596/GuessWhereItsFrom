# Guess Where It's From

A mobile quiz game built with Expo (React Native), Supabase, and a Vite React admin dashboard.

## Project Structure

- `/mobile` - The Expo React Native mobile application
- `/admin` - The Vite React TS admin dashboard
- Backend is hosted on Supabase (`Hanestia` project).

## Prerequisites

- Node.js (v18 or newer recommended)
- npm or yarn
- Expo Go app on your phone, or an iOS Simulator / Android Emulator

## Running the Mobile App

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npm start
   ```
4. Press `i` to open in iOS simulator, `a` to open in Android emulator, or scan the QR code with the Expo Go app on your physical device.

## Running the Admin Dashboard

1. Navigate to the admin directory:
   ```bash
   cd admin
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser to the URL shown in the terminal (usually `http://localhost:5173`).

## Database & Authentication

- The backend is powered by Supabase.
- When you register a new account in the mobile app, a profile is automatically created in the `profiles` table.
- To access the admin dashboard, you must log in with an account that has `is_admin: true` in the `profiles` table.
