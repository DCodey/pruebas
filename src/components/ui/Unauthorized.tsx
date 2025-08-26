import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes/paths';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div
      style={{
        padding: '2rem',
        textAlign: 'center',
        maxWidth: '600px',
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif',
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <h1 style={{ color: '#e53e3e' }}>No autorizado</h1>
      <p style={{ marginTop: 8 }}>Debes iniciar sesión para acceder a esta página.</p>
      <button
        onClick={() => navigate(ROUTES.LOGIN)}
        style={{
          display: 'inline-block',
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          backgroundColor: '#4299e1',
          color: 'white',
          textDecoration: 'none',
          border: 'none',
          borderRadius: '0.25rem',
          fontWeight: 600,
          fontSize: 16,
          cursor: 'pointer',
        }}
      >
        Iniciar sesión
      </button>
    </div>
  );
};

export default Unauthorized;
