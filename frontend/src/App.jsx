import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { AlertTriangle, Construction, Bus, Info, Check } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './App.css';

// Helper function for professional icons
const getCategoryIcon = (category) => {
  const iconSize = 18;
  switch (category) {
    case 'Traffic': return <AlertTriangle size={iconSize} color="#ff5252" />;
    case 'Road Work': return <Construction size={iconSize} color="#f1c40f" />;
    case 'Public Transport': return <Bus size={iconSize} color="#2196f3" />;
    default: return <Info size={iconSize} color="#666" />;
  }
};

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
        <div className="popup-container">
          <strong className="form-title">Report Issue</strong>
          
          <label className="form-label">Category</label>
          <select 
            className="form-select"
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="General">General</option>
            <option value="Traffic">Traffic</option>
            <option value="Road Work">Road Work</option>
            <option value="Public Transport">Public Transport</option>
          </select>

          <textarea 
            className="form-textarea"
            placeholder="Describe the issue..." 
            value={report}
            onChange={(e) => setReport(e.target.value)}
          />

          <button onClick={handleSubmit} className="submit-btn">
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
  const [map, setMap] = useState(null);

  const fetchReports = () => {
    fetch('http://localhost:5000/api/reports')
      .then(res => res.json())
      .then(data => setAllReports(data))
      .catch(err => console.error("Error fetching reports:", err));
  };

  const handleFlyTo = (lat, lng) => {
    if (map) {
      map.flyTo([lat, lng], 16, { duration: 1.5 });
    }
  };

  // New function to handle resolving/deleting a report
  const handleDelete = (e, id) => {
    e.stopPropagation(); // Prevents the map from flying when we click the button
    
    if (window.confirm("Mark this issue as resolved?")) {
      fetch('http://localhost:5000/api/reports/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      .then(res => res.json())
      .then(() => {
        fetchReports(); // Refresh the list
      })
      .catch(err => console.error("Error deleting:", err));
    }
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
        <h1 className="header-logo">İst-Flow</h1>
        <div className="status-container">
          <span className={`status-dot ${serverStatus.includes('Online') ? 'online' : 'offline'}`}></span>
          <small>{serverStatus}</small>
        </div>
      </header>

      <div className="main-layout">
        <aside className="sidebar">
          <h3 className="sidebar-title">Live Transit Feed</h3>
          {allReports.length === 0 ? (
            <p className="no-data">No active reports in Istanbul.</p>
          ) : (
            [...allReports].reverse().map((rep) => (
              <div 
                key={rep.id} 
                className="report-card" 
                onClick={() => handleFlyTo(rep.lat, rep.lng)}
                style={{ borderLeftColor: rep.category === 'Traffic' ? '#ff5252' : rep.category === 'Road Work' ? '#f1c40f' : '#2196f3' }}
              >
                <div className="card-header">
                  <div className="category-header">
                    {getCategoryIcon(rep.category)}
                    <span className="category-name">{rep.category}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <small className="timestamp">
                      {new Date(rep.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </small>
                    <button 
                      className="resolve-btn" 
                      onClick={(e) => handleDelete(e, rep.id)}
                      title="Resolve Issue"
                    >
                      <Check size={14} />
                    </button>
                  </div>
                </div>
                <p className="report-desc">{rep.description}</p>
                <code className="coords">{rep.lat.toFixed(4)}, {rep.lng.toFixed(4)}</code>
              </div>
            ))
          )}
        </aside>

        <main className="map-wrapper">
          <MapContainer 
            center={[41.0082, 28.9784]} 
            zoom={12} 
            className="leaflet-container"
            ref={setMap} 
          >
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