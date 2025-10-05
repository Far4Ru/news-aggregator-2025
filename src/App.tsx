import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Header } from './components/common/Header'
import { Footer } from './components/common/Footer'
import { Home } from './pages/Home'
import { News } from './pages/News'
import { Sources } from './pages/Sources'
import { Moderation } from './pages/Moderation'
import { Suggestions } from './pages/Suggestions'
import { NewNews } from './pages/NewNews'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import './styles/main.scss'

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="app">
            <Header />
            <main className="main">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/news" element={<News />} />
                <Route path="/sources" element={<Sources />} />
                <Route path="/moderation" element={<Moderation />} />
                <Route path="/suggestions" element={<Suggestions />} />
                <Route path="/new-news" element={<NewNews />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App