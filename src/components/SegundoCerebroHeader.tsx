import React, { useRef, useState } from 'react';
import { supabase } from '../supabase';
import useNeuroState from '../store/useNeuroState';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Edit2, UploadCloud } from 'lucide-react';

const moduloColors = [
  '#3ec6f7', // Sincronizador Mental
  '#ffe93c', // Biblioteca de Conocimiento
  '#a259f7', // Consejero Inteligente
  '#ffb13c', // Ajuste Emocional
  '#00ffcc', // Zona de Enfoque
  '#ff3c3c', // Desafíos Avanzados
  '#cfaaff', // Otro módulo
];

function NeonProgressCircle({ percentage = 45, size = 220, strokeWidth = 16, segments = 7, colors = moduloColors }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const gap = 0.08;
  const segmentAngle = (2 * Math.PI) / segments;
  const progressSegments = Math.floor((percentage / 100) * segments);
  const partialSegment = ((percentage / 100) * segments) % 1;

  return (
    <svg width={size} height={size} className="drop-shadow-[0_0_16px_rgba(162,89,247,0.5)]">
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        {[...Array(segments)].map((_, i) => {
          const startAngle = i * segmentAngle + gap / 2;
          const endAngle = (i + 1) * segmentAngle - gap / 2;
          const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
          const x1 = size / 2 + radius * Math.cos(startAngle);
          const y1 = size / 2 + radius * Math.sin(startAngle);
          const x2 = size / 2 + radius * Math.cos(endAngle);
          const y2 = size / 2 + radius * Math.sin(endAngle);
          const isFilled = i < progressSegments;
          const isPartial = i === progressSegments && partialSegment > 0;
          let fillLength = isPartial ? partialSegment : 1;
          if (!isFilled && !isPartial) fillLength = 0;
          const arcEndAngle = startAngle + (endAngle - startAngle) * fillLength;
          const x2p = size / 2 + radius * Math.cos(arcEndAngle);
          const y2p = size / 2 + radius * Math.sin(arcEndAngle);
          return (
            <path
              key={i}
              d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${isPartial ? x2p : x2} ${isPartial ? y2p : y2}`}
              stroke={colors[i % colors.length]}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              style={{
                filter: isFilled || isPartial ? 'drop-shadow(0 0 12px #a259f7)' : 'none',
                opacity: isFilled || isPartial ? 1 : 0.18,
              }}
            />
          );
        })}
      </g>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius - 8}
        fill="rgba(30,20,50,0.7)"
        stroke="#a259f7"
        strokeWidth={2}
        style={{ filter: 'blur(2px)' }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={42}
        fontWeight="bold"
        fill="#fff"
        style={{ textShadow: '0 0 8px #a259f7, 0 0 2px #fff' }}
      >
        {percentage}%
      </text>
      <text
        x="50%"
        y="62%"
        textAnchor="middle"
        fontSize={18}
        fill="#a259f7"
        fontWeight="600"
        style={{ textShadow: '0 0 6px #a259f7' }}
      >
        Progreso
      </text>
    </svg>
  );
}

export default function SegundoCerebroHeader() {
  const {
    userName,
    avatarUrl,
    setUserName,
    setAvatarUrl,
    iaModules,
    setIAModuleState,
    setIAModuleProgress,
  } = useNeuroState();
  const [editName, setEditName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);
  const [uploading, setUploading] = useState(false);
  const [activated, setActivated] = useState(
    Object.values(iaModules).some((m) => m.estado !== 'pendiente')
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  type Modulo = { key: string; nombreAmigable: string; progreso: number; estado: string };
  const modulos: Modulo[] = Object.values(iaModules).slice(0, 7) as Modulo[];
  const total = modulos.length > 0
    ? Math.round(modulos.reduce((acc, m) => acc + (m.progreso || 0), 0) / modulos.length)
    : 0;

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${userName.replace(/\s+/g, '_')}_${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });
    if (error) {
      alert('Error al subir el avatar: ' + error.message);
      setUploading(false);
      return;
    }
    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
    if (publicUrlData?.publicUrl) {
      setAvatarUrl(publicUrlData.publicUrl);
    }
    setUploading(false);
  }

  function handleNameSave() {
    setUserName(nameInput.trim() || 'Invitado');
    setEditName(false);
  }

  function handleActivate() {
    Object.values(iaModules).forEach((m: any) => {
      if (m.estado === 'pendiente') setIAModuleState(m.key, 'activado');
    });
    setActivated(true);
  }

  return (
    <div className="w-full flex flex-row items-start justify-between gap-12 bg-gradient-to-r from-[#181a2f]/80 via-[#23234a]/70 to-[#181a2f]/80 rounded-2xl p-8 mb-8 shadow-xl border border-[#a259f7]/30">
      {/* Columna Izquierda */}
      <div className="flex flex-col items-center gap-6">
        {/* Avatar */}
        <div className="relative group">
          <img
            src={avatarUrl || '/images/modulos/diseñofinalavatar.png'}
            alt="Avatar IA"
            className="w-40 h-40 rounded-full object-cover border-4 border-[#3ec6f7] shadow-xl bg-[#0a1a2f]"
          />
          <button
            className="absolute bottom-2 right-2 bg-[#3ec6f7] text-[#101c2c] p-2 rounded-full shadow-lg hover:bg-[#aef1ff] transition"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            title="Cambiar avatar"
          >
            <UploadCloud className="w-5 h-5" />
          </button>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            disabled={uploading}
          />
        </div>
        <AnimatePresence>
          {uploading && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="text-sm text-[#3ec6f7]"
            >
              Subiendo...
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Barra de Progreso Circular */}
        <NeonProgressCircle percentage={total} />
      </div>

      {/* Columna Derecha */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Nombre y Estado */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-row items-center gap-3">
            {editName ? (
              <>
                <input
                  className="text-4xl font-extrabold font-orbitron bg-[#0a1a2f] border border-[#3ec6f7] rounded-xl px-4 py-2 text-[#aef1ff] shadow focus:outline-none"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleNameSave()}
                  autoFocus
                  maxLength={32}
                />
                <button 
                  className="ml-2 px-3 py-2 rounded-lg bg-[#3ec6f7] text-[#101c2c] font-bold hover:bg-[#aef1ff] transition" 
                  onClick={handleNameSave}
                >
                  <CheckCircle className="w-6 h-6" />
                </button>
              </>
            ) : (
              <>
                <span className="text-4xl font-extrabold font-orbitron text-[#aef1ff] drop-shadow-lg tracking-wide">
                  {userName || 'Tu IA'}
                </span>
                <button 
                  className="ml-2 px-2 py-1 rounded-lg bg-[#3ec6f7] text-[#101c2c] font-bold hover:bg-[#aef1ff] transition" 
                  onClick={() => setEditName(true)} 
                  title="Editar nombre"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
          
          <div className="text-xl text-[#b6eaff] font-semibold">
            Dale forma, nómbralo y desbloquea tu potencial cognitivo aumentado.
          </div>
        </div>

        {/* Estado y Botón de Activación */}
        <div className="flex flex-row gap-4 items-center">
          <span className={`px-4 py-2 rounded-full font-bold text-lg flex items-center gap-2 ${
            activated ? 'bg-green-400/20 text-green-300' : 'bg-yellow-400/20 text-yellow-300'
          }`}>
            {activated ? 'En curso' : 'Pendiente'}
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className={`px-8 py-3 rounded-xl font-extrabold text-xl bg-gradient-to-r from-[#3ec6f7] to-[#aef1ff] text-[#101c2c] shadow-xl font-orbitron border-2 border-[#3ec6f7] transition-all ${
              activated ? 'opacity-60 cursor-not-allowed' : 'animate-bounce'
            }`}
            onClick={handleActivate}
            disabled={activated}
          >
            {activated ? '¡Activado!' : 'Activar mi Segundo Cerebro'}
          </motion.button>
        </div>

        {/* Lista de Módulos */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {modulos.map((m, i) => (
            <div 
              key={m.key} 
              className="flex items-center justify-between px-4 py-2 rounded-lg bg-[#0a1a2f]/50 border border-[#3ec6f7]/20"
            >
              <span className="text-[#b6eaff] font-medium">{m.nombreAmigable}</span>
              <span 
                className="font-bold px-2 py-1 rounded-full text-sm"
                style={{ 
                  background: moduloColors[i % moduloColors.length] + '22',
                  color: moduloColors[i % moduloColors.length]
                }}
              >
                {m.progreso || 0}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 