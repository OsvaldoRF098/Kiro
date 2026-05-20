const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const { getCountries, pdfSingle, pdfAll } = require('../controllers/countriesController');

const router = express.Router();

// GET /api/countries
router.get('/', verifyToken, getCountries);

// POST /api/countries/pdf/single
router.post('/pdf/single', verifyToken, pdfSingle);

// POST /api/countries/pdf/all
router.post('/pdf/all', verifyToken, pdfAll);

module.exports = router;
