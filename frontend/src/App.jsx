import React, { useState } from 'react';
import axios from 'axios';
import TripForm from './components/TripForm';
import MapComponent from './components/MapComponent';
import ELDLog from './components/ELDLog';
import './styles/App.css';

import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:8000/api' 
  : '/_/backend/api';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateTrip = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE}/calculate/`, formData);
      setData(response.data);
    } catch (err) {
      console.error('Full error object:', err);
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
      }
      const detail = err.response?.data?.error || err.message;
      setError(`Calculation failed: ${detail}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header>
        <motion.h1 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          TRUCKFLOW ELD
        </motion.h1>
        <motion.p 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ color: 'var(--text-secondary)' }}
        >
          Intelligent Trip Planning & HOS Log Generation
        </motion.p>
      </header>

      <main className="dashboard-grid">
        <motion.div 
          className="sidebar"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <TripForm onCalculate={calculateTrip} loading={loading} />
          
          <AnimatePresence>
            {error && (
              <motion.div 
                className="glass-card error-card" 
                style={{ marginTop: '20px', borderColor: '#ff4444' }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <p style={{ color: '#ff4444', margin: 0 }}>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {data && (
            <motion.div 
              className="glass-card metrics-container" 
              style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="metric-card">
                <div className="metric-value">{data.distance_miles.toFixed(0)}</div>
                <div className="metric-label">Total Miles</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">{data.duration_hours.toFixed(1)}</div>
                <div className="metric-label">Drive Hrs</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">{data.daily_logs.length}</div>
                <div className="metric-label">Total Days</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">{data.events.length}</div>
                <div className="metric-label">HOS Events</div>
              </div>
            </motion.div>
          )}
        </motion.div>

        <motion.div 
          className="content"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <MapComponent 
            routeGeometry={data?.route_geometry} 
            locations={data?.locations} 
          />
          
          <AnimatePresence>
            {data?.daily_logs && (
              <motion.div 
                className="logs-section glass-card"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h2>Generated Daily Logs</h2>
                <div className="logs-scroll-container">
                  {data.daily_logs.map((dayEvents, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <ELDLog 
                        dayEvents={dayEvents} 
                        date={`Day ${idx + 1}`} 
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}

export default App;
