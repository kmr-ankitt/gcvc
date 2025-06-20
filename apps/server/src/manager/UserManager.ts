import type { Socket } from "socket.io";
import { RoomManager } from "./RoomManger";

export interface User {
  socket: Socket;
  name: string;
}

export class UserManager {
  private users: User[];
  private queue: string[];
  private roomManager: RoomManager;

  constructor() {
    this.users = [];
    this.queue = [];
    this.roomManager = new RoomManager();
  }

  addUser(name: string, socket: Socket) {
    
    this.users.push({ socket, name })
    this.queue.push(socket.id);
    socket.emit("lobby")
    this.clearQueue();
    this.initHandler(socket);
  }

  removeUser(socket: Socket) {
    const user = this.users.find(user => user.socket.id === socket.id);
    this.users = this.users.filter(user => user.socket.id !== socket.id)
    this.queue = this.queue.filter(s => s === socket.id);
  }

  clearQueue() {
    if (this.queue.length < 2) return;

    console.log("-----------------------------------")
    console.log(this.queue)
    console.log("-----------------------------------")
    
    const id1 = this.queue.shift();
    const id2 = this.queue.pop();
    const user1 = this.users.find(x => x.socket.id === id1);
    const user2 = this.users.find(x => x.socket.id === id2);

    if (!user1 || !user2) return;

    this.roomManager.createRoom(user1, user2)
    this.clearQueue();
  }

  initHandler(socket: Socket) {
    socket.on("offer", ({ sdp, roomId }: { sdp: string, roomId: string }) => {
      this.roomManager.onOffer(roomId, sdp, socket.id);
    })

    socket.on("answer", ({ sdp, roomId }: { sdp: string, roomId: string }) => {
      this.roomManager.onAnswer(roomId, sdp, socket.id);
    })

    socket.on("add-ice-candidate", ({ candidate, roomId , type}) => {
      this.roomManager.onIceCandidate(roomId, socket.id, candidate, type);
    }) 
  }
}