import React, { useState } from "react";
import { api } from '../../client';

export default function NotificationItem({
  id,
  icon,
  message,
  time,
  initialButtonText,
  postText,
}) {
  const [buttonText, setButtonText] = useState(initialButtonText);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!id || !buttonText || loading) return;

    setLoading(true);

    try {
      if (buttonText === "Sync Back") {
        await api.markNotificationRead(id);
        setButtonText("Synced");
      } 
      
      else if (buttonText === "Synced") {
        await api.markNotificationUnread(id);
        setButtonText("Sync Back");
      }
    } 
    
    catch (err) {
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

      {buttonText && (
        <button
          onClick={handleClick}
          disabled={loading}
          className={`px-3 py-1 rounded-md text-sm transition ${
            loading
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : buttonText === "Sync Back"
              ? "bg-purple-300 hover:bg-purple-400"
              : "bg-purple-200 text-purple-900 hover:bg-purple-300"
          }`}
        >
          {loading ? "..." : buttonText}
        </button>
      )}
    </div>
  );
}
