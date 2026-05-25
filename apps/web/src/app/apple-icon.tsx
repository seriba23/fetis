import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0A0A0A',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            fontSize: 50,
            fontWeight: 600,
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          FETIS
        </div>
        <div
          style={{
            fontSize: 12,
            marginTop: 6,
            color: 'rgba(255,255,255,0.55)',
            letterSpacing: '0.4em',
            fontWeight: 300,
          }}
        >
          MUEBLES
        </div>
      </div>
    ),
    { ...size },
  );
}
