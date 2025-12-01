import Home from './pages/Home';
import { Routes, Route } from 'react-router-dom';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Events from './pages/Events';
import Messages from './pages/Messages';

function App() {
  return (
    <>
      <div className="font-sans">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/events" element={<Events />} />
          <Route path="/messages" element={<Messages />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
