/**
 * HexaDynamics — StudioDialect-inspired structural layout
 * Colors preserved: #00D1A0 (accent), #0a0a0a (bg), #d2d2d2 (text)
 * Structure: Fixed hero → scrolling body → capabilities → achievements → footer
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Cpu,
  Briefcase,
  Palette,
  Instagram,
  Linkedin,
  ExternalLink,
  Trophy,
  Medal,
  Award,
  Star,
  Navigation,
  Calendar,
  ArrowUpRight,
} from 'lucide-react';

// Vite SVG Imports
import hexagonGraphic from './assets/hexagon.svg';
import hexadynamicsText from './assets/hexadynamics.svg';
import droneGraphic from './assets/drone-svg.svg';

/* ─────────────────── INTERSECTION OBSERVER REVEAL ─────────────────── */
const useReveal = (threshold = 0.15) => {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setRevealed(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, revealed };
};

/* ─────────────────── WAVE BACKGROUND (Generative Canvas) ─────────────────── */
const WaveBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Multi-layered waves (10 layers for rich texture)
    const waves = [
      { amplitude: 100, frequency: 0.005, speed: 0.02, offset: 0, opacity: 0.2 },
      { amplitude: 120, frequency: 0.003, speed: 0.015, offset: 200, opacity: 0.15 },
      { amplitude: 80, frequency: 0.007, speed: 0.025, offset: 400, opacity: 0.1 },
      { amplitude: 60, frequency: 0.009, speed: 0.03, offset: 600, opacity: 0.08 },
      { amplitude: 140, frequency: 0.002, speed: 0.01, offset: 800, opacity: 0.12 },
      { amplitude: 90, frequency: 0.004, speed: 0.018, offset: 1000, opacity: 0.1 },
      { amplitude: 110, frequency: 0.006, speed: 0.022, offset: 1200, opacity: 0.07 },
      { amplitude: 70, frequency: 0.008, speed: 0.028, offset: 1400, opacity: 0.05 },
      { amplitude: 130, frequency: 0.0025, speed: 0.012, offset: 1600, opacity: 0.09 },
      { amplitude: 85, frequency: 0.0045, speed: 0.016, offset: 1800, opacity: 0.11 },
    ];

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.5;

      waves.forEach((wave, i) => {
        ctx.beginPath();
        ctx.lineWidth = 1.5;
        
        // Use brand color #00D1A0 with varying opacity
        const gradient = ctx.createLinearGradient(0, height / 2, width, height / 2);
        gradient.addColorStop(0, `rgba(0, 209, 160, ${wave.opacity})`);
        gradient.addColorStop(0.5, `rgba(0, 209, 160, ${wave.opacity * 1.5})`);
        gradient.addColorStop(1, `rgba(0, 209, 160, ${wave.opacity})`);
        
        ctx.strokeStyle = gradient;

        for (let x = 0; x < width; x += 1) {
          const y = 
            height / 2 + 
            Math.sin(x * wave.frequency + (time * wave.speed) + wave.offset) * wave.amplitude * 
            Math.sin(time * 0.005 + i);

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1, // Be above the basic background but below text (text sections are z-index 2+)
        opacity: 0.6,
      }}
    />
  );
};

/* Text reveal wrapper — Scramble/pixelated decode animation */
const SCRAMBLE_CHARS = '▓▒░█▄▀■□▪▫▬▐▌●◆◇◈⬡⬢⏣⎔';

const ScrambleText = ({
  children,
  delay = 0,
}: {
  children: string;
  delay?: number;
}) => {
  const { ref, revealed } = useReveal(0.1);
  const [displayText, setDisplayText] = useState(children);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!revealed) return;

    const original = children;
    const duration = 800; // ms
    const startTime = performance.now() + delay * 1000;

    const scramble = (time: number) => {
      const elapsed = time - startTime;
      if (elapsed < 0) {
        frameRef.current = requestAnimationFrame(scramble);
        return;
      }

      const progress = Math.min(elapsed / duration, 1);
      const revealedCount = Math.floor(progress * original.length);

      let result = '';
      for (let i = 0; i < original.length; i++) {
        if (original[i] === ' ') {
          result += ' ';
        } else if (i < revealedCount) {
          result += original[i];
        } else {
          result += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }
      }
      setDisplayText(result);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(scramble);
      } else {
        setDisplayText(original);
      }
    };

    frameRef.current = requestAnimationFrame(scramble);
    return () => cancelAnimationFrame(frameRef.current);
  }, [revealed, children, delay]);

  return (
    <div
      ref={ref}
      className={`text-reveal ${revealed ? 'revealed' : ''}`}
      style={{ '--reveal-delay': `${delay}s`, marginTop: '5vw', maxWidth: '95%', color: '#d2d2d2', fontSize: '1.8vw', fontWeight: 500, lineHeight: '150%', letterSpacing: '-0.04vw', wordBreak: 'break-word' } as React.CSSProperties}
    >
      <div className="line" style={{ animationDelay: `${delay}s` }}>
        {displayText}
      </div>
    </div>
  );
};

/* Original TextReveal for non-string children */
const TextReveal = ({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  key?: React.Key;
}) => {
  const { ref, revealed } = useReveal(0.1);
  return (
    <div
      ref={ref}
      className={`text-reveal ${revealed ? 'revealed' : ''} ${className}`}
      style={{ '--reveal-delay': `${delay}s` } as React.CSSProperties}
    >
      <div className="line" style={{ animationDelay: `${delay}s` }}>
        {children}
      </div>
    </div>
  );
};

/* Element reveal wrapper */
const ElementReveal = ({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  key?: React.Key;
}) => {
  const { ref, revealed } = useReveal(0.1);
  return (
    <div ref={ref} className={`element-reveal ${revealed ? 'revealed' : ''} ${className}`}>
      <div className="element-reveal-item" style={{ animationDelay: `${delay}s` }}>
        {children}
      </div>
    </div>
  );
};

/* ─────────────────── NAVBAR ─────────────────── */
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: scrolled ? '0.6vw 2.5vw' : '1vw 2.5vw',
        background: scrolled ? 'rgba(10,10,10,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Logo */}
      <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.8vw', textDecoration: 'none' }}>
        <img
          src={hexagonGraphic}
          alt="Hexagon Logo"
          style={{ width: '2vw', height: '2vw', objectFit: 'contain' }}
        />
        <img
          src={hexadynamicsText}
          alt="Hexadynamics Logo Text"
          style={{ height: '1.4vw', objectFit: 'contain', marginTop: '0.1vw' }}
        />
      </a>

      {/* Nav Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2vw' }}>
        {['Home', 'About', 'Domains', 'Achievements'].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            className="UI_1"
            style={{
              color: 'rgba(210,210,210,0.5)',
              transition: 'color 0.2s ease',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#00D1A0')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(210,210,210,0.5)')}
          >
            {item}
          </a>
        ))}
        <a
          href="https://hexadynamics.vercel.app/Forms"
          target="_blank"
          rel="noreferrer"
          className="UI_1"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4vw',
            padding: '0.4vw 1.2vw',
            background: '#00D1A0',
            color: '#0a0a0a',
            fontWeight: 700,
            borderRadius: '2px',
            textDecoration: 'none',
            transition: 'opacity 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          [ REGISTER ] <ArrowUpRight size={12} />
        </a>
      </div>
    </nav>
  );
};

/* ─────────────────── 3D TORNADO PHOTO SPIRAL ─────────────────── */
// Replace these with your actual project photos later
const SPIRAL_IMAGES: string[] = [
  '/spiral-photos/WhatsApp Unknown 2026-03-07 at 10.30.20/WhatsApp Image 2026-03-07 at 10.22.19.jpeg',
  '/spiral-photos/WhatsApp Unknown 2026-03-07 at 10.30.20/WhatsApp Image 2026-03-07 at 10.22.20.jpeg',
  '/spiral-photos/WhatsApp Unknown 2026-03-07 at 10.30.20/WhatsApp Image 2026-03-07 at 10.22.21.jpeg',
  '/spiral-photos/WhatsApp Unknown 2026-03-07 at 10.30.20/WhatsApp Image 2026-03-07 at 10.22.22.jpeg',
  '/spiral-photos/WhatsApp Unknown 2026-03-07 at 10.30.20/WhatsApp Image 2026-03-07 at 10.22.23.jpeg',
  '/spiral-photos/WhatsApp Unknown 2026-03-07 at 10.30.20/WhatsApp Image 2026-03-07 at 10.22.24.jpeg',
  '/spiral-photos/WhatsApp Unknown 2026-03-07 at 10.30.20/WhatsApp Image 2026-03-07 at 10.22.25.jpeg',
  '/spiral-photos/WhatsApp Unknown 2026-03-07 at 10.31.02/WhatsApp Image 2026-03-07 at 10.23.26.jpeg',
  '/spiral-photos/WhatsApp Unknown 2026-03-07 at 10.31.02/WhatsApp Image 2026-03-07 at 10.23.27 (1).jpeg',
  '/spiral-photos/WhatsApp Unknown 2026-03-07 at 10.31.02/WhatsApp Image 2026-03-07 at 10.23.27.jpeg',
  '/spiral-photos/WhatsApp Unknown 2026-03-07 at 10.31.02/WhatsApp Image 2026-03-07 at 10.23.28.jpeg',
  '/spiral-photos/WhatsApp Unknown 2026-03-07 at 10.31.02/WhatsApp Image 2026-03-07 at 10.23.29 (1).jpeg',
  '/spiral-photos/WhatsApp Unknown 2026-03-07 at 10.31.02/WhatsApp Image 2026-03-07 at 10.23.29 (2).jpeg',
  '/spiral-photos/WhatsApp Unknown 2026-03-07 at 10.31.02/WhatsApp Image 2026-03-07 at 10.23.29.jpeg',
  '/spiral-photos/WhatsApp Unknown 2026-03-07 at 10.31.02/WhatsApp Image 2026-03-07 at 10.23.30 (1).jpeg',
  '/spiral-photos/WhatsApp Unknown 2026-03-07 at 10.31.02/WhatsApp Image 2026-03-07 at 10.23.30 (2).jpeg',
  '/spiral-photos/WhatsApp Unknown 2026-03-07 at 10.31.02/WhatsApp Image 2026-03-07 at 10.23.30.jpeg',
];

/**
 * Tornado spiral — row-based rings like StudioDialect.
 * Each row is a full ring of cards packed edge-to-edge (no horizontal gaps).
 * Rows have small vertical gaps between them.
 * Radius shrinks per row → tornado cone.
 * Scroll drives Y-rotation.
 */
const PhotoSpiral = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rotY = useRef(0);
  const rotX = useRef(0);
  const targetRotY = useRef(0);
  const targetRotX = useRef(0);
  const animId = useRef<number>(0);
  const spiralContainerRef = useRef<HTMLDivElement>(null);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Card dimensions
  const cardW = isMobile ? 70 : 140;
  const cardH = isMobile ? 90 : 175;

  // Row definitions: each row has its own radius (tornado cone)
  // Rows go from top (widest) to bottom (narrowest)
  const rowRadii = isMobile
    ? [170, 145, 115, 85]
    : [380, 320, 250, 180];

  const numRows = rowRadii.length;
  // Gap between rows
  const rowGap = isMobile ? 8 : 14;
  // Total height of all rows
  const totalHeight = numRows * cardH + (numRows - 1) * rowGap;
  const containerH = totalHeight + 120;

  // Twist offset per row — each row starts at a slightly different angle
  const rowTwist = 12; // degrees offset per row for spiral effect

  // Build all cards: each row is a helical ring (screw thread incline)
  const cards: { src: string; angle: number; yOffset: number; radius: number; rowIdx: number; colIdx: number }[] = [];
  let imgIndex = 0;

  // helixRise: vertical climb per full revolution (connects one row to the next)
  const helixRise = cardH + rowGap;

  for (let row = 0; row < numRows; row++) {
    const r = rowRadii[row];
    const angleDelta = (cardW / r) * (180 / Math.PI);
    const cardsInRow = Math.floor(360 / angleDelta);
    const actualAngle = 360 / cardsInRow;

    // Base vertical position for this row
    const baseY = row * (cardH + rowGap) - (totalHeight - cardH) / 2;

    for (let col = 0; col < cardsInRow; col++) {
      const angle = col * actualAngle + row * rowTwist;
      // Helical incline: each card rises slightly based on its position around the ring
      const helixOffset = (col / cardsInRow) * helixRise;
      const yOffset = baseY - helixOffset; // negative = upward
      const src = SPIRAL_IMAGES[imgIndex % SPIRAL_IMAGES.length];
      cards.push({ src, angle, yOffset, radius: r, rowIdx: row, colIdx: col });
      imgIndex++;
    }
  }

  // Scroll-based rotation AND vertical rise
  const translateYRef = useRef(600); // start below
  const targetTranslateY = useRef(600);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      // Rotation: spin as user scrolls
      targetRotY.current = scrollY * 0.45;
      targetRotX.current = -8;

      // Vertical rise: tornado starts at bottom, rises up as user scrolls
      // At scrollY=0 → translateY = +600 (below center, sitting at bottom)
      // As scrollY increases → translateY goes negative (tornado rises)
      // Total travel: from +600 to about -800 over the hero scroll zone
      const heroScrollRange = window.innerHeight * 1.8; // roughly 180vh of scroll
      const progress = Math.min(scrollY / heroScrollRange, 1);
      targetTranslateY.current = 600 - progress * 1400; // 600 → -800
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Animation loop
  useEffect(() => {
    const ease = 0.035;
    const tick = () => {
      rotY.current += (targetRotY.current - rotY.current) * ease;
      rotX.current += (targetRotX.current - rotX.current) * ease;
      translateYRef.current += (targetTranslateY.current - translateYRef.current) * ease;
      
      if (spiralContainerRef.current) {
        spiralContainerRef.current.style.transform = `translateY(${translateYRef.current}px) rotateX(${rotX.current}deg) rotateY(${rotY.current}deg)`;
      }
      
      animId.current = requestAnimationFrame(tick);
    };
    animId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId.current);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: `${containerH}px`,
        perspective: '1100px',
        perspectiveOrigin: '50% 50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',
      }}
    >
      <div
        ref={spiralContainerRef}
        style={{
          position: 'relative',
          width: 0,
          height: 0,
          transformStyle: 'preserve-3d',
          transform: `translateY(${translateYRef.current}px) rotateX(${rotX.current}deg) rotateY(${rotY.current}deg)`,
          willChange: 'transform',
        }}
      >
        {cards.map(({ src, angle, yOffset, radius, rowIdx, colIdx }, i) => (
          <div
            key={`${rowIdx}-${colIdx}`}
            style={{
              position: 'absolute',
              width: `${cardW}px`,
              height: `${cardH}px`,
              left: `${-cardW / 2}px`,
              top: `${-cardH / 2}px`,
              transform: `rotateY(${angle}deg) translateZ(${radius}px) translateY(${yOffset}px)`,
              backfaceVisibility: 'hidden',
            }}
          >
            <div
              className="spiral-card"
              style={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                borderRadius: '4px',
                border: '1px solid rgba(210,210,210,0.04)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
                cursor: 'pointer',
              }}
            >
              <img
                src={src}
                alt={`Project ${i + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'grayscale(20%) brightness(0.85)',
                  display: 'block',
                }}
                draggable={false}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(10,10,10,0.4) 0%, transparent 50%)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const HeroSection = () => {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Calculate percentage relative to window
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    setMousePos({ x, y });
  };

  return (
  <>
    {/* Fixed hero behind everything */}
    <div 
      className="hero-fixed" 
      onMouseMove={handleMouseMove}
      style={{ overflow: 'hidden' }}
    >
      <WaveBackground />
      {/* Interactive Ambient Gradient */}
      <div
        style={{
          position: 'absolute',
          inset: '-20%',
          background: `
            radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(0, 209, 160, 0.15) 0%, transparent 40%),
            radial-gradient(circle at ${100 - mousePos.x}% ${100 - mousePos.y}%, rgba(0, 150, 140, 0.1) 0%, transparent 50%)
          `,
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0,
          transition: 'background 0.3s ease-out',
        }}
      />

      {/* Cross markers (Dialect pattern) */}
      <div style={{ position: 'absolute', top: '1.25vw', left: '1.25vw' }}><div className="cross-icon" /></div>
      <div style={{ position: 'absolute', top: '1.25vw', right: '1.25vw' }}><div className="cross-icon" /></div>

      {/* Centered giant title — positioned at top */}
      <div
        style={{
          position: 'absolute',
          top: '12%',
          left: 0,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.2vw',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      >
        {/* SVGs in Hero */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2vw', zIndex: 1 }}>
          <img
            src={hexagonGraphic}
            alt="Hexagon Graphic"
            style={{
              width: '18vw',
              marginBottom: '1vw',
              animation: 'pop-in 0.5s 2s ease both',
            }}
          />
          <img
            src={hexadynamicsText}
            alt="Hexadynamics Text Logo"
            style={{
              width: '50vw',
              animation: 'pop-in 0.5s 2.2s ease both',
            }}
          />
        </div>

        {/* Subtitle */}
        <div className="hero__subtitle">
          An interactive production studio for aerial innovation, spanning drone racing, engineering, and technology.
        </div>
      </div>

      {/* 3D Photo Spiral — positioned to fill hero */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
        }}
      >
        <PhotoSpiral />
      </div>

      {/* Bottom cross markers */}
      <div style={{ position: 'absolute', bottom: '1.25vw', left: '1.25vw' }}><div className="cross-icon" /></div>
      <div style={{ position: 'absolute', bottom: '1.25vw', right: '1.25vw' }}><div className="cross-icon" /></div>
    </div>

    {/* Scroll container to enable parallax */}
    <div className="hero-scroll-container" id="home" />
  </>
  );
};

/* ─────────────────── BODY INTRO (Light-on-dark, Dialect-style) ─────────────────── */
const BodyIntro = () => (
  <div className="body-section" id="about">
    {/* Giant heading */}
    <TextReveal>
      <h1
        style={{
          color: '#d2d2d2',
          marginBottom: '1.5vw',
          marginLeft: '-0.4vw',
        }}
      >
        PIONEERING
        <br />
        AERIAL{' '}
        <span style={{ color: '#00D1A0' }}>INNOVATION</span>
      </h1>
    </TextReveal>

    {/* Main content split: text left + media right */}
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '-1vw',
        marginBottom: '-1vw',
      }}
    >
      {/* Left callout */}
      <div style={{ width: '25vw' }}>
        <ElementReveal delay={0.2}>
          <p className="body-text" style={{ marginBottom: '1.5vw', color: '#d2d2d2' }}>
            Hexadynamics is your go-to drone club at SRM. We specialize in
            building FPV drones and undertake exciting projects related to
            drone technology.
          </p>
          <p className="body-text" style={{ marginBottom: '2vw', color: 'rgba(210,210,210,0.8)' }}>
            With a strong focus on drone racing, we're proud winners of
            multiple races across India. Through workshops, competitions, and
            collaborative projects, we empower our members with the skills
            needed to excel.
          </p>
          <a
            href="https://hexadynamics.vercel.app/Forms"
            target="_blank"
            rel="noreferrer"
            className="arrow-link"
            style={{ color: '#00D1A0' }}
          >
            <span className="arrow-link__label">Join the Squad</span>
            <span className="arrow-link__arrow" style={{ background: '#00D1A0', borderRadius: '4px' }} />
          </a>
        </ElementReveal>
      </div>

      {/* Right media */}
      <ElementReveal delay={0.3}>
        <div
          style={{
            position: 'relative',
            width: '46.875vw',
            height: '26.37vw',
            overflow: 'hidden',
          }}
        >
          <video
            src="/media/robofest.mp4"
            autoPlay
            loop
            muted
            playsInline
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '180%',
              height: '180%',
              objectFit: 'cover',
              opacity: 0.85,
              transform: 'translate(-50%, -50%) rotate(-90deg)',
              transition: 'opacity 0.7s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.85';
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(10,10,10,0.3) 0%, transparent 20%)',
              pointerEvents: 'none',
            }}
          />
        </div>
      </ElementReveal>
    </div>

    {/* Full-width statement text (Dialect pattern) */}
    <ScrambleText delay={0.1}>
      {"Everything we build is driven by a passion for flight and a hunger for pushing what's possible. From carbon fiber frames to AI-powered autonomous systems — we engineer the future of aerial technology."}
    </ScrambleText>
  </div>
);

/* ─────────────────── CAPABILITIES (Dialect-style list) ─────────────────── */
const domains = [
  { 
    title: 'Drone Engineering', 
    tag: '01', 
    description: 'We design and build custom-engineered FPV drones from the ground up. Our focus lies in structural optimization using high-grade carbon fiber, precision-tuned power systems for maximum agility, and custom-tailored flight controllers for extreme performance in racing and specialized missions.' 
  },
  { 
    title: 'Autonomous Systems', 
    tag: '02', 
    description: 'Pioneering the next generation of flight through AI and automation. We develop vision-based obstacle avoidance systems, GPS-guided waypoint navigation, and autonomous landing protocols using Raspberry Pi, Pixhawk, and custom-trained neural networks for intelligent aerial operation.' 
  },
  { 
    title: 'Racing & Competition', 
    tag: '03', 
    description: 'Competing at the highest levels of national drone racing. Our squad trains for pinpoint accuracy and lightning-fast reflexes, participating in IDRL and international leagues. We specialize in high-speed maneuvers, gate coordination, and low-latency digital FPV setups.' 
  },
  { 
    title: 'Workshop & Training', 
    tag: '04', 
    description: 'Nurturing the future of drone tech through interactive learning. From beginner soldering sessions to advanced PID tuning workshops, we provide hands-on training that covers the entire drone lifecycle—CAD design, assembly, and expert piloting skills.' 
  },
  { 
    title: 'Corporate & Sponsorship', 
    tag: '05', 
    description: 'Bridging technical expertise with professional logistics. We handle strategic networking, secure funding for major projects, and manage event logistics. Our domain connects the technical team with industry partners for collaborative innovation.' 
  },
  { 
    title: 'Creative & Media', 
    tag: '06', 
    description: 'Capturing the world from new perspectives. We specialize in cinematic FPV videography, high-speed chase shots, and unique aerial perspectives for commercial and creative projects, pushing the limits of storytelling through experimental camera mounts.' 
  },
];

const CapabilitiesSection = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(0);

  return (
    <div className="body-section" id="domains" style={{ borderTop: '1px solid rgba(210,210,210,0.08)' }}>
      <TextReveal>
        <h1
          style={{
            color: '#d2d2d2',
            marginBottom: '0.5vw',
            marginLeft: '-0.4vw',
          }}
        >
          WHAT WE <span style={{ color: '#00D1A0' }}>DO</span>
        </h1>
      </TextReveal>

      <div className="capabilities" style={{ position: 'relative', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>

        {/* Left Side: Drone Graphic + Hovered Content Card */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '1vw' }}>
          
          {/* Detailed Description Card (Glassmorphism) */}
          <div 
            style={{ 
              height: '14vw', 
              width: '28vw', 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-start',
              textAlign: 'left',
              marginBottom: '2vw',
              padding: '2vw',
              background: 'rgba(210, 210, 210, 0.03)',
              backdropFilter: 'blur(10px)',
              borderRadius: '8px',
              border: '1px solid rgba(210, 210, 210, 0.08)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              transition: 'opacity 0.5s ease, transform 0.5s ease, border-color 0.5s ease',
              opacity: hoveredIndex !== null ? 1 : 0,
              transform: hoveredIndex !== null ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.98)',
              borderTopColor: hoveredIndex !== null ? '#00D1A0' : 'rgba(210, 210, 210, 0.08)',
              borderTopWidth: '2px',
            }}
          >
            {hoveredIndex !== null && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '1vw' }}>
                  <div className="UI_1" style={{ color: '#00D1A0', fontSize: '0.8vw' }}>
                    [ {domains[hoveredIndex].tag} ]
                  </div>
                  <div className="UI_1" style={{ color: 'rgba(210,210,210,0.3)', fontSize: '0.7vw' }}>
                    DETAILED OVERVIEW
                  </div>
                </div>
                <h3 style={{ fontSize: '1.4vw', marginBottom: '1vw', color: '#d2d2d2', letterSpacing: '-0.02em' }}>
                  {domains[hoveredIndex].title}
                </h3>
                <p 
                  className="body-text" 
                  style={{ 
                    fontSize: '0.9vw', 
                    lineHeight: '160%', 
                    color: 'rgba(210,210,210,0.6)', 
                    margin: 0,
                    fontWeight: 400
                  }}
                >
                  {domains[hoveredIndex].description}
                </p>
              </>
            )}
          </div>

          <div style={{ position: 'relative', width: '35vw', height: '35vw', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img
              src={droneGraphic}
              alt="Drone Graphic"
              style={{
                width: '100%',
                opacity: 0.6,
                filter: 'brightness(1.5) drop-shadow(0 0 15px rgba(0,209,160,0.5))',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div className="capabilities__list" style={{ position: 'relative', zIndex: 1 }}>
            {domains.map((d, i) => (
              <ElementReveal key={d.title} delay={i * 0.08}>
                <div
                  className="capability-item"
                  style={{
                    cursor: 'pointer',
                    transition: 'color 0.3s ease',
                    color: hoveredIndex === i ? '#00D1A0' : '#d2d2d2',
                  }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(i)} // Keep the last hovered or reset? User said "when i hover", let's keep it on the last one or reset to first.
                >
                  <div className="label" style={i === 0 ? { borderTop: '1px solid rgba(210,210,210,0.12)' } : {}}>
                    {d.title}
                  </div>
                  <div className="number" style={i === 0 ? { borderTop: '1px solid rgba(210,210,210,0.12)' } : {}}>
                    [ {d.tag} ]
                  </div>
                </div>
              </ElementReveal>
            ))}

            {/* Arrow link at bottom */}
            <ElementReveal delay={0.6}>
              <a
                href="https://hexadynamics.vercel.app/Forms"
                target="_blank"
                rel="noreferrer"
                className="arrow-link"
                style={{ marginTop: '3vw', color: '#00D1A0' }}
              >
                <span className="arrow-link__label">Explore Our Work</span>
                <span className="arrow-link__arrow" style={{ background: '#00D1A0', borderRadius: '4px' }} />
              </a>
            </ElementReveal>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────── MARQUEE ─────────────────── */
const MarqueeStrip = () => {
  const items = [
    'FPV DRONES',
    'RACING',
    'AERIAL INNOVATION',
    'DRONE DESIGN',
    'AUTONOMOUS FLIGHT',
    'COMPUTER VISION',
    'CARBON FIBER',
    'COMPETITIONS',
  ];
  const repeated = [...items, ...items, ...items, ...items];

  return (
    <div className="logo-rail" style={{ zIndex: 2, position: 'relative' }}>
      <div className="marquee-track" style={{ height: '100%', alignItems: 'center' }}>
        {repeated.map((text, i) => (
          <span
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.8vw',
              whiteSpace: 'nowrap',
              color: 'rgba(210,210,210,0.25)',
              fontWeight: 800,
              textTransform: 'uppercase' as const,
              letterSpacing: '-0.04em',
              fontSize: 'clamp(12px, 1.25vw, 24px)',
              marginRight: '2vw',
              fontFamily: 'var(--font-sans)',
            }}
          >
            <span style={{ color: 'rgba(0,209,160,0.4)', fontSize: '0.5em' }}>●</span>
            {text}
          </span>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────── STATS ROW (Between sections) ─────────────────── */
const StatsRow = () => (
  <div
    className="body-section"
    style={{
      borderTop: '1px solid rgba(210,210,210,0.08)',
      paddingTop: '3vw',
      paddingBottom: '3vw',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      {[
        { num: '15+', label: 'ACTIVE PROJECTS' },
        { num: '20', label: 'CORE MEMBERS' },
        { num: '6+', label: 'NATIONAL WINS' },
        { num: '3', label: 'DOMAINS' },
      ].map((s, i) => (
        <ElementReveal key={i} delay={i * 0.1}>
          <div>
            <div
              style={{
                color: '#00D1A0',
                fontWeight: 800,
                letterSpacing: '-0.04em',
                fontSize: 'clamp(36px, 4.5vw, 96px)',
                fontFamily: 'var(--font-sans)',
                lineHeight: 1,
              }}
            >
              {s.num}
            </div>
            <div
              className="UI_1"
              style={{
                color: 'rgba(210,210,210,0.55)',
                marginTop: '0.5vw',
              }}
            >
              {s.label}
            </div>
          </div>
        </ElementReveal>
      ))}
    </div>
  </div>
);

/* ─────────────────── ACHIEVEMENTS ─────────────────── */
const achievements = [
  {
    date: 'AUG 2025', rank: '1ST PLACE', title: 'Mechnovate Drone Design',
    event: 'VIT Vellore', icon: Trophy,
    description: 'Developed a custom carbon fiber drone frame from scratch. Optimized using FEA analysis for minimal deformation and high strength-to-weight ratio.',
  },
  {
    date: 'JAN 2025', rank: '2ND PLACE', title: 'Shaastra Aerial Robotic',
    event: 'IIT Madras', icon: Medal,
    description: 'Engineered an indoor autonomous drone capable of precise package delivery using computer vision algorithms and custom payload mechanisms.',
  },
  {
    date: 'DEC 2024', rank: '1ST PLACE', title: 'Cargo Drone Racing',
    event: 'MVJ Bangalore', icon: Award,
    description: 'Tested drone stability under heavy weight loading and agility. Flawless performance in high-stress cargo transport scenarios.',
  },
  {
    date: 'OCT 2024', rank: '1ST PLACE', title: 'TechnoVIT Drone Racing',
    event: 'VIT Chennai', icon: Star,
    description: 'Secured victory with a massive 30-second lead over 10+ skilled participants from across India in an intense two-round competition.',
  },
  {
    date: 'MAY 2024', rank: '3RD PLACE', title: "NeutronFest'24",
    event: 'Rishihood University', icon: Trophy,
    description: 'Showcased exceptional dedication and skill in an exhilarating drone racing competition, pushing the limits of aerial agility.',
  },
  {
    date: 'OCT 2024', rank: 'WORKSHOP', title: 'DroneXperience',
    event: 'SRMIST x AeroKnotz', icon: Navigation,
    description: 'Collaborative two-day immersive workshop covering drone fundamentals, building, and team-based racing challenges.',
  },
];

const AchievementsSection = () => (
  <div
    className="body-section"
    id="achievements"
    style={{ borderTop: '1px solid rgba(210,210,210,0.08)' }}
  >
    <TextReveal>
      <h1 style={{ color: '#d2d2d2', marginBottom: '0.5vw', marginLeft: '-0.4vw' }}>
        HALL OF <span style={{ color: '#00D1A0' }}>FAME</span>
      </h1>
    </TextReveal>

    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4vw', marginTop: '1.5vw' }}>
      <ElementReveal>
        <h4 style={{ color: 'rgba(210,210,210,0.7)' }}>ACHIEVEMENTS</h4>
      </ElementReveal>
      <ElementReveal delay={0.1}>
        <p className="body-text" style={{ maxWidth: '22vw', color: 'rgba(210,210,210,0.7)' }}>
          Pushing the boundaries of aerial agility and technical excellence across national stages.
        </p>
      </ElementReveal>
    </div>

    {/* Achievement rows (Dialect project-item style) */}
    <div style={{ borderTop: '1px solid rgba(210,210,210,0.1)' }}>
      {achievements.map((a, i) => (
        <ElementReveal key={a.title} delay={i * 0.06}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              padding: '2.5vw 0',
              borderBottom: '1px solid rgba(210,210,210,0.08)',
              transition: 'background 0.3s ease',
              cursor: 'default',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(210,210,210,0.02)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            {/* Left: Icon + Date */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5vw', width: '14vw', flexShrink: 0 }}>
              <div
                style={{
                  width: '2vw',
                  height: '2vw',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0,209,160,0.1)',
                  color: '#00D1A0',
                  borderRadius: '2px',
                  flexShrink: 0,
                }}
              >
                <a.icon size={14} />
              </div>
              <div>
                <div className="UI_1" style={{ color: '#00D1A0', marginBottom: '0.3vw' }}>{a.rank}</div>
                <div className="UI_1" style={{ color: 'rgba(210,210,210,0.55)' }}>
                  <Calendar size={9} style={{ display: 'inline', marginRight: '0.3vw', verticalAlign: 'middle' }} />
                  {a.date}
                </div>
              </div>
            </div>

            {/* Center: Title + Event */}
            <div style={{ flexGrow: 1, paddingLeft: '2vw' }}>
              <h4 style={{ color: '#d2d2d2', marginBottom: '0.3vw', letterSpacing: '-0.03em' }}>{a.title}</h4>
              <div className="UI_1" style={{ color: 'rgba(210,210,210,0.5)' }}>{a.event}</div>
            </div>

            {/* Right: Description */}
            <div className="body-text" style={{ maxWidth: '22vw', color: 'rgba(210,210,210,0.65)', flexShrink: 0 }}>
              {a.description}
            </div>
          </div>
        </ElementReveal>
      ))}
    </div>
  </div>
);

/* ─────────────────── FOOTER (Dialect-style) ─────────────────── */
const Footer = () => (
  <footer className="footer-section" style={{ zIndex: 2, position: 'relative', background: '#0a0a0a' }}>
    {/* Giant CTA heading */}
    <div style={{ padding: '5.2vw 2.5vw 3vw' }}>
      <TextReveal>
        <h2 style={{ color: '#d2d2d2', marginBottom: '1vw' }}>
          READY TO <span style={{ color: '#00D1A0' }}>FLY?</span>
        </h2>
      </TextReveal>
      <ElementReveal delay={0.1}>
        <h4 style={{ color: 'rgba(210,210,210,0.5)', marginBottom: '4vw' }}>
          JOIN SRM'S PREMIER DRONE CLUB
        </h4>
      </ElementReveal>
    </div>

    {/* Footer content grid */}
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        padding: '0 2.5vw 4vw',
        gap: '8vw',
      }}
    >
      {/* Column 1: Brand */}
      <div style={{ maxWidth: '14.7917vw' }}>
        <h5 style={{ color: 'rgba(210,210,210,0.4)', marginBottom: '1.2vw' }}>FIND US</h5>
        <div className="body-text" style={{ color: 'rgba(210,210,210,0.5)' }}>
          <p style={{ margin: 0 }}>SRM Institute of Science</p>
          <p style={{ margin: 0 }}>and Technology</p>
          <p style={{ margin: '0.5vw 0 0' }}>Kattankulathur, Chennai</p>
        </div>
      </div>

      {/* Column 2: Navigation */}
      <div>
        <h5 style={{ color: 'rgba(210,210,210,0.4)', marginBottom: '1.2vw' }}>INTERNAL</h5>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8333vw' }}>
          {['Home', 'About', 'Domains', 'Achievements'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="UI_1"
              style={{ color: 'rgba(210,210,210,0.4)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#00D1A0')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(210,210,210,0.4)')}
            >
              {item}
            </a>
          ))}
        </div>
      </div>

      {/* Column 3: External */}
      <div>
        <h5 style={{ color: 'rgba(210,210,210,0.4)', marginBottom: '1.2vw' }}>EXTERNAL</h5>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8333vw' }}>
          <a
            href="https://www.instagram.com/hexadynamics.srmist?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
            target="_blank"
            rel="noreferrer"
            className="UI_1"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4vw', color: 'rgba(210,210,210,0.4)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#00D1A0')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(210,210,210,0.4)')}
          >
            <Instagram size={14} /> Instagram
          </a>
          <a
            href="https://www.linkedin.com/company/hexadynamics/?originalSubdomain=in"
            target="_blank"
            rel="noreferrer"
            className="UI_1"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4vw', color: 'rgba(210,210,210,0.4)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#00D1A0')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(210,210,210,0.4)')}
          >
            <Linkedin size={14} /> LinkedIn
          </a>
          <a
            href="mailto:hexadynamics.srmist@gmail.com"
            className="UI_1"
            style={{ color: 'rgba(210,210,210,0.4)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#00D1A0')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(210,210,210,0.4)')}
          >
            hexadynamics.srmist@gmail.com
          </a>
        </div>
      </div>
    </div>

    {/* Bottom bar (Dialect pattern) */}
    <div className="footer-bottom-bar">
      <div className="UI_1" style={{ color: 'rgba(210,210,210,0.2)' }}>
        © 2025 HEXADYNAMICS. ALL RIGHTS RESERVED.
      </div>
      <div style={{ display: 'flex', gap: '2vw' }}>
        {['Privacy Policy', 'Terms of Service'].map((item) => (
          <a
            key={item}
            href="#"
            className="UI_1"
            style={{ color: 'rgba(210,210,210,0.15)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#00D1A0')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(210,210,210,0.15)')}
          >
            {item}
          </a>
        ))}
      </div>
    </div>
  </footer>
);

/* ─────────────────── DRONE CURSOR ─────────────────── */
const DroneCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });
  const velocity = useRef({ x: 0, y: 0 });
  const animId = useRef<number>(0);

  useEffect(() => {
    // Hide on mobile/touch devices
    if ('ontouchstart' in window) return;

    const onMouseMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
    };

    const tick = () => {
      const ease = 0.4;
      const prevX = pos.current.x;
      const prevY = pos.current.y;

      pos.current.x += (target.current.x - pos.current.x) * ease;
      pos.current.y += (target.current.y - pos.current.y) * ease;

      // Velocity for tilt effect
      velocity.current.x = pos.current.x - prevX;
      velocity.current.y = pos.current.y - prevY;

      if (cursorRef.current) {
        const tiltX = Math.max(-25, Math.min(25, velocity.current.x * 3)); // Bank left/right
        const tiltY = Math.max(-15, Math.min(15, velocity.current.y * 2)); // Pitch forward/back
        cursorRef.current.style.transform = `translate(${pos.current.x - 20}px, ${pos.current.y - 20}px) rotateY(${tiltX}deg) rotateX(${-tiltY}deg)`;
      }

      animId.current = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMouseMove);
    animId.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animId.current);
    };
  }, []);

  // Don't render on touch devices
  if (typeof window !== 'undefined' && 'ontouchstart' in window) return null;

  return (
    <div
      ref={cursorRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '40px',
        height: '40px',
        pointerEvents: 'none',
        zIndex: 99999,
        perspective: '200px',
        willChange: 'transform',
      }}
    >
      <svg
        viewBox="0 0 100 100"
        width="40"
        height="40"
        style={{ filter: 'drop-shadow(0 4px 12px rgba(0,209,160,0.4))' }}
      >
        {/* Drone body */}
        <rect x="38" y="38" width="24" height="24" rx="4" fill="#0a0a0a" stroke="#00D1A0" strokeWidth="2" />
        {/* Center dot */}
        <circle cx="50" cy="50" r="4" fill="#00D1A0" />

        {/* Arms */}
        <line x1="38" y1="38" x2="22" y2="22" stroke="#00D1A0" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="62" y1="38" x2="78" y2="22" stroke="#00D1A0" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="38" y1="62" x2="22" y2="78" stroke="#00D1A0" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="62" y1="62" x2="78" y2="78" stroke="#00D1A0" strokeWidth="2.5" strokeLinecap="round" />

        {/* Propellers — spinning */}
        <g className="drone-prop" style={{ transformOrigin: '22px 22px' }}>
          <ellipse cx="22" cy="22" rx="14" ry="4" fill="rgba(0,209,160,0.5)" />
          <ellipse cx="22" cy="22" rx="4" ry="14" fill="rgba(0,209,160,0.5)" />
        </g>
        <g className="drone-prop" style={{ transformOrigin: '78px 22px' }}>
          <ellipse cx="78" cy="22" rx="14" ry="4" fill="rgba(0,209,160,0.5)" />
          <ellipse cx="78" cy="22" rx="4" ry="14" fill="rgba(0,209,160,0.5)" />
        </g>
        <g className="drone-prop" style={{ transformOrigin: '22px 78px' }}>
          <ellipse cx="22" cy="78" rx="14" ry="4" fill="rgba(0,209,160,0.5)" />
          <ellipse cx="22" cy="78" rx="4" ry="14" fill="rgba(0,209,160,0.5)" />
        </g>
        <g className="drone-prop" style={{ transformOrigin: '78px 78px' }}>
          <ellipse cx="78" cy="78" rx="14" ry="4" fill="rgba(0,209,160,0.5)" />
          <ellipse cx="78" cy="78" rx="4" ry="14" fill="rgba(0,209,160,0.5)" />
        </g>

        {/* Motor hubs */}
        <circle cx="22" cy="22" r="3" fill="#00D1A0" />
        <circle cx="78" cy="22" r="3" fill="#00D1A0" />
        <circle cx="22" cy="78" r="3" fill="#00D1A0" />
        <circle cx="78" cy="78" r="3" fill="#00D1A0" />
      </svg>
    </div>
  );
};

/* ─────────────────── APP ─────────────────── */
export default function App() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#d2d2d2', fontFamily: 'var(--font-sans)', cursor: 'none' }}>
      <DroneCursor />
      <Navbar />
      <HeroSection />
      <MarqueeStrip />
      <BodyIntro />
      <MarqueeStrip />
      <StatsRow />
      <CapabilitiesSection />
      <AchievementsSection />
      <Footer />
    </div>
  );
}
