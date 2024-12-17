import React, { useRef, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { IconButton, Toolbar, Slider, Box, Button } from "@mui/material";
import { Brush, Edit, Delete, Logout } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const socket = io("http://localhost:3000");

function Canvas() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState("brush");

  const navigate = useNavigate();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth - 20;
    canvas.height = window.innerHeight - 100;
    ctx.lineCap = "round";
    ctxRef.current = ctx;

    // Socket listeners for drawing, erasing, and clearing
    socket.on("draw", ({ x0, y0, x1, y1, color, size }) => {
      drawLine(x0, y0, x1, y1, color, size, false);
    });

    socket.on("erase", ({ x0, y0, x1, y1, size }) => {
      drawLine(x0, y0, x1, y1, "#FFFFFF", size, false);
    });

    socket.on("clear", () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
  }, []);

  const drawLine = (x0, y0, x1, y1, strokeColor, size, emit = true) => {
    const ctx = ctxRef.current;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = size;

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.closePath();

    if (emit) {
      if (tool === "eraser") {
        socket.emit("erase", { x0, y0, x1, y1, size });
      } else {
        socket.emit("draw", { x0, y0, x1, y1, color: strokeColor, size });
      }
    }
  };

  const handleMouseDown = (e) => {
    setIsDrawing(true);
    const { offsetX, offsetY } = e.nativeEvent;
    canvasRef.current.lastX = offsetX;
    canvasRef.current.lastY = offsetY;
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = e.nativeEvent;
    const { lastX, lastY } = canvasRef.current;

    const strokeColor = tool === "eraser" ? "#FFFFFF" : color; // White for eraser, selected color otherwise
    drawLine(lastX, lastY, offsetX, offsetY, strokeColor, brushSize);

    canvasRef.current.lastX = offsetX;
    canvasRef.current.lastY = offsetY;
  };

  const handleMouseUp = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit("clear");
  };

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    navigate('/login');
  };

  return (
    <Box>
      {/* Toolbar */}
      <Toolbar sx={{ backgroundColor: "#f5f5f5", gap: 1 }}>
        <IconButton onClick={() => setTool("brush")}>
          <Brush /> Brush
        </IconButton>
        <IconButton onClick={() => setTool("eraser")}>
          <Edit /> Eraser
        </IconButton>
        <IconButton onClick={clearCanvas}>
          <Delete /> Clear
        </IconButton>
        <Slider
          value={brushSize}
          onChange={(e, val) => setBrushSize(val)}
          min={1}
          max={20}
          sx={{ width: "150px", marginLeft: "10px" }}
        />
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          style={{ marginLeft: "10px" }}
        />
        <Button
          onClick={handleLogout}
          variant="contained"
          color="error"
          startIcon={<Logout />}
          sx={{ marginLeft: "auto" }}
        >
          Logout
        </Button>
      </Toolbar>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseOut={handleMouseUp}
        style={{
          border: "1px solid #ddd",
          display: "block",
          margin: "auto",
          background: "#fff",
          cursor: tool === "eraser" ? "crosshair" : "default",
        }}
      />
    </Box>
  );
}

export default Canvas;
