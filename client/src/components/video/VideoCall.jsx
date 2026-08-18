import { useState, useRef, useEffect, useCallback } from "react";
import VideoCallControls from "./VideoCallControls";
import {
  OFFER,
  ANSWER,
  ICE_CANDIDATE,
  END_CALL,
  CALL_ACCEPTED,
  CALL_REJECTED,
} from "../../sockets/socketEvents";

const STUN_SERVER =
  import.meta.env.VITE_STUN_SERVER || "stun:stun.l.google.com:19302";

const ICE_SERVERS = {
  iceServers: [{ urls: STUN_SERVER }],
};

export default function VideoCall({
  callId,
  callerId,
  receiverId,
  isCaller,
  localUser,
  onEndCall,
  socket,
}) {
  const [status, setStatus] = useState("connecting");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [error, setError] = useState(null);
  const [duration, setDuration] = useState(0);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const durationIntervalRef = useRef(null);

  const cleanup = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  }, []);

  const handleEndCall = useCallback(() => {
    cleanup();
    setStatus("ended");
    if (socket) {
      socket.emit(END_CALL, {
        callId,
        to: isCaller ? receiverId : callerId,
      });
    }
    setTimeout(() => onEndCall?.(), 500);
  }, [cleanup, socket, callId, callerId, receiverId, isCaller, onEndCall]);

  useEffect(() => {
    if (!socket) return;

    function handleCallAccepted() {
      setStatus("connected");
      setDuration(0);
      durationIntervalRef.current = setInterval(
        () => setDuration((d) => d + 1),
        1000
      );
    }

    function handleCallRejected() {
      setStatus("rejected");
      cleanup();
      setTimeout(() => onEndCall?.(), 1500);
    }

    function handleCallEnded() {
      setStatus("ended");
      cleanup();
      setTimeout(() => onEndCall?.(), 500);
    }

    function handleRemoteOffer(data) {
      handleOffer(data.offer, data.from);
    }

    function handleRemoteAnswer(data) {
      handleAnswer(data.answer);
    }

    function handleRemoteIceCandidate(data) {
      addIceCandidate(data.candidate);
    }

    socket.on(CALL_ACCEPTED, handleCallAccepted);
    socket.on(CALL_REJECTED, handleCallRejected);
    socket.on(END_CALL, handleCallEnded);
    socket.on(OFFER, handleRemoteOffer);
    socket.on(ANSWER, handleRemoteAnswer);
    socket.on(ICE_CANDIDATE, handleRemoteIceCandidate);

    return () => {
      socket.off(CALL_ACCEPTED, handleCallAccepted);
      socket.off(CALL_REJECTED, handleCallRejected);
      socket.off(END_CALL, handleCallEnded);
      socket.off(OFFER, handleRemoteOffer);
      socket.off(ANSWER, handleRemoteAnswer);
      socket.off(ICE_CANDIDATE, handleRemoteIceCandidate);
    };
  }, [socket]);

  useEffect(() => {
    startCall();
    return cleanup;
  }, []);

  async function startCall() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = pc;

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit(ICE_CANDIDATE, {
            callId,
            candidate: event.candidate,
            to: isCaller ? receiverId : callerId,
          });
        }
      };

      pc.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") {
          setStatus("connected");
          if (!durationIntervalRef.current) {
            setDuration(0);
            durationIntervalRef.current = setInterval(
              () => setDuration((d) => d + 1),
              1000
            );
          }
        } else if (
          pc.connectionState === "failed" ||
          pc.connectionState === "disconnected"
        ) {
          handleEndCall();
        }
      };

      if (isCaller) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit(OFFER, {
          callId,
          offer: pc.localDescription,
          to: receiverId,
          from: callerId,
        });
      }
    } catch (err) {
      console.error("Failed to start call:", err);
      if (
        err.name === "NotAllowedError" ||
        err.name === "PermissionDeniedError"
      ) {
        setError("Camera/microphone permission denied. Please allow access and try again.");
      } else if (
        err.name === "NotFoundError" ||
        err.name === "DevicesNotFoundError"
      ) {
        setError("No camera or microphone found. Please connect a device.");
      } else {
        setError("Failed to start video call. Please try again.");
      }
    }
  }

  async function handleOffer(offer, from) {
    try {
      let pc = peerConnectionRef.current;
      if (!pc) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        pc = new RTCPeerConnection(ICE_SERVERS);
        peerConnectionRef.current = pc;

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.onicecandidate = (event) => {
          if (event.candidate && socket) {
            socket.emit(ICE_CANDIDATE, {
              callId,
              candidate: event.candidate,
              to: from,
            });
          }
        };

        pc.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };

        pc.onconnectionstatechange = () => {
          if (pc.connectionState === "connected") {
            setStatus("connected");
            if (!durationIntervalRef.current) {
              setDuration(0);
              durationIntervalRef.current = setInterval(
                () => setDuration((d) => d + 1),
                1000
              );
            }
          } else if (
            pc.connectionState === "failed" ||
            pc.connectionState === "disconnected"
          ) {
            handleEndCall();
          }
        };
      }

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit(ANSWER, {
        callId,
        answer: pc.localDescription,
        to: from,
      });
    } catch (err) {
      console.error("Failed to handle offer:", err);
      setError("Failed to establish connection.");
    }
  }

  async function handleAnswer(answer) {
    try {
      const pc = peerConnectionRef.current;
      if (pc && pc.signalingState === "have-local-offer") {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (err) {
      console.error("Failed to handle answer:", err);
    }
  }

  async function addIceCandidate(candidate) {
    try {
      const pc = peerConnectionRef.current;
      if (pc && pc.remoteDescription) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (err) {
      console.error("Failed to add ICE candidate:", err);
    }
  }

  function toggleMute() {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted((prev) => !prev);
    }
  }

  function toggleVideo() {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff((prev) => !prev);
    }
  }

  function formatDuration(secs) {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  const statusText = {
    connecting: "Connecting...",
    connected: formatDuration(duration),
    ended: "Call ended",
    rejected: "Call declined",
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col">
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />

      <div className="relative z-10 flex items-center justify-center pt-12 pb-4">
        <div className="bg-black/50 backdrop-blur-md rounded-full px-5 py-2.5 text-center">
          <p className="text-white font-semibold text-sm">
            {status === "connecting"
              ? "Connecting..."
              : status === "ended" || status === "rejected"
              ? statusText[status]
              : `Call with ${isCaller ? receiverId : callerId}`}
          </p>
          {status === "connected" && (
            <p className="text-green-400 text-xs font-medium mt-0.5">
              {formatDuration(duration)}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="relative z-10 mx-auto max-w-md mt-4 bg-red-500/90 backdrop-blur text-white text-sm px-4 py-3 rounded-xl text-center">
          {error}
        </div>
      )}

      <div className="relative z-10 mt-auto mb-4 mx-4">
        <div className="bg-gray-800/80 backdrop-blur rounded-2xl p-4">
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-md">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full aspect-video object-cover rounded-xl bg-gray-900"
              />
              <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg">
                You
              </div>
              {isVideoOff && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-xl">
                  <span className="text-4xl text-gray-600">
                    {localUser?.username?.[0]?.toUpperCase() || "?"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 pb-8">
        <VideoCallControls
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          onToggleMute={toggleMute}
          onToggleVideo={toggleVideo}
          onEndCall={handleEndCall}
        />
      </div>
    </div>
  );
}
