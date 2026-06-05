import { getSortedPostsData } from '@/lib/posts';

export default async function sitemap() {
  const baseUrl = 'https://www.yourcyberwill.com';

  // Base pages
  const routes = ['', '/privacy', '/terms', ['/blogs']].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'monthly',
    priority: 1.0,
  }));

  // Automatically fetch all markdown blogs for the sitemap
  const posts = getSortedPostsData();
  const blogRoutes = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.date,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...routes, ...blogRoutes];
}