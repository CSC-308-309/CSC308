import React, { useMemo, useState } from "react";
import { api } from "../../client";
import { useNotifications } from "./useNotifications";

export default function NotificationItem({
  id,
  icon,
  message,
  time,
  postText,
  actionVariant = "read",
  initialIsRead = false,
  onDelete,
}) {
  const [isRead, setIsRead] = useState(Boolean(initialIsRead));
  const [isSyncedBack, setIsSyncedBack] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { refreshUnreadCount } = useNotifications();

  const buttonText = useMemo(() => {
    if (actionVariant === "sync") return isSyncedBack ? "Synced" : "Sync Back";
    return isRead ? "Mark as unread" : "Mark as read";
  }, [actionVariant, isSyncedBack, isRead]);

  const handleClick = async () => {
    if (!id || loading || deleting) return;

    setLoading(true);
    try {
      if (actionVariant === "sync") {
        // will give sync a different function once username is fixed in api route
        if (!isSyncedBack) {
          await api.markNotificationRead(id);
          setIsSyncedBack(true);
          setIsRead(true);
        } else {
          await api.markNotificationUnread(id);
          setIsSyncedBack(false);
          setIsRead(false);
        }
      } else {
        if (!isRead) {
          await api.markNotificationRead(id);
          setIsRead(true);
        } else {
          await api.markNotificationUnread(id);
          setIsRead(false);
        }
      }

      await refreshUnreadCount();
    } catch (err) {
      console.error("Notification action failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || loading || deleting) return;

    const ok = window.confirm("Delete this notification?");
    if (!ok) return;

    console.log("Deleting notification id:", id);

    setDeleting(true);
    try {
      await api.deleteNotification(id);

      if (typeof onDelete === "function") {
        onDelete(id);
      }

      await refreshUnreadCount();
    } catch (err) {
      console.error("Delete notification failed:", err);
    } finally {
      setDeleting(false);
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

      <div className="flex items-center gap-2">
        <button
          onClick={handleClick}
          disabled={loading || deleting}
          className={`px-3 py-1 rounded-md text-sm transition ${
            loading || deleting
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : actionVariant === "sync"
                ? isSyncedBack
                  ? "bg-purple-200 text-purple-900 hover:bg-purple-300"
                  : "bg-purple-300 hover:bg-purple-400"
                : isRead
                  ? "bg-purple-200 text-purple-900 hover:bg-purple-300"
                  : "bg-purple-300 hover:bg-purple-400"
          }`}
        >
          {loading ? "..." : buttonText}
        </button>

        <button
          onClick={handleDelete}
          disabled={loading || deleting}
          className={`px-3 py-1 rounded-md text-sm transition ${
            loading || deleting
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-red-100 text-red-700 hover:bg-red-200"
          }`}
          title="Delete notification"
        >
          {deleting ? "..." : "Delete"}
        </button>
      </div>
    </div>
  );
}
