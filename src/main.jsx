import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ReactLenis } from 'lenis/react';
import App from './App';
import { ThemeProvider } from './hooks/ThemeProvider';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import 'lenis/dist/lenis.css';
import './index.css'; // Asegúrate de que aquí importes tus estilos de Tailwind

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ReactLenis
      root
      options={{
        duration: 1.2,
        lerp: 0.08,
        smoothWheel: true,
        smoothTouch: false, // Desactivar en móviles para usar scroll inercial nativo súper fluido
        syncTouch: false,
      }}
    >
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <App />
            <Toaster
              position="top-center"
              gutter={12}
              toastOptions={{
                duration: 4500,
                style: {
                  background: 'transparent',
                  boxShadow: 'none',
                  padding: 0,
                  maxWidth: 'none',
                },
              }}
            />
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </ReactLenis>
  </React.StrictMode>
);