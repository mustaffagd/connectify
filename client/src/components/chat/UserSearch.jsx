import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Loader2, MessageCircle } from "lucide-react";
import { searchUsers } from "../../services/userService";
import { createConversation } from "../../services/conversationService";
import Avatar from "../common/Avatar";

export default function UserSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creatingId, setCreatingId] = useState(null);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  const fetchUsers = useCallback(async (q) => {
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const data = await searchUsers(q);
      const users = Array.isArray(data) ? data : data.users || data.data || [];
      setResults(users);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchUsers(query), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, fetchUsers]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleStartChat(user) {
    setCreatingId(user._id);
    try {
      const conversation = await createConversation(user._id);
      onSelect(conversation);
      setQuery("");
      setResults([]);
      setOpen(false);
    } catch (err) {
      console.error("Failed to create conversation:", err);
    } finally {
      setCreatingId(null);
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search users to chat..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-h-80 overflow-y-auto">
          {results.map((user) => (
            <div
              key={user._id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
            >
              <Avatar
                src={user.profile_image}
                alt={user.username}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {user.username}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              <button
                onClick={() => handleStartChat(user)}
                disabled={creatingId === user._id}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
              >
                {creatingId === user._id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <MessageCircle className="w-3 h-3" />
                )}
                Start Chat
              </button>
            </div>
          ))}
        </div>
      )}

      {open && query.length >= 2 && !loading && results.length === 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-500">No users found</p>
        </div>
      )}
    </div>
  );
}
