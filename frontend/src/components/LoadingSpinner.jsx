const spinnerStyles = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
  .spinner-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 4rem 2rem;
    gap: 1.25rem;
  }
  .spinner-ring {
    width: 56px; height: 56px;
    border: 4px solid rgba(99,102,241,0.15);
    border-top: 4px solid #818cf8;
    border-right: 4px solid #c084fc;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    box-shadow: 0 0 20px rgba(129,140,248,0.3);
  }
  .spinner-text {
    color: #64748b;
    font-size: 0.9rem;
    font-weight: 500;
    animation: pulse 1.5s ease-in-out infinite;
    letter-spacing: 0.05em;
  }
`;

export default function LoadingSpinner() {
  return (
    <>
      <style>{spinnerStyles}</style>
      <div role="status" aria-label="Cargando..." className="spinner-container">
        <div className="spinner-ring" />
        <span className="spinner-text">Cargando países...</span>
      </div>
    </>
  );
}
