import Avatar from "../common/Avatar";

function formatTimestamp(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function truncate(text, max = 45) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "…" : text;
}

export default function ConversationList({
  conversations = [],
  selectedId,
  onSelect,
  onlineUsers = [],
}) {
  const sorted = [...conversations].sort((a, b) => {
    const aTime = a.lastMessage?.createdAt || a.updatedAt || "";
    const bTime = b.lastMessage?.createdAt || b.updatedAt || "";
    return new Date(bTime) - new Date(aTime);
  });

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 20.105V4.875A1.875 1.875 0 0 1 5.625 3h12.75A1.875 1.875 0 0 1 20.25 4.875v10.5A1.875 1.875 0 0 1 18.375 17.25H7.5l-3.75 2.855Z"
            />
          </svg>
        </div>
        <p className="text-gray-500 text-sm leading-relaxed">
          No conversations yet. Search for users to start chatting.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-y-auto">
      {sorted.map((conv) => {
        const otherUser = conv.participants?.find(
          (p) => p._id !== selectedId
        ) || conv.otherUser;
        const otherId = otherUser?._id;
        const isOnline = onlineUsers.includes(otherId);
        const isActive = conv._id === selectedId;
        const unread = conv.unreadCount || 0;
        const lastMsgText = conv.lastMessage?.content || "";
        const lastMsgTime =
          conv.lastMessage?.createdAt || conv.updatedAt;

        return (
          <button
            key={conv._id}
            onClick={() => onSelect(conv)}
            className={`flex items-center gap-3 w-full px-4 py-3 text-left transition-colors duration-150 border-b border-gray-100 hover:bg-gray-50 ${
              isActive ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
            }`}
          >
            <Avatar
              src={otherUser?.profile_image}
              alt={otherUser?.username}
              size="md"
              online={isOnline}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span
                  className={`font-medium text-sm truncate ${
                    unread > 0 ? "text-gray-900" : "text-gray-700"
                  }`}
                >
                  {otherUser?.username || "Unknown User"}
                </span>
                <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                  {formatTimestamp(lastMsgTime)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <p
                  className={`text-sm truncate ${
                    unread > 0
                      ? "text-gray-800 font-medium"
                      : "text-gray-500"
                  }`}
                >
                  {truncate(lastMsgText)}
                </p>
                {unread > 0 && (
                  <span className="ml-2 flex-shrink-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
