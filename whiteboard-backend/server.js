const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

// Initialize express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Frontend URL
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Collaborative whiteboard backend is running!");
});

// WebSocket logic for real-time updates
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Listen for drawing data from clients
  // Relay drawing data
  socket.on("draw", (data) => {
    socket.broadcast.emit("draw", data); // Broadcast to others
  });
  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
