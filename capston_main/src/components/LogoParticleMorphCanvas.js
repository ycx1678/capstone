// src/components/LogoParticleMorphCanvas.js
import { useEffect, useMemo, useRef } from "react";

const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function randomSpherePoint(radius) {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  return {
    x: radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.sin(phi) * Math.sin(theta),
    z: radius * Math.cos(phi),
  };
}

export default function LogoParticleMorphCanvas({
  src,
  bg = "#000",
  color = "199,166,106", // ✅ 전체 금색 기본값
  density = 1400,

  sphereRadiusFactor = 0.42,
  driftAmp = 8,
  driftSpeed = 0.22,

  orbitSpeed = 0.07,
  orbitSpeedScatter = 0.11,
  orbitTilt = 0.55,
  orbitWobble = 0.18,

  orbitSec = 3.2,
  scatterSec = 1.4,
  freeSec = 0.9,
  gatherSec = 1.8,
  holdSec = 0.8,

  logoFitW = 0.62,
  logoFitH = 0.26,
  logoOffsetY = 0,
  logoScale = 1.5,

  overlayStrength = 1.0,
  overlayFadeInFrac = 0.4,

  dprCap = 3,

  centerOffsetY = 0,

  oneShot = true,
  onModeChange,
  onComplete,
}) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  const stateRef = useRef({
    particles: [],
    w: 0,
    h: 0,
    lastSizeKey: "",
    overlayRect: null,
    sphereR: 0,

    lastMode: "",
    completedOnce: false,
    frozenAt: null,
  });

  const off = useMemo(() => document.createElement("canvas"), []);
  const offCtx = useMemo(() => off.getContext("2d"), [off]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) return;

    let raf = 0;
    let ro = null;

    const cycleSec = orbitSec + scatterSec + freeSec + gatherSec + holdSec;

    const buildOverlayRect = (img) => {
      const { w, h } = stateRef.current;
      if (!w || !h || !img) return null;

      const boxW = w * Math.min(0.98, logoFitW * logoScale);
      const boxH = h * Math.min(0.98, logoFitH * logoScale);

      const ir = img.width / img.height;
      const br = boxW / boxH;

      let drawW, drawH;
      if (ir > br) {
        drawW = boxW;
        drawH = boxW / ir;
      } else {
        drawH = boxH;
        drawW = boxH * ir;
      }

      const x = (w - drawW) / 2;
      const y = (h - drawH) / 2 + logoOffsetY + centerOffsetY;

      off.width = Math.max(1, Math.floor(drawW));
      off.height = Math.max(1, Math.floor(drawH));
      offCtx.clearRect(0, 0, off.width, off.height);
      offCtx.drawImage(img, 0, 0, off.width, off.height);

      return { x, y, w: drawW, h: drawH };
    };

    const reseedParticles = () => {
      const { w, h } = stateRef.current;
      const sphereR = Math.min(w, h) * sphereRadiusFactor * 0.92;
      stateRef.current.sphereR = sphereR;

      const particles = [];
      for (let i = 0; i < density; i++) {
        const sp = randomSpherePoint(sphereR);
        particles.push({
          sx: sp.x,
          sy: sp.y,
          sz: sp.z,
          z: (sp.z / sphereR + 1) / 2,

          tx: w / 2,
          ty: h / 2 + centerOffsetY,

          r: 0.7 + Math.random() * 0.8,
          a: 0.55 + Math.random() * 0.35,

          ph: Math.random() * Math.PI * 2,
          spd: 0.7 + Math.random() * 0.9,
          delay: Math.random() * 0.25,
        });
      }
      stateRef.current.particles = particles;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));

      const dpr = Math.max(1, Math.min(dprCap, window.devicePixelRatio || 1));
      const sizeKey = `${w}x${h}@${dpr}`;
      if (stateRef.current.lastSizeKey === sizeKey) return;
      stateRef.current.lastSizeKey = sizeKey;

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      stateRef.current.w = w;
      stateRef.current.h = h;

      reseedParticles();
      if (imgRef.current) {
        stateRef.current.overlayRect = buildOverlayRect(imgRef.current);
      }
    };

    const applyOrbit = (x, y, z, tt, speed) => {
      const a = tt * speed;
      const ca = Math.cos(a);
      const sa = Math.sin(a);

      let rx = x * ca + z * sa;
      let rz = -x * sa + z * ca;

      const tilt = orbitTilt * 0.65;
      const ct = Math.cos(tilt);
      const st = Math.sin(tilt);

      let ry = y * ct - rz * st;
      rz = y * st + rz * ct;

      const wob = orbitWobble * 0.18 * Math.sin(tt * 0.9);
      ry += wob * 60;

      return { x: rx, y: ry, z: rz };
    };

    const render = (tms) => {
      raf = requestAnimationFrame(render);

      const { w, h, particles, overlayRect, sphereR } = stateRef.current;
      if (!w || !h) return;

      const frozenAt = stateRef.current.frozenAt;
      const tmsUse = frozenAt != null ? frozenAt : tms;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      if (!particles.length) return;

      const cycleT = (tmsUse * 0.001) % cycleSec;

      const tOrbitEnd = orbitSec;
      const tScatterEnd = tOrbitEnd + scatterSec;
      const tFreeEnd = tScatterEnd + freeSec;
      const tGatherEnd = tFreeEnd + gatherSec;

      let mode = "orbit";
      if (cycleT < tOrbitEnd) mode = "orbit";
      else if (cycleT < tScatterEnd) mode = "scatter";
      else if (cycleT < tFreeEnd) mode = "free";
      else if (cycleT < tGatherEnd) mode = "gather";
      else mode = "hold";

      if (stateRef.current.lastMode !== mode) {
        stateRef.current.lastMode = mode;
        if (typeof onModeChange === "function") onModeChange(mode);
      }

      if (oneShot && mode === "hold" && !stateRef.current.completedOnce) {
        stateRef.current.completedOnce = true;
        stateRef.current.frozenAt = tms;
        if (typeof onComplete === "function") onComplete();
      }

      const scatterP =
        mode === "scatter"
          ? (cycleT - tOrbitEnd) / scatterSec
          : mode === "free" || mode === "gather" || mode === "hold"
          ? 1
          : 0;

      const gatherP =
        mode === "gather"
          ? (cycleT - tFreeEnd) / gatherSec
          : mode === "hold"
          ? 1
          : 0;

      const scatterE = easeInOutCubic(clamp(scatterP, 0, 1));
      const gatherE = easeInOutCubic(clamp(gatherP, 0, 1));

      let overlayAlpha = 0;
      if (overlayRect && imgRef.current) {
        if (mode === "gather") {
          const start = 1 - clamp(overlayFadeInFrac, 0.05, 0.95);
          const k = clamp((gatherP - start) / (1 - start), 0, 1);
          overlayAlpha = overlayStrength * easeInOutCubic(k);
        } else if (mode === "hold") {
          overlayAlpha = overlayStrength;
        }
      }

      const particleFade =
        mode === "hold"
          ? 0
          : mode === "gather"
          ? clamp(1 - overlayAlpha, 0, 1)
          : 1;

      const cx = w / 2;
      const cy = h / 2 + centerOffsetY;

      const margin = Math.max(14, Math.min(w, h) * 0.045);
      const allowX = Math.max(1, w / 2 - margin);
      const allowY = Math.max(1, h / 2 - margin);

      const approxMaxX = sphereR * 1.55 + driftAmp * 1.6 + 80;
      const approxMaxY = sphereR * 1.55 + driftAmp * 1.6 + 90;

      const baseSafe = Math.min(1, allowX / approxMaxX, allowY / approxMaxY);

      ctx.globalCompositeOperation = "source-over";

      const tt = tmsUse * 0.001;

      const curOrbitSpeed =
        mode === "scatter" || mode === "free" ? orbitSpeedScatter : orbitSpeed;

      for (const d of particles) {
        const orb = applyOrbit(d.sx, d.sy, d.sz, tt, curOrbitSpeed);

        const depth = clamp(
          0.6 + ((orb.z / sphereR + 1) / 2) * 0.95,
          0.45,
          1.6
        );

        const drift =
          driftAmp *
          (0.8 + d.z * 0.6) *
          Math.sin(d.ph + tt * driftSpeed * d.spd);

        const drift2 =
          driftAmp *
          0.75 *
          (0.8 + d.z * 0.6) *
          Math.cos(d.ph * 0.9 + tt * driftSpeed * d.spd);

        let sx = cx + orb.x * depth + drift;
        let sy = cy + orb.y * depth + drift2;

        const dx = sx - cx;
        const dy = sy - cy;

        const desiredPush = mode === "orbit" ? 1 : 1 + 0.3 * scatterE;
        const safePush = Math.min(desiredPush, baseSafe);

        sx = cx + dx * safePush;
        sy = cy + dy * safePush;

        let x = sx;
        let y = sy;

        if (mode === "gather") {
          const pe = clamp((gatherE - d.delay) / (1 - d.delay), 0, 1);
          const mix = easeInOutCubic(pe);
          x = sx + (d.tx - sx) * mix;
          y = sy + (d.ty - sy) * mix;
        } else if (mode === "hold") {
          x = d.tx;
          y = d.ty;
        }

        const alpha = d.a * particleFade;
        if (alpha <= 0.002) continue;

        const rr = d.r * (0.9 + d.z * 0.28);

        // ✅ 전체 금색 + 은은한 glow
        ctx.shadowColor = `rgba(${color},0.32)`;
        ctx.shadowBlur = 6;
        ctx.fillStyle = `rgba(${color},${clamp(alpha, 0, 1)})`;
        ctx.beginPath();
        ctx.arc(x, y, rr, 0, Math.PI * 2);
        ctx.fill();
      }

      // shadow 상태 정리
      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";

      if (overlayAlpha > 0.001 && overlayRect) {
        const { x, y, w: ow, h: oh } = overlayRect;
        ctx.save();
        ctx.globalAlpha = overlayAlpha;
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(off, x, y, ow, oh);
        ctx.restore();
      }
    };

    ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      stateRef.current.overlayRect = buildOverlayRect(img);
    };
    img.onerror = () => {
      imgRef.current = null;
      stateRef.current.overlayRect = null;
    };
    img.src = src;

    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
    };
  }, [
    src,
    bg,
    color,
    density,
    sphereRadiusFactor,
    driftAmp,
    driftSpeed,
    orbitSpeed,
    orbitSpeedScatter,
    orbitTilt,
    orbitWobble,
    orbitSec,
    scatterSec,
    freeSec,
    gatherSec,
    holdSec,
    logoFitW,
    logoFitH,
    logoOffsetY,
    logoScale,
    overlayStrength,
    overlayFadeInFrac,
    dprCap,
    centerOffsetY,
    oneShot,
    onModeChange,
    onComplete,
    off,
    offCtx,
  ]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
