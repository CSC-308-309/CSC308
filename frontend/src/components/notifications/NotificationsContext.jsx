import React, { createContext, useCallback, useEffect, useState } from "react";
import { api } from "../../client";

const NotificationsContext = createContext(null);

export function NotificationsProvider({ username, children }) {
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    if (!username) return;
    try {
      const res = await api.getUnreadNotificationsCount(username);
      setUnreadCount(res?.unreadCount ?? 0);
    } catch (e) {
      console.error("Failed to refresh unread count:", e);
    }
  }, [username]);

  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  return (
    <NotificationsContext.Provider
      value={{ unreadCount, setUnreadCount, refreshUnreadCount }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export { NotificationsContext };
