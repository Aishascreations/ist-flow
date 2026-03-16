const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let reports = [];

// Helper: Fixes Turkish comma decimals and returns a clean number string
const cleanCoord = (val) => val ? val.toString().replace(',', '.') : "0";

app.get('/api/ibb/buses', async (req, res) => {
    try {
        console.log("Fetching live IETT data...");
        
        // Primary Endpoint
        const url = "https://api.ibb.gov.tr/iett/FiloDurum/Sahalar.json";
        
        const response = await axios.get(url, { 
            timeout: 5000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const rawBuses = response.data;

        if (!rawBuses || !Array.isArray(rawBuses) || rawBuses.length === 0) {
            throw new Error("Empty response from primary API");
        }

        const cleanedBuses = rawBuses.slice(0, 150).map(bus => ({
            _id: bus.KapıNo || Math.random().toString(),
            HAT_KODU: bus.HatKodu || "İETT",
            LATITUDE: cleanCoord(bus.Enlem),
            LONGITUDE: cleanCoord(bus.Boylam),
            GUZERGAH: bus.Guzergah || ""
        }));

        res.json(cleanedBuses);

    } catch (error) {
        console.error("⚠️ IETT Primary Failed. Generating Simulation Data for Dev...");
        
        // FALLBACK: Generate 10-15 "Ghost" buses around Istanbul center 
        // This ensures your UI works and you can keep coding while İETT is down.
        const mockBuses = Array.from({ length: 15 }).map((_, i) => ({
            _id: `MOCK-${i}`,
            HAT_KODU: `${34 + i}A`,
            LATITUDE: (41.0082 + (Math.random() - 0.5) * 0.1).toString(),
            LONGITUDE: (28.9784 + (Math.random() - 0.5) * 0.1).toString(),
            GUZERGAH: "Simulated Route"
        }));

        res.json(mockBuses);
    }
});

// --- USER REPORTS ---
app.get('/api/reports', (req, res) => res.json(reports));
app.post('/api/reports', (req, res) => {
    const newReport = { id: Date.now(), ...req.body, timestamp: new Date() };
    reports.push(newReport);
    res.status(201).json(newReport);
});
app.post('/api/reports/delete', (req, res) => {
    reports = reports.filter(r => r.id !== req.body.id);
    res.json({ status: "success" });
});

app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));