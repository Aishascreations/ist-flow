import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

function LocationMarker() {
  const [position, setPosition] = useState(null);
  const [report, setReport] = useState("");
  const [category, setCategory] = useState("General"); // New state for category

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setReport(""); 
    },
  });

  const handleSubmit = () => {
    fetch('http://localhost:5000/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lat: position.lat,
        lng: position.lng,
        category: category, // Sending the category now
        description: report
      }),
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      setPosition(null);
    })
    .catch(err => console.error("Error:", err));
  };

  return position === null ? null : (
    <Marker position={position}>
      <Popup>
        <div style={{ minWidth: '180px', fontFamily: 'sans-serif' }}>
          <strong style={{ fontSize: '1.1rem' }}>Report Issue</strong> <br />
          
          <label style={{ display: 'block', marginTop: '10px', fontSize: '0.8rem' }}>Category:</label>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: '100%', padding: '5px', marginBottom: '10px' }}
          >
            <option value="General">General</option>
            <option value="Traffic">🚦 Traffic</option>
            <option value="Road Work">🚧 Road Work</option>
            <option value="Public Transport">🚌 Public Transport</option>
            <option value="Infrastructure">🏗️ Infrastructure</option>
          </select>

          <textarea 
            placeholder="Describe the issue..." 
            value={report}
            onChange={(e) => setReport(e.target.value)}
            style={{ width: '100%', height: '60px', padding: '5px', boxSizing: 'border-box' }}
          />

          <button 
            onClick={handleSubmit}
            style={{ 
              marginTop: '10px', 
              width: '100%', 
              cursor: 'pointer',
              background: '#4caf50',
              color: 'white',
              border: 'none',
              padding: '8px',
              borderRadius: '4px',
              fontWeight: 'bold'
            }}
          >
            Submit Report
          </button>
        </div>
      </Popup>
    </Marker>
  );
}

function App() {
  const [serverStatus, setServerStatus] = useState("Connecting to backend...");

  useEffect(() => {
    fetch('http://localhost:5000/api/status')
      .then(res => res.json())
      .then(data => setServerStatus(data.message))
      .catch(() => setServerStatus("Backend not reached. Start your server.js!"));
  }, []);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '10px', background: '#1a1a1a', color: 'white' }}>
        <h1>İst-Flow</h1>
        <p style={{ color: serverStatus.includes('Online') ? '#4caf50' : '#ff5252', margin: 0 }}>
          {serverStatus}
        </p>
      </header>

      <main style={{ flex: 1 }}>
        <MapContainer 
          center={[41.0082, 28.9784]} 
          zoom={12} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker />
        </MapContainer>
      </main>
    </div>
  );
}

export default App;