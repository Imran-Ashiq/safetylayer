import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

// Get all blog posts from the content/blog directory
function getBlogPosts(): string[] {
  const blogDir = path.join(process.cwd(), 'content', 'blog');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(blogDir)) {
    return [];
  }

  const files = fs.readdirSync(blogDir);
  return files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => file.replace('.mdx', ''));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://safetylayer.vercel.app';
  const blogPosts = getBlogPosts();

  const blogUrls = blogPosts.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    ...blogUrls,
  ];
}
