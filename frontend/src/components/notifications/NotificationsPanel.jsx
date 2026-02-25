import { useEffect, useMemo, useState } from "react";
import groupNotifications from "./GroupNotifications";
import NotificationSection from "./NotificationSection";
import { api } from "../../client";

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete(notificationId) {
    setNotifications(prev =>
      prev.filter(n => String(n.id) !== String(notificationId)));
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {

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
            <NotificationSection title="New" items={grouped.new} onDelete={handleDelete} />
          )}
          {grouped.week.length > 0 && (
            <NotificationSection title="This Week" items={grouped.week} onDelete={handleDelete} />
          )}
          {grouped.month.length > 0 && (
            <NotificationSection title="This Month" items={grouped.month} onDelete={handleDelete} />
          )}
          {grouped.older.length > 0 && (
            <NotificationSection title="Older" items={grouped.older} onDelete={handleDelete} />
          )}
        </>
      )}
    </div>
  );
}
