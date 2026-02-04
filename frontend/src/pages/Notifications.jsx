import Navbar from '../components/Navbar';
import NotificationsPanel from '../components/notifications/NotificationsPanel';

export default function Notifications() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <div className="flex h-screen overflow-hidden font-sans">
      <Navbar />

      <div className="flex-1 bg-gray-50 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-8 text-melodious-pink">
          Notifications
        </h1>

        <NotificationsPanel username={user?.username} />
      </div>
    </div>
  );
}
