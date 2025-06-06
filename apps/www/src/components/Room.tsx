'use client'

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const URL = "http://localhost:4000"
export default function Room({ roomId }: { roomId: string }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [lobby, setLobby] = useState(true);

  const name = usePathname().split("/")[2];
  console.log(name)
  useEffect(() => {
    const socket = io(URL);
    setSocket(socket);

    socket.on("send-offer", ({ roomId }) => {
      alert("send-offer please")
      setLobby(false);
      socket.emit("offer", {
        sdp: "",
        roomId
      })
    })

    socket.on("offer", ({ roomId, offer }) => {
      alert('send answer please')
      setLobby(false);
      // socket.emit("answer", {
      //   sdp: "",
      //   roomId,
      // })
    })

    socket.on("answer", ({ roomId, answer }) => {
      alert('connection done')
      setLobby(false);
      socket.emit("offer", {
        sdp: "",
        roomId,
      })
    })

    socket.on("lobby", () => {
      setLobby(true);
    })

  }, [name])

  if (lobby) {
    return (
      <div>
        <h1>Lobby</h1>
        <p>Waiting for connect you to someone...</p>
      </div>
    )
  }

  return (
    <div>
      <h1>
        Room {roomId}
      </h1>
      <video width={400} height={400}/>
      <video width={400} height={400}/>
    </div>

  );
}
