# Smart Office Assistant

Welcome to the Smart Office Assistant! This is a React-based web application designed to streamline workplace operations in an IT office environment. It helps manage employee attendance, parking spaces, and conference room bookings, along with an admin dashboard for insights and a helpful AI chatbot.

## Features

### For Employees:
- **Mark Daily Attendance**:
  - Options: Work From Home (WFH), In-Office, On-Leave.
  - If In-Office, specify mode of transport.
  - Simulated auto check-in options (Location, QR, Wi-Fi).
  - Check-out functionality for In-Office status.
  - View attendance history.
- **View Parking Slots**:
  - Real-time (simulated) view of available parking spaces.
  - Visual map of parking bays with occupancy status.
- **Book Conference/Meeting Rooms**:
  - View available rooms with details (capacity, AV equipment, floor).
  - Filter rooms based on requirements.
  - Select a date to view room availability.
  - Book available time slots for a selected room.
  - View and cancel own bookings.
- **AI Chatbot**:
  - Floating chatbot to answer common questions about office procedures.
  - Provides contextual help and can simulate AI-driven suggestions.

### For Admins:
- **Admin Dashboard**:
  - **Attendance Trends**: Visual charts gráfica showing WFH vs. In-Office vs. On-Leave.
  - **Parking Usage**: Charts displaying real-time parking occupancy rates.
  - **Room Occupancy**: Insights into how frequently rooms are booked and for how long.
  - Simulated AI insights like predicting peak office days.

### General:
- **Role-Based Access**: Distinct views and functionalities for Employees and Admins.
- **Responsive UI**: Built with Tailwind CSS for a modern and responsive experience on various devices.
- **PWA Ready**: Includes a basic manifest for Progressive Web App capabilities.
- **Mock Data**: Uses realistic mock data to simulate a fully functional environment.

## Tech Stack

- **Frontend**: React 18+ with TypeScript
- **Styling**: Tailwind CSS (via CDN)
- **Routing**: React Router (HashRouter)
- **Charts**: Recharts
- **State Management**: React Context API, `useState`, `useEffect`
- **Mock Backend**: Simulated API calls within the frontend for data persistence during a session (data resets on full refresh if not using localStorage for some parts like login).
- **AI Simulation**: Chatbot responses and AI features are rule-based and mocked within `geminiService.ts`.

## Getting Started

This application is designed to run directly in a browser that supports modern JavaScript and has an internet connection for the Tailwind CDN.

1.  **Ensure you have a modern web browser.** (e.g., Chrome, Firefox, Edge, Safari)
2.  **Serve the files**:
    *   If you have the project files locally, you can use a simple HTTP server to serve the `index.html` file and other assets. For example, using Node.js and `serve`:
        ```bash
        npm install -g serve
        serve . 
        ```
        Then open `http://localhost:3000` (or the port `serve` indicates) in your browser.
    *   Alternatively, for development with Vite (as implied by `vite.svg` in `index.html`), you would typically run:
        ```bash
        npm install
        npm run dev
        ```
        (This requires `vite` and `typescript` to be set up as dev dependencies in a `package.json` which is not part of this output.)
3.  **Login**: On the login page, select a mock user to proceed. Different users have different roles (Employee/Admin).

## Project Structure

-   `/index.html`: Main HTML entry point.
-   `/index.tsx`: React application root.
-   `/App.tsx`: Main application component, sets up routing and global layout.
-   `/types.ts`: TypeScript type definitions.
-   `/constants.ts`: Mock data and application-wide constants.
-   `/components/`: Contains reusable UI components.
    -   `/common/`: Generic components like Button, Modal, Card.
    -   `/attendance/`, `/parking/`, `/booking/`, `/admin/`: Feature-specific components.
    -   `/icons/`: SVG icon components.
    -   `AuthContext.tsx`: Manages authentication state.
    -   `Chatbot.tsx`: The floating AI chatbot.
    -   `Navbar.tsx`: Top navigation bar.
    -   `ProtectedRoute.tsx`: Handles route protection.
-   `/pages/`: Top-level page components for different views.
    -   `LoginPage.tsx`
    -   `EmployeeDashboardPage.tsx`
    -   `AdminOverviewPage.tsx`
    -   `NotFoundPage.tsx`
-   `/services/`:
    -   `mockApiService.ts`: Simulates backend API calls and manages mock data.
    -   `geminiService.ts`: Simulates responses from an AI model for the chatbot.
-   `/hooks/`: Custom React hooks.
    -   `useAuth.ts`: Hook to access authentication context.
    -   `useLocalStorage.ts`: Hook for simple localStorage persistence.
-   `/manifest.json`: PWA manifest.
-   `/README.md`: This file.
-   `/PRODUCT_ROADMAP.md`: Document outlining future development plans.

## Key Mocked Features

-   **Auto Check-in**: Simulated with buttons. No actual location, QR, or Wi-Fi scanning is implemented.
-   **Real-time Updates**: Parking and room availability changes are simulated through mock data modifications, often triggered by timers or user actions.
-   **AI Features**:
    -   Chatbot responses are based on a predefined knowledge base and simple contextual rules.
    -   Predictions (peak days, room recommendations) are hardcoded or based on simple calculations on mock data.
    -   Conflict resolution and auto-release of slots are simulated with basic logic.

## 🖥️ Progressive Web App (PWA) Support

This project is now a PWA! You can install it on your desktop or mobile device for a native app-like experience. Key features:
- **Offline support**: Basic offline caching using a service worker.
- **Installable**: Add to your home screen or desktop from supported browsers.
- **Manifest**: Includes app name, icons, theme color, and more for a polished install experience.

**How it works:**
- A service worker (`public/service-worker.js`) caches core assets for offline use.
- The app registers the service worker automatically on load.
- The manifest (`manifest.json`) provides metadata for installability.

To test PWA features:
1. Build and serve the app (`npm run build` then `serve dist/`).
2. Open in Chrome/Edge, go to DevTools → Application tab, and check service worker and installability status.
