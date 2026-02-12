export default function groupNotifications(notifications = []) {
  const groups = {
    new: [],
    week: [],
    month: [],
    older: [],
  };

  const now = Date.now();

  notifications.forEach((notif) => {
    const createdAt = new Date(notif.created_at);
    if (isNaN(createdAt.getTime())) {
      groups.older.push(notif);
      return;
    }

    const daysAgo = Math.floor(
      (now - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysAgo <= 1) groups.new.push(notif);
    else if (daysAgo <= 7) groups.week.push(notif);
    else if (daysAgo <= 30) groups.month.push(notif);
    else groups.older.push(notif);
  });

  return groups;
}
