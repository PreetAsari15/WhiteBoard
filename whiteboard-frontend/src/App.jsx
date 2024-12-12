import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from './context/AuthProvider';
import io from 'socket.io-client';
import './App.css';

// Initialize socket connection
const socket = io('http://localhost:3000'); // Ensure backend is running

const App = () => {
  // Auth
  const { user, login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  // Canvas
  const canvasRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [canvas, setCanvas] = useState(null);

  // Initialize Canvas
  useEffect(() => {
    if (!user) return;  // Don't initialize canvas unless user is logged in

    const fabricCanvas = new window.fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
    });

    // Set initial canvas dimensions
    const resizeCanvas = () => {
      const container = canvasContainerRef.current;
      if (container) {
        fabricCanvas.setWidth(container.clientWidth);
        fabricCanvas.setHeight(container.clientHeight);
        fabricCanvas.renderAll();
      }
    };

    resizeCanvas();

    // Handle window resize
    window.addEventListener('resize', resizeCanvas);

    // Sync with state
    setCanvas(fabricCanvas);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      fabricCanvas.dispose();
    };
  }, [user]);  // Only create canvas after user is logged in

  // Set brush properties
  useEffect(() => {
    if (canvas) {
      canvas.freeDrawingBrush.color = brushColor;
      canvas.freeDrawingBrush.width = brushSize;
    }
  }, [brushColor, brushSize, canvas]);

  // Listen for drawing data from the server
  useEffect(() => {
    if (canvas) {
      socket.on('draw', (data) => {
        canvas.loadFromJSON(data, () => {
          canvas.renderAll();
        });
      });
    }

    // Cleanup socket event
    return () => {
      socket.off('draw');
    };
  }, [canvas]);

  // Send drawing updates to the server
  const sendDrawingData = () => {
    if (canvas) {
      const json = canvas.toJSON();
      socket.emit('draw', json);
    }
  };

  // Listen for new drawing paths and emit data
  useEffect(() => {
    if (canvas) {
      const onPathCreated = () => sendDrawingData();
      canvas.on('path:created', onPathCreated);

      // Cleanup event
      return () => {
        canvas.off('path:created', onPathCreated);
      };
    }
  }, [canvas]);

  // Clear canvas and notify other clients
  const clearCanvas = () => {
    if (canvas) {
      canvas.clear();
      sendDrawingData(); // Send cleared state to others
    }
  };

  return (
    <div className="app-container">
      <h1>Collaborative Whiteboard</h1>
      {user ? (
        <div>
          <p>Welcome, {user.email}!</p>
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
      ) : (
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
      )}
    </div>
  );
};

export default App;
