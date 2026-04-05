import { NextResponse } from 'next/server';

// Proxy the pipeline's RSS feed through s2d.info so external services can reach it
export async function GET() {
  try {
    const res = await fetch('http://89.167.8.125:3000/feed/approved', {
      cache: 'no-store',
      headers: { 'User-Agent': 'S2D-Feed-Proxy/1.0' },
    });

    if (!res.ok) {
      return new NextResponse('Feed unavailable', { status: 502 });
    }

    const xml = await res.text();

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, max-age=0',
      },
    });
  } catch {
    return new NextResponse('Feed unavailable', { status: 502 });
  }
}
