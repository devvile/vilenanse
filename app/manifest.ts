import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Holi App',
    short_name: 'Holi',
    description: 'Aim for Excellence - track finances, health, and habits.',
    id: '/',
    start_url: '/',
    display: 'standalone',
    background_color: '#0d0d12',
    theme_color: '#0d0d12',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    screenshots: [
      {
        src: '/screenshots/mobile.png',
        sizes: '1024x1792',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Holi App Mobile Dashboard',
      },
      {
        src: '/screenshots/desktop.png',
        sizes: '1792x1024',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Holi App Desktop Dashboard',
      },
    ],
  }
}
