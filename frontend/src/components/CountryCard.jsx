import { useState } from 'react';

const cardStyles = `
  .country-card {
    background: rgba(30, 41, 59, 0.7);
    border: 1px solid rgba(99,102,241,0.15);
    border-radius: 1rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
    cursor: default;
  }
  .country-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.3);
    border-color: rgba(99,102,241,0.4);
  }
  .card-flag {
    width: 100%;
    height: 130px;
    object-fit: cover;
    display: block;
  }
  .card-body {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    flex: 1;
  }
  .card-name {
    font-size: 1rem;
    font-weight: 700;
    color: #f1f5f9;
    line-height: 1.3;
    margin: 0;
  }
  .card-info {
    font-size: 0.82rem;
    color: #94a3b8;
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }
  .card-info span.label {
    color: #64748b;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.72rem;
    letter-spacing: 0.04em;
  }
  .card-info span.value {
    color: #cbd5e1;
    font-weight: 500;
  }
  .card-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    background: rgba(99,102,241,0.15);
    border: 1px solid rgba(99,102,241,0.25);
    color: #a5b4fc;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    width: fit-content;
    margin-top: 0.2rem;
  }
  .card-actions {
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem 1rem 1rem;
  }
  .btn-delete {
    flex: 1;
    padding: 0.5rem 0.5rem;
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.3);
    color: #f87171;
    border-radius: 0.6rem;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, transform 0.1s;
    font-family: 'Inter', sans-serif;
  }
  .btn-delete:hover {
    background: rgba(239,68,68,0.2);
    border-color: rgba(239,68,68,0.5);
    transform: scale(1.02);
  }
  .btn-pdf {
    flex: 1;
    padding: 0.5rem 0.5rem;
    background: rgba(99,102,241,0.15);
    border: 1px solid rgba(99,102,241,0.3);
    color: #a5b4fc;
    border-radius: 0.6rem;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, transform 0.1s;
    font-family: 'Inter', sans-serif;
  }
  .btn-pdf:hover {
    background: rgba(99,102,241,0.25);
    border-color: rgba(99,102,241,0.5);
    transform: scale(1.02);
  }
`;

const regionEmoji = {
  Africa: '🌍', Americas: '🌎', Asia: '🌏', Europe: '🌍', Oceania: '🌏', Antarctic: '🧊',
};

export default function CountryCard({ country, onDelete, onDownloadPdf }) {
  const [imgError, setImgError] = useState(false);
  const { name, flags, population, region } = country;
  const countryName = name?.common ?? 'Unknown';
  const flagUrl = flags?.svg || flags?.png || '';
  const formattedPopulation = typeof population === 'number'
    ? population.toLocaleString('es-ES')
    : 'N/A';
  const emoji = regionEmoji[region] ?? '🌐';

  return (
    <>
      <style>{cardStyles}</style>
      <article className="country-card">
        {!imgError ? (
          <img
            src={flagUrl} alt={`Bandera de ${countryName}`}
            className="card-flag"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="card-flag" style={{
            background: 'linear-gradient(135deg, #1e293b, #334155)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '3rem',
          }}>🏳️</div>
        )}

        <div className="card-body">
          <h2 className="card-name">{countryName}</h2>
          <div className="card-info">
            <span className="label">👥 Población</span>
            <span className="value">{formattedPopulation}</span>
          </div>
          <div className="card-badge">{emoji} {region ?? 'N/A'}</div>
        </div>

        <div className="card-actions">
          <button className="btn-delete" onClick={() => onDelete(countryName)}>
            🗑 Eliminar
          </button>
          <button className="btn-pdf" onClick={() => onDownloadPdf(country)}>
            📄 PDF
          </button>
        </div>
      </article>
    </>
  );
}
