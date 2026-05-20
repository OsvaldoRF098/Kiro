'use strict';

const { fetchCountries, ApiTimeoutError, ApiError } = require('../services/restCountriesService');
const { generateSinglePdf, generateAllPdf } = require('../services/pdfService');

/**
 * GET /api/countries
 *
 * Proxies the RestCountries API and returns the full list of countries.
 *
 * Responses:
 *   200 — CountryData[]
 *   502 — { message: "External API error" }
 *   504 — { message: "External API timeout" }
 *   500 — { message: "Internal server error" }
 */
async function getCountries(req, res) {
  try {
    const countries = await fetchCountries();
    return res.status(200).json(countries);
  } catch (err) {
    if (err instanceof ApiTimeoutError) {
      return res.status(504).json({ message: 'External API timeout' });
    }
    if (err instanceof ApiError) {
      return res.status(502).json({ message: 'External API error' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * POST /api/countries/pdf/single
 *
 * Generates a PDF for a single country.
 * Expects body: CountryData (name, capital, population, region, flags)
 *
 * Responses:
 *   200 — application/pdf binary
 *   400 — { message: "Datos de país inválidos o incompletos" }
 *   500 — { message: "Internal server error" }
 */
async function pdfSingle(req, res) {
  try {
    const country = req.body;

    // Validate required fields
    if (
      !country ||
      !country.name ||
      !country.capital ||
      country.population === undefined ||
      country.population === null ||
      !country.region ||
      !country.flags
    ) {
      return res.status(400).json({ message: 'Datos de país inválidos o incompletos' });
    }

    const pdfBuffer = await generateSinglePdf(country);
    const filename = encodeURIComponent(country.name.common || 'country');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
    return res.status(200).send(pdfBuffer);
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * POST /api/countries/pdf/all
 *
 * Generates a PDF for all countries in the provided list.
 * Expects body: CountryData[]
 *
 * Responses:
 *   200 — application/pdf binary
 *   400 — { message: "La lista de países está vacía" }
 *   500 — { message: "Internal server error" }
 */
async function pdfAll(req, res) {
  try {
    const countries = req.body;

    if (!Array.isArray(countries) || countries.length === 0) {
      return res.status(400).json({ message: 'La lista de países está vacía' });
    }

    const pdfBuffer = await generateAllPdf(countries);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="countries-report.pdf"');
    return res.status(200).send(pdfBuffer);
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { getCountries, pdfSingle, pdfAll };
