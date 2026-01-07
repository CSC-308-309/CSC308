import {
  Home,
  User,
  MessageSquare,
  Bell,
  Calendar,
  Settings,
  LogOut,
  LogIn,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import logoIcon from '../assets/logo.svg';
import { isLoggedIn, logout } from '../utils/auth';

export default function Navbar() {
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav
      className="flex flex-col w-[215px] text-white"
      style={{
        background:
          'linear-gradient(180deg, #A376A2 0%, #8D5F8C 50%, #7E5179 100%)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-6 border-b border-gray-200">
        <img src={logoIcon} alt="Mic" className="w-8 h-8" />
        <h1 className="text-2xl font-semibold font-nunito">
          Melodious
        </h1>
      </div>

      {/* Main Nav */}
      <div className="flex-1 py-4">
        <Link to="/">
          <NavItem icon={<Home />} label="Home" />
        </Link>

        {loggedIn && (
          <>
            <Link to="/profile">
              <NavItem icon={<User />} label="Profile" />
            </Link>

            <Link to="/messages">
              <NavItem icon={<MessageSquare />} label="Messages" />
            </Link>

            <Link to="/notifications">
              <NavItem icon={<Bell />} label="Notifications" />
            </Link>

            <Link to="/events">
              <NavItem icon={<Calendar />} label="Events" />
            </Link>
          </>
        )}

        {!loggedIn && (
          <>
            <Link to="/login">
              <NavItem icon={<LogIn />} label="Login" />
            </Link>

            <Link to="/signup">
              <NavItem icon={<User />} label="Sign Up" />
            </Link>
          </>
        )}
      </div>

      {/* Bottom */}
      {loggedIn && (
        <div className="border-t border-gray-200 py-4">
          <Link to="/settings">
            <NavItem icon={<Settings />} label="Settings" />
          </Link>

          <button onClick={handleLogout} className="w-full">
            <NavItem icon={<LogOut />} label="Log out" />
          </button>
        </div>
      )}
    </nav>
  );
}

function NavItem({ icon, label }) {
  return (
    <div className="flex items-center gap-4 w-full px-6 py-3 hover:bg-white hover:bg-opacity-10 transition-colors cursor-pointer">
      <div className="w-6 h-6">{icon}</div>
      <span className="text-base font-medium">{label}</span>
    </div>
  );
}
