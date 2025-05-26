import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // ગ્લોબલ સ્ટાઇલ અથવા Tailwind CSS
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);