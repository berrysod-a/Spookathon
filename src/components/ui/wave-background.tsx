"use client";

import React, { useEffect, useRef } from "react";
import { createNoise2D } from "simplex-noise";

interface WavesProps {
  strokeColor?: string;
  backgroundColor?: string;
  pointerSize?: number;
  className?: string;
}

export function Waves({
  strokeColor = "#3b82f6",
  backgroundColor = "#09090b",
  pointerSize = 0.5,
  className = "",
}: WavesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const noise2D = createNoise2D();

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      radius: 180 * pointerSize,
      clickRadius: 0,
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    const handleClick = () => {
      mouse.clickRadius = 250;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("click", handleClick);

    let time = 0;
    const lineSpacing = 32;
    const step = 8;

    const render = () => {
      time += 0.003;
      mouse.x += (mouse.targetX - mouse.x) * 0.1;
      mouse.y += (mouse.targetY - mouse.y) * 0.1;
      if (mouse.clickRadius > 0) {
        mouse.clickRadius *= 0.94;
        if (mouse.clickRadius < 1) mouse.clickRadius = 0;
      }

      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 1;
      ctx.strokeStyle = strokeColor;

      const numLines = Math.ceil(height / lineSpacing) + 2;

      for (let i = 0; i < numLines; i++) {
        const baseY = i * lineSpacing;
        ctx.beginPath();
        let first = true;

        for (let x = 0; x <= width + step; x += step) {
          // Noise offset
          const nx = x * 0.002;
          const ny = baseY * 0.002;
          const n = noise2D(nx + time, ny + time) * 18;

          let dy = n;

          // Mouse proximity displacement
          const distMouse = Math.hypot(x - mouse.x, baseY - mouse.y);
          if (distMouse < mouse.radius) {
            const factor = (1 - distMouse / mouse.radius);
            dy += factor * -28;
          }

          // Click ripple
          if (mouse.clickRadius > 0) {
            const distClick = Math.hypot(x - mouse.x, baseY - mouse.y);
            const rippleDiff = Math.abs(distClick - (250 - mouse.clickRadius) * 2);
            if (rippleDiff < 40) {
              const rippleFactor = (1 - rippleDiff / 40) * (mouse.clickRadius / 250);
              dy += Math.sin(rippleDiff * 0.2) * 20 * rippleFactor;
            }
          }

          const y = baseY + dy;

          if (first) {
            ctx.moveTo(x, y);
            first = false;
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.globalAlpha = 0.25;
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("click", handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, [strokeColor, backgroundColor, pointerSize]);

  return <canvas ref={canvasRef} className={`w-full h-full block ${className}`} />;
}
