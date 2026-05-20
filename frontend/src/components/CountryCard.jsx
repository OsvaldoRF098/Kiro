/**
 * CountryCard — displays a single country's information.
 *
 * Props:
 *   country        {Object}   - CountryData object
 *   onDelete       {Function} - Called with name.common when "Eliminar" is clicked
 *   onDownloadPdf  {Function} - Called with the country object when "Descargar PDF" is clicked
 */
export default function CountryCard({ country, onDelete, onDownloadPdf }) {
  const { name, flags, population, region } = country;
  const countryName = name?.common ?? 'Unknown';
  const flagUrl = flags?.svg || flags?.png || '';
  const formattedPopulation = typeof population === 'number'
    ? population.toLocaleString()
    : 'N/A';

  return (
    <article
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        backgroundColor: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      <img
        src={flagUrl}
        alt={countryName}
        style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '0.25rem' }}
      />
      <h2 style={{ fontSize: '1.1rem', margin: 0 }}>{countryName}</h2>
      <p style={{ margin: 0 }}>
        <strong>Población:</strong> {formattedPopulation}
      </p>
      <p style={{ margin: 0 }}>
        <strong>Región:</strong> {region ?? 'N/A'}
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        <button
          onClick={() => onDelete(countryName)}
          style={{
            flex: 1,
            padding: '0.4rem 0.75rem',
            backgroundColor: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
          }}
        >
          Eliminar
        </button>
        <button
          onClick={() => onDownloadPdf(country)}
          style={{
            flex: 1,
            padding: '0.4rem 0.75rem',
            backgroundColor: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
          }}
        >
          Descargar PDF
        </button>
      </div>
    </article>
  );
}
