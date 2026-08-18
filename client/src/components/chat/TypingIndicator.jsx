import { useEffect } from "react";

export default function TypingIndicator({ username }) {
  useEffect(() => {}, [username]);

  return (
    <div className="flex items-end gap-2 px-4 py-1.5">
      <div className="bg-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
        <span className="text-xs text-gray-500 mr-1.5">
          {username} is typing
        </span>
        <span className="flex gap-0.5">
          <span
            className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </span>
      </div>
    </div>
  );
}
