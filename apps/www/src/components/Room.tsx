'use client'

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const URL = "http://localhost:4000"

export default function Room({
  roomid,
  localVideoTrack,
  localAudioTrack
}: {
  roomid: string,
  localVideoTrack: MediaStreamTrack | null,
  localAudioTrack: MediaStreamTrack | null
}) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [lobby, setLobby] = useState(true);
  const [sendingPc, setSendingPc] = useState<null | RTCPeerConnection>(null);
  const [receivingPc, setReceivingPc] = useState<null | RTCPeerConnection>(null);
  const [remoteVideoTrack, setRemoteVideoTrack] = useState<MediaStreamTrack | null>(null);
  const [remoteAudioTrack, setRemoteAudioTrack] = useState<MediaStreamTrack | null>(null);
  const [remoteMediaStream, setRemoteMediaStream] = useState<MediaStream | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  const name = roomid;
  
  useEffect(() => {
    
    console.log("Room name is : " + name)
    const socket = io(URL);

    socket.on('send-offer', async ({ roomId }) => {

      console.log("sending offer")

      setLobby(false);
      const pc = new RTCPeerConnection();

      setSendingPc(pc);

      if (localVideoTrack) {
        console.log("added video track")
        console.log(localVideoTrack)
        pc.addTrack(localVideoTrack);
      }
      if (localAudioTrack) {
        console.log("added audio track")
        console.log(localAudioTrack)
        pc.addTrack(localAudioTrack);
      }

      pc.onicecandidate = async (e) => {
        if (!e.candidate) return;
        if (e.candidate) {
          socket.emit("add-ice-candidate", {
            roomId,
            candidate: e.candidate,
            type: "sender"
          });
        }
      }

      pc.onnegotiationneeded = async () => {
        const sdp = await pc.createOffer();
        pc.setLocalDescription(sdp);
        socket.emit("offer", {
          sdp,
          roomId
        });
      }
    });
    
    socket.on("offer", async ({ roomId, sdp: remoteSdp }) => {
      setLobby(false);
      const pc = new RTCPeerConnection();
      pc.setRemoteDescription(remoteSdp)
      const sdp = await pc.createAnswer();
      pc.setLocalDescription(sdp);
      const stream = new MediaStream();
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
      setRemoteMediaStream(stream);
      setReceivingPc(pc);

      pc.onicecandidate = async (e) => {
        if (e.candidate) {
          socket.emit("add-ice-candidate", {
            roomId,
            candidate: e.candidate,
            type: "receiver"
          });
        }
      }

      socket.emit("answer", {
        roomId,
        sdp: sdp
      });

      setTimeout(() => {
        const track1 = pc.getTransceivers()[0].receiver.track
        const track2 = pc.getTransceivers()[1].receiver.track
        console.log(track1);
        if (track1.kind === "video") {
          setRemoteAudioTrack(track2)
          setRemoteVideoTrack(track1)
        } else {
          setRemoteAudioTrack(track1)
          setRemoteVideoTrack(track2)
        }
        //@ts-ignore
        remoteVideoRef.current.srcObject.addTrack(track1)
        //@ts-ignore 
        remoteVideoRef.current.srcObject.addTrack(track2)
        //@ts-ignore
        remoteVideoRef.current.play();
      }, 5000)
    });

    socket.on("answer", async ({ roomId, sdp: remoteSdp }) => {
      setLobby(false);
      setSendingPc(pc => {
        pc?.setRemoteDescription(remoteSdp)
        return pc;
      })
    })

    socket.on("lobby", () => {
      setLobby(true);
    })

    socket.on("add-ice-candidate", ({ candidate, type }) => {
      if (type === "sender") {
        setReceivingPc(pc => {
          pc?.addIceCandidate(candidate)
          return pc;
        })
      } else {
        setSendingPc(pc => {
          pc?.addIceCandidate(candidate)
          return pc;
        })
      }
    })

    setSocket(socket)
  }, [name])

  useEffect(() => {
    if (localVideoRef.current && localVideoTrack && localAudioTrack) {
      localVideoRef.current.srcObject = new MediaStream([localVideoTrack, localAudioTrack]);
      localVideoRef.current.play();
    }

  }, [localVideoRef])

  return (<div>
    Hi {name}
    <video autoPlay width={400} height={400} ref={localVideoRef} />
    {lobby ? "Waiting to connect you to someone" : null}
    <video autoPlay width={400} height={400} ref={remoteVideoRef} />
  </div>)
}
