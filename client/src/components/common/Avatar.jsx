export default function Avatar({ src, username, size = "md", isOnline }) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-lg",
    xl: "h-20 w-20 text-xl",
  };

  const dotSizeClasses = {
    sm: "h-2 w-2 border",
    md: "h-2.5 w-2.5 border-[1.5px]",
    lg: "h-3 w-3 border-2",
    xl: "h-4 w-4 border-2",
  };

  const initials = username
    ? username
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const colors = [
    "bg-violet-600",
    "bg-indigo-600",
    "bg-blue-600",
    "bg-emerald-600",
    "bg-amber-600",
    "bg-rose-600",
    "bg-cyan-600",
    "bg-fuchsia-600",
  ];

  const colorIndex = username
    ? username.charCodeAt(0) % colors.length
    : 0;

  return (
    <div className="relative inline-flex shrink-0">
      {src ? (
        <img
          src={src}
          alt={username || "User"}
          className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-gray-800`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} ${colors[colorIndex]} flex items-center justify-center rounded-full font-semibold text-white ring-2 ring-gray-800`}
        >
          {initials}
        </div>
      )}
      {typeof isOnline === "boolean" && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-gray-950 ${
            dotSizeClasses[size]
          } ${isOnline ? "bg-emerald-400" : "bg-gray-500"}`}
        />
      )}
    </div>
  );
}
