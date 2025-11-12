// src/pages/Notifications.jsx
import Navbar from "../components/Navbar";

export default function Notifications() {

  // example notifs
  const notifications = [
    {
      id: 1,
      message: "Your profile has been updated successfully.",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      message: "New friend request from Alex Rivera.",
      time: "5 hours ago",
      read: true,
    },
    {
      id: 3,
      message: "Your post received 12 new likes!",
      time: "1 day ago",
      read: false,
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden font-sans">
      {/* Sidebar/Navbar */}
      <div className="flex">
        <Navbar />
      </div>

      {/* Notifications Section */}
      <div className="flex-1 bg-gray-50 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6 text-melodious-dark-purple">
          Notifications
        </h1>

        <div className="space-y-4">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-2xl shadow-sm border transition-all ${
                notif.read
                  ? "bg-white border-gray-200"
                  : "bg-melodious-purple/10 border-melodious-purple"
              }`}
            >
              <p className="text-gray-800">{notif.message}</p>
              <p className="text-sm text-gray-500 mt-1">{notif.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}