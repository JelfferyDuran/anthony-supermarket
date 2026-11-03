import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import StaffApp from './staff/StaffApp.jsx';
import { configureTelegramChrome } from './lib/telegram.js';
import './styles.css';

// Telegram enhancements are progressive only; browser previews keep working.
configureTelegramChrome();

const params = new URLSearchParams(window.location.search);
const staffMode = params.get('staff') === '1' || window.location.hash.toLowerCase() === '#staff';
const RootApp = staffMode ? StaffApp : App;

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>
);
