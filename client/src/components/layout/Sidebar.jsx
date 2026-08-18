import { useState, useEffect } from "react";
import { Search, X, MessageSquarePlus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../common/Avatar";
import { searchUsers } from "../../services/userService";
import { createConversation } from "../../services/conversationService";

export default function Sidebar({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onlineUserIds,
  onNewConversation,
  isOpen,
  onClose,
}) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await searchUsers(searchQuery);
        const results = Array.isArray(data) ? data : data.users || [];
        setSearchResults(results.filter((u) => u._id !== user?._id));
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, user?._id]);

  const handleStartConversation = async (userId) => {
    try {
      const data = await createConversation(userId);
      const conversation = data.conversation || data;
      onNewConversation(conversation);
      onSelectConversation(conversation._id || conversation.id);
      setSearchQuery("");
      setSearchResults([]);
    } catch (err) {
      console.error("Failed to create conversation:", err);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-80 flex-col border-r border-gray-800 bg-gray-950 transition-transform duration-300 lg:relative lg:translate-x-0 lg:z-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar
              src={user?.profile_image}
              username={user?.username}
              size="sm"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {user?.username}
              </p>
              <p className="truncate text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-3 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-800 bg-gray-900 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2 custom-scrollbar">
          {searchQuery.trim() && (
            <div className="mb-2">
              {searching ? (
                <p className="px-3 py-4 text-center text-sm text-gray-500">
                  Searching...
                </p>
              ) : searchResults.length > 0 ? (
                searchResults.map((u) => (
                  <button
                    key={u._id || u.id}
                    onClick={() => handleStartConversation(u._id || u.id)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-gray-800/70"
                  >
                    <Avatar
                      src={u.profile_image}
                      username={u.username}
                      size="md"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {u.username}
                      </p>
                      <p className="truncate text-xs text-gray-500">{u.email}</p>
                    </div>
                  </button>
                ))
              ) : (
                <p className="px-3 py-4 text-center text-sm text-gray-500">
                  No users found
                </p>
              )}
            </div>
          )}

          {!searchQuery.trim() && (
            <>
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center px-4 py-12 text-center">
                  <MessageSquarePlus className="mb-3 h-10 w-10 text-gray-700" />
                  <p className="text-sm font-medium text-gray-400">
                    No conversations yet
                  </p>
                  <p className="mt-1 text-xs text-gray-600">
                    Search for people to start chatting
                  </p>
                </div>
              ) : (
                conversations.map((conversation) => {
                  const otherUser = conversation.participants?.find(
                    (p) => p._id !== user?._id && p.id !== user?.id
                  );
                  const otherId = otherUser?._id || otherUser?.id;
                  const isOnline = onlineUserIds?.has(otherId);

                  return (
                    <button
                      key={conversation._id || conversation.id}
                      onClick={() => {
                        onSelectConversation(
                          conversation._id || conversation.id
                        );
                        onClose();
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                        selectedConversationId ===
                        (conversation._id || conversation.id)
                          ? "bg-violet-600/15 ring-1 ring-violet-600/30"
                          : "hover:bg-gray-800/70"
                      }`}
                    >
                      <Avatar
                        src={otherUser?.profile_image}
                        username={otherUser?.username}
                        size="md"
                        isOnline={isOnline}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">
                          {otherUser?.username || "Unknown"}
                        </p>
                        <p className="truncate text-xs text-gray-500">
                          {conversation.lastMessage?.content ||
                            "No messages yet"}
                        </p>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-600 px-1.5 text-[10px] font-bold text-white">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}
