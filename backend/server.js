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

app.listen(PORT, () => {
    console.log(`✅ Backend running on http://localhost:${PORT}`);
});