import React, { useMemo, useState } from "react";
import { api } from "../../client";
import { useNotifications } from "./NotificationsContext";

export default function NotificationItem({
  id,
  icon,
  message,
  time,
  postText,
  actionVariant = "read", 
  initialIsRead = false,
}) 

{
  const [isRead, setIsRead] = useState(Boolean(initialIsRead));
  const [isSyncedBack, setIsSyncedBack] = useState(false);
  const [loading, setLoading] = useState(false);

  const { refreshUnreadCount, setUnreadCount, unreadCount } = useNotifications();

  const buttonText = useMemo(() => {
    if (actionVariant === "sync") return isSyncedBack ? "Synced" : "Sync Back";
    return isRead ? "Mark as unread" : "Mark as read";
  }, [actionVariant, isSyncedBack, isRead]);

  const handleClick = async () => {
    if (!id || loading) return;

    setLoading(true);
    try {
      const wasUnread = !isRead;

      if (actionVariant === "sync") {
        
        // will give sync a different function once username is fixed in api route
        if (!isSyncedBack) {
          await api.markNotificationRead(id);
          setIsSyncedBack(true);
          setIsRead(true);
        } 
        
        else {
          await api.markNotificationUnread(id);
          setIsSyncedBack(false);
          setIsRead(false);
        }
      } 
      
      else {
        if (!isRead) {
          await api.markNotificationRead(id);
          setIsRead(true);
        } 
        
        else {
          await api.markNotificationUnread(id);
          setIsRead(false);
        }
      }

      const nowUnread = actionVariant === "sync"
        ? (isSyncedBack ? true : false) 
        : isRead; 

      await refreshUnreadCount();

    } catch (err) {
      console.error("Notification action failed:", err);
    } 
    
    finally {
      setLoading(false);
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

      <button
        onClick={handleClick}
        disabled={loading}
        className={`px-3 py-1 rounded-md text-sm transition ${
          loading
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
    </div>
  );
}
