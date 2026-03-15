import { useEffect, useMemo, useRef } from "react";

const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function ramp01(value, start, end) {
  if (end <= start) return value >= end ? 1 : 0;
  return clamp((value - start) / (end - start), 0, 1);
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
  density = 1200,

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

  logoFitW = 0.52,
  logoFitH = 0.22,
  logoOffsetY = 0,
  logoScale = 1.18,

  overlayStrength = 1.0,
  dprCap = 2,
  overlayOversample = 2,

  centerOffsetY = 0,

  oneShot = true,
  onModeChange,
  onComplete,

  liteMode = false,
}) {
  const autoLiteMode = useMemo(() => {
    if (typeof window === "undefined") return false;

    const ua = window.navigator.userAgent || "";
    const vendor = window.navigator.vendor || "";
    const platform = window.navigator.platform || "";
    const maxTouchPoints = window.navigator.maxTouchPoints || 0;

    const isIOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (platform === "MacIntel" && maxTouchPoints > 1);

    const isSafari =
      /Safari/i.test(ua) &&
      !/Chrome|CriOS|Edg|OPR|SamsungBrowser|Firefox|FxiOS/i.test(ua) &&
      /Apple/i.test(vendor);

    return isIOS || isSafari;
  }, []);

  const shouldLiteMode = liteMode || autoLiteMode;

  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const offRef = useRef(null);
  const offCtxRef = useRef(null);

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
    animationStartAt: null,
    lastFrameAt: 0,
    resizeQueued: false,
  });

  useEffect(() => {
    if (!offRef.current) {
      offRef.current = document.createElement("canvas");
      offCtxRef.current = offRef.current.getContext("2d", {
        alpha: true,
        willReadFrequently: false,
      });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const off = offRef.current;
    const offCtx = offCtxRef.current;

    if (!canvas || !off || !offCtx) return;

    const ctx = canvas.getContext("2d", {
      alpha: false,
      willReadFrequently: false,
    });

    if (!ctx) return;

    let rafId = 0;
    let ro = null;
    let resizeHandler = null;

    const effectiveDprCap = shouldLiteMode ? Math.min(dprCap, 1.5) : dprCap;

    const effectiveDensity = shouldLiteMode
      ? Math.max(220, Math.round(density * 0.42))
      : density;

    const effectiveOverlayOversample = shouldLiteMode
      ? Math.min(overlayOversample, 1.5)
      : overlayOversample;

    const effectiveOverlayStrength = shouldLiteMode
      ? Math.min(overlayStrength, 0.72)
      : overlayStrength;

    const effectiveDriftAmp = shouldLiteMode ? driftAmp * 0.72 : driftAmp;
    const effectiveOrbitTilt = shouldLiteMode ? orbitTilt * 0.9 : orbitTilt;
    const effectiveOrbitWobble = shouldLiteMode ? orbitWobble * 0.65 : orbitWobble;
    const effectiveSphereRadiusFactor = shouldLiteMode
      ? sphereRadiusFactor * 0.96
      : sphereRadiusFactor;

    const effectiveParticleShadowBlur = 0;
    const effectiveOverlayShadowBlur = shouldLiteMode ? 6 : 10;

    const particleShadowColor = `rgba(${color},${shouldLiteMode ? "0.18" : "0.24"})`;
    const overlayShadowColor = `rgba(${color},${shouldLiteMode ? "0.10" : "0.16"})`;

    const cycleSec = orbitSec + scatterSec + freeSec + gatherSec + holdSec;

    const tOrbitEnd = orbitSec;
    const tScatterEnd = tOrbitEnd + scatterSec;
    const tFreeEnd = tScatterEnd + freeSec;
    const tGatherEnd = tFreeEnd + gatherSec;
    const tHoldEnd = tGatherEnd + holdSec;

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

      const oversample = clamp(effectiveOverlayOversample, 1, 3);
      const offW = Math.max(1, Math.round(drawW * cssDpr * oversample));
      const offH = Math.max(1, Math.round(drawH * cssDpr * oversample));

      off.width = offW;
      off.height = offH;

      offCtx.setTransform(1, 0, 0, 1, 0, 0);
      offCtx.clearRect(0, 0, offW, offH);
      offCtx.imageSmoothingEnabled = true;
      offCtx.imageSmoothingQuality = shouldLiteMode ? "medium" : "high";
      offCtx.drawImage(img, 0, 0, offW, offH);

      return { x, y, w: drawW, h: drawH };
    };

    const reseedParticles = () => {
      const { w, h } = stateRef.current;
      const sphereR = Math.min(w, h) * effectiveSphereRadiusFactor * 0.92;
      stateRef.current.sphereR = sphereR;

      const particles = new Array(effectiveDensity);

      for (let i = 0; i < effectiveDensity; i++) {
        const sp = randomSpherePoint(sphereR);
        particles[i] = {
          sx: sp.x,
          sy: sp.y,
          sz: sp.z,
          z: (sp.z / sphereR + 1) / 2,

          tx: w / 2,
          ty: h / 2 + centerOffsetY,

          r: shouldLiteMode
            ? 0.8 + Math.random() * 0.72
            : 0.72 + Math.random() * 0.85,

          a: shouldLiteMode
            ? 0.52 + Math.random() * 0.26
            : 0.56 + Math.random() * 0.34,

          ph: Math.random() * Math.PI * 2,
          spd: 0.7 + Math.random() * 0.9,

          // gather 시작 타이밍 분산
          delay: Math.random() * 0.18,
        };
      }

      stateRef.current.particles = particles;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));

      const rawDpr =
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      const dpr = Math.max(1, Math.min(effectiveDprCap, rawDpr));

      const pixelW = Math.max(1, Math.round(w * dpr));
      const pixelH = Math.max(1, Math.round(h * dpr));

      const sizeKey = `${w}x${h}@${dpr}`;
      if (stateRef.current.lastSizeKey === sizeKey) return;
      stateRef.current.lastSizeKey = sizeKey;

      const prevW = stateRef.current.w;
      const prevH = stateRef.current.h;
      const prevDpr = stateRef.current.cssDpr;

      canvas.width = pixelW;
      canvas.height = pixelH;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = shouldLiteMode ? "medium" : "high";

      stateRef.current.w = w;
      stateRef.current.h = h;
      stateRef.current.cssDpr = dpr;

      const sizeChangedEnough =
        !prevW ||
        !prevH ||
        Math.abs(prevW - w) > 8 ||
        Math.abs(prevH - h) > 8 ||
        Math.abs(prevDpr - dpr) > 0.2;

      if (sizeChangedEnough) {
        reseedParticles();
      }

      if (imgRef.current) {
        stateRef.current.overlayRect = buildOverlayRect(imgRef.current);
      }
    };

    const queueResize = () => {
      if (stateRef.current.resizeQueued) return;
      stateRef.current.resizeQueued = true;

      requestAnimationFrame(() => {
        stateRef.current.resizeQueued = false;
        resize();
      });
    };

    const applyOrbit = (x, y, z, tt, speed) => {
      const a = tt * speed;
      const ca = Math.cos(a);
      const sa = Math.sin(a);

      let rx = x * ca + z * sa;
      let rz = -x * sa + z * ca;

      const tilt = effectiveOrbitTilt * 0.65;
      const ct = Math.cos(tilt);
      const st = Math.sin(tilt);

      let ry = y * ct - rz * st;
      rz = y * st + rz * ct;

      const wob = effectiveOrbitWobble * 0.18 * Math.sin(tt * 0.9);
      ry += wob * 60;

      return { x: rx, y: ry, z: rz };
    };

    const getModeName = (cycleT) => {
      if (cycleT < tOrbitEnd) return "orbit";
      if (cycleT < tScatterEnd) return "scatter";
      if (cycleT < tFreeEnd) return "free";
      if (cycleT < tGatherEnd) return "gather";
      return "hold";
    };

    const render = (tms) => {
      rafId = requestAnimationFrame(render);

      const s = stateRef.current;
      const { w, h, particles, overlayRect, sphereR } = s;
      if (!w || !h) return;

      if (s.animationStartAt == null) {
        s.animationStartAt = tms;
        s.lastFrameAt = tms;
      }

      const frameDelta = tms - s.lastFrameAt;
      s.lastFrameAt = tms;

      if (frameDelta > 120) {
        s.animationStartAt += frameDelta - 16.7;
      }

      const frozenAt = s.frozenAt;
      const tmsUse = frozenAt != null ? frozenAt : tms;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      if (!particles.length || !sphereR) return;

      const elapsedSec = (tmsUse - s.animationStartAt) * 0.001;
      const cycleT = oneShot
        ? Math.min(elapsedSec, cycleSec)
        : elapsedSec % cycleSec;

      const modeName = getModeName(cycleT);
      if (s.lastMode !== modeName) {
        s.lastMode = modeName;
        if (typeof onModeChange === "function") onModeChange(modeName);
      }

      if (oneShot && elapsedSec >= tHoldEnd && !s.completedOnce) {
        s.completedOnce = true;
        s.frozenAt = tms;
        if (typeof onComplete === "function") onComplete();
      }

      // ---- 핵심: discrete mode 대신 continuous amount 사용 ----
      const scatterAmt = easeInOutCubic(ramp01(cycleT, tOrbitEnd, tScatterEnd));
      const freeAmt = easeInOutCubic(ramp01(cycleT, tScatterEnd, tFreeEnd));
      const gatherAmt = easeInOutCubic(ramp01(cycleT, tFreeEnd, tGatherEnd));
      const holdAmt = easeInOutCubic(ramp01(cycleT, tGatherEnd, tHoldEnd));

      // scatter 이후 회전이 빨라지고, gather 들어가면 다시 자연스럽게 낮아짐
      const orbitBlend = scatterAmt * (1 - gatherAmt * 0.9);
      const curOrbitSpeed = lerp(orbitSpeed, orbitSpeedScatter, orbitBlend);

      // 바깥으로 퍼지는 정도도 gather 들어가면 자연스럽게 사라짐
      const scatterPush = scatterAmt * (1 - gatherAmt);

      let overlayAlpha = 0;
      if (overlayRect && imgRef.current) {
        const revealStart = shouldLiteMode ? 0.82 : 0.72;
        const revealP = clamp((gatherAmt - revealStart) / (1 - revealStart), 0, 1);
        const revealE = easeOutCubic(revealP);
        overlayAlpha = clamp(
          lerp(0, effectiveOverlayStrength, revealE) * (1 - holdAmt) +
            Math.max(effectiveOverlayStrength, 0.92) * holdAmt,
          0,
          1
        );
      }

      // 파티클도 hold 직전에 딱 끄지 말고 연속적으로 감쇠
      const particleFadeBase = 1 - holdAmt;
      const particleFade =
        particleFadeBase *
        (gatherAmt > 0
          ? clamp(1 - overlayAlpha * 1.08, 0, 1)
          : 1);

      const cx = w / 2;
      const cy = h / 2 + centerOffsetY;

      const margin = Math.max(14, Math.min(w, h) * 0.045);
      const allowX = Math.max(1, w / 2 - margin);
      const allowY = Math.max(1, h / 2 - margin);

      const approxMaxX = sphereR * 1.55 + effectiveDriftAmp * 1.6 + 80;
      const approxMaxY = sphereR * 1.55 + effectiveDriftAmp * 1.6 + 90;
      const baseSafe = Math.min(1, allowX / approxMaxX, allowY / approxMaxY);

      ctx.globalCompositeOperation = "source-over";
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = shouldLiteMode ? "medium" : "high";

      const tt = elapsedSec;

      ctx.shadowColor = particleShadowColor;
      ctx.shadowBlur = effectiveParticleShadowBlur;

      for (let i = 0; i < particles.length; i++) {
        const d = particles[i];
        const orb = applyOrbit(d.sx, d.sy, d.sz, tt, curOrbitSpeed);

        const depth = clamp(
          0.6 + ((orb.z / sphereR + 1) / 2) * 0.95,
          0.45,
          1.6
        );

        const drift =
          effectiveDriftAmp *
          (0.8 + d.z * 0.6) *
          Math.sin(d.ph + tt * driftSpeed * d.spd);

        const drift2 =
          effectiveDriftAmp *
          0.75 *
          (0.8 + d.z * 0.6) *
          Math.cos(d.ph * 0.9 + tt * driftSpeed * d.spd);

        let sx = cx + orb.x * depth + drift;
        let sy = cy + orb.y * depth + drift2;

        const dx = sx - cx;
        const dy = sy - cy;

        const desiredPush = 1 + 0.3 * scatterPush;
        const safePush = Math.min(desiredPush, baseSafe);

        sx = cx + dx * safePush;
        sy = cy + dy * safePush;

        // gather도 branch snap 없이 항상 계산
        const gatherShift = clamp((gatherAmt - d.delay) / (1 - d.delay), 0, 1);
        const gatherMix = easeInOutCubic(gatherShift);

        const x = lerp(sx, d.tx, gatherMix);
        const y = lerp(sy, d.ty, gatherMix);

        const alpha = d.a * particleFade;
        if (alpha <= 0.002) continue;

        const rr = d.r * (0.9 + d.z * 0.28);

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
        ctx.imageSmoothingQuality = shouldLiteMode ? "medium" : "high";
        ctx.shadowColor = overlayShadowColor;
        ctx.shadowBlur = effectiveOverlayShadowBlur;
        ctx.drawImage(off, x, y, ow, oh);
        ctx.shadowBlur = 0;
        ctx.restore();
      }
    };

    resize();

    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        queueResize();
      });
      ro.observe(canvas);
    } else {
      resizeHandler = () => queueResize();
      window.addEventListener("resize", resizeHandler);
    }

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

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      if (ro) ro.disconnect();
      if (resizeHandler) window.removeEventListener("resize", resizeHandler);
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
    shouldLiteMode,
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