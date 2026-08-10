import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { getGoogleFontsUrl } from '../shared/fonts.js'

if (!document.getElementById('datebg-google-fonts')) {
  const link = document.createElement('link')
  link.id = 'datebg-google-fonts'
  link.rel = 'stylesheet'
  link.href = getGoogleFontsUrl()
  document.head.appendChild(link)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
