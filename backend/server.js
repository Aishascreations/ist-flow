require('dotenv').config(); // Load the .env file
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose'); // NEW
const app = express();

app.use(cors());
app.use(express.json());

// --- MONGODB CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// --- DEFINE THE REPORT MODEL ---
const Report = mongoose.model('Report', new mongoose.Schema({
  lat: Number,
  lng: Number,
  category: String,
  description: String,
  timestamp: { type: Date, default: Date.now }
}));

// --- UPDATED ROUTES ---

// 1. Get all reports from DB
app.get('/api/reports', async (req, res) => {
    try {
        const reports = await Report.find().sort({ timestamp: -1 }); // Newest first
        res.json(reports);
    } catch (err) { res.status(500).json([]); }
});

// 2. Save a report to DB
app.post('/api/reports', async (req, res) => {
    try {
        const newReport = new Report(req.body);
        await newReport.save();
        res.status(201).json(newReport);
    } catch (err) { res.status(400).json({ error: "Failed to save" }); }
});

// 3. Delete a report from DB
app.post('/api/reports/delete', async (req, res) => {
    try {
        await Report.findByIdAndDelete(req.body.id);
        res.json({ status: "success" });
    } catch (err) { res.status(404).json({ error: "Not found" }); }
});

// --- IBB BUS PROXY (Keep this as is) ---
app.get('/api/ibb/buses', async (req, res) => {
    // ... (Your existing bus code)
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));