import express from "express";
import { PORT } from "./config";
import { Server } from "socket.io";
import { createServer } from "http";
import { UserManager } from "./manager/UserManager";

export const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

const userManager = new UserManager();

io.on("connection", (socket) => {
  console.log("New user connected.")
  userManager.addUser("ankit", socket);
  io.on("disconnect", () => {
    userManager.removeUser(socket);
    console.log("User disconnected.")
  })
})

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})