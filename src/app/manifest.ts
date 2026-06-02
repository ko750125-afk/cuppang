import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '심플 배송 정산',
    short_name: '배송 정산',
    description: '직관적인 초심플 배송 실적 및 정산 관리 앱',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#1850d4',
    theme_color: '#1850d4',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  };
}
