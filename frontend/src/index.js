import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import App from './App';
import './index.css';

const muiCache = createCache({
  key: 'mui',
  prepend: true,
});

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <CacheProvider value={muiCache}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </CacheProvider>
  </React.StrictMode>
);