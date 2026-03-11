import { useEffect, useMemo, useRef } from "react";

const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

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
  color = "199,166,106",
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
  holdSec = 1.25,

  logoFitW = 0.62,
  logoFitH = 0.26,
  logoOffsetY = 0,
  logoScale = 1.5,

  overlayStrength = 1.0,
  dprCap = 5,
  overlayOversample = 3.2,

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
    cssDpr: 1,
    lastSizeKey: "",
    overlayRect: null,
    sphereR: 0,

    lastMode: "",
    completedOnce: false,
    frozenAt: null,
  });

  const off = useMemo(() => document.createElement("canvas"), []);
  const offCtx = useMemo(
    () =>
      off.getContext("2d", {
        alpha: true,
        willReadFrequently: false,
      }),
    [off]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", {
      alpha: false,
      desynchronized: false,
      willReadFrequently: false,
    });
    if (!ctx || !offCtx) return;

    let raf = 0;
    let ro = null;

    const cycleSec = orbitSec + scatterSec + freeSec + gatherSec + holdSec;

    const buildOverlayRect = (img) => {
      const { w, h, cssDpr } = stateRef.current;
      if (!w || !h || !img) return null;

      const boxW = w * Math.min(0.98, logoFitW * logoScale);
      const boxH = h * Math.min(0.98, logoFitH * logoScale);

      const imgW = img.naturalWidth || img.width || 1;
      const imgH = img.naturalHeight || img.height || 1;
      const ir = imgW / imgH;
      const br = boxW / boxH;

      let drawW;
      let drawH;

      if (ir > br) {
        drawW = boxW;
        drawH = boxW / ir;
      } else {
        drawH = boxH;
        drawW = boxH * ir;
      }

      const x = (w - drawW) / 2;
      const y = (h - drawH) / 2 + logoOffsetY + centerOffsetY;

      const oversample = clamp(overlayOversample, 1, 6);
      const offW = Math.max(1, Math.round(drawW * cssDpr * oversample));
      const offH = Math.max(1, Math.round(drawH * cssDpr * oversample));

      off.width = offW;
      off.height = offH;

      offCtx.setTransform(1, 0, 0, 1, 0, 0);
      offCtx.clearRect(0, 0, offW, offH);
      offCtx.imageSmoothingEnabled = true;
      offCtx.imageSmoothingQuality = "high";
      offCtx.drawImage(img, 0, 0, offW, offH);

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

          r: 0.72 + Math.random() * 0.85,
          a: 0.56 + Math.random() * 0.34,

          ph: Math.random() * Math.PI * 2,
          spd: 0.7 + Math.random() * 0.9,
          delay: Math.random() * 0.25,
        });
      }
      stateRef.current.particles = particles;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));

      const rawDpr = window.devicePixelRatio || 1;
      const dpr = Math.max(1, Math.min(dprCap, rawDpr));

      const pixelW = Math.max(1, Math.round(w * dpr));
      const pixelH = Math.max(1, Math.round(h * dpr));

      const sizeKey = `${w}x${h}@${dpr}`;
      if (stateRef.current.lastSizeKey === sizeKey) return;
      stateRef.current.lastSizeKey = sizeKey;

      canvas.width = pixelW;
      canvas.height = pixelH;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      stateRef.current.w = w;
      stateRef.current.h = h;
      stateRef.current.cssDpr = dpr;

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

      // ✅ 로고는 gather 마지막 구간에서 자연스럽게 페이드인
      let overlayAlpha = 0;
      if (overlayRect && imgRef.current) {
        if (mode === "gather") {
          const revealStart = 0.9;
          const k = clamp((gatherP - revealStart) / (1 - revealStart), 0, 1);
          const eased = easeOutCubic(k);
          overlayAlpha = clamp(overlayStrength * eased, 0, 1);
        } else if (mode === "hold") {
          overlayAlpha = clamp(Math.max(overlayStrength, 0.98), 0, 1);
        }
      }

      const particleFade =
        mode === "hold"
          ? 0
          : mode === "gather"
          ? clamp(1 - overlayAlpha * 1.08, 0, 1)
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
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

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

        ctx.shadowColor = `rgba(${color},0.34)`;
        ctx.shadowBlur = 6;
        ctx.fillStyle = `rgba(${color},${clamp(alpha, 0, 1)})`;
        ctx.beginPath();
        ctx.arc(x, y, rr, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";

      if (overlayAlpha > 0.001 && overlayRect) {
        const { x, y, w: ow, h: oh } = overlayRect;
        ctx.save();
        ctx.globalAlpha = overlayAlpha;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.shadowColor = `rgba(${color},0.20)`;
        ctx.shadowBlur = 16;
        ctx.drawImage(off, x, y, ow, oh);
        ctx.shadowBlur = 0;
        ctx.restore();
      }
    };

    ro = new ResizeObserver(() => {
      resize();
    });
    ro.observe(canvas);

    resize();

    const img = new Image();
    img.decoding = "async";

    img.onload = async () => {
      try {
        if (img.decode) await img.decode();
      } catch (e) {}
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
    dprCap,
    overlayOversample,
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
      style={{
        width: "100%",
        height: "100%",
        display: "block",
      }}
    />
  );
}