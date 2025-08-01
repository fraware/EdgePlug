import React from 'react';
import ReactDOM from 'react-dom/client';
import HighFidelityDemo from './HighFidelityDemo';
import '../styles/globals.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <HighFidelityDemo />
  </React.StrictMode>
); 