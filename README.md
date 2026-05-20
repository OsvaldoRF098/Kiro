# Countries Explorer MERN

Full-stack web application built with the MERN stack (MongoDB, Express, React, Node.js). Displays country information from the RestCountries API with search, deletion, restoration, and PDF generation features.

## Project Structure

```
├── backend/    # Node.js/Express API
└── frontend/   # React app (Vite)
```

See [backend/README.md](./backend/README.md) and [frontend/README.md](./frontend/README.md) for setup and deployment instructions.

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Production — only receives merges from `develop` via PR |
| `develop` | Integration — all feature branches merge here first |
| `feature/*` | Individual features — branched from `develop`, merged back via PR |

### Workflow

1. Create a feature branch from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/my-feature
   ```
2. Develop and commit your changes.
3. Open a Pull Request from `feature/my-feature` → `develop`.
4. After review and CI passes, merge into `develop`.
5. When `develop` is stable and ready for release, open a PR from `develop` → `main`.

### Rules

- **Never push directly to `main` or `develop`** — always use Pull Requests.
- All PRs require at least one review before merging.
- Branch names must follow the `feature/`, `fix/`, or `chore/` prefix convention.
