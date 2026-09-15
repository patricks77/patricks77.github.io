const site = 'https://patricklovesmore.deepatstudio.com';

const items = [
  { title: 'Les probabilités d’être soi', description: 'Pourquoi je crois que se connaître est le travail d’une vie.', path: '/journal/les-probabilites-detre-soi' },
  { title: 'La chanson de Noël que je n’ai pas écrite', description: 'Comment quatre intelligences artificielles ont créé ensemble un cadeau de Noël à l’humanité.', path: '/journal/la-chanson-de-noel-que-je-nai-pas-ecrite' },
  { title: 'Les livres que je porte', description: 'Récits intimes, fantasy et mondes humains.', path: '/journal/les-livres-que-je-porte' },
];

const escapeXml = (value: string) => value.replace(/[<>&'"]/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[character] ?? character);

export function GET() {
  const entries = items.map(({ title, description, path }) => {
    const link = `${site}${path}`;
    return `    <item>\n      <title>${escapeXml(title)}</title>\n      <link>${link}</link>\n      <guid isPermaLink="true">${link}</guid>\n      <description>${escapeXml(description)}</description>\n    </item>`;
  }).join('\n');

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>Patrick Lovesmore</title>\n    <description>Un regard sur l’humanité, l’imaginaire et la création.</description>\n    <link>${site}</link>\n    <language>fr-CA</language>\n${entries}\n  </channel>\n</rss>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
