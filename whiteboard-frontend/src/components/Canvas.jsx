import { useRef, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000'); // Backend URL

function Canvas() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prevPos, setPrevPos] = useState(null);

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

    // Listen for the clear event
    socket.on('clear', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    return () => {
      socket.off('draw');
      socket.off('clear');
    };
  }, []);

  const startDrawing = (event) => {
    const { offsetX: x, offsetY: y } = event.nativeEvent;
    setIsDrawing(true);
    setPrevPos({ x, y });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setPrevPos(null);
  };

  const draw = (event) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const { offsetX: x, offsetY: y } = event.nativeEvent;

    const data = {
      x,
      y,
      prevX: prevPos.x,
      prevY: prevPos.y,
      color: '#000000',
      size: 2,
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

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Emit the clear event to the server
    socket.emit('clear');
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onMouseMove={draw}
        style={{ border: '1px solid black', cursor: 'crosshair' }}
      />
      <button onClick={clearCanvas}>Clear Canvas</button>
    </div>
  );
}

export default Canvas;
