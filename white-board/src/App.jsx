import React, { useEffect, useRef, useState } from 'react';
import './App.css'; // Import the CSS file

const App = () => {
  const canvasRef = useRef(null); // Ref for the canvas DOM element
  const canvasContainerRef = useRef(null); // Ref for the canvas container
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [canvas, setCanvas] = useState(null);

  // Initialize fabric.Canvas on mount
  useEffect(() => {
    const fabricCanvas = new window.fabric.Canvas(canvasRef.current);
    fabricCanvas.isDrawingMode = true;
    fabricCanvas.freeDrawingBrush.color = brushColor;  // Set initial brush color
    fabricCanvas.freeDrawingBrush.width = brushSize;

    const canvasContainer = canvasContainerRef.current;
    fabricCanvas.setWidth(canvasContainer.clientWidth);
    fabricCanvas.setHeight(canvasContainer.clientHeight);

    setCanvas(fabricCanvas);

    return () => {
      fabricCanvas.dispose(); // Cleanup on unmount
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount

  // Update brush color dynamically whenever the brushColor state changes
  useEffect(() => {
    if (canvas) {
      canvas.freeDrawingBrush.color = brushColor;
      canvas.renderAll();  // Re-render the canvas to apply the new brush color
    }
  }, [brushColor, canvas]); // Dependency on brushColor and canvas to update when either changes

  // Update brush size dynamically
  useEffect(() => {
    if (canvas) {
      canvas.freeDrawingBrush.width = brushSize;
      canvas.renderAll(); // Re-render the canvas to apply the new brush size
    }
  }, [brushSize, canvas]); // Dependency on brushSize and canvas to update when either changes

  const handleColorChange = (e) => {
    setBrushColor(e.target.value); // Update brush color state
  };

  const handleBrushSizeChange = (e) => {
    setBrushSize(Number(e.target.value)); // Update brush size state
  };

  const clearCanvas = () => {
    if (canvas) {
      canvas.clear();
    }
  };

  return (
    <div className="app-container">
      <h1>Collaborative Whiteboard</h1>
      <div className="toolbar">
        <label>
          Brush Color:
          <input
            type="color"
            value={brushColor}
            onChange={handleColorChange}
            className="color-picker"
          />
        </label>
        <label>
          Brush Size:
          <input
            type="number"
            min="1"
            max="20"
            value={brushSize}
            onChange={handleBrushSizeChange}
            className="brush-size"
          />
        </label>
        <button onClick={clearCanvas}>Clear</button>
      </div>

      <div className="canvas-container" ref={canvasContainerRef}>
        <canvas ref={canvasRef}></canvas>
      </div>
    </div>
  );
};

export default App;
