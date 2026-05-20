'use strict';

const PDFDocument = require('pdfkit');

/**
 * Collects a PDFDocument stream into a Buffer.
 * @param {PDFDocument} doc
 * @returns {Promise<Buffer>}
 */
function collectBuffer(doc) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
}

/**
 * Fetches an image from a URL and returns its Buffer.
 * Returns null if the fetch fails or the response is not OK.
 * @param {string} url
 * @returns {Promise<Buffer|null>}
 */
async function fetchImageBuffer(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  }
}

/**
 * Generates a PDF for a single country, including its flag image.
 *
 * @param {object} country - CountryData object
 * @returns {Promise<Buffer>}
 */
async function generateSinglePdf(country) {
  const doc = new PDFDocument({ margin: 50 });
  const bufferPromise = collectBuffer(doc);

  const name = country.name?.common ?? 'Unknown';
  const capital = Array.isArray(country.capital) && country.capital.length > 0
    ? country.capital[0]
    : 'N/A';
  const population = typeof country.population === 'number'
    ? country.population.toLocaleString()
    : 'N/A';
  const region = country.region ?? 'N/A';
  const flagUrl = country.flags?.svg || country.flags?.png || null;

  // Title
  doc.fontSize(24).font('Helvetica-Bold').text(name, { align: 'center' });
  doc.moveDown(0.5);

  // Flag image
  if (flagUrl) {
    const imageBuffer = await fetchImageBuffer(flagUrl);
    if (imageBuffer) {
      try {
        doc.image(imageBuffer, { fit: [200, 130], align: 'center' });
        doc.moveDown(0.5);
      } catch {
        // Skip image if pdfkit cannot embed it (e.g. unsupported format)
      }
    }
  }

  doc.moveDown(0.5);

  // Country details
  doc.fontSize(12).font('Helvetica-Bold').text('Capital: ', { continued: true })
     .font('Helvetica').text(capital);

  doc.fontSize(12).font('Helvetica-Bold').text('Población: ', { continued: true })
     .font('Helvetica').text(population);

  doc.fontSize(12).font('Helvetica-Bold').text('Región: ', { continued: true })
     .font('Helvetica').text(region);

  doc.end();

  return bufferPromise;
}

/**
 * Generates a PDF listing all countries (no flag images to avoid network calls).
 *
 * @param {object[]} countries - Array of CountryData objects
 * @returns {Promise<Buffer>}
 */
async function generateAllPdf(countries) {
  const doc = new PDFDocument({ margin: 50 });
  const bufferPromise = collectBuffer(doc);

  // Title
  doc.fontSize(20).font('Helvetica-Bold').text('Countries Report', { align: 'center' });
  doc.moveDown(1);

  countries.forEach((country, index) => {
    const name = country.name?.common ?? 'Unknown';
    const capital = Array.isArray(country.capital) && country.capital.length > 0
      ? country.capital[0]
      : 'N/A';
    const population = typeof country.population === 'number'
      ? country.population.toLocaleString()
      : 'N/A';
    const region = country.region ?? 'N/A';

    if (index > 0) {
      doc.moveDown(0.5)
         .strokeColor('#cccccc')
         .lineWidth(0.5)
         .moveTo(50, doc.y)
         .lineTo(doc.page.width - 50, doc.y)
         .stroke()
         .moveDown(0.5);
    }

    doc.fontSize(13).font('Helvetica-Bold').text(name);
    doc.fontSize(11).font('Helvetica-Bold').text('Capital: ', { continued: true })
       .font('Helvetica').text(capital);
    doc.fontSize(11).font('Helvetica-Bold').text('Población: ', { continued: true })
       .font('Helvetica').text(population);
    doc.fontSize(11).font('Helvetica-Bold').text('Región: ', { continued: true })
       .font('Helvetica').text(region);
  });

  doc.end();

  return bufferPromise;
}

module.exports = { generateSinglePdf, generateAllPdf };
