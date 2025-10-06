import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Header } from './components/common/Header'
import { Footer } from './components/common/Footer'
import { Home } from './pages/Home'
import { News } from './pages/News'
import { Sources } from './pages/Sources'
import { Moderation } from './pages/Moderation'
import { Suggestions } from './pages/Suggestions'
import { NewNews } from './pages/NewNews'
import './styles/main.scss'
import { AuthProvider } from './context/AuthProvider'
import { NotificationProvider } from './context/NotificationProvider'

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router basename={import.meta.env.VITE_BASE_URL}>
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