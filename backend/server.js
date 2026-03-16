const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors()); // Allows the frontend to connect
app.use(express.json());

// A simple test route
app.get('/api/status', (req, res) => {
    res.json({ message: "İst-Flow Backend is Online!", city: "Istanbul" });
});

app.post('/api/reports', (req, res) => {
    const { lat, lng, description } = req.body;
    
    // For now, we just log it to the console
    console.log(`📍 New Report Received: [${lat}, ${lng}] - ${description}`);
    
    // Send a success message back to the frontend
    res.status(201).json({ status: "success", message: "Report saved to server!" });
});

app.listen(PORT, () => {
    console.log(`✅ Backend running on http://localhost:${PORT}`);
});