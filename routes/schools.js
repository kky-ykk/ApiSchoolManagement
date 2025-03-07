const express = require('express');
const router = express.Router();
const db = require('../config/db');

console.log("::",db);

// Helper function to calculate distance using Haversine formula
const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

// **Add School API**
router.post('/addSchool', (req, res) => {
    const { id,name, address, latitude, longitude } = req.body;

    // Validation
    if (!id || !name || !address || !latitude || !longitude) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const sql = 'INSERT INTO schools (id, name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
    db.query(sql, [id,name, address, latitude, longitude], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'School added successfully', schoolId: result.insertId });
    });
});

// **List Schools API**
router.get('/listSchools', (req, res) => {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Latitude and Longitude are required' });
    }

    db.query('SELECT * FROM schools', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const userLat = parseFloat(latitude);
        const userLon = parseFloat(longitude);

        // Calculate distance and sort
        const sortedSchools = results.map(school => {
            return {
                ...school,
                distance: getDistance(userLat, userLon, school.latitude, school.longitude)
            };
        }).sort((a, b) => a.distance - b.distance);

        res.json(sortedSchools);
    });
});

module.exports = router;
