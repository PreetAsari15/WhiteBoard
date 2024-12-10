import React, { useEffect, useRef, useState } from 'react';
import './App.css'; // Import the CSS file

const App = () => {
  const canvasRef = useRef(null); // Ref for the canvas DOM element
  const canvasContainerRef = useRef(null); // Ref for the canvas container
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [canvas, setCanvas] = useState(null);

  useEffect(() => {
    // Initialize Fabric.js Canvas when component mounts
    const fabricCanvas = new window.fabric.Canvas(canvasRef.current);
    fabricCanvas.isDrawingMode = true;
    fabricCanvas.freeDrawingBrush.color = brushColor;
    fabricCanvas.freeDrawingBrush.width = brushSize;

    // Adjust the canvas size based on the container size
    const canvasContainer = canvasContainerRef.current;
    fabricCanvas.setWidth(canvasContainer.clientWidth);
    fabricCanvas.setHeight(canvasContainer.clientHeight);

    setCanvas(fabricCanvas);

    // Cleanup on component unmount
    return () => {
      fabricCanvas.dispose();
    };
  }, []); // Empty dependency array to ensure this effect runs only once on mount

  useEffect(() => {
    // Handle window resizing and update canvas size dynamically
    const handleResize = () => {
      if (canvas) {
        const canvasContainer = canvasContainerRef.current;
        canvas.setWidth(canvasContainer.clientWidth);
        canvas.setHeight(canvasContainer.clientHeight);
        canvas.renderAll(); // Re-render the canvas to apply the size changes
      }
    };

    // Add resize event listener
    window.addEventListener('resize', handleResize);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [canvas]); // Depend on the canvas instance

  const handleColorChange = (e) => {
    setBrushColor(e.target.value);
  };

  const handleBrushSizeChange = (e) => {
    setBrushSize(Number(e.target.value));
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
        {/* This is where the canvas will be rendered */}
        <canvas ref={canvasRef}></canvas>
      </div>
    </div>
  );
};

export default App;
