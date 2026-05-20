'use strict';

/**
 * Custom error thrown when the RestCountries API does not respond within the timeout.
 */
class ApiTimeoutError extends Error {
  constructor(message = 'External API timeout') {
    super(message);
    this.name = 'ApiTimeoutError';
  }
}

/**
 * Custom error thrown when the RestCountries API returns a 4xx or 5xx HTTP status.
 */
class ApiError extends Error {
  constructor(message = 'External API error', cause) {
    super(message);
    this.name = 'ApiError';
    if (cause !== undefined) {
      this.cause = cause;
    }
  }
}

/**
 * Fetches the list of countries from the RestCountries API.
 *
 * Uses an AbortController with a 10-second timeout. Throws:
 *   - ApiTimeoutError  if the request is aborted due to timeout
 *   - ApiError         if the API returns a 4xx/5xx status or any other fetch error
 *
 * @returns {Promise<Array>} Parsed JSON array of country objects
 */
async function fetchCountries() {
  const RESTCOUNTRIES_URL = process.env.RESTCOUNTRIES_URL;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(RESTCOUNTRIES_URL, { signal: controller.signal });

    if (!res.ok) {
      throw new ApiError(`External API error: HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new ApiTimeoutError();
    }
    // Re-throw ApiError instances as-is; wrap anything else
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError('External API error', err);
  } finally {
    clearTimeout(timeoutId);
  }
}

module.exports = { fetchCountries, ApiTimeoutError, ApiError };
