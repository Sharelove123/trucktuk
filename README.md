# TruckFlow ELD Trip Planner

A full-stack application built with Django and React for property-carrying truck drivers to plan their trips, calculate routes, and generate ELD-compliant daily log sheets based on 70hr/8day HOS rules.

## Features
- **Intelligent Routing**: Uses OSRM and Nominatim for geocoding and routing.
- **HOS Compliance**: Automatically calculates breaks, sleeper berth periods, and fueling stops.
- **Interactive Map**: View the route and markers for pickup/dropoff points.
- **ELD Log Sheets**: Visual 24-hour log grids showing duty status transitions with SVG precision.
- **Rich Aesthetics**: Premium dark-mode design with glassmorphism, smooth Framer Motion animations, and responsive layouts.

## Tech Stack
- **Backend**: Django, Django REST Framework, CORS Headers.
- **Frontend**: React (Vite), Leaflet, Framer Motion, Lucide Icons, Axios.
- **APIs**: Nominatim (Geocoding), OSRM (Routing), OpenStreetMap (Tiles).

## Hosting
The app is configured for deployment on **Vercel** using the provided `vercel.json`. 
- **Frontend**: Deploys as a static build.
- **Backend**: Deploys as a Python Serverless Function.
- **Requirements**: Ensure `requirements.txt` is present in the backend folder.

## Setup Instructions

### Backend
1. Navigate to the `backend` directory.
2. (Optional) Create a virtual environment: `python -m venv venv`.
3. Activate venv: `.\venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux).
4. Install dependencies: `pip install django djangorestframework django-cors-headers requests`.
5. Run migrations: `python manage.py migrate`.
6. Start the server: `python manage.py runserver`.

### Frontend
1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`.
3. Start the dev server: `npm run dev`.

## Assumptions
- Property-carrying driver, 70hrs/8days.
- Fueling at least once every 1,000 miles (15 min On-Duty).
- 1 hour for pickup and drop-off (On-Duty).
- Standard HOS: 11h driving, 14h duty, 30m break after 8h driving, 10h sleeper reset.
