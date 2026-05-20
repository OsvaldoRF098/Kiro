const BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Authenticate a user and retrieve a JWT token.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ token: string }>}
 */
export async function login(email, password) {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(`Login failed with status ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch the list of countries from the backend.
 * @param {string} token - JWT token
 * @returns {Promise<Array>} Array of country objects
 */
export async function getCountries(token) {
  const response = await fetch(`${BASE_URL}/api/countries`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch countries with status ${response.status}`);
  }

  return response.json();
}

/**
 * Download a PDF for a single country.
 * @param {Object} country - Country data object
 * @param {string} token - JWT token
 * @returns {Promise<Blob>}
 */
export async function downloadSinglePdf(country, token) {
  const response = await fetch(`${BASE_URL}/api/countries/pdf/single`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(country),
  });

  if (!response.ok) {
    throw new Error(`Failed to download single PDF with status ${response.status}`);
  }

  return response.blob();
}

/**
 * Download a PDF containing all visible countries.
 * @param {Array} countries - Array of country data objects
 * @param {string} token - JWT token
 * @returns {Promise<Blob>}
 */
export async function downloadAllPdf(countries, token) {
  const response = await fetch(`${BASE_URL}/api/countries/pdf/all`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(countries),
  });

  if (!response.ok) {
    throw new Error(`Failed to download all PDF with status ${response.status}`);
  }

  return response.blob();
}
