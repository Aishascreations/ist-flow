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

// DELETE a specific report by ID
app.post('/api/reports/delete', (req, res) => {
    const { id } = req.body;
    const initialLength = reports.length;
    
    // Filter out the report with the matching ID
    reports = reports.filter(report => report.id !== id);
    
    if (reports.length < initialLength) {
        console.log(`🗑️ Report ${id} removed.`);
        res.json({ status: "success", message: "Report resolved and removed." });
    } else {
        res.status(404).json({ status: "error", message: "Report not found." });
    }
});

app.listen(PORT, () => {
    console.log(` Backend running on http://localhost:${PORT}`);
});