'use strict';

// Set JWT_SECRET before importing app
const JWT_SECRET = 'test-jwt-secret-integration';
process.env.JWT_SECRET = JWT_SECRET;

// Mock the restCountriesService module before importing app
jest.mock('../services/restCountriesService');

const jwt = require('jsonwebtoken');
const request = require('supertest');
const { fetchCountries, ApiTimeoutError, ApiError } = require('../services/restCountriesService');

const app = require('../index');

// Generate a valid token for use in tests
const VALID_TOKEN = jwt.sign({ userId: 'test-user-id', email: 'test@example.com' }, JWT_SECRET, {
  expiresIn: '1h',
});

const SAMPLE_COUNTRIES = [
  {
    name: { common: 'Germany', official: 'Federal Republic of Germany' },
    capital: ['Berlin'],
    population: 83240525,
    region: 'Europe',
    flags: { svg: 'https://flagcdn.com/de.svg', png: 'https://flagcdn.com/w320/de.png' },
  },
  {
    name: { common: 'France', official: 'French Republic' },
    capital: ['Paris'],
    population: 67391582,
    region: 'Europe',
    flags: { svg: 'https://flagcdn.com/fr.svg', png: 'https://flagcdn.com/w320/fr.png' },
  },
];

beforeEach(() => {
  // Reset all mocks before each test
  jest.resetAllMocks();
});

describe('GET /api/countries — integration tests', () => {
  it('returns HTTP 401 with "Token no proporcionado" when no Authorization header is sent', async () => {
    const res = await request(app).get('/api/countries');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Token no proporcionado' });
  });

  it('returns HTTP 401 with "Token inválido" when an invalid token is sent', async () => {
    const res = await request(app)
      .get('/api/countries')
      .set('Authorization', 'Bearer this.is.not.a.valid.token');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Token inválido' });
  });

  it('returns HTTP 200 with the countries array when the service succeeds', async () => {
    fetchCountries.mockResolvedValue(SAMPLE_COUNTRIES);

    const res = await request(app)
      .get('/api/countries')
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(SAMPLE_COUNTRIES.length);

    // Verify required fields are present on each country
    res.body.forEach((country) => {
      expect(country).toHaveProperty('name');
      expect(country).toHaveProperty('capital');
      expect(country).toHaveProperty('population');
      expect(country).toHaveProperty('region');
      expect(country).toHaveProperty('flags');
    });
  });

  it('returns HTTP 504 with "External API timeout" when the service throws ApiTimeoutError', async () => {
    fetchCountries.mockRejectedValue(new ApiTimeoutError());

    const res = await request(app)
      .get('/api/countries')
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(res.status).toBe(504);
    expect(res.body).toEqual({ message: 'External API timeout' });
  });

  it('returns HTTP 502 with "External API error" when the service throws ApiError', async () => {
    fetchCountries.mockRejectedValue(new ApiError());

    const res = await request(app)
      .get('/api/countries')
      .set('Authorization', `Bearer ${VALID_TOKEN}`);

    expect(res.status).toBe(502);
    expect(res.body).toEqual({ message: 'External API error' });
  });
});
