"use client"

import Room from "@/components/Room";
import { useMedia } from "@/context/MediaContext";

import React from "react";

export default function Page({ params }: { params: Promise<{ roomid: string }> }) {
  const { localAudioTrack, localVideoTrack } = useMedia();
  const { roomid } = React.use(params);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Room roomid={roomid} localAudioTrack={localAudioTrack} localVideoTrack={localVideoTrack} />
    </div>
  );
}
