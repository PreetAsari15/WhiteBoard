import React, { useRef, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000'); // Backend URL

function Canvas() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prevPos, setPrevPos] = useState(null);
  const [color, setColor] = useState('#000000'); // Default brush color
  const [brushSize, setBrushSize] = useState(2); // Default brush size

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Listen for drawing data from the server
    socket.on('draw', (data) => {
      const { x, y, prevX, prevY, color, size } = data;
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.stroke();
    });

    // Listen for clear canvas event
    socket.on('clear', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    return () => {
      socket.off('draw');
      socket.off('clear');
    };
  }, []);

  const startDrawing = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setIsDrawing(true);
    setPrevPos({ x, y });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setPrevPos(null);
  };

  const handleDraw = (event) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const data = {
      x,
      y,
      prevX: prevPos.x,
      prevY: prevPos.y,
      color,
      size: brushSize,
    };

    // Emit drawing data to the server
    socket.emit('draw', data);

    // Draw on the local canvas
    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.size;
    ctx.beginPath();
    ctx.moveTo(data.prevX, data.prevY);
    ctx.lineTo(data.x, data.y);
    ctx.stroke();

    setPrevPos({ x, y });
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Notify other users to clear the canvas
    socket.emit('clear');
  };

  const handleLogout = () => {
    // Simple example: redirect to login page or perform logout actions
    window.location.href = '/login'; // Adjust this as per your application
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div
        className="toolbar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px',
          background: '#f4f4f4',
          borderBottom: '1px solid #ddd',
        }}
      >
        <div style={{ display: 'flex', gap: '10px' }}>
          <label>
            Brush Color:
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
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
            />
          </label>
          <button onClick={handleClearCanvas} style={{ padding: '5px 10px' }}>
            Clear Canvas
          </button>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '5px 10px',
            background: '#ff4d4d',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
          }}
        >
          Logout
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onMouseMove={handleDraw}
        style={{ border: '1px solid black', cursor: 'crosshair', flexGrow: 1 }}
      />
    </div>
  );
}

export default Canvas;
