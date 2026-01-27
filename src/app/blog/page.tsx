import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Blog - Security & Privacy Articles',
  description: 'Learn how to protect your sensitive data when using AI tools like ChatGPT, Claude, and DeepSeek. Expert guides on PII protection, GDPR compliance, and data security.',
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 mb-6">
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">Security Blog</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-slate-900 dark:text-white">
            Learn to{' '}
            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Protect Your Data
            </span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Expert guides on using AI tools securely, PII protection best practices, and GDPR compliance tips.
          </p>
        </div>

        {/* Blog Posts Grid */}
        {posts.length === 0 ? (
          <Card className="p-12 text-center bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-white/10">
            <p className="text-slate-600 dark:text-slate-400">No blog posts yet. Check back soon!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <Card className="group h-full p-8 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-white/10 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
                  {/* Tags */}
                  {post.frontMatter.tags && post.frontMatter.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.frontMatter.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-xs border-blue-500/20 text-blue-600 dark:text-blue-400"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Title */}
                  <h2 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {post.frontMatter.title}
                  </h2>

                  {/* Description */}
                  <p className="text-slate-700 dark:text-slate-400 mb-6 line-clamp-3">
                    {post.frontMatter.description}
                  </p>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(post.frontMatter.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      <span>5 min read</span>
                    </div>
                  </div>

                  {/* Read More */}
                  <div className="mt-6 flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium group-hover:gap-3 transition-all">
                    <span>Read Article</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
