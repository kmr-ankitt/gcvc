"use client"

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Landing() {
  const [roomId, setRoomId] = useState<string | null>(null);

  const router = useRouter();
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(`/room/${roomId}`);
    setRoomId(null);  
  }
  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <input type="text"
        placeholder="Room id"
        className="bg-zinc-200 text-zinc-800 placeholder:text-zinc-400 text-center"
        onChange={(e) =>
          setRoomId(e.target.value)
        }
        value={roomId || ""}
      />
      <button type="submit" className="bg-zinc-800">Create room</button>
    </form>
  );
}
