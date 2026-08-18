import { useState, useEffect, useCallback } from "react";
import { Menu } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import useSocket from "../hooks/useSocket";
import Sidebar from "../components/layout/Sidebar";
import ChatWindow from "../components/chat/ChatWindow";
import { getConversations } from "../services/conversationService";
import {
  JOIN_CONVERSATION,
  LEAVE_CONVERSATION,
  USER_ONLINE,
  USER_OFFLINE,
  USERS_ONLINE,
} from "../sockets/socketEvents";

export default function DashboardPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);

  const fetchConversations = useCallback(async () => {
    try {
      const data = await getConversations();
      const list = Array.isArray(data) ? data : data.conversations || [];
      setConversations(list);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!socket) return;

    socket.on(USERS_ONLINE, (userIds) => {
      setOnlineUserIds(new Set(userIds));
    });

    socket.on("user_online", (userId) => {
      setOnlineUserIds((prev) => new Set([...prev, userId]));
    });

    socket.on("user_offline", (userId) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    return () => {
      socket.off("users_online");
      socket.off("user_online");
      socket.off("user_offline");
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !selectedConversationId) return;

    socket.emit(JOIN_CONVERSATION, selectedConversationId);

    return () => {
      socket.emit(LEAVE_CONVERSATION, selectedConversationId);
    };
  }, [socket, selectedConversationId]);

  const handleSelectConversation = (id) => {
    setSelectedConversationId(id);
    setSidebarOpen(false);
  };

  const handleNewConversation = (conversation) => {
    setConversations((prev) => {
      const exists = prev.some(
        (c) => (c._id || c.id) === (conversation._id || conversation.id)
      );
      if (exists) return prev;
      return [conversation, ...prev];
    });
  };

  const selectedConversation = conversations.find(
    (c) => (c._id || c.id) === selectedConversationId
  );

  const otherUser = selectedConversation?.participants?.find(
    (p) => (p._id || p.id) !== user?._id
  );

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-950">
      <Sidebar
        conversations={conversations}
        selectedConversationId={selectedConversationId}
        onSelectConversation={handleSelectConversation}
        onlineUserIds={onlineUserIds}
        onNewConversation={handleNewConversation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex flex-1 flex-col">
        {selectedConversationId ? (
          <ChatWindow
            conversationId={selectedConversationId}
            conversation={selectedConversation}
            otherUser={otherUser}
            socket={socket}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-900">
              <Menu className="h-8 w-8 text-gray-600" />
            </div>
            <h2 className="text-xl font-semibold text-white">
              Select a conversation
            </h2>
            <p className="mt-2 max-w-sm text-sm text-gray-500">
              Choose from your existing conversations or search for someone to
              start a new one.
            </p>
            <button
              onClick={() => setSidebarOpen(true)}
              className="mt-6 rounded-xl border border-gray-700 px-5 py-2.5 text-sm text-gray-300 transition hover:border-gray-500 hover:text-white lg:hidden"
            >
              Open Sidebar
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
