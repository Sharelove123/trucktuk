import React, { useState } from 'react';
import { MapPin, Navigation, Package, Clock, Loader2 } from 'lucide-react';

const TripForm = ({ onCalculate, loading }) => {
  const [formData, setFormData] = useState({
    current_location: 'Los Angeles, CA',
    pickup_location: 'Las Vegas, NV',
    dropoff_location: 'Salt Lake City, UT',
    current_cycle_used: '0'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCalculate(formData);
  };

  return (
    <div className="glass-card form-container">
      <h2>Plan Your Trip</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label><Navigation size={16} /> Current Location</label>
          <input 
            type="text" 
            value={formData.current_location}
            onChange={(e) => setFormData({...formData, current_location: e.target.value})}
            placeholder="Address or City"
            required
          />
        </div>
        
        <div className="input-group">
          <label><Package size={16} /> Pickup Location</label>
          <input 
            type="text" 
            value={formData.pickup_location}
            onChange={(e) => setFormData({...formData, pickup_location: e.target.value})}
            placeholder="Address or City"
            required
          />
        </div>

        <div className="input-group">
          <label><MapPin size={16} /> Dropoff Location</label>
          <input 
            type="text" 
            value={formData.dropoff_location}
            onChange={(e) => setFormData({...formData, dropoff_location: e.target.value})}
            placeholder="Address or City"
            required
          />
        </div>

        <div className="input-group">
          <label><Clock size={16} /> Cycle Hours Used (0-70)</label>
          <input 
            type="number" 
            min="0" 
            max="70"
            value={formData.current_cycle_used}
            onChange={(e) => setFormData({...formData, current_cycle_used: e.target.value})}
            required
          />
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? <Loader2 className="spin" /> : 'Calculate Route & Logs'}
        </button>
      </form>
    </div>
  );
};

export default TripForm;
