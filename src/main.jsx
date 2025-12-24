import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { UserProvider } from './contexts/UserContext'
import { ProgressionProvider } from './contexts/ProgressionContext'
import { CombatProvider } from './contexts/CombatContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider>
      <ProgressionProvider>
        <CombatProvider>
          <App />
        </CombatProvider>
      </ProgressionProvider>
    </UserProvider>
  </React.StrictMode>,
)