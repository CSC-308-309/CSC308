// src/components/notifications/NotificationItem.jsx

import React, { useState } from "react";

export default function NotificationItem({
  icon,
  message,
  time,
  initialButtonText,
  postText,
}) {
  const [buttonText, setButtonText] = useState(initialButtonText);

  const handleClick = () => {
    if (buttonText === "Sync Back") setButtonText("Synced");
    else if (buttonText === "Synced") setButtonText("Sync Back");
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
}
