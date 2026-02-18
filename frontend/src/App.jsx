import Home from "./pages/Home";
import { Routes, Route } from "react-router-dom";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Events from "./pages/Events";
import Messages from "./pages/Messages";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { NotificationsProvider } from "./components/notifications/NotificationsContext";
import ProfileSetup from "./pages/ProfileSetup";

function getUsernameFromStorage() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user?.username || null;
  } catch {
    return null;
  }
}

function App() {
  const username = getUsernameFromStorage();

  return (
    <div className="font-sans">
      <NotificationsProvider username={username}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/events" element={<Events />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profilesetup" element={<ProfileSetup />} />
        </Routes>
      </NotificationsProvider>
    </div>
  );
}

export default App;
