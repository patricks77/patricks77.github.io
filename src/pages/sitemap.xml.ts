const pages = [
  { path: '/', priority: '1.0' },
  { path: '/journal', priority: '0.9' },
  { path: '/journal/la-chanson-de-noel-que-je-nai-pas-ecrite', priority: '0.9' },
  { path: '/about', priority: '0.7' },
];

export function GET() {
  const site = 'https://patricklovesmore.deepatstudio.com';
  const urls = pages.map(({ path, priority }) => `  <url>\n    <loc>${site}${path}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>${priority}</priority>\n  </url>`).join('\n');

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
