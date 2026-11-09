import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { createBrainFrameLoop, createBrainParticles, projectBrainParticle } from '../utils/brainParticles';

interface ParticleBrainProps {
  compact?: boolean;
  className?: string;
}

export const ParticleBrain: React.FC<ParticleBrainProps> = ({ compact = false, className = '' }) => {
  const control = useRef<HTMLButtonElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const element = canvas.current;
    const button = control.current;
    const ctx = element?.getContext('2d');
    if (!element || !ctx || !button) return;

    const points = createBrainParticles(compact ? 1800 : 5200);
    const offsets = points.map(() => ({ x: 0, y: 0, vx: 0, vy: 0 }));
    let last = 0;
    let yaw = 0.85;
    let pitch = -0.23;
    let width = 1;
    let height = 1;
    let pointer = { x: 0, y: 0, active: false };
    let drag: { x: number; y: number; distance: number } | null = null;
    let waves: { x: number; y: number; radius: number; life: number }[] = [];
    let settling = false;
    const introEnd = performance.now() + 3500;

    const enabled = () => !reduced && !document.hidden;

    const locate = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const down = (event: PointerEvent) => {
      if (!enabled() || event.button !== 0) return;
      drag = { x: event.clientX, y: event.clientY, distance: 0 };
      pointer = { ...locate(event), active: true };
      button.setPointerCapture(event.pointerId);
      loop.invalidate();
    };

    const move = (event: PointerEvent) => {
      if (!enabled()) return;
      pointer = { ...locate(event), active: true };
      if (drag) {
        const dx = event.clientX - drag.x;
        const dy = event.clientY - drag.y;
        yaw += dx * 0.008;
        pitch = Math.max(-0.65, Math.min(0.65, pitch + dy * 0.003));
        drag.distance += Math.abs(dx) + Math.abs(dy);
        drag.x = event.clientX;
        drag.y = event.clientY;
      }
      loop.invalidate();
    };

    const ripple = (x: number, y: number) => {
      if (!enabled()) return;
      waves = [...waves.slice(-3), { x, y, radius: 0, life: 1 }];
      loop.invalidate();
    };

    const up = (event: PointerEvent) => {
      if (drag && drag.distance < 7) {
        const at = locate(event);
        ripple(at.x, at.y);
      }
      drag = null;
      if (event.pointerType === 'touch') pointer.active = false;
    };

    const cancel = () => {
      drag = null;
      pointer.active = false;
    };

    const leave = () => {
      if (!drag) pointer.active = false;
    };

    const click = (event: MouseEvent) => {
      if (event.detail === 0) ripple(width * 0.52, height * 0.45);
    };

    const key = (event: KeyboardEvent) => {
      if (!enabled() || !event.key.startsWith('Arrow')) return;
      event.preventDefault();
      yaw += event.key === 'ArrowLeft' ? -0.15 : event.key === 'ArrowRight' ? 0.15 : 0;
      pitch = Math.max(-0.65, Math.min(0.65, pitch + (event.key === 'ArrowUp' ? -0.08 : event.key === 'ArrowDown' ? 0.08 : 0)));
      last = 0;
      loop.invalidate();
    };

    const events: Record<string, EventListener> = {
      pointerdown: down as EventListener,
      pointermove: move as EventListener,
      pointerup: up as EventListener,
      pointercancel: cancel as EventListener,
      lostpointercapture: cancel as EventListener,
      pointerleave: leave as EventListener,
      click: click as EventListener,
      keydown: key as EventListener,
    };

    for (const [name, handler] of Object.entries(events)) {
      button.addEventListener(name, handler);
    }

    function draw(time: number) {
      if (!element || !ctx) return;
      if (time - last >= 33 || last === 0) {
        const dt = Math.min(40, time - last || 33);
        const step = dt / 16.667;
        const rect = element.getBoundingClientRect();
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        width = rect.width;
        height = rect.height;

        if (width > 0 && height > 0) {
          if (element.width !== Math.round(width * ratio) || element.height !== Math.round(height * ratio)) {
            element.width = Math.round(width * ratio);
            element.height = Math.round(height * ratio);
          }

          const moving = enabled();
          if (moving) {
            if (time < introEnd) yaw += dt * 0.000072;
            waves.forEach((w) => {
              w.radius += dt * 0.28;
              w.life -= dt / 1200;
            });
            waves = waves.filter((w) => w.life > 0);
          }

          ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
          ctx.clearRect(0, 0, width, height);

          const projected = points
            .map((point, index) => ({ point, index, ...projectBrainParticle(point, width, height, yaw, pitch) }))
            .sort((a, b) => a.depth - b.depth);

          settling = false;
          for (const mark of projected) {
            const offset = offsets[mark.index];
            let glow = 0;
            if (moving) {
              let fx = 0;
              let fy = 0;
              if (pointer.active) {
                const dx = mark.x + offset.x - pointer.x;
                const dy = mark.y + offset.y - pointer.y;
                const dist = Math.hypot(dx, dy);
                const radius = Math.max(42, Math.min(95, width * 0.19));
                if (dist < radius) {
                  const force = (1 - dist / radius) * 2.8;
                  fx += (dx / Math.max(1, dist)) * force;
                  fy += (dy / Math.max(1, dist)) * force;
                  glow = 1 - dist / radius;
                }
              }

              for (const wave of waves) {
                const dx = mark.x - wave.x;
                const dy = mark.y - wave.y;
                const dist = Math.hypot(dx, dy);
                const band = Math.abs(dist - wave.radius);
                if (band < 28) {
                  const force = (1 - band / 28) * wave.life * 3;
                  fx += (dx / Math.max(1, dist)) * force;
                  fy += (dy / Math.max(1, dist)) * force;
                  glow = Math.max(glow, wave.life);
                }
              }

              offset.vx = (offset.vx + (fx - offset.x * 0.045) * step) * 0.82 ** step;
              offset.vy = (offset.vy + (fy - offset.y * 0.045) * step) * 0.82 ** step;
              offset.x += offset.vx * step;
              offset.y += offset.vy * step;
              if (Math.abs(offset.x) + Math.abs(offset.y) + Math.abs(offset.vx) + Math.abs(offset.vy) > 0.05) {
                settling = true;
              }
            }

            // 3-color structural presentation:
            // 1. Saffron / Gold (hue < 80): Cerebellar folia & brainstem pillar
            // 2. Mint / Cyan (hue in 140..210): Parieto-Temporal-Occipital mantle
            // 3. Iris / Violet (hue > 210): Frontal & Executive cortex
            const hue = mark.point.hue;
            const sat = hue < 80 ? 94 : hue < 210 ? 82 : 78;
            const baseLit = hue < 80 ? 64 : hue < 210 ? 62 : 68;
            const lit = (mark.depth > 0 ? baseLit + 14 : baseLit) * mark.point.shade + glow * 18;
            const alpha = Math.min(
              1,
              (mark.depth > 0 ? 0.82 + mark.depth * 0.16 : 0.22) * mark.point.shade + glow * 0.35
            );

            ctx.fillStyle = `hsla(${hue},${sat}%,${lit}%,${alpha})`;
            ctx.beginPath();
            ctx.arc(mark.x + offset.x, mark.y + offset.y, mark.size * (1 + glow * 0.5), 0, Math.PI * 2);
            ctx.fill();
          }
        }
        last = time;
      }
    }

    const loop = createBrainFrameLoop({
      request: (callback) => requestAnimationFrame(callback),
      cancel: (frame) => cancelAnimationFrame(frame),
      paint: draw,
      canAnimate: () => enabled() && (performance.now() < introEnd || pointer.active || waves.length > 0 || settling),
    });

    function redraw() {
      last = 0;
      if (!document.hidden) loop.invalidate();
    }

    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(redraw);
    observer?.observe(element);
    if (!observer) window.addEventListener('resize', redraw);
    document.addEventListener('visibilitychange', redraw);
    redraw();

    return () => {
      loop.stop();
      observer?.disconnect();
      if (!observer) window.removeEventListener('resize', redraw);
      document.removeEventListener('visibilitychange', redraw);
      for (const [name, handler] of Object.entries(events)) {
        button.removeEventListener(name, handler);
      }
    };
  }, [compact, reduced]);

  return (
    <div
      className={`relative w-full ${className}`}
      style={{ height: compact ? 190 : 330 }}
    >
      <button
        ref={control}
        type="button"
        aria-label={
          reduced
            ? 'Particle brain illustration'
            : 'Interactive particle brain. Move to scatter, drag to rotate, or click for a ripple. Arrow keys rotate. Enter sends a ripple.'
        }
        disabled={reduced}
        className="w-full h-full p-0 border-0 bg-transparent rounded-xl outline-none focus:ring-1 focus:ring-[#8052ff]/40 select-none"
        style={{
          cursor: reduced ? 'default' : 'grab',
          touchAction: 'pan-y',
        }}
      >
        <canvas ref={canvas} aria-hidden className="block w-full h-full pointer-events-none" />
      </button>
    </div>
  );
};

export default ParticleBrain;
