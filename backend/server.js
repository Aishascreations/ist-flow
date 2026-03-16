require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
const app = express();

app.use(cors());
app.use(express.json());

// --- LOCAL MONGODB CONNECTION ---
// Make sure your .env has: MONGO_URI=mongodb://127.0.0.1:27017/istflow
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to LOCAL MongoDB"))
  .catch(err => console.error("❌ Local Connection Error:", err));

// --- REPORT MODEL ---
const Report = mongoose.model('Report', new mongoose.Schema({
  lat: Number,
  lng: Number,
  category: String,
  description: String,
  timestamp: { type: Date, default: Date.now }
}));

// --- ROUTES ---

// 1. Get all reports
app.get('/api/reports', async (req, res) => {
  try {
    const reports = await Report.find().sort({ timestamp: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Save a report
app.post('/api/reports', async (req, res) => {
  try {
    const newReport = await Report.create(req.body);
    console.log("📍 New Pin Saved Local!");
    res.status(201).json(newReport);
  } catch (err) {
    res.status(400).json({ error: "Save failed" });
  }
});

// 3. Delete a report
app.post('/api/reports/delete', async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.body.id);
    res.json({ status: "success" });
  } catch (err) {
    res.status(404).json({ error: "Delete failed" });
  }
});

// --- IBB BUS PROXY ---
app.get('/api/ibb/buses', async (req, res) => {
  try {
    const response = await axios.get('https://api.ibb.gov.tr/iett/FiloYonetimMerkezi/GetFiloAracKonum_JSON');
    res.json(response.data);
  } catch (error) {
    console.log("🚌 IBB API Down - Sending empty list");
    res.json([]); 
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Local Server running on port ${PORT}`));