"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useMedia } from "@/context/MediaContext";

export default function Landing() {
  const [name, setName] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const { setLocalAudioTrack, setLocalVideoTrack } = useMedia();

  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;
    const roomId = Math.random().toString(36).substring(2, 10);
    router.push(`/room/${roomId}`);
  };

  const getCam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      const audioTrack = stream.getAudioTracks()[0];
      const videoTrack = stream.getVideoTracks()[0];
      setLocalAudioTrack(audioTrack);
      setLocalVideoTrack(videoTrack);

      if (videoRef.current) {
        videoRef.current.srcObject = new MediaStream([videoTrack, audioTrack]);
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Failed to get media stream:", err);
    }
  };

  useEffect(() => {
    getCam();
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <video
        width={400}
        height={400}
        ref={videoRef}
        autoPlay
        className="rounded shadow"
      />
      <form className="flex flex-col gap-4 w-full max-w-xs" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter Name"
          className="bg-zinc-200 text-zinc-800 placeholder:text-zinc-500 p-2 rounded text-center"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-zinc-800 text-white py-2 rounded hover:bg-zinc-700 transition"
        >
          Join Room
        </button>
      </form>
    </div>
  );
}