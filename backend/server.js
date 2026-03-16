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
    const { lat, lng, category, description } = req.body;
    
    // Updated log to include the category
    console.log(`📣 [${category}] Report at [${lat.toFixed(4)}, ${lng.toFixed(4)}]: ${description}`);
    
    res.status(201).json({ status: "success", message: `Report for ${category} saved!` });
})

app.listen(PORT, () => {
    console.log(`✅ Backend running on http://localhost:${PORT}`);
});