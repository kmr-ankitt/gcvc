"use client"
import Room from "@/components/Room";
import React from "react";

export default function Page({ params }: { params: Promise<{ roomid: string }> }) {

  return (
    <div>
      <Room roomid={roomid} localAudioTrack={localAudioTrack} localVideoTrack={localVideoTrack} />
    </div>
  );
}
