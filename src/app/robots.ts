import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard', '/match'],
      },
    ],
    sitemap: 'https://collegematchtool.com/sitemap.xml',
    host: 'https://collegematchtool.com',
  }
}
