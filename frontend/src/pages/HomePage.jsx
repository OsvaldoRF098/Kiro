import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useCountryStore from '../store/useCountryStore';
import { downloadSinglePdf, downloadAllPdf } from '../api/countriesApi';
import CountryCard from '../components/CountryCard';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * HomePage — main view showing the list of countries.
 *
 * Reads state from useCountryStore and handles:
 * - Fetching countries on mount
 * - Search filtering
 * - Country deletion and restoration
 * - PDF downloads (single and all)
 * - Logout
 */
export default function HomePage() {
  const navigate = useNavigate();

  const {
    isLoading,
    error,
    searchTerm,
    fetchCountries,
    deleteCountry,
    restoreCountries,
    setSearchTerm,
    filteredCountries,
  } = useCountryStore((state) => ({
    isLoading: state.isLoading,
    error: state.error,
    searchTerm: state.searchTerm,
    fetchCountries: state.fetchCountries,
    deleteCountry: state.deleteCountry,
    restoreCountries: state.restoreCountries,
    setSearchTerm: state.setSearchTerm,
    filteredCountries: state.filteredCountries(),
  }));

  const token = localStorage.getItem('token');

  // Fetch countries on mount
  useEffect(() => {
    fetchCountries(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── PDF download helpers ──────────────────────────────────────────────────

  /**
   * Download a PDF for a single country.
   * @param {Object} country
   */
  const handleDownloadSinglePdf = async (country) => {
    try {
      const blob = await downloadSinglePdf(country, token);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${country.name?.common ?? 'country'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Error al descargar el PDF: ${err.message}`);
    }
  };

  /**
   * Download a PDF for all currently visible countries.
   */
  const handleDownloadAll = async () => {
    try {
      const blob = await downloadAllPdf(filteredCountries, token);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'countries-report.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Error al descargar el PDF general: ${err.message}`);
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <h1 style={{ margin: 0 }}>Countries Explorer</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '0.4rem 1rem',
            backgroundColor: '#6b7280',
            color: '#fff',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
          }}
        >
          Cerrar sesión
        </button>
      </header>

      {/* Controls */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <SearchBar value={searchTerm} onChange={setSearchTerm} />
        <button
          onClick={restoreCountries}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#10b981',
            color: '#fff',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
          }}
        >
          Restaurar países
        </button>
        <button
          onClick={handleDownloadAll}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#8b5cf6',
            color: '#fff',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
          }}
        >
          Descargar PDF General
        </button>
      </div>

      {/* Loading state */}
      {isLoading && <LoadingSpinner />}

      {/* Error state */}
      {!isLoading && error && (
        <p role="alert" style={{ color: '#ef4444', textAlign: 'center' }}>
          No se pudieron cargar los países. Intente nuevamente.
        </p>
      )}

      {/* Empty state — no countries after deletions */}
      {!isLoading && !error && filteredCountries.length === 0 && !searchTerm && (
        <p style={{ textAlign: 'center', color: '#6b7280' }}>
          No hay países para mostrar. Restaura la lista para continuar.
        </p>
      )}

      {/* Empty state — search returned no results */}
      {!isLoading && !error && filteredCountries.length === 0 && searchTerm && (
        <p style={{ textAlign: 'center', color: '#6b7280' }}>
          No se encontraron países con ese nombre.
        </p>
      )}

      {/* Country grid */}
      {!isLoading && !error && filteredCountries.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1rem',
          }}
        >
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
  );
}
