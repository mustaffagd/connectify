import { useState, useEffect, useRef, useCallback } from "react";
import { Send, ArrowLeft, Video } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../common/Avatar";
import Spinner from "../common/Spinner";
import { getMessages, sendMessage, markAsRead } from "../../services/messageService";
import {
  SEND_MESSAGE,
  NEW_MESSAGE,
  TYPING_START,
  TYPING_STOP,
  MARK_READ,
  MESSAGES_READ,
} from "../../sockets/socketEvents";

export default function ChatWindow({
  conversationId,
  conversation,
  otherUser,
  socket,
}) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const typingRef = useRef(false);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const fetchMessages = useCallback(async (pageNum = 1, append = false) => {
    try {
      const data = await getMessages(conversationId, pageNum);
      const msgs = Array.isArray(data) ? data : data.messages || [];
      if (append) {
        setMessages((prev) => [...msgs.reverse(), ...prev]);
      } else {
        setMessages(msgs.reverse());
        setTimeout(scrollToBottom, 100);
      }
      setHasMore(msgs.length === 20);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoading(false);
    }
  }, [conversationId, scrollToBottom]);

  useEffect(() => {
    setMessages([]);
    setLoading(true);
    setPage(1);
    setHasMore(true);
    fetchMessages(1, false);
  }, [conversationId, fetchMessages]);

  useEffect(() => {
    if (!socket) return;

    socket.on(NEW_MESSAGE, (message) => {
      if (message.conversation === conversationId || message.conversationId === conversationId) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
        socket.emit(MARK_READ, conversationId);
      }
    });

    socket.on(TYPING_START, (data) => {
      if (data.conversationId === conversationId && data.userId !== user?._id) {
        setOtherTyping(true);
      }
    });

    socket.on(TYPING_STOP, (data) => {
      if (data.conversationId === conversationId && data.userId !== user?._id) {
        setOtherTyping(false);
      }
    });

    socket.on(MESSAGES_READ, (data) => {
      if (data.conversationId === conversationId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.sender !== user?._id ? { ...m, read: true } : m
          )
        );
      }
    });

    return () => {
      socket.off(NEW_MESSAGE);
      socket.off(TYPING_START);
      socket.off(TYPING_STOP);
      socket.off(MESSAGES_READ);
    };
  }, [socket, conversationId, user?._id, scrollToBottom]);

  useEffect(() => {
    markAsRead(conversationId).catch(() => {});
  }, [conversationId, messages.length]);

  const handleTyping = () => {
    if (!socket || !conversationId) return;

    if (!typingRef.current) {
      typingRef.current = true;
      socket.emit(TYPING_START, { conversationId, userId: user?._id });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      typingRef.current = false;
      socket.emit(TYPING_STOP, { conversationId, userId: user?._id });
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const content = newMessage.trim();
    setNewMessage("");
    setSending(true);

    if (typingRef.current && socket) {
      typingRef.current = false;
      socket.emit(TYPING_STOP, { conversationId, userId: user?._id });
      clearTimeout(typingTimeoutRef.current);
    }

    try {
      if (socket) {
        socket.emit(SEND_MESSAGE, {
          conversationId,
          content,
        });
      } else {
        await sendMessage(conversationId, content);
        fetchMessages(1, false);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      setNewMessage(content);
    } finally {
      setSending(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMessages(nextPage, true);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-gray-800 px-4 py-3">
        <button
          onClick={() => window.history.back()}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white lg:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Avatar
          src={otherUser?.profile_image}
          username={otherUser?.username}
          size="md"
          isOnline={false}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">
            {otherUser?.username || "Unknown User"}
          </p>
          {otherTyping ? (
            <p className="text-xs text-violet-400">typing...</p>
          ) : (
            <p className="text-xs text-gray-500">Offline</p>
          )}
        </div>
        <button className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-800 hover:text-white">
          <Video className="h-5 w-5" />
        </button>
      </div>

      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar"
      >
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner size="md" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-sm text-gray-500">
              No messages yet. Say hello!
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {hasMore && (
              <button
                onClick={loadMore}
                className="mx-auto mb-4 block rounded-lg px-4 py-1.5 text-xs text-violet-400 transition hover:bg-gray-800"
              >
                Load earlier messages
              </button>
            )}

            {messages.map((message, index) => {
              const isOwn =
                message.sender === user?._id ||
                message.sender?._id === user?._id;
              const showTimestamp =
                index === 0 ||
                new Date(message.createdAt).toDateString() !==
                  new Date(messages[index - 1].createdAt).toDateString();

              return (
                <div key={message._id || message.id || index}>
                  {showTimestamp && (
                    <div className="my-4 text-center text-xs text-gray-600">
                      {new Date(message.createdAt).toLocaleDateString([], {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  )}
                  <div
                    className={`flex ${
                      isOwn ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                        isOwn
                          ? "bg-violet-600 text-white"
                          : "bg-gray-800 text-gray-100"
                      }`}
                    >
                      <p className="break-words text-sm leading-relaxed">
                        {message.content}
                      </p>
                      <p
                        className={`mt-1 text-[10px] ${
                          isOwn ? "text-violet-200" : "text-gray-500"
                        }`}
                      >
                        {formatTime(message.createdAt)}
                        {isOwn && message.read && (
                          <span className="ml-1">✓✓</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form
        onSubmit={handleSendMessage}
        className="border-t border-gray-800 px-4 py-3"
      >
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            className="flex-1 rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
