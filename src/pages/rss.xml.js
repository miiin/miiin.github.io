import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('blog');
  posts.sort((a, b) => (a.data.date < b.data.date ? 1 : -1));

  return rss({
    title: '민영 블로그',
    description: '개발하고 음악 듣는 일상을 기록합니다.',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: new Date(post.data.date),
      link: `/posts/${post.slug}/`,
    })),
  });
}
