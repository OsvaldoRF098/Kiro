/**
 * SearchBar — text input for filtering countries by name.
 *
 * Props:
 *   value    {string}   - Controlled input value
 *   onChange {Function} - Called with the new text on every keystroke
 */
export default function SearchBar({ value, onChange }) {
  return (
    <input
      type="text"
      placeholder="Buscar país..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Buscar país"
      style={{
        padding: '0.5rem 1rem',
        fontSize: '1rem',
        border: '1px solid #d1d5db',
        borderRadius: '0.375rem',
        width: '100%',
        maxWidth: '400px',
        outline: 'none',
      }}
    />
  );
}
