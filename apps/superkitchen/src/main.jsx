import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import StaffApp from './staff/StaffApp.jsx';
import './styles.css';

// Telegram Mini App SDK (optional — enhances UX inside Telegram webview).
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

const params = new URLSearchParams(window.location.search);
const staffMode = params.get('staff') === '1' || window.location.hash.toLowerCase() === '#staff';
const RootApp = staffMode ? StaffApp : App;

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>
);
