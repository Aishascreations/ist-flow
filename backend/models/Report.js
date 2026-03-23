const express = require('express');
const router = express.Router();
const Report = require('../models/Report'); // Ensure this matches your file structure

// 1. GET all reports (READ)
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find().sort({ timestamp: -1 }); // Newest first
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. POST a new report (CREATE)
router.post('/', async (req, res) => {
  const report = new Report({
    lat: req.body.lat,
    lng: req.body.lng,
    category: req.body.category,
    description: req.body.description
  });

  try {
    const newReport = await report.save();
    res.status(201).json(newReport);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 3. PATCH a report (UPDATE)
// This allows you to edit the description or category after it's been posted
router.patch('/:id', async (req, res) => {
  try {
    const { description, category } = req.body;
    const updateData = {};
    
    if (description) updateData.description = description;
    if (category) updateData.category = category;

    const updatedReport = await Report.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true } // Returns the document AFTER the update is applied
    );

    if (!updatedReport) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json(updatedReport);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 4. DELETE a report (DELETE)
// Triggered by your "checkmark" button in the UI
router.delete('/:id', async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json({ message: 'Report resolved and deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;