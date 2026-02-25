import React, { createContext, useCallback, useEffect, useState } from "react";
import { api } from "../../client";

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const res = await api.getUnreadNotificationsCount();
      setUnreadCount(res?.unreadCount ?? 0);
    } catch (e) {
      console.error("Failed to refresh unread count:", e);
    }
  }, []);

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
