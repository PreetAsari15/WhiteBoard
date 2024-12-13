const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors"); // Import CORS

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Your frontend URL
    methods: ["GET", "POST"],
  },
});

// Enable CORS for all origins
app.use(cors());

// Serve static files (e.g., your frontend files)
app.use(express.static("public"));

// Handle socket connections
io.on("connection", (socket) => {
  console.log("A user connected");

  // Listen for 'draw' events from clients and broadcast to all clients
  socket.on("draw", (data) => {
    console.log("Received draw data:", data);
    // Broadcast the drawing data to all other connected clients
    socket.broadcast.emit("draw", data);
  });

  // Handle canvas clear request
  socket.on("clear", () => {
    console.log("Clear canvas request received");
    io.emit("clear"); // Broadcast to all clients
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Add a route for the root URL
app.get("/", (req, res) => {
  res.send("Socket.IO server is running");
});

// Start the server
const port = 3000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
