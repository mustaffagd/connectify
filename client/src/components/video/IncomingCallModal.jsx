import { useEffect, useState } from "react";
import { Phone, PhoneOff } from "lucide-react";
import Avatar from "../common/Avatar";

export default function IncomingCallModal({
  caller,
  onAccept,
  onReject,
  visible,
}) {
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (!visible) {
      setCountdown(30);
      return;
    }
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onReject?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [visible, onReject]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center animate-in zoom-in-95 duration-300">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Avatar
              src={caller?.profile_image}
              alt={caller?.username}
              size="xl"
            />
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-5 w-5 bg-green-500 items-center justify-center">
                <Phone className="w-2.5 h-2.5 text-white" />
              </span>
            </span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-1">
          {caller?.username}
        </h3>
        <p className="text-sm text-gray-500 mb-1">Incoming video call</p>
        <p className="text-xs text-gray-400 mb-6">
          Auto-rejects in {countdown}s
        </p>

        <div className="flex items-center justify-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={onReject}
              className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-200 transition-all duration-200 shadow-lg"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
            <span className="text-xs text-gray-500 font-medium">Reject</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <button
              onClick={onAccept}
              className="w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-200 transition-all duration-200 shadow-lg animate-pulse"
            >
              <Phone className="w-6 h-6" />
            </button>
            <span className="text-xs text-gray-500 font-medium">Accept</span>
          </div>
        </div>
      </div>
    </div>
  );
}
