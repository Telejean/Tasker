import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import dbConnect from "./utils/sequelize";
import session from "express-session";
import passport from "./middlewares/passport-config";
import apiRoutes from "./routes/index";
import authRoutes from "./routes/auth.routes";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.use("/api", apiRoutes);

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("task:statusChange", (data) => {
    io.emit("task:statusUpdated", data);
  });

  socket.on("project:update", (data) => {
    io.emit("project:updated", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, async () => {
  try {
    await dbConnect.authenticate();
    console.log("Database connection established successfully. \n");
    console.log(`Server running on port ${PORT}`);
  } catch (error) {
    console.error("Database connection failed:", error);
  }
});
