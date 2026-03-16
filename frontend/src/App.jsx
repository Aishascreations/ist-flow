import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

function LocationMarker() {
  const [position, setPosition] = useState(null);
  const [report, setReport] = useState("");

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setReport(""); 
    },
  });

  const handleSubmit = () => {
    // This sends the data to your backend server.js
    fetch('http://localhost:5000/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lat: position.lat,
        lng: position.lng,
        description: report
      }),
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message); // "Report saved to server!"
      setPosition(null);    // Removes the marker after successful submission
    })
    .catch(err => {
      console.error("Error sending report:", err);
      alert("Failed to send report. Is the backend running?");
    });
  };

  return position === null ? null : (
    <Marker position={position}>
      <Popup>
        <div style={{ minWidth: '150px' }}>
          <strong>Report an Issue</strong> <br />
          <small>Lat: {position.lat.toFixed(4)}, Lng: {position.lng.toFixed(4)}</small>
          <hr />
          <textarea 
            placeholder="What's happening here?" 
            value={report}
            onChange={(e) => setReport(e.target.value)}
            style={{ width: '100%', marginTop: '5px', padding: '5px' }}
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
              padding: '5px',
              borderRadius: '4px'
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