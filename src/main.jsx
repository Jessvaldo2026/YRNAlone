// FILE: src/main.jsx
// 🏭 INDUSTRIAL-GRADE ENTRY POINT
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ErrorBoundary } from './components/IndustrialGrade.jsx'

// Initialize EmailJS
if (typeof window !== 'undefined' && window.emailjs) {
  window.emailjs.init('_aQr2ZmXVBIGcYnk5');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
