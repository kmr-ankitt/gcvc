import type { Socket } from "socket.io";
import { RoomManager } from "./RoomManger";

export interface User {
  socket: Socket;
  name: string;
}

export class UserManager {
  private users: User[];
  private queue: Socket[];
  private roomManager: RoomManager;

  constructor() {
    this.users = [];
    this.queue = [];
    this.roomManager = new RoomManager();
  }

  addUser(name: string, socket: Socket) {
    this.users.push({ socket, name })
    this.queue.push(socket);
    this.clearQueue();
    this.initHandler(socket);
  }

  removeUser(socket: Socket) {
    this.users = this.users.filter(user => user.socket.id === socket.id)
    this.queue = this.queue.filter(s => s.id === socket.id);
  }

  clearQueue() {
    if (this.queue.length < 2) return;

    const user1 = this.users.find(user => user.socket.id === this.queue.shift()?.id);
    const user2 = this.users.find(user => user.socket.id === this.queue.pop()?.id);

    if (!user1 || !user2) return;

    this.roomManager.createRoom(user1, user2)
    // this.clearQueue();
  }

  initHandler(socket: Socket) {
    socket.on("offer", ({ sdp, roomId }: { sdp: string, roomId: string }) => {
      this.roomManager.onOffer(roomId, sdp);
    })

    socket.on("answer", ({ sdp, roomId }: { sdp: string, roomId: string }) => {
      this.roomManager.onAnswer(roomId, sdp);
    })
  }
}