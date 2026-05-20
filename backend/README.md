# Countries Explorer — Backend

Node.js/Express API that serves as a proxy for the RestCountries API, handles JWT authentication, and generates PDF reports.

## Environment Variables (Railway)

Configure the following environment variables in your Railway service:

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port the server listens on (Railway sets this automatically) | `3001` |
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/countries-explorer` |
| `JWT_SECRET` | Secret key for signing JWT tokens (use a random 256-bit string) | `your-secret-here` |
| `RESTCOUNTRIES_URL` | Full URL for the RestCountries API endpoint | `https://restcountries.com/v3.1/all?fields=name,capital,population,region,flags` |

## Running Locally

1. Copy `.env.example` to `.env` and fill in the values.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Seed the test user in MongoDB (required before first login):
   ```bash
   node src/scripts/seedUser.js
   ```
   This creates a user with:
   - Email: `admin@example.com`
   - Password: `changeme123`

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | No | Health check |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/countries` | JWT | List of countries |
| POST | `/api/countries/pdf/single` | JWT | PDF for one country |
| POST | `/api/countries/pdf/all` | JWT | PDF for all countries |

## Deployment on Railway

1. Create a new Railway service pointing to the `backend/` directory.
2. Set all environment variables listed above.
3. Railway will automatically run `npm start` (`node src/index.js`).
4. After deployment, run the seed script once via Railway's shell or a one-off job:
   ```bash
   node src/scripts/seedUser.js
   ```
