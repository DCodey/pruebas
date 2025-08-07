import React from 'react';

export default function NotFound() {
  return React.createElement('div', { 
    style: { 
      padding: '2rem', 
      textAlign: 'center',
      maxWidth: '600px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    } 
  },
    React.createElement('h1', { style: { color: '#e53e3e' } }, '404 - Página no encontrada'),
    React.createElement('p', null, 'Lo sentimos, la página que buscas no existe o ha sido movida.'),
    React.createElement('a', { 
      href: '/',
      style: {
        display: 'inline-block',
        marginTop: '1rem',
        padding: '0.5rem 1rem',
        backgroundColor: '#4299e1',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '0.25rem'
      }
    }, 'Volver al inicio')
  );
}
