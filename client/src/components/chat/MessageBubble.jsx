import { Check, CheckCheck } from "lucide-react";

function formatBubbleTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function MessageBubble({ message, isOwn, showSender }) {
  const senderName = message.sender?.username || "";
  const content = message.content || "";
  const read = message.read || message.readAt;

  return (
    <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} px-4 py-1`}>
      {showSender && !isOwn && (
        <span className="text-xs font-medium text-gray-500 mb-1 ml-1">
          {senderName}
        </span>
      )}
      <div
        className={`relative max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg px-4 py-2.5 ${
          isOwn
            ? "bg-blue-500 text-white rounded-l-xl rounded-br-xl"
            : "bg-gray-200 text-gray-800 rounded-r-xl rounded-bl-xl"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
          {content}
        </p>
        <div
          className={`flex items-center gap-1 mt-1 ${
            isOwn ? "justify-end" : "justify-start"
          }`}
        >
          <span
            className={`text-[10px] ${
              isOwn ? "text-blue-100" : "text-gray-400"
            }`}
          >
            {formatBubbleTime(message.createdAt)}
          </span>
          {isOwn && (
            <span className="text-blue-100">
              {read ? (
                <CheckCheck className="w-3.5 h-3.5" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
