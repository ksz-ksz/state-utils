if (process.env.NODE_ENV === 'development') {
  new EventSource('/esbuild').addEventListener('change', () =>
    location.reload()
  );
}

import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './app';

const rootElement = document.getElementById('root');
if (rootElement !== null) {
  const root = createRoot(rootElement);

  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
