/**
 * LoadingSpinner — visual loading indicator.
 * Uses a CSS animation via inline styles to avoid requiring a separate CSS file.
 */
export default function LoadingSpinner() {
  return (
    <div
      role="status"
      aria-label="Cargando..."
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          border: '5px solid #e0e0e0',
          borderTop: '5px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
