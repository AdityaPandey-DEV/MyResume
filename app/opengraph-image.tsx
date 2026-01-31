import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Aditya Pandey | Full Stack Developer'
export const size = {
    width: 1200,
    height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 128,
                    background: 'white',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Inter, sans-serif',
                }}
            >
                <div
                    style={{
                        backgroundImage: 'linear-gradient(90deg, #00C9FF 0%, #92FE9D 100%)',
                        backgroundClip: 'text',
                        color: 'transparent',
                        fontWeight: 800,
                        marginBottom: 40,
                    }}
                >
                    Aditya Pandey
                </div>
                <div style={{ fontSize: 48, color: '#333', fontWeight: 600 }}>
                    Full Stack Developer
                </div>
                <div style={{ fontSize: 24, color: '#666', marginTop: 30 }}>
                    adityapandeydev.vercel.app
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
