import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});
const PORT = 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.get("/", (req, res) => {
  res.send("Socket server is running.");
});

// run this when any browser connects
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // send message to currently connected client
  socket.emit("serverMessage", {
    message: "Connected to the Sanskrit Monopoly server",
  });

  // listen for pingserver client event
  socket.on("pingServer", (data) => {
    console.log("Ping received:", data);

    // reply to client who sent ping
    socket.emit("serverMessage", {
      message: `Server received: ${data.message}`,
    });
  });

  // print to console when client disconnects
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
