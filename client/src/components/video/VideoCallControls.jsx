import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";

export default function VideoCallControls({
  isMuted,
  isVideoOff,
  onToggleMute,
  onToggleVideo,
  onEndCall,
}) {
  return (
    <div className="flex items-center justify-center gap-4 py-3 px-6">
      <button
        onClick={onToggleMute}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
          isMuted
            ? "bg-red-500 text-white hover:bg-red-600"
            : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
        }`}
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>

      <button
        onClick={onEndCall}
        className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-all duration-200 shadow-lg"
        title="End Call"
      >
        <PhoneOff className="w-6 h-6" />
      </button>

      <button
        onClick={onToggleVideo}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
          isVideoOff
            ? "bg-red-500 text-white hover:bg-red-600"
            : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
        }`}
        title={isVideoOff ? "Turn camera on" : "Turn camera off"}
      >
        {isVideoOff ? (
          <VideoOff className="w-5 h-5" />
        ) : (
          <Video className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
