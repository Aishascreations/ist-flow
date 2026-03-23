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

// 2. Save a report (CREATE)
app.post('/api/reports', async (req, res) => {
  try {
    const newReport = await Report.create(req.body);
    console.log("📍 New Pin Saved Local!");
    res.status(201).json(newReport);
  } catch (err) {
    res.status(400).json({ error: "Save failed" });
  }
});

// 3. Edit a report (UPDATE) - NEW ADDITION
app.patch('/api/reports/:id', async (req, res) => {
  try {
    const { description } = req.body;
    const updatedReport = await Report.findByIdAndUpdate(
      req.params.id,
      { description },
      { new: true } // Returns the updated document instead of the old one
    );

    if (!updatedReport) {
      return res.status(404).json({ error: "Report not found" });
    }

    console.log(`📝 Report Updated: ${req.params.id}`);
    res.json(updatedReport);
  } catch (err) {
    res.status(400).json({ error: "Update failed" });
  }
});

// 4. Delete a report (DELETE)
app.post('/api/reports/delete', async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.body.id);
    console.log("🗑️ Report Resolved/Deleted");
    res.json({ status: "success" });
  } catch (err) {
    res.status(404).json({ error: "Delete failed" });
  }
});

// --- IBB BUS PROXY (MODIFIED FOR DYNAMIC COUNT) ---
app.get('/api/ibb/buses', async (req, res) => {
  try {
    const response = await axios.get('https://api.ibb.gov.tr/iett/FiloYonetimMerkezi/GetFiloAracKonum_JSON', { timeout: 5000 });
    const buses = response.data || [];
    res.json({ count: buses.length, data: buses }); 
  } catch (error) {
    console.log("🚌 IBB API Down - Sending Mock Data for testing");
    
    // MOCK DATA: 3 Fake buses so your "0 BUSES" becomes "3 BUSES"
    const mockBuses = [
      { _id: "m1", LATITUDE: "41.0082", LONGITUDE: "28.9784", HAT_KODU: "34AS" },
      { _id: "m2", LATITUDE: "41.0150", LONGITUDE: "28.9700", HAT_KODU: "11US" },
      { _id: "m3", LATITUDE: "41.0200", LONGITUDE: "28.9800", HAT_KODU: "15BK" }
    ];

    res.json({
      count: mockBuses.length,
      data: mockBuses
    }); 
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Local Server running on port ${PORT}`));