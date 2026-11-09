import React, { useState, useEffect, useRef } from 'react';

export type AvatarState = 'speaking' | 'listening' | 'thinking' | 'idle';

export interface ReactiveInterviewerAvatarProps {
  state: AvatarState;
  interviewerName: string;
  interviewerRole: string;
  companyName: string;
  roundMode: 'technical' | 'hr';
  isMuted?: boolean;
}

export default function ReactiveInterviewerAvatar({
  state,
  interviewerName,
  interviewerRole,
  companyName,
  roundMode,
  isMuted = false,
}: ReactiveInterviewerAvatarProps) {
  // Micro-physics states
  const [headY, setHeadY] = useState(0);
  const [headTilt, setHeadTilt] = useState(0);
  const [blinkValue, setBlinkValue] = useState(0); // 0 = open, 1 = fully closed
  const [mouthOpen, setMouthOpen] = useState(0); // 0 = closed smile, 1 = wide open
  const [mouthSpread, setMouthSpread] = useState(0);
  const [audioWaves, setAudioWaves] = useState<number[]>([8, 14, 22, 32, 24, 38, 28, 18, 26, 34, 20, 10]);
  const [bgMode, setBgMode] = useState<'obsidian' | 'highkey'>('obsidian');
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);

  const animFrameRef = useRef<number | null>(null);
  const isBlinkingRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Path to the user-provided 3D reference avatar image
  const referenceAvatarPath = '/assets/media/image_6edb2f7d.png';

  // Process reference image to isolate character from white background and blend into obsidian dark studio
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = referenceAvatarPath;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const w = img.naturalWidth || 500;
      const h = img.naturalHeight || 500;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Chroma-key out the flat white background with soft anti-aliased edge feathering
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Detect white background pixels
        if (r > 235 && g > 235 && b > 235) {
          const whiteness = (r + g + b) / 3;
          if (whiteness > 248) {
            data[i + 3] = 0; // completely transparent
          } else {
            // Smooth edge alpha feathering
            const alpha = 255 - Math.round(((whiteness - 235) / 13) * 255);
            data[i + 3] = Math.max(0, Math.min(255, alpha));
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      try {
        const dataUrl = canvas.toDataURL('image/png');
        setProcessedImageUrl(dataUrl);
      } catch (e) {
        // Fallback to direct path if canvas export fails
        setProcessedImageUrl(referenceAvatarPath);
      }
    };

    img.onerror = () => {
      setProcessedImageUrl(referenceAvatarPath);
    };
  }, [referenceAvatarPath]);

  // Natural Double-Blink Mechanism with smooth easing
  useEffect(() => {
    let blinkTimeout: NodeJS.Timeout;

    const triggerBlink = () => {
      if (isBlinkingRef.current) return;
      isBlinkingRef.current = true;

      const startTime = performance.now();
      const blinkDuration = 140; // ms

      const stepBlink = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / blinkDuration);
        const val = Math.sin(progress * Math.PI);
        setBlinkValue(val);

        if (progress < 1) {
          requestAnimationFrame(stepBlink);
        } else {
          setBlinkValue(0);
          isBlinkingRef.current = false;

          // 25% chance of realistic double-blink
          if (Math.random() < 0.25) {
            setTimeout(triggerBlink, 120);
          } else {
            scheduleNextBlink();
          }
        }
      };

      requestAnimationFrame(stepBlink);
    };

    const scheduleNextBlink = () => {
      const delay = Math.random() * 2600 + 2600;
      blinkTimeout = setTimeout(triggerBlink, delay);
    };

    scheduleNextBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);

  // Continuous Organic Physics Loop: Head Breathing, Head Tilt, Speech Syllable Modulation
  useEffect(() => {
    let startTime = performance.now();

    const loop = (now: number) => {
      const elapsed = now - startTime;

      // Subtle breathing motion
      const breath = Math.sin(elapsed * 0.0022) * 1.8;
      setHeadY(breath);

      // Micro head tilt based on state
      if (state === 'thinking') {
        setHeadTilt((prev) => prev * 0.92 + 1.8 * 0.08); // inquisitive tilt
      } else if (state === 'listening') {
        setHeadTilt((prev) => prev * 0.92 + -0.6 * 0.08); // attentive focus
      } else {
        setHeadTilt((prev) => prev * 0.9);
      }

      // Organic fluid mouth animation while speaking
      if (state === 'speaking') {
        const primaryWave = (Math.sin(elapsed * 0.019) + 1) * 0.48;
        const syllableWave = Math.sin(elapsed * 0.034) * 0.28;
        const pauseDrop = Math.sin(elapsed * 0.006) > 0.88 ? 0.2 : 1;
        const rawMouth = Math.max(0.02, Math.min(1, (primaryWave + syllableWave) * pauseDrop));

        setMouthOpen((prev) => prev * 0.58 + rawMouth * 0.42);
        setMouthSpread((prev) => prev * 0.7 + (Math.sin(elapsed * 0.014) * 0.5 + 0.5) * 0.3);

        if (Math.random() < 0.4) {
          setAudioWaves((prev) =>
            prev.map(() => Math.floor(Math.random() * 26) + 8)
          );
        }
      } else if (state === 'listening') {
        setMouthOpen((prev) => prev * 0.75);
        setMouthSpread(0);

        if (Math.random() < 0.25) {
          setAudioWaves((prev) =>
            prev.map(() => Math.floor(Math.random() * 18) + 4)
          );
        }
      } else {
        setMouthOpen((prev) => prev * 0.7);
        setMouthSpread(0);
        setAudioWaves([6, 8, 10, 14, 10, 16, 12, 8, 10, 12, 8, 5]);
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [state]);

  // State Color Palette & Halo Rings
  const getHaloStyles = () => {
    switch (state) {
      case 'speaking':
        return {
          glow: 'shadow-[0_0_65px_rgba(128,82,255,0.55)]',
          border: 'border-[#8052ff]',
          badgeBg: 'bg-[#8052ff]/20 border-[#8052ff]/40 text-[#cdbdff]',
          badgeText: 'AI Interviewer Speaking...',
          badgeIcon: 'volume_up',
          accent: '#8052ff',
          ringPulse: 'border-[#8052ff]/40',
        };
      case 'listening':
        return {
          glow: 'shadow-[0_0_65px_rgba(85,201,139,0.55)]',
          border: 'border-[#55C98B]',
          badgeBg: 'bg-[#55C98B]/20 border-[#55C98B]/40 text-[#55C98B]',
          badgeText: 'Listening to Candidate (Hands-Free Active)',
          badgeIcon: 'mic',
          accent: '#55C98B',
          ringPulse: 'border-[#55C98B]/40',
        };
      case 'thinking':
        return {
          glow: 'shadow-[0_0_55px_rgba(255,186,53,0.5)]',
          border: 'border-[#ffba35]',
          badgeBg: 'bg-[#ffba35]/20 border-[#ffba35]/40 text-[#ffba35]',
          badgeText: 'Analyzing Architecture & Formulating Next Question...',
          badgeIcon: 'psychology',
          accent: '#ffba35',
          ringPulse: 'border-[#ffba35]/40',
        };
      case 'idle':
      default:
        return {
          glow: 'shadow-[0_0_35px_rgba(255,255,255,0.12)]',
          border: 'border-[#363639]',
          badgeBg: 'bg-[#16161A] border-[#363639] text-[#9A9A9A]',
          badgeText: 'AI Interviewer Ready',
          badgeIcon: 'person',
          accent: '#8052ff',
          ringPulse: 'border-[#363639]',
        };
    }
  };

  const halo = getHaloStyles();
  const isFemalePersona = roundMode === 'hr';

  // Active display image: processed PNG (isolated background) or original
  const activeImageSrc = bgMode === 'obsidian' && processedImageUrl ? processedImageUrl : referenceAvatarPath;

  return (
    <div className="flex flex-col items-center justify-center select-none py-2">
      {/* Studio Viewport Container with Multi-Layer Radiance Halo */}
      <div className="relative flex items-center justify-center">
        {/* Outer Studio Ambient Halo Rings */}
        {state === 'speaking' && (
          <>
            <div className="absolute w-[290px] h-[290px] sm:w-[325px] sm:h-[325px] rounded-full border border-[#8052ff]/30 animate-ping opacity-35 pointer-events-none" />
            <div className="absolute w-[315px] h-[315px] sm:w-[350px] sm:h-[350px] rounded-full border border-[#8052ff]/20 animate-pulse pointer-events-none" />
          </>
        )}
        {state === 'listening' && (
          <>
            <div className="absolute w-[290px] h-[290px] sm:w-[325px] sm:h-[325px] rounded-full border border-[#55C98B]/35 animate-ping opacity-40 pointer-events-none" />
            <div className="absolute w-[315px] h-[315px] sm:w-[350px] sm:h-[350px] rounded-full border border-[#55C98B]/25 animate-pulse pointer-events-none" />
          </>
        )}
        {state === 'thinking' && (
          <div className="absolute w-[290px] h-[290px] sm:w-[325px] sm:h-[325px] rounded-full border-2 border-dashed border-[#ffba35]/40 animate-spin [animation-duration:9s] pointer-events-none" />
        )}

        {/* Circular Viewport with Studio Glass & Metallic Bezel */}
        <div
          className={`relative w-60 h-60 sm:w-68 sm:h-68 rounded-full border-2 ${halo.border} ${halo.glow} ${
            bgMode === 'obsidian'
              ? 'bg-gradient-to-b from-[#181824] via-[#0f0f16] to-[#07070a]'
              : 'bg-white'
          } overflow-hidden flex items-center justify-center transition-all duration-300 shadow-2xl`}
        >
          {/* Subtle Ambient Studio Lighting behind character */}
          {bgMode === 'obsidian' && (
            <div
              className="absolute inset-0 opacity-40 pointer-events-none transition-colors duration-500"
              style={{
                background: `radial-gradient(circle at 50% 36%, ${halo.accent} 0%, rgba(20,20,32,0.6) 55%, transparent 75%)`,
              }}
            />
          )}

          {/* Character Container with Organic Breathing and Tilt Physics */}
          <div
            className="relative w-full h-full flex items-center justify-center transition-transform duration-200"
            style={{
              transform: `translateY(${headY}px) rotate(${headTilt}deg) ${
                state === 'listening' ? 'scale(1.03)' : 'scale(1)'
              }`,
            }}
          >
            {/* Base Stylized 3D Character Render (Matches User Reference Image) */}
            <img
              src={activeImageSrc}
              alt="AI Interviewer Avatar"
              className="w-full h-full object-cover object-center select-none pointer-events-none scale-105"
              draggable={false}
            />

            {/* Interactive SVG Animation Overlay Layer (Blinking Eyelids + Syllable Mouth Movement) */}
            <svg
              viewBox="0 0 500 500"
              className="absolute inset-0 w-full h-full pointer-events-none select-none scale-105"
            >
              <defs>
                {/* Eyelid Skin Shading matching reference character */}
                <linearGradient id="eyelidGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9c6366" />
                  <stop offset="70%" stopColor="#ba7c7f" />
                  <stop offset="100%" stopColor="#874e51" />
                </linearGradient>

                {/* Mouth Cavity Gradient */}
                <radialGradient id="mouthCavityGrad" cx="50%" cy="40%" r="50%">
                  <stop offset="0%" stopColor="#5a1822" />
                  <stop offset="70%" stopColor="#300d13" />
                  <stop offset="100%" stopColor="#1a060a" />
                </radialGradient>

                {/* Soft Lip Texture */}
                <linearGradient id="lipGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#b67173" />
                  <stop offset="100%" stopColor="#985356" />
                </linearGradient>

                {/* Edge Feather Filter for Seamless Blend */}
                <filter id="softLipEdge" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="0.8" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Dynamic Blinking Eyelids (Calibrated to Spectacles and Eyes in Reference Image) */}
              {blinkValue > 0.05 && (
                <g id="blinking-eyelids" opacity={Math.min(1, blinkValue * 1.2)}>
                  {/* Left Eye (Viewer's Left) - Center at X:198, Y:212 */}
                  <g transform="translate(198, 212)">
                    <path
                      d={`M -25 -2 Q 0 ${blinkValue * 20} 25 -2 Q 0 ${blinkValue * 6 - 8} -25 -2 Z`}
                      fill="url(#eyelidGrad)"
                      stroke="#422225"
                      strokeWidth="1.2"
                    />
                    {/* Eyelash edge */}
                    <path
                      d={`M -24 0 Q 0 ${blinkValue * 19} 24 0`}
                      fill="none"
                      stroke="#221315"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </g>

                  {/* Right Eye (Viewer's Right) - Center at X:296, Y:212 */}
                  <g transform="translate(296, 212)">
                    <path
                      d={`M -25 -2 Q 0 ${blinkValue * 20} 25 -2 Q 0 ${blinkValue * 6 - 8} -25 -2 Z`}
                      fill="url(#eyelidGrad)"
                      stroke="#422225"
                      strokeWidth="1.2"
                    />
                    {/* Eyelash edge */}
                    <path
                      d={`M -24 0 Q 0 ${blinkValue * 19} 24 0`}
                      fill="none"
                      stroke="#221315"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </g>
                </g>
              )}

              {/* Dynamic Organic Mouth Overlay (Precisely calibrated to character lips at X:252, Y:305) */}
              {mouthOpen > 0.06 && (
                <g
                  id="organic-speech-mouth"
                  filter="url(#softLipEdge)"
                  opacity={Math.min(1, (mouthOpen - 0.06) * 3.5)}
                >
                  {/* Inner Oral Cavity & Subtle Teeth */}
                  {(() => {
                    const cx = 252;
                    const cy = 305;
                    const hw = 19 + mouthSpread * 3; // calibrated realistic half-width
                    const openH = Math.min(7, mouthOpen * 7.5); // subtle realistic speech opening
                    const topY = cy - openH * 0.4;
                    const botY = cy + openH * 0.6;

                    return (
                      <>
                        {/* Oral Cavity Background */}
                        <path
                          d={`M ${cx - hw} ${cy} Q ${cx} ${topY} ${cx + hw} ${cy} Q ${cx} ${botY} ${cx - hw} ${cy} Z`}
                          fill="url(#mouthCavityGrad)"
                        />

                        {/* Upper Teeth Ridge Glimpse */}
                        {mouthOpen > 0.25 && (
                          <path
                            d={`M ${cx - hw * 0.55} ${cy} Q ${cx} ${topY + 0.5} ${cx + hw * 0.55} ${cy} Q ${cx} ${cy + Math.min(2.5, mouthOpen * 2.5)} ${cx - hw * 0.55} ${cy} Z`}
                            fill="#f8f9fa"
                            opacity={0.9}
                          />
                        )}

                        {/* Subtle Lip Shading Contours Matching Real Lip Vermillion */}
                        <path
                          d={`M ${cx - hw - 1} ${cy} Q ${cx} ${topY - 0.8} ${cx + hw + 1} ${cy} Q ${cx} ${topY + 1} ${cx - hw - 1} ${cy} Z`}
                          fill="url(#lipGrad)"
                          stroke="#6b3538"
                          strokeWidth="0.6"
                        />
                        <path
                          d={`M ${cx - hw} ${cy} Q ${cx} ${botY} ${cx + hw} ${cy} Q ${cx} ${botY + 2} ${cx - hw} ${cy} Z`}
                          fill="url(#lipGrad)"
                          stroke="#6b3538"
                          strokeWidth="0.6"
                        />
                      </>
                    );
                  })()}
                </g>
              )}
            </svg>
          </div>

          {/* Vignette Rim Shadow for Seamless Depth */}
          <div className="absolute inset-0 rounded-full shadow-[inset_0_0_24px_rgba(0,0,0,0.65)] pointer-events-none" />
        </div>

        {/* Floating Mini Status Badge on Viewport Rim */}
        <div
          className={`absolute -top-1 -right-1 w-8 h-8 rounded-full border-2 border-[#0D0D0F] flex items-center justify-center text-white shadow-xl ${
            state === 'speaking'
              ? 'bg-[#8052ff] animate-pulse'
              : state === 'listening'
              ? 'bg-[#55C98B] animate-pulse'
              : state === 'thinking'
              ? 'bg-[#ffba35] animate-spin'
              : 'bg-[#363639]'
          }`}
          title={halo.badgeText}
        >
          <span className="material-symbols-outlined text-[15px]">
            {halo.badgeIcon}
          </span>
        </div>
      </div>

      {/* Reactive Multi-Band Audio Visualizer Bar */}
      <div className="flex items-center gap-1.5 h-8 mt-4 px-4 py-1.5 rounded-full bg-[#121217]/90 border border-[#22222a] shadow-inner backdrop-blur-md">
        {audioWaves.map((height, i) => (
          <div
            key={i}
            className="w-1.5 rounded-full transition-all duration-150"
            style={{
              height: `${Math.min(24, Math.max(4, height))}px`,
              backgroundColor:
                state === 'speaking'
                  ? '#8052ff'
                  : state === 'listening'
                  ? '#55C98B'
                  : state === 'thinking'
                  ? '#ffba35'
                  : '#4b5563',
              opacity: state === 'idle' ? 0.35 : 0.95,
            }}
          />
        ))}
      </div>

      {/* State & Panelist Credential Pill with Background Style Toggle */}
      <div className="mt-2.5 flex flex-col items-center text-center space-y-1">
        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-mono font-semibold border ${halo.badgeBg} transition-colors duration-300 shadow-md`}
        >
          <span className="material-symbols-outlined text-[14px] animate-pulse">
            {halo.badgeIcon}
          </span>
          <span>{halo.badgeText}</span>
        </div>

        <div className="text-xs text-white font-bold flex items-center gap-1.5">
          <span>{interviewerName}</span>
          <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#8052ff]/20 text-[#cdbdff] font-mono border border-[#8052ff]/30">
            {isFemalePersona ? 'HR Director' : 'Technical Lead'}
          </span>
          <button
            onClick={() => setBgMode((prev) => (prev === 'obsidian' ? 'highkey' : 'obsidian'))}
            className="ml-1 text-[10px] text-[#9A9A9A] hover:text-[#cdbdff] transition-colors font-mono cursor-pointer underline"
            title="Toggle between Obsidian Dark Studio and High-Key Studio Lighting"
          >
            {bgMode === 'obsidian' ? 'Studio Dark' : 'High-Key'}
          </button>
        </div>
        <div className="text-[10px] text-[#9A9A9A] font-mono">
          {interviewerRole} · {companyName} Placement Panel
        </div>
      </div>
    </div>
  );
}
