import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const RecenterMap = ({ coords }) => {
  const map = useMap();
  if (coords && coords.length > 0) {
    const bounds = L.latLngBounds(coords.map(c => [c[1], c[0]]));
    map.fitBounds(bounds, { padding: [50, 50] });
  }
  return null;
};

const MapComponent = ({ routeGeometry, locations }) => {
  const center = [39.8283, -98.5795]; // Center of USA
  
  const polyline = routeGeometry ? routeGeometry.coordinates.map(c => [c[1], c[0]]) : [];

  return (
    <div className="map-wrapper glass-card">
      <MapContainer center={center} zoom={4} style={{ height: '400px', width: '100%', borderRadius: '12px' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {locations?.current && (
          <Marker position={[locations.current.lat, locations.current.lon]}>
            <Popup>Current Location</Popup>
          </Marker>
        )}
        
        {locations?.pickup && (
          <Marker position={[locations.pickup.lat, locations.pickup.lon]}>
            <Popup>Pickup: {locations.pickup.display_name}</Popup>
          </Marker>
        )}
        
        {locations?.dropoff && (
          <Marker position={[locations.dropoff.lat, locations.dropoff.lon]}>
            <Popup>Dropoff: {locations.dropoff.display_name}</Popup>
          </Marker>
        )}

        {polyline.length > 0 && (
          <>
            <Polyline positions={polyline} color="#00f2ff" weight={4} opacity={0.7} />
            <RecenterMap coords={routeGeometry.coordinates} />
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
