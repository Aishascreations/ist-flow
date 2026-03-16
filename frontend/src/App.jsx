import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Check, Search, Loader2, Activity, Moon, Sun, Navigation } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

// Fix Marker Icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const busIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
  iconSize: [30, 30], iconAnchor: [15, 30]
});

function LocationMarker({ onReportSubmit }) {
  const [position, setPosition] = useState(null);
  const [report, setReport] = useState("");
  const [category, setCategory] = useState("General");

  useMapEvents({ click(e) { setPosition(e.latlng); } });

  const handleSubmit = () => {
    fetch('http://localhost:5000/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat: position.lat, lng: position.lng, category, description: report }),
    }).then(() => { setPosition(null); onReportSubmit(); });
  };

  return position && (
    <Marker position={position}>
      <Popup>
        <div className="popup-container">
          <select className="form-select" onChange={(e) => setCategory(e.target.value)}>
            <option value="General">General</option>
            <option value="Traffic">Traffic</option>
            <option value="Accident">Accident</option>
          </select>
          <textarea className="form-textarea" placeholder="Describe issue..." onChange={(e) => setReport(e.target.value)} />
          <button onClick={handleSubmit} className="submit-btn">Submit</button>
        </div>
      </Popup>
    </Marker>
  );
}

function App() {
  const [theme, setTheme] = useState('dark');
  const [allReports, setAllReports] = useState([]);
  const [liveBuses, setLiveBuses] = useState([]);
  const [map, setMap] = useState(null);
  const [weather, setWeather] = useState({ temp: "--" });
  
  // NEW: Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const fetchReports = () => fetch('http://localhost:5000/api/reports').then(r => r.json()).then(setAllReports);
  const fetchBuses = () => fetch('http://localhost:5000/api/ibb/buses').then(r => r.json()).then(setLiveBuses);

  useEffect(() => {
    fetchReports(); fetchBuses();
    const bInterval = setInterval(fetchBuses, 30000);
    fetch('https://api.open-meteo.com/v1/forecast?latitude=41.0082&longitude=28.9784&current_weather=true')
      .then(r => r.json()).then(d => setWeather({ temp: Math.round(d.current_weather.temperature) }));
    return () => clearInterval(bInterval);
  }, []);

  // --- NEW: Search Handler ---
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery || !map) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery} Istanbul&limit=1`);
      const data = await res.json();
      if (data[0]) map.flyTo([data[0].lat, data[0].lon], 15);
    } catch (err) { console.error("Search failed"); }
    setIsSearching(false);
  };

  // --- NEW: Delete Handler ---
  const handleResolve = async (e, id) => {
    e.stopPropagation(); // Stops FlyTo from firing
    try {
      await fetch('http://localhost:5000/api/reports/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchReports();
    } catch (err) { console.error("Delete failed"); }
  };

  const handleGPS = () => { if (map) map.locate().on("locationfound", (e) => map.flyTo(e.latlng, 15)); };

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="header-logo">İst-Flow <span className="live-badge">LIVE</span></h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div className="weather-pill"><Sun size={14}/> {weather.temp}°C</div>
            <button className="theme-toggle-btn" onClick={() => {
                const nt = theme === 'dark' ? 'light' : 'dark';
                setTheme(nt); document.documentElement.setAttribute('data-theme', nt);
            }}>{theme === 'dark' ? <Sun size={18} color="#f1c40f" /> : <Moon size={18} />}</button>
        </div>
      </header>

      <div className="main-layout">
        <aside className="sidebar">
          {/* SEARCH BAR */}
          <form className="search-container" onSubmit={handleSearch}>
            <input 
              className="search-input" 
              placeholder="Search e.g. Kadikoy..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
            <button type="submit" className="search-btn">
              {isSearching ? <Loader2 className="animate-spin" size={16}/> : <Search size={16}/>}
            </button>
          </form>

          <div className="stats-box">
            <div className="stats-header"><Activity size={12}/> SYSTEM STATUS</div>
            <div className="stats-grid">
              <div className="stat-item"><span className="stat-val">{liveBuses.length}</span><span className="stat-label">BUSES</span></div>
              <div className="stat-item"><span className="stat-val">{allReports.length}</span><span className="stat-label">REPORTS</span></div>
            </div>
          </div>

          <div className="report-feed">
            {allReports.map(rep => (
              <div key={rep.id} className="report-card" onClick={() => map.flyTo([rep.lat, rep.lng], 16)}>
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{rep.category}</strong>
                  <button className="resolve-btn" onClick={(e) => handleResolve(e, rep.id)}>
                    <Check size={14} />
                  </button>
                </div>
                <p>{rep.description}</p>
              </div>
            ))}
          </div>
        </aside>

        <main className="map-wrapper">
          <button className="search-btn" onClick={handleGPS} style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 1000 }}>
            <Navigation size={16} />
          </button>
          <MapContainer center={[41.0082, 28.9784]} zoom={12} className="leaflet-container" ref={setMap}>
            <TileLayer url={theme === 'dark' ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"} />
            <LocationMarker onReportSubmit={fetchReports} />
            {liveBuses.map(bus => (
              <Marker key={bus._id} position={[bus.LATITUDE, bus.LONGITUDE]} icon={busIcon}>
                <Popup>Line: {bus.HAT_KODU}</Popup>
              </Marker>
            ))}
            {allReports.map(rep => (
              <Marker key={rep.id} position={[rep.lat, rep.lng]}><Popup>{rep.description}</Popup></Marker>
            ))}
          </MapContainer>
        </main>
      </div>
    </div>
  );
}

export default App;