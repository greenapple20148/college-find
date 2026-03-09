import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CollegeFind — Find Your Perfect College',
    short_name: 'CollegeFind',
    description:
      'Free college search and admission match tool for 12th-grade students.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#C9923C',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
