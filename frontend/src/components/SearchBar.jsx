const searchStyles = `
  .search-wrapper {
    position: relative;
    flex: 1;
    max-width: 420px;
  }
  .search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1rem;
    pointer-events: none;
  }
  .search-input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.75rem;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(99,102,241,0.25);
    border-radius: 0.75rem;
    font-size: 0.95rem;
    color: #f1f5f9;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    font-family: 'Inter', sans-serif;
  }
  .search-input::placeholder { color: #475569; }
  .search-input:focus {
    border-color: #818cf8;
    box-shadow: 0 0 0 3px rgba(129,140,248,0.15);
  }
`;

export default function SearchBar({ value, onChange }) {
  return (
    <>
      <style>{searchStyles}</style>
      <div className="search-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Buscar país..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Buscar país"
          className="search-input"
        />
      </div>
    </>
  );
}
