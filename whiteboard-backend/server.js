const express = require("express");
const http = require("http");
const jwt = require("jsonwebtoken");
const admin = require("./firebaseAdmin");
const socketIo = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
app.use(express.json());
const SECRET_KEY = process.env.JWT_SECRET; // Your JWT secret key

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Your frontend URL
    methods: ["GET", "POST"],
  },
});

//Enable CORS for all origins
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

// Route to verify Firebase ID Token and generate a JWT
app.post("/firebase-auth", async (req, res) => {
  const { idToken } = req.body;

  try {
    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Extract user details from the Firebase token
    const { uid, email } = decodedToken;

    // Generate custom JWT
    const token = jwt.sign({ uid, email }, SECRET_KEY, { expiresIn: "1h" });

    res.json({ token });
  } catch (error) {
    console.error("Firebase ID Token Error:", error.message);
    res.status(401).json({ message: "Unauthorized" });
  }
});

// Example protected route
app.get("/protected", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    res.json({ message: "Access granted", user: decoded });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});

// Start the server
const port = 3000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const fetchProtectedData = async () => {
  const token = localStorage.getItem("jwt"); // Retrieve JWT from storage

  const response = await fetch("http://localhost:3000/protected", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  console.log("Protected data:", data);
};
