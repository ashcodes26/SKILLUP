import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { burstParticle, createBrainParticles, LOGIN_BURST_DURATION } from '../utils/brainParticles';

interface LoginTransitionProps {
  visible: boolean;
  onComplete: () => void;
}

export const LoginTransition: React.FC<LoginTransitionProps> = ({ visible, onComplete }) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const skip = useRef<HTMLButtonElement>(null);
  const complete = useRef(onComplete);
  const reduced = useReducedMotion();
  const [containerOpacity, setContainerOpacity] = useState(1);

  useEffect(() => {
    complete.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!visible) return;
    const element = canvas.current;
    const ctx = element?.getContext('2d');
    const fallback = window.setTimeout(() => complete.current(), LOGIN_BURST_DURATION + 300);
    let frame = 0;

    if (reduced || !element || !ctx) {
      frame = requestAnimationFrame(() => complete.current());
      return () => {
        cancelAnimationFrame(frame);
        clearTimeout(fallback);
      };
    }

    skip.current?.focus();
    const points = createBrainParticles(4200);
    let start: number | null = null;

    const draw = (time: number) => {
      if (start === null) start = time;
      const progress = Math.min(1, (time - start) / LOGIN_BURST_DURATION);
      if (progress >= 1) {
        complete.current();
        return;
      }

      // Keep overlay 100% opaque during the zoom and blast; dissolve only at the climax as sparks clear screen
      if (progress > 0.88) {
        setContainerOpacity(Math.max(0, 1 - (progress - 0.88) / 0.12));
      } else {
        setContainerOpacity(1);
      }

      const rect = element.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      if (element.width !== Math.round(rect.width * ratio) || element.height !== Math.round(rect.height * ratio)) {
        element.width = Math.round(rect.width * ratio);
        element.height = Math.round(rect.height * ratio);
      }

      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);

      const cx = rect.width * 0.52;
      const cy = rect.height * 0.45;

      // Central radial blast shockwave flash as blast triggers
      if (progress > 0.2 && progress < 0.85) {
        const shockProgress = (progress - 0.2) / 0.65;
        const shockRadius = Math.max(rect.width, rect.height) * 0.7 * shockProgress ** 1.3;
        const shockAlpha = Math.max(0, (1 - shockProgress) * 0.35);

        if (shockAlpha > 0.01) {
          const grad = ctx.createRadialGradient(cx, cy, Math.max(0, shockRadius - 70), cx, cy, shockRadius);
          grad.addColorStop(0, 'rgba(128, 82, 255, 0)');
          grad.addColorStop(0.7, `rgba(146, 93, 255, ${shockAlpha * 0.35})`);
          grad.addColorStop(1, `rgba(45, 212, 191, ${shockAlpha * 0.7})`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, shockRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw each particle as a luminous warp streak accelerating outward
      for (let index = 0; index < points.length; index++) {
        const point = points[index];
        const mark = burstParticle(point, index, progress, rect.width, rect.height);
        const hue = point.hue;
        const sat = hue < 80 ? 94 : hue < 210 ? 84 : 80;
        const lit = Math.min(94, (mark.depth > 0 ? 74 : 60) * point.shade + 28 * mark.burst);
        const alpha = Math.max(0, Math.min(1, (mark.depth > 0 ? 0.9 : 0.35) * point.shade * mark.opacity));

        const dx = mark.x - cx;
        const dy = mark.y - cy;
        const dist = Math.hypot(dx, dy) || 1;
        const streakLength = Math.min(48, mark.burst * 42 * Math.min(mark.zoom * 0.35, 3.5));

        if (streakLength > 2 && mark.burst > 0.03) {
          ctx.strokeStyle = `hsla(${hue},${sat}%,${lit}%,${alpha})`;
          ctx.lineWidth = Math.min(4.5, (point.size + 0.35) * (1 + mark.burst * 1.3));
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(mark.x - (dx / dist) * streakLength, mark.y - (dy / dist) * streakLength);
          ctx.lineTo(mark.x, mark.y);
          ctx.stroke();
        } else {
          ctx.fillStyle = `hsla(${hue},${sat}%,${lit}%,${alpha})`;
          ctx.beginPath();
          ctx.arc(mark.x, mark.y, Math.min(12, (point.size + 0.25) * (1 + mark.burst * 0.8)), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(fallback);
    };
  }, [visible, reduced]);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Entering workspace"
      onKeyDown={(event) => {
        if (event.key === 'Tab') {
          event.preventDefault();
          skip.current?.focus();
        }
        if (event.key === 'Escape') complete.current();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        backgroundColor: '#070709',
        opacity: containerOpacity,
        transition: 'opacity 120ms ease-out',
        color: '#f5f4f8',
      }}
    >
      <canvas ref={canvas} aria-hidden style={{ display: 'block', width: '100%', height: '100%' }} />

      {/* Discrete floating dismiss button in corner for accessibility */}
      <div style={{ position: 'absolute', right: 24, bottom: 24, zIndex: 10001 }}>
        <button
          ref={skip}
          type="button"
          onClick={() => complete.current()}
          style={{
            minHeight: 36,
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 20,
            background: 'rgba(24, 24, 30, 0.75)',
            backdropFilter: 'blur(8px)',
            color: '#aaa8b6',
            padding: '6px 16px',
            fontSize: 12,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
          className="hover:border-white/30 hover:text-white transition-colors"
        >
          <span>Skip</span>
          <span style={{ fontSize: 14 }}>›</span>
        </button>
      </div>
    </div>
  );
};

export default LoginTransition;
