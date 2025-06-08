import type { User } from "./UserManager";

export interface Room {
  user1: User;
  user2: User;
}

let GLOBAL_ROOM_ID = 1;

export class RoomManager {

  /**
   * Rooms are stored in a Map with roomId as the key.
   * roomID -------> [user1, user2] 
  **/
  private rooms: Map<string, Room>;
  constructor() {
    this.rooms = new Map<string, Room>();
  }

  createRoom(user1: User, user2: User) {
    const roomId = this.generateRoomId().toString();
    this.rooms.set(roomId.toString(), {
      user1,
      user2,
    })

    user1.socket.emit("send-offer", {
      roomId
    })

    user2.socket.emit("send-offer", {
      roomId
    })
  }

  onOffer(roomId: string, sdp: string, senderSocketId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    const recivingUser = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
    recivingUser?.socket.emit("offer", {
      sdp,
      roomId,
      
    })
  }

  onAnswer(roomId: string, sdp: string, senderSocketId : string) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    const recivingUser = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
    recivingUser ?.socket.emit("answer", {
      sdp,
      roomId
    })
  }

  onIceCandidate(roomId: string, senderSocketId : string, candidate: any, type: "sender" | "receiver") {
    const room = this.rooms.get(roomId);
    if (!room) return;
    const recivingUser = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
    recivingUser.socket.emit("add-ice-candidate", ({ candidate, type}))
  }

  generateRoomId(): number {
    return GLOBAL_ROOM_ID++;
  }
}