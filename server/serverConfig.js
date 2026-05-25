import express, { json } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

export const setupServer = () => {
  const app = express();
  const server = createServer(app);

  const raw = process.env.CORS_ORIGIN || "http://localhost:5173";
  const allowedOrigins = raw.split(",").map(s => s.trim()).filter(Boolean);

  console.log("[BOOT] CORS_ORIGIN env =", process.env.CORS_ORIGIN);
  console.log("[BOOT] allowedOrigins  =", allowedOrigins);
  
  const corsOptions = {
    origin: allowedOrigins.length > 0 
      ? allowedOrigins 
      : ["http://localhost:3000"],

    methods: ["GET", "POST"],
    credentials: true,
  };

  const io = new Server(server, {
    cors: corsOptions,
  });

  app.use(cors(corsOptions));
  app.use(json());

  return { app, server, io };
};