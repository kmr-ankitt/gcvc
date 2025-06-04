"use client";

import { useEffect, useRef } from "react";
import io from "socket.io-client";

export default function VideoSection() {
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    socketRef.current = io("https://gcvc.onrender.com/");

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pcRef.current = pc;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          if (localRef.current) {
            localRef.current.srcObject = stream;
            localRef.current.play().catch((err) => {
              console.error("Error playing local video stream:", err);
            });
          }
          stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        })
        .catch((err) => {
          alert("Error accessing media devices. Please check your camera and microphone permissions.");
          console.error("Error accessing media devices.", err);
        });
    } else {
      alert("MediaDevices API or getUserMedia is not supported on this device. Please use a compatible browser or device.");
      console.error("MediaDevices API or getUserMedia not supported on this device.");
    }

    pc.ontrack = (e) => {
      if (remoteRef.current && e.streams[0]) {
        remoteRef.current.srcObject = e.streams[0];
        remoteRef.current.play().catch((err) => {
          console.error("Error playing remote video stream:", err);
        });
      }
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.current.emit("ice-candidate", e.candidate);
      }
    };

    socketRef.current.on("offer", async (offer: RTCSessionDescriptionInit) => {
      if (!pcRef.current) return;
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      socketRef.current.emit("answer", answer);
    });

    socketRef.current.on("answer", (answer: RTCSessionDescriptionInit) => {
      pcRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socketRef.current.on("ice-candidate", (candidate: RTCIceCandidateInit) => {
      pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
    });

    return () => {
      socketRef.current?.disconnect();
      pcRef.current?.close();
    };
  }, []);

  const call = async () => {
    if (!pcRef.current) return;
    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);
    socketRef.current?.emit("offer", offer);
  };

  return (
    <div>
      <video ref={localRef} autoPlay muted playsInline width={300} />
      <video ref={remoteRef} autoPlay playsInline width={300} />
      <button onClick={call}>Call</button>
    </div>
  );
}
