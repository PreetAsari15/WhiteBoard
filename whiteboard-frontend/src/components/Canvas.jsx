import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/Canvas.css';

const Canvas = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [canvas, setCanvas] = useState(null);

  const { logout } = useAuth();
  useEffect(() => {
    if (!user) {
      navigate('/login'); // Redirect if not logged in
    }

    const fabricCanvas = new window.fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
    });

    const resizeCanvas = () => {
      const container = canvasContainerRef.current;
      if (container) {
        fabricCanvas.setWidth(container.clientWidth);
        fabricCanvas.setHeight(container.clientHeight);
        fabricCanvas.renderAll();
      }
    };

    resizeCanvas();

    window.addEventListener('resize', resizeCanvas);

    setCanvas(fabricCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      fabricCanvas.dispose();
    };
  }, [user, navigate]);

  useEffect(() => {
    if (canvas) {
      canvas.freeDrawingBrush.color = brushColor;
      canvas.freeDrawingBrush.width = brushSize;
    }
  }, [brushColor, brushSize, canvas]);

  const clearCanvas = () => {
    if (canvas) {
      canvas.clear();
    }
  };

  return (
    <div>
      <button onClick={logout}>Logout</button>
      <div className="toolbar">
        <label>
          Brush Color:
          <input
            type="color"
            value={brushColor}
            onChange={(e) => setBrushColor(e.target.value)}
            className="color-picker"
          />
        </label>
        <label>
          Brush Size:
          <input
            type="number"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
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

export default Canvas;
