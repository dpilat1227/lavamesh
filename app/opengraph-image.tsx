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
              color: '#ff7300',
              fontSize: 44,
              fontWeight: 700,
            }}
          >
            🔥
          </div>
          <div style={{ fontSize: 72, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.04em', lineHeight: 1 }}>
            LavaMesh
          </div>
          <div style={{ fontSize: 28, color: 'rgba(255,255,255,0.55)', lineHeight: 1.35 }}>
            Private mesh networking. Zero per-seat fees.
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
