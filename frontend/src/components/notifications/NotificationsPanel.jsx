// src/components/notifications/NotificationsPanel.jsx

import groupNotifications from "./GroupNotifications";
import NotificationSection from "./NotificationSection";

export default function NotificationsPanel() {

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

  const grouped = groupNotifications(exampleNotifications);

  return (
    <div className="bg-white p-8 rounded-2xl shadow-md space-y-10">
      {grouped.new.length > 0 && (
        <NotificationSection title="New" items={grouped.new} />
      )}

      {grouped.week.length > 0 && (
        <NotificationSection title="This Week" items={grouped.week} />
      )}

      {grouped.month.length > 0 && (
        <NotificationSection title="This Month" items={grouped.month} />
      )}

      {grouped.older.length > 0 && (
        <NotificationSection title="Older" items={grouped.older} />
      )}
    </div>
  );
}
