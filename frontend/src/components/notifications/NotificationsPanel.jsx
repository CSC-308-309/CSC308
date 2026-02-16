import { useEffect, useMemo, useState } from "react";
import groupNotifications from "./GroupNotifications";
import NotificationSection from "./NotificationSection";
import { api, getCurrentUsername } from "../../client";

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const username = getCurrentUsername();
      if (!username) return;

      setLoading(true);
      setError("");

      try {
        const res = await api.listNotifications();
        const items = Array.isArray(res) ? res : (res?.items ?? []);

        if (!cancelled) setNotifications(items);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load notifications");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const grouped = useMemo(
    () => groupNotifications(notifications),
    [notifications],
  );

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-md">
        <p className="text-gray-600">Loading notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-md">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const total = notifications.length;

  return (
    <div className="bg-white p-8 rounded-2xl shadow-md space-y-10">
      {total === 0 ? (
        <p className="text-gray-600">You have no notifications yet.</p>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
