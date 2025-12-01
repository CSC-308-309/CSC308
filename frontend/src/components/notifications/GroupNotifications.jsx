export default function groupNotifications(notifications) {
  const groups = {
    new: [],
    week: [],
    month: [],
    older: [],
  };

  notifications.forEach((notif) => {
    const daysAgo = notif.daysAgo ?? 0;

    if (daysAgo <= 1) groups.new.push(notif);
    else if (daysAgo <= 7) groups.week.push(notif);
    else if (daysAgo <= 30) groups.month.push(notif);
    else groups.older.push(notif);
  });

  return groups;
}
