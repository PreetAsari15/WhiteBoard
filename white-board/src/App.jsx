import React, { useEffect, useRef, useState } from "react";

const App = () => {
  const canvasRef = useRef(null);
  const [brushColor, setBrushColor] = useState("black");
  const [brushSize, setBrushSize] = useState(5);

  useEffect(() => {
    // Initialize Fabric.js canvas
    const canvas = new fabric.Canvas("whiteboard", {
      backgroundColor: "white",
      isDrawingMode: true,
    });

    // Set default brush settings
    canvas.freeDrawingBrush.color = brushColor;
    canvas.freeDrawingBrush.width = brushSize;

    // Save canvas reference
    canvasRef.current = canvas;

    // Cleanup on unmount
    return () => canvas.dispose();
  }, []);

  // Update brush settings when state changes
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.freeDrawingBrush.color = brushColor;
      canvasRef.current.freeDrawingBrush.width = brushSize;
    }
  }, [brushColor, brushSize]);

  // Clear the canvas
  const clearCanvas = () => {
    canvasRef.current.clear();
    canvasRef.current.backgroundColor = "white"; // Reset background color
    canvasRef.current.renderAll();
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h1>Whiteboard</h1>

      {/* Toolbar */}
      <div style={{ marginBottom: "10px" }}>
        <label>
          Brush Color:{" "}
          <input
            type="color"
            value={brushColor}
            onChange={(e) => setBrushColor(e.target.value)}
          />
        </label>
        <label style={{ marginLeft: "15px" }}>
          Brush Size:{" "}
          <input
            type="number"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
          />
        </label>
        <button
          style={{
            marginLeft: "15px",
            padding: "5px 10px",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={clearCanvas}
        >
          Clear Canvas
        </button>
      </div>

      {/* Canvas */}
      <canvas
        id="whiteboard"
        width="800"
        height="600"
        style={{ border: "1px solid black" }}
      ></canvas>
    </div>
  );
};

export default App;
