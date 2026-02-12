export default function ParticipantsModel({
  isOpen,
  onClose,
  participants,
  title,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div className="font-semibold text-lg">{title || "Chat info"}</div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="p-5">
          {participants?.length ? (
            <div className="space-y-3">
              {participants.map((p) => (
                <div key={p.username} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {p.avatar ? (
                      <img
                        src={p.avatar}
                        alt={`${p.username} avatar`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-600 font-semibold">
                        {(p.name || p.username)?.[0]}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="font-medium text-gray-800 truncate">
                      {p.name || p.username}
                    </div>
                    <div className="text-xs text-gray-500">@{p.username}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500">No participants found.</div>
          )}
        </div>

        <div className="px-5 py-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
