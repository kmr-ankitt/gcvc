import express from "express";
import { PORT } from "./config";
import { Server } from "socket.io";
import { createServer } from "http";

export const app = express();
const server = createServer(app);
const io = new Server({
  cors: {
    origin: "*"
  }
});

io.on("connection", (socket) => {
  console.log("New user connected.")
})

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})