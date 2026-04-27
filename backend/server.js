//require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
const app = express();

// --- CORS: Allow both local dev and your live Vercel frontend ---
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL, // e.g. https://ist-flow.vercel.app
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  }
}));

app.use(express.json());

// --- MONGODB CONNECTION (works for both local and Atlas) ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ Connection Error:", err));

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
    console.log("📍 New Report Saved!");
    res.status(201).json(newReport);
  } catch (err) {
    res.status(400).json({ error: "Save failed" });
  }
});

// 3. Edit a report (UPDATE)
app.patch('/api/reports/:id', async (req, res) => {
  try {
    const { description } = req.body;
    const updatedReport = await Report.findByIdAndUpdate(
      req.params.id,
      { description },
      { new: true }
    );
    if (!updatedReport) return res.status(404).json({ error: "Report not found" });
    res.json(updatedReport);
  } catch (err) {
    res.status(400).json({ error: "Update failed" });
  }
});

// 4. Delete a report — fixed to use proper DELETE method
app.delete('/api/reports/:id', async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    console.log("🗑️ Report Deleted");
    res.json({ status: "success" });
  } catch (err) {
    res.status(404).json({ error: "Delete failed" });
  }
});

// --- IBB BUS PROXY ---
app.get('/api/ibb/buses', async (req, res) => {
  try {
    const response = await axios.get(
      'https://api.ibb.gov.tr/iett/FiloYonetimMerkezi/GetFiloAracKonum_JSON',
      { timeout: 5000 }
    );
    const buses = response.data || [];
    res.json({ count: buses.length, data: buses });
  } catch (error) {
    console.log("🚌 IBB API unavailable - returning empty");
    res.json({ count: 0, data: [] });
  }
});

// Health check endpoint (useful for Render)
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
