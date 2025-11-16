import Home from './pages/Home';
import { Routes, Route } from 'react-router-dom';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';

function App() {
  return (
    <>
      <div className="font-sans">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
