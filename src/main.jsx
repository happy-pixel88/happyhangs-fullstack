import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { SWRConfig } from 'swr'
import App from './App.jsx'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SWRConfig value={{ revalidateOnFocus: false, dedupingInterval: 3600000 }}>
        <App />
      </SWRConfig>
    </BrowserRouter>
  </React.StrictMode>,
)