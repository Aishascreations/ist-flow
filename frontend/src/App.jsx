import { useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

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
        <p style={{ color: serverStatus.includes('Online') ? '#4caf50' : '#ff5252' }}>
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
        </MapContainer>
      </main>
    </div>
  );
}

export default App;