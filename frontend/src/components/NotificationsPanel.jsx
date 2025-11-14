import React, { useState } from "react";
import { User } from "lucide-react";

export const NotificationItem = ({
  icon,
  message,
  time,
  initialButtonText,
  postText,
}) => {
  
  const [buttonText, setButtonText] = useState(initialButtonText);

  const handleClick = () => {
    if (buttonText === "Sync Back") {
      setButtonText("Synced");
    } else if (buttonText === "Synced") {
      setButtonText("Sync Back");
    }
  };

  return (
    <div className="flex items-start justify-between py-2">
      <div className="flex items-start space-x-3">
        <div className="text-purple-700">{icon}</div>
        <div>
          <p className="text-gray-800">{message}</p>

          {postText && (
            <div className="bg-pink-100 text-gray-700 px-3 py-2 mt-1 rounded-xl max-w-xs text-sm">
              {postText}
            </div>
          )}

          <p className="text-sm text-gray-500">{time}</p>
        </div>
      </div>

      {buttonText && (
        <button
          onClick={handleClick}
          className={`px-3 py-1 rounded-md text-sm transition ${
            buttonText === "Sync Back"
              ? "bg-purple-300 hover:bg-purple-400"
              : "bg-purple-200 text-purple-900 hover:bg-purple-300"
          }`}
        >
          {buttonText}
        </button>
      )}
    </div>
  );
};

function groupNotifications(notifications) {
  const groups = {
    new: [],
    week: [],
    month: [],
    older: [],
  };

  notifications.forEach((notif) => {
    const daysAgo = notif.daysAgo ?? 0;

    if (daysAgo <= 1) groups.new.push(notif);
    else if (daysAgo <= 7) groups.week.push(notif);
    else if (daysAgo <= 30) groups.month.push(notif);
    else groups.older.push(notif);
  });

  return groups;
}

const exampleNotifications = [
  {
    id: 1,
    user: "Juice",
    message: "started syncing you",
    time: "3 hours ago",
    button: "Sync Back",
    daysAgo: 0,
  },
  {
    id: 2,
    user: "caprisuneli",
    message: "liked your comment:",
    postText: "yesss mammaaa",
    time: "2 days ago",
    button: "Synced",
    daysAgo: 2,
  },
  {
    id: 3,
    user: "Stefanie",
    message: "liked your profile",
    time: "5 days ago",
    daysAgo: 5,
  },
  {
    id: 4,
    user: "Talia",
    message: "liked your comment:",
    postText: "Barcelona Baddieeee",
    time: "Oct 8",
    button: "Sync Back",
    daysAgo: 25,
  },
  {
    id: 5,
    user: "Abeyah",
    message: "liked your profile",
    time: "Sept 15",
    daysAgo: 60,
  },
];

export default function NotificationsPanel() {
  const grouped = groupNotifications(exampleNotifications);

  const renderSection = (title, items) => (
  <section>
    <h2 className="text-lg font-bold text-melodious-dark-purple">{title}</h2>
    <hr className="border-gray-300 mb-4" />
    <div className="space-y-4">
      {items.map((notif) => {
        const button = notif.button ?? "Sync Back"; //

        return (
          <NotificationItem
            key={notif.id}
            icon={<User />}
            message={
              <span>
                <strong>{notif.user}</strong> {notif.message}
              </span>
            }
            postText={notif.postText}
            time={notif.time}
            initialButtonText={button}
          />
        );
      })}
    </div>
  </section>
);

  return (
    <div className="bg-white p-8 rounded-2xl shadow-md space-y-10">
      {grouped.new.length > 0 && renderSection("New", grouped.new)}
      {grouped.week.length > 0 && renderSection("This Week", grouped.week)}
      {grouped.month.length > 0 && renderSection("This Month", grouped.month)}
      {grouped.older.length > 0 && renderSection("Older", grouped.older)}
    </div>
  );
}