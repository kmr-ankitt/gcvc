import express from "express";
import { PORT } from "./config";
import http from "http";
import { Server } from "socket.io";

export const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

io.on("connection", (socket) => {
  console.log("User connected with id:", socket.id);

  socket.on('offer', (payload) => {
    socket.broadcast.emit('offer', payload);
  });

  socket.on('answer', (payload) => {
    socket.broadcast.emit('answer', payload);
  });

  socket.on('ice-candidate', (payload) => {
    socket.broadcast.emit('ice-candidate', payload);
  });
})

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})