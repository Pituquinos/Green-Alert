import React from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
function App() {
  const [status, setStatus] = React.useState('Comprobando conexión…');
  React.useEffect(() => {
    fetch('/api/v1/health')
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then(() => setStatus('API Gateway disponible'))
      .catch(() => setStatus('API Gateway no disponible'));
  }, []);
  return (
    <main>
      <p>PLATAFORMA AMBIENTAL</p>
      <h1>Green Alert 2.0</h1>
      <h2>Una base para cuidar nuestro entorno.</h2>
      <p>Infraestructura inicial · Etapas 1–3</p>
      <output>{status}</output>
      <p>Los reportes y la autenticación se implementarán en las siguientes etapas.</p>
    </main>
  );
}
createRoot(document.getElementById('root')!).render(<App />);
