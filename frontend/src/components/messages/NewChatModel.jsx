import { useEffect, useMemo, useState } from "react";

export default function NewChatModel({
  isOpen,
  onClose,
  onCreate,
  api,
  myUsername,
}) 

{
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [name, setName] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const selectedUsernames = useMemo(() => Array.from(selected), [selected]);
  const isGroup = selectedUsernames.length > 1;

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    async function loadUsers() {
      try {
        setError(null);
        setLoadingUsers(true);

        const data = await api.listUsers();
        const list = Array.isArray(data) ? data : (data?.users || []);
        const filtered = list.filter(u => u.username && u.username !== myUsername);

        if (!mounted) return;
        setUsers(filtered);
      } 
      
      catch (e) {
        if (!mounted) return;
        setError(e?.message || "Failed to load users");
      } 
      
      finally {
        if (!mounted) return;
        setLoadingUsers(false);
      }
    }

    loadUsers();
    return () => { mounted = false; };
  }, [isOpen, api, myUsername]);

  function toggle(username) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(username)) next.delete(username);
      else next.add(username);
      return next;
    });
  }

  async function handleCreate() {
    try {
      setError(null);

      if (!myUsername) throw new Error("Not logged in.");
      if (selectedUsernames.length === 0) throw new Error("Select at least one person.");
      if (isGroup && !name.trim()) throw new Error("Group chats need a name.");

      setSubmitting(true);

      const payload = {
        name: isGroup ? name.trim() : null,
        is_group: isGroup,
        created_by: myUsername,
        participants: [myUsername, ...selectedUsernames],
      };

      await onCreate(payload);
      onClose();
      setSelected(new Set());
      setName("");
    } 
    
    catch (e) {
      setError(e?.message || "Failed to create chat");
    } 
    
    finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div className="font-semibold text-lg">New Chat</div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="text-sm text-gray-600">
            Select participants (1 for direct chat, 2+ for a group).
          </div>

          {isGroup && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Group name"
              className="w-full bg-gray-100 px-4 py-2 rounded-xl"
            />
          )}

          <div className="border rounded-xl overflow-hidden">
            {loadingUsers ? (
              <div className="p-4 text-sm text-gray-500">Loading users...</div>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                {users.map(u => (
                  <label
                    key={u.username}
                    className="flex items-center justify-between px-4 py-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50"
                  >
                    <div>
                      <div className="font-medium text-gray-800">{u.name || u.username}</div>
                      <div className="text-xs text-gray-500">@{u.username}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selected.has(u.username)}
                      onChange={() => toggle(u.username)}
                      className="h-4 w-4"
                    />
                  </label>
                ))}
                {users.length === 0 && (
                  <div className="p-4 text-sm text-gray-500">No other users found.</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-4 border-t flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={submitting}
            className="px-4 py-2 rounded-xl bg-melodious-purple text-white disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
