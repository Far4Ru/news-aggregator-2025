import { HashRouter as Router, Routes, Route } from 'react-router-dom';

import { Footer } from './components/common/Footer';
import { Header } from './components/common/Header';
import { AuthProvider } from './context/AuthProvider';
import { NotificationProvider } from './context/NotificationProvider';
import { Home } from './pages/Home';
import { Moderation } from './pages/Moderation';
import { NewNews } from './pages/NewNews';
import { News } from './pages/News';
import { NewSources } from './pages/NewSources';
import { Sources } from './pages/Sources';
import { Suggestions } from './pages/Suggestions';
import './styles/main.scss';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router basename={import.meta.env.VITE_BASE_URL}>
          <div className='app'>
            <Header />
            <main className='main'>
              <Routes>
                <Route path='/' element={<News />} />
                <Route path='/about' element={<Home />} />
                <Route path='/sources' element={<Sources />} />
                <Route path='/moderation' element={<Moderation />} />
                <Route path='/suggestions' element={<Suggestions />} />
                <Route path='/new-news' element={<NewNews />} />
                <Route path='/new-sources' element={<NewSources />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
