"use client";

import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("https://gcvc.onrender.com"); // make sure server is live and CORS is correct

export default function VideoSection() {
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [isCaller, setIsCaller] = useState(false);

  useEffect(() => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pcRef.current = pc;

    socket.on("offer", async (offer: RTCSessionDescriptionInit) => {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      if (localRef.current) {
        localRef.current.srcObject = stream;
        localRef.current.play();
      }
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", answer);
    });

    socket.on("answer", async (answer: RTCSessionDescriptionInit) => {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on("ice-candidate", async (candidate: RTCIceCandidateInit) => {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    });

    pc.ontrack = (e) => {
      if (remoteRef.current && e.streams[0]) {
        remoteRef.current.srcObject = e.streams[0];
        remoteRef.current.play();
      }
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice-candidate", e.candidate);
      }
    };

    return () => {
      pc.close();
      socket.disconnect();
    };
  }, []);

  const call = async () => {
    if (!pcRef.current) return;
    setIsCaller(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    stream.getTracks().forEach((track) => pcRef.current!.addTrack(track, stream));
    if (localRef.current) {
      localRef.current.srcObject = stream;
      localRef.current.play();
    }
    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);
    socket.emit("offer", offer);
  };

  return (
    <div>
      <video ref={localRef} autoPlay playsInline muted width={300} />
      <video ref={remoteRef} autoPlay playsInline width={300} />
      <button onClick={call} disabled={isCaller}>
        Call
      </button>
    </div>
  );
}
