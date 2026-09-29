import { ImageResponse } from 'next/og';

export const alt = 'LavaMesh — Private Mesh Networking';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#050505',
          padding: 72,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 640 }}>
          {/* The real mark, not an emoji. Rendering 🔥 here meant every shared
              link previewed with the platform's own emoji font — a different
              logo than the favicon and the in-app header. */}
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 22,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #1a0802 0%, #3a1405 100%)',
              border: '1px solid rgba(255,115,0,0.5)',
              boxShadow: '0 0 40px rgba(255,115,0,0.35)',
            }}
          >
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#ff7300" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
            </svg>
          </div>
          <div style={{ fontSize: 72, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.04em', lineHeight: 1 }}>
            LavaMesh
          </div>
          <div style={{ fontSize: 28, color: 'rgba(255,255,255,0.55)', lineHeight: 1.35 }}>
            Free dashboard for Headscale.
          </div>
        </div>
        <div style={{ display: 'flex', position: 'relative', width: 360, height: 360 }}>
          {[
            [180, 40],
            [300, 120],
            [280, 260],
            [80, 250],
            [50, 110],
            [180, 180],
          ].map(([x, y], i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: i === 5 ? 18 : 12,
                height: i === 5 ? 18 : 12,
                borderRadius: 999,
                background: '#ff7300',
                opacity: i === 5 ? 1 : 0.7,
                boxShadow: '0 0 16px #ff7300',
              }}
            />
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
