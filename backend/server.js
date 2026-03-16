const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// This "database" will hold our reports while the server is running
let reports = [];

app.get('/api/status', (req, res) => {
    res.json({ message: "İst-Flow Backend is Online!", city: "Istanbul" });
});

// NEW: Route to send all reports to the map
app.get('/api/reports', (req, res) => {
    res.json(reports);
});

app.post('/api/reports', (req, res) => {
    const { lat, lng, category, description } = req.body;
    
    const newReport = {
        id: Date.now(), // Unique ID for React keys
        lat,
        lng,
        category,
        description,
        timestamp: new Date()
    };

    reports.push(newReport); // Save it to our list
    console.log(` [${category}] Saved. Total reports: ${reports.length}`);
    
    res.status(201).json({ status: "success", message: "Report saved!", data: newReport });
});

app.listen(PORT, () => {
    console.log(` Backend running on http://localhost:${PORT}`);
});