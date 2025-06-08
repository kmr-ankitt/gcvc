"use client"

import React, { createContext, ReactNode, useContext, useState } from 'react'

interface MediaContextType {
  localAudioTrack: MediaStreamTrack | null;
  localVideoTrack: MediaStreamTrack | null;
  setLocalAudioTrack: (track: MediaStreamTrack | null) => void;
  setLocalVideoTrack: (track: MediaStreamTrack | null) => void;
}

const MediaContext = createContext<MediaContextType | null>(null);

export default function MediaContextProvider({ children }: { children: ReactNode }) {
  const [localAudioTrack, setLocalAudioTrack] = useState<MediaStreamTrack | null>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<MediaStreamTrack | null>(null);

  return (
    <MediaContext.Provider value={{ localVideoTrack, localAudioTrack, setLocalVideoTrack, setLocalAudioTrack }} >
      {children}
    </MediaContext.Provider>
  )
}

export const useMedia = () => {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error("useMedia must be used within a MediaProvider");
  }
  return context;
};