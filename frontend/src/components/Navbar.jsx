import {
  Home,
  User,
  MessageSquare,
  Bell,
  Calendar,
  Settings,
  LogOut,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import logoIcon from '../assets/logo.svg';

export default function Navbar() {
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
        <h1
          className="text-2xl font-semibold"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          Melodious
        </h1>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4">
        <Link to="/" className="block">
          <NavItem icon={<Home />} label="Home" />
        </Link>

        <Link to="/profile" className="block">
          <NavItem icon={<User />} label="Profile" />
        </Link>

        <NavItem icon={<MessageSquare />} label="Messages" />

        <Link to="/notifications" className="block">
          <NavItem icon={<Bell />} label="Notifications" />
        </Link>

        <NavItem icon={<Calendar />} label="Events" />
      </div>

      {/* Bottom Settings */}
      <div className="border-t border-gray-200 py-4">
        <NavItem icon={<Settings />} label="Settings" />
        <NavItem icon={<LogOut />} label="Log out" />
      </div>
    </nav>
  );
}

function NavItem({ icon, label }) {
  return (
    <button className="flex items-center gap-4 w-full px-6 py-3 hover:bg-white hover:bg-opacity-10 transition-colors">
      <div className="w-6 h-6">{icon}</div>
      <span className="text-base font-medium">{label}</span>
    </button>
  );
}
