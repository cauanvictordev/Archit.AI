
import React, { useState, useRef, useEffect } from 'react';
import { Room } from '../types';

interface ManualPlannerProps {
  onExport: (imageData: string) => void;
  loading: boolean;
}

const ROOM_TYPES = [
  { label: 'Sala', color: '#3b82f6' },
  { label: 'Quarto', color: '#8b5cf6' },
  { label: 'Cozinha', color: '#f59e0b' },
  { label: 'Banheiro', color: '#10b981' },
  { label: 'Garagem', color: '#64748b' },
];

const ManualPlanner: React.FC<ManualPlannerProps> = ({ onExport, loading }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedType, setSelectedType] = useState(ROOM_TYPES[0]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
    }

    // Rooms
    rooms.forEach(room => {
      ctx.fillStyle = room.color + '44';
      ctx.strokeStyle = room.color;
      ctx.lineWidth = 2;
      ctx.fillRect(room.x, room.y, room.w, room.h);
      ctx.strokeRect(room.x, room.y, room.w, room.h);
      
      ctx.fillStyle = '#fff';
      ctx.font = '12px Inter';
      ctx.fillText(room.label, room.x + 5, room.y + 15);
    });
  };

  useEffect(() => {
    drawCanvas();
  }, [rooms]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setStartPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setIsDrawing(true);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    const newRoom: Room = {
      id: Math.random().toString(),
      x: Math.min(startPos.x, endX),
      y: Math.min(startPos.y, endY),
      w: Math.abs(endX - startPos.x),
      h: Math.abs(endY - startPos.y),
      label: selectedType.label,
      color: selectedType.color
    };

    if (newRoom.w > 10 && newRoom.h > 10) {
      setRooms([...rooms, newRoom]);
    }
    setIsDrawing(false);
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onExport(canvas.toDataURL('image/png'));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-4">
        {ROOM_TYPES.map(type => (
          <button
            key={type.label}
            onClick={() => setSelectedType(type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              selectedType.label === type.label 
              ? 'bg-white text-slate-900 border-white' 
              : 'bg-slate-800 text-slate-400 border-white/10 hover:border-white/30'
            }`}
          >
            {type.label}
          </button>
        ))}
        <button 
          onClick={() => setRooms([])}
          className="ml-auto px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
        >
          Limpar Rascunho
        </button>
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-inner bg-slate-900">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          className="w-full cursor-crosshair block"
        />
        {rooms.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-500 text-sm">
            Clique e arraste para desenhar os cômodos da sua casa
          </div>
        )}
      </div>

      <button
        disabled={loading || rooms.length === 0}
        onClick={handleExport}
        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
      >
        {loading ? 'IA Processando Rascunho...' : 'IA: Transformar Rascunho em Planta 3D'}
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      </button>
    </div>
  );
};

export default ManualPlanner;
