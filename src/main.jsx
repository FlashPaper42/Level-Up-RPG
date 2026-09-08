import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { UserProvider } from './contexts/UserContext'
import { ProgressionProvider } from './contexts/ProgressionContext'
import { CombatProvider } from './contexts/CombatContext'
import { AuthProvider } from './contexts/AuthContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <UserProvider>
        <ProgressionProvider>
          <CombatProvider>
            <App />
          </CombatProvider>
        </ProgressionProvider>
      </UserProvider>
    </AuthProvider>
  </React.StrictMode>,
)