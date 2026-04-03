import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

export async function GET(context: APIContext) {
  const site = context.site?.toString() ?? 'https://example.com';

  const posts = await getCollection('blog');

  // 모든 태그 수집
  const tagSet = new Set<string>();
  for (const post of posts) {
    for (const tag of post.data.tags ?? []) {
      tagSet.add(tag);
    }
  }

  const urls: string[] = [];

  // 정적 페이지
  urls.push(`${site}/`, `${site}/now`, `${site}/posts`, `${site}/tags`);

  // 포스트 페이지
  for (const post of posts) {
    urls.push(`${site}/posts/${post.slug}`);
  }

  // 태그 페이지
  for (const tag of tagSet) {
    urls.push(`${site}/tags/${encodeURIComponent(tag)}`);
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (loc) => `  <url>
    <loc>${loc}</loc>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
