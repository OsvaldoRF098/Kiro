import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useCountryStore from '../store/useCountryStore';
import { downloadSinglePdf, downloadAllPdf } from '../api/countriesApi';
import CountryCard from '../components/CountryCard';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';

const homeStyles = `
  .home-root {
    min-height: 100vh;
    background: #0f172a;
  }
  .home-header {
    background: rgba(15,23,42,0.95);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(99,102,241,0.15);
    position: sticky;
    top: 0;
    z-index: 100;
    padding: 0 1.5rem;
  }
  .header-inner {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
    gap: 1rem;
  }
  .header-brand {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    text-decoration: none;
  }
  .header-brand .globe { font-size: 1.5rem; }
  .header-brand h1 {
    font-size: 1.2rem;
    font-weight: 800;
    background: linear-gradient(135deg, #818cf8, #c084fc);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    white-space: nowrap;
  }
  .header-count {
    background: rgba(99,102,241,0.15);
    border: 1px solid rgba(99,102,241,0.25);
    color: #a5b4fc;
    font-size: 0.78rem;
    font-weight: 600;
    padding: 0.2rem 0.65rem;
    border-radius: 999px;
    white-space: nowrap;
  }
  .btn-logout {
    padding: 0.45rem 1rem;
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.25);
    color: #f87171;
    border-radius: 0.6rem;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
    font-family: 'Inter', sans-serif;
    white-space: nowrap;
  }
  .btn-logout:hover {
    background: rgba(239,68,68,0.2);
    border-color: rgba(239,68,68,0.4);
  }
  .home-controls {
    max-width: 1400px;
    margin: 0 auto;
    padding: 1.5rem 1.5rem 0;
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    align-items: center;
  }
  .btn-restore {
    padding: 0.7rem 1.2rem;
    background: rgba(16,185,129,0.1);
    border: 1px solid rgba(16,185,129,0.3);
    color: #34d399;
    border-radius: 0.75rem;
    font-size: 0.88rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, transform 0.1s;
    font-family: 'Inter', sans-serif;
    white-space: nowrap;
  }
  .btn-restore:hover {
    background: rgba(16,185,129,0.2);
    border-color: rgba(16,185,129,0.5);
    transform: translateY(-1px);
  }
  .btn-pdf-all {
    padding: 0.7rem 1.2rem;
    background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.2));
    border: 1px solid rgba(139,92,246,0.35);
    color: #c084fc;
    border-radius: 0.75rem;
    font-size: 0.88rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, transform 0.1s;
    font-family: 'Inter', sans-serif;
    white-space: nowrap;
  }
  .btn-pdf-all:hover {
    background: linear-gradient(135deg, rgba(139,92,246,0.3), rgba(236,72,153,0.3));
    border-color: rgba(139,92,246,0.55);
    transform: translateY(-1px);
  }
  .home-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 1.5rem;
  }
  .hero-banner {
    background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08));
    border: 1px solid rgba(99,102,241,0.15);
    border-radius: 1.25rem;
    padding: 1.5rem 2rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .hero-banner .hero-icon { font-size: 2.5rem; }
  .hero-banner h2 {
    font-size: 1.1rem;
    font-weight: 700;
    color: #e2e8f0;
    margin-bottom: 0.2rem;
  }
  .hero-banner p { font-size: 0.85rem; color: #64748b; }
  .stats-row {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-left: auto;
  }
  .stat-chip {
    background: rgba(15,23,42,0.6);
    border: 1px solid rgba(99,102,241,0.2);
    border-radius: 0.75rem;
    padding: 0.6rem 1rem;
    text-align: center;
    min-width: 90px;
  }
  .stat-chip .stat-num {
    font-size: 1.3rem;
    font-weight: 800;
    background: linear-gradient(135deg, #818cf8, #c084fc);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: block;
  }
  .stat-chip .stat-label {
    font-size: 0.7rem;
    color: #64748b;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .countries-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    color: #475569;
  }
  .empty-state .empty-icon { font-size: 3rem; margin-bottom: 1rem; display: block; }
  .empty-state p { font-size: 1rem; font-weight: 500; }
  .error-state {
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.2);
    border-radius: 1rem;
    padding: 2rem;
    text-align: center;
    color: #f87171;
  }
  .error-state .error-icon { font-size: 2.5rem; margin-bottom: 0.75rem; display: block; }
`;

export default function HomePage() {
  const navigate = useNavigate();

  const {
    isLoading, error, searchTerm,
    fetchCountries, deleteCountry, restoreCountries,
    setSearchTerm, filteredCountries, countries,
  } = useCountryStore((state) => ({
    isLoading: state.isLoading,
    error: state.error,
    searchTerm: state.searchTerm,
    fetchCountries: state.fetchCountries,
    deleteCountry: state.deleteCountry,
    restoreCountries: state.restoreCountries,
    setSearchTerm: state.setSearchTerm,
    filteredCountries: state.filteredCountries(),
    countries: state.countries,
  }));

  const token = localStorage.getItem('token');

  useEffect(() => { fetchCountries(token); }, []); // eslint-disable-line

  const handleDownloadSinglePdf = async (country) => {
    try {
      const blob = await downloadSinglePdf(country, token);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${country.name?.common ?? 'country'}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (err) { alert(`Error al descargar el PDF: ${err.message}`); }
  };

  const handleDownloadAll = async () => {
    try {
      const blob = await downloadAllPdf(filteredCountries, token);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'countries-report.pdf';
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (err) { alert(`Error al descargar el PDF general: ${err.message}`); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <>
      <style>{homeStyles}</style>
      <div className="home-root">
        {/* Sticky Header */}
        <header className="home-header">
          <div className="header-inner">
            <div className="header-brand">
              <span className="globe">🌍</span>
              <h1>Countries Explorer</h1>
            </div>
            {!isLoading && !error && (
              <span className="header-count">
                {filteredCountries.length} países
              </span>
            )}
            <button className="btn-logout" onClick={handleLogout}>
              🚪 Cerrar sesión
            </button>
          </div>
        </header>

        {/* Controls bar */}
        <div className="home-controls">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
          <button className="btn-restore" onClick={restoreCountries}>
            🔄 Restaurar países
          </button>
          <button className="btn-pdf-all" onClick={handleDownloadAll}>
            📥 Descargar PDF General
          </button>
        </div>

        <div className="home-content">
          {/* Hero banner */}
          {!isLoading && !error && filteredCountries.length > 0 && (
            <div className="hero-banner">
              <span className="hero-icon">🗺️</span>
              <div>
                <h2>Explora el mundo</h2>
                <p>Busca, filtra y descarga información de cualquier país</p>
              </div>
              <div className="stats-row">
                <div className="stat-chip">
                  <span className="stat-num">{filteredCountries.length}</span>
                  <span className="stat-label">Visibles</span>
                </div>
                <div className="stat-chip">
                  <span className="stat-num">{countries.length}</span>
                  <span className="stat-label">Activos</span>
                </div>
              </div>
            </div>
          )}

          {/* Loading */}
          {isLoading && <LoadingSpinner />}

          {/* Error */}
          {!isLoading && error && (
            <div className="error-state" role="alert">
              <span className="error-icon">⚠️</span>
              <p>No se pudieron cargar los países. Intente nuevamente.</p>
            </div>
          )}

          {/* Empty — no countries after deletions */}
          {!isLoading && !error && filteredCountries.length === 0 && !searchTerm && (
            <div className="empty-state">
              <span className="empty-icon">🗑️</span>
              <p>No hay países para mostrar.<br />Restaura la lista para continuar.</p>
            </div>
          )}

          {/* Empty — search no results */}
          {!isLoading && !error && filteredCountries.length === 0 && searchTerm && (
            <div className="empty-state">
              <span className="empty-icon">🔍</span>
              <p>No se encontraron países con ese nombre.</p>
            </div>
          )}

          {/* Grid */}
          {!isLoading && !error && filteredCountries.length > 0 && (
            <div className="countries-grid">
              {filteredCountries.map((country) => (
                <CountryCard
                  key={country.name?.common}
                  country={country}
                  onDelete={deleteCountry}
                  onDownloadPdf={handleDownloadSinglePdf}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
