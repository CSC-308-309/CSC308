import Home from "./pages/Home";
import { Routes, Route, Navigate } from "react-router-dom";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Events from "./pages/Events";
import Messages from "./pages/Messages";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { NotificationsProvider } from "./components/notifications/NotificationsContext";
import ProfileSetup from "./pages/ProfileSetup";
import { isLoggedIn } from "./utils/auth";

function ProtectedRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <div className="font-sans">
      <NotificationsProvider>
        <Routes>
          <Route
            path="/"
            element={
              isLoggedIn() ? <Home /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <Events />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/profilesetup"
            element={
              <ProtectedRoute>
                <ProfileSetup />
              </ProtectedRoute>
            }
          />
        </Routes>
      </NotificationsProvider>
    </div>
  );
}

export default App;
