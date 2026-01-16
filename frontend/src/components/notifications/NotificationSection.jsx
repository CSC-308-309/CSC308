import NotificationItem from "./NotificationItem";
import { User } from "lucide-react";

export default function NotificationSection({ title, items }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-melodious-dark-purple">
        {title}
      </h2>
      <hr className="border-gray-300 mb-4" />

      <div className="space-y-4">
        {items.map((notif) => {
          const button = notif.button ?? "Sync Back";

          return (
            <NotificationItem
              key={notif.id}
              id={notif.id}
              icon={<User />}
              message={
                <span>
                  <strong>{notif.user}</strong> {notif.message}
                </span>
              }
              postText={notif.postText}
              time={notif.time}
              initialButtonText={button}
            />
          );
        })}
      </div>
    </section>
  );
}
