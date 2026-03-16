import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

function LocationMarker({ onReportSubmit }) {
  const [position, setPosition] = useState(null);
  const [report, setReport] = useState("");
  const [category, setCategory] = useState("General");

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
        category: category,
        description: report
      }),
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      setPosition(null);
      onReportSubmit(); 
    })
    .catch(err => console.error("Error:", err));
  };

  return position === null ? null : (
    <Marker position={position}>
      <Popup>
        <div style={{ minWidth: '180px' }}>
          <strong style={{ color: '#333' }}>Report Issue</strong>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: '100%', padding: '5px', margin: '10px 0' }}
          >
            <option value="General">General</option>
            <option value="Traffic">🚦 Traffic</option>
            <option value="Road Work">🚧 Road Work</option>
            <option value="Public Transport">🚌 Public Transport</option>
          </select>

          <textarea 
            placeholder="Describe issue..." 
            value={report}
            onChange={(e) => setReport(e.target.value)}
            style={{ width: '100%', height: '60px', padding: '5px', boxSizing: 'border-box' }}
          />

          <button onClick={handleSubmit} className="submit-btn" 
            style={{ 
              marginTop: '10px', width: '100%', padding: '8px', 
              background: '#4caf50', color: 'white', border: 'none', 
              borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' 
            }}>
            Submit Report
          </button>
        </div>
      </Popup>
    </Marker>
  );
}

function App() {
  const [serverStatus, setServerStatus] = useState("Connecting...");
  const [allReports, setAllReports] = useState([]);

  const fetchReports = () => {
    fetch('http://localhost:5000/api/reports')
      .then(res => res.json())
      .then(data => setAllReports(data))
      .catch(err => console.error("Error:", err));
  };

  useEffect(() => {
    fetch('http://localhost:5000/api/status')
      .then(res => res.json())
      .then(data => setServerStatus(data.message))
      .catch(() => setServerStatus("Backend Offline"));
    
    fetchReports();
  }, []);

  return (
    <div className="app-container">
      <header className="header">
        <h1 style={{ margin: 0, color: '#f1c40f' }}>İst-Flow</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ 
            height: '10px', width: '10px', borderRadius: '50%', 
            background: serverStatus.includes('Online') ? '#4caf50' : '#ff5252' 
          }}></span>
          <small>{serverStatus}</small>
        </div>
      </header>

      <div className="main-layout">
        <aside className="sidebar">
          <h3 className="sidebar-title">Live Feed</h3>
          {allReports.length === 0 ? (
            <p style={{ color: '#999', fontSize: '0.9rem' }}>No reports yet. Click the map to start.</p>
          ) : (
            [...allReports].reverse().map((rep) => (
              <div key={rep.id} className="report-card" 
                style={{ borderLeft: `5px solid ${rep.category === 'Traffic' ? '#ff5252' : '#2196f3'}` }}>
                <div className="card-header">
                  <strong>{rep.category}</strong>
                  <small style={{ color: '#999' }}>{new Date(rep.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                </div>
                <p style={{ margin: '8px 0', fontSize: '0.9rem' }}>{rep.description}</p>
                <code style={{ fontSize: '0.7rem', color: '#666' }}>{rep.lat.toFixed(3)}, {rep.lng.toFixed(3)}</code>
              </div>
            ))
          )}
        </aside>

        <main className="map-wrapper">
          <MapContainer center={[41.0082, 28.9784]} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {allReports.map((rep) => (
              <Marker key={rep.id} position={[rep.lat, rep.lng]}>
                <Popup>
                  <strong>{rep.category}</strong> <br /> {rep.description}
                </Popup>
              </Marker>
            ))}
            <LocationMarker onReportSubmit={fetchReports} />
          </MapContainer>
        </main>
      </div>
    </div>
  );
}

export default App;