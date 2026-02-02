import NotificationItem from "./NotificationItem";
import { User, MessageSquare, Calendar, Heart, Bell } from "lucide-react";

function timeAgo(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days !== 1 ? "s" : ""} ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;

  const years = Math.floor(days / 365);
  return `${years} year${years !== 1 ? "s" : ""} ago`;
}

export default function NotificationSection({ title, items = [] }) {
  const iconForType = (type) => {
    switch (type) {
      case "message":
        return <MessageSquare />;
      case "event":
        return <Calendar />;
      case "like":
        return <Heart />;
      case "match":
        return <Bell />;
      default:
        return <User />;
    }
  };

  return (
    <section>
      <h2 className="text-lg font-bold text-melodious-dark-purple">
        {title}
      </h2>
      <hr className="border-gray-300 mb-4" />

      <div className="space-y-4">
        {items.map((notif) => {
          const {
            id,
            username,
            type,
            message,
            link,
            is_read,
            is_archived,
            created_at,
          } = notif;

          // will give sync a different function once username is fixed in api route
          const actionVariant = type === "match" ? "sync" : "read";

          return (
            <NotificationItem
<<<<<<< HEAD
              key={notif.id}
              id={notif.id}
              icon={<User />}
=======
              key={id}
              id={id}
              icon={iconForType(type)}
>>>>>>> notifsAPI
              message={
                <span>
                  <strong>{username}</strong> {message}
                </span>
              }
              postText={is_archived ? "(Archived)" : link ? "View" : ""}
              time={timeAgo(created_at)}
              actionVariant={actionVariant}
              initialIsRead={Boolean(is_read)}
            />
          );
        })}
      </div>
    </section>
  );
}
