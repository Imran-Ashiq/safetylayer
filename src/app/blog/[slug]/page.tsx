import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllPostSlugs, getPostBySlug, extractHeadings } from '@/lib/blog';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ArrowLeft, Shield, ExternalLink } from 'lucide-react';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import 'highlight.js/styles/github-dark.css';

export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.frontMatter.title,
    description: post.frontMatter.description,
    openGraph: {
      title: post.frontMatter.title,
      description: post.frontMatter.description,
      type: 'article',
      publishedTime: post.frontMatter.date,
      authors: [post.frontMatter.author || 'SafetyLayer Team'],
      images: post.frontMatter.image ? [post.frontMatter.image] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.frontMatter.title,
      description: post.frontMatter.description,
      images: post.frontMatter.image ? [post.frontMatter.image] : undefined,
    },
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const headings = extractHeadings(post.content);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Blog</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,800px)_300px] gap-12 max-w-7xl mx-auto">
          {/* Main Content */}
          <article className="min-w-0">
            {/* Article Header */}
            <header className="mb-16">
              {/* Tags */}
              {post.frontMatter.tags && post.frontMatter.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {post.frontMatter.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-xs px-3 py-1 border-blue-500/30 bg-blue-500/5 text-blue-600 dark:text-blue-400 font-medium"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-4xl md:text-6xl font-bold mb-8 text-slate-900 dark:text-white leading-tight">
                {post.frontMatter.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-base text-slate-600 dark:text-slate-400 pb-8 border-b-2 border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <span>
                    {new Date(post.frontMatter.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <span>5 min read</span>
                </div>
                {post.frontMatter.author && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">By {post.frontMatter.author}</span>
                  </div>
                )}
              </div>
            </header>

            {/* MDX Content */}
            <div className="prose prose-slate dark:prose-invert max-w-none 
              prose-headings:scroll-mt-20 
              prose-headings:font-bold
              prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-3 prose-h2:border-b prose-h2:border-slate-200 dark:prose-h2:border-slate-800
              prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4
              prose-p:text-lg prose-p:leading-relaxed prose-p:mb-6 prose-p:text-slate-700 dark:prose-p:text-slate-300
              prose-ul:my-6 prose-ul:space-y-3
              prose-ol:my-6 prose-ol:space-y-3
              prose-li:text-lg prose-li:leading-relaxed prose-li:text-slate-700 dark:prose-li:text-slate-300
              prose-strong:text-slate-900 dark:prose-strong:text-white prose-strong:font-semibold
              prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:font-medium prose-a:no-underline hover:prose-a:underline
              prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-6 prose-blockquote:py-2 prose-blockquote:my-6 prose-blockquote:bg-blue-500/5 prose-blockquote:rounded-r
              prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-code:bg-blue-50 dark:prose-code:bg-blue-900/20 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-medium prose-code:before:content-[''] prose-code:after:content-['']
              prose-pre:bg-slate-900 dark:prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-700 dark:prose-pre:border-slate-800 prose-pre:rounded-xl prose-pre:p-6 prose-pre:my-8 prose-pre:shadow-xl prose-pre:overflow-x-auto
              prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8
              
              /* Custom component styles */
              [&_.lead-paragraph]:text-xl [&_.lead-paragraph]:leading-relaxed [&_.lead-paragraph]:text-slate-600 [&_.lead-paragraph]:dark:text-slate-400 [&_.lead-paragraph]:mb-10 [&_.lead-paragraph]:border-l-4 [&_.lead-paragraph]:border-blue-500 [&_.lead-paragraph]:pl-6 [&_.lead-paragraph]:py-4 [&_.lead-paragraph]:bg-blue-500/5 [&_.lead-paragraph]:rounded-r-lg
              
              [&_.warning-box]:my-8 [&_.warning-box]:p-6 [&_.warning-box]:bg-gradient-to-r [&_.warning-box]:from-red-500/10 [&_.warning-box]:to-orange-500/10 [&_.warning-box]:border-l-4 [&_.warning-box]:border-red-500 [&_.warning-box]:rounded-r-xl [&_.warning-box]:shadow-lg
              
              [&_.tip-box]:my-8 [&_.tip-box]:p-6 [&_.tip-box]:bg-gradient-to-r [&_.tip-box]:from-green-500/10 [&_.tip-box]:to-emerald-500/10 [&_.tip-box]:border-l-4 [&_.tip-box]:border-green-500 [&_.tip-box]:rounded-r-xl [&_.tip-box]:shadow-lg
              
              [&_.stat-highlight]:my-10 [&_.stat-highlight]:p-6 [&_.stat-highlight]:md:p-8 [&_.stat-highlight]:text-center [&_.stat-highlight]:bg-gradient-to-br [&_.stat-highlight]:from-blue-500/20 [&_.stat-highlight]:via-purple-500/20 [&_.stat-highlight]:to-pink-500/20 [&_.stat-highlight]:border-2 [&_.stat-highlight]:border-blue-500/30 [&_.stat-highlight]:rounded-2xl [&_.stat-highlight]:text-2xl [&_.stat-highlight]:md:text-3xl [&_.stat-highlight]:font-bold [&_.stat-highlight]:text-blue-600 [&_.stat-highlight]:dark:text-blue-400 [&_.stat-highlight]:shadow-2xl [&_.stat-highlight]:break-words
              
              [&_.quote-box]:my-10 [&_.quote-box]:p-6 [&_.quote-box]:md:p-8 [&_.quote-box]:bg-slate-50 [&_.quote-box]:dark:bg-slate-900/50 [&_.quote-box]:border-l-4 [&_.quote-box]:border-purple-500 [&_.quote-box]:rounded-r-2xl [&_.quote-box]:italic [&_.quote-box]:text-lg [&_.quote-box]:md:text-xl [&_.quote-box]:leading-relaxed [&_.quote-box]:shadow-xl
              [&_.quote-author]:block [&_.quote-author]:mt-4 [&_.quote-author]:text-sm [&_.quote-author]:not-italic [&_.quote-author]:text-slate-600 [&_.quote-author]:dark:text-slate-400 [&_.quote-author]:font-medium
              
              [&_.compliance-grid]:grid [&_.compliance-grid]:grid-cols-1 [&_.compliance-grid]:md:grid-cols-3 [&_.compliance-grid]:gap-4 [&_.compliance-grid]:my-8
              [&_.compliance-card]:p-4 [&_.compliance-card]:md:p-6 [&_.compliance-card]:bg-gradient-to-br [&_.compliance-card]:from-red-500/10 [&_.compliance-card]:to-orange-500/10 [&_.compliance-card]:border [&_.compliance-card]:border-red-500/30 [&_.compliance-card]:rounded-xl [&_.compliance-card]:text-center [&_.compliance-card]:shadow-lg [&_.compliance-card]:break-words
              
              [&_.steps-container]:my-12 [&_.steps-container]:space-y-6
              [&_.step-card]:flex [&_.step-card]:gap-4 [&_.step-card]:md:gap-6 [&_.step-card]:p-4 [&_.step-card]:md:p-6 [&_.step-card]:bg-white [&_.step-card]:dark:bg-slate-900/50 [&_.step-card]:border [&_.step-card]:border-slate-200 [&_.step-card]:dark:border-slate-800 [&_.step-card]:rounded-xl [&_.step-card]:shadow-lg [&_.step-card]:hover:shadow-xl [&_.step-card]:transition-all
              [&_.step-number]:flex [&_.step-number]:items-center [&_.step-number]:justify-center [&_.step-number]:w-10 [&_.step-number]:h-10 [&_.step-number]:md:w-12 [&_.step-number]:md:h-12 [&_.step-number]:rounded-full [&_.step-number]:bg-gradient-to-br [&_.step-number]:from-blue-500 [&_.step-number]:to-cyan-500 [&_.step-number]:text-white [&_.step-number]:font-bold [&_.step-number]:text-lg [&_.step-number]:md:text-xl [&_.step-number]:shadow-lg [&_.step-number]:flex-shrink-0
              [&_.step-content]:flex-1 [&_.step-content]:min-w-0
              
              [&_.example-container]:my-12 [&_.example-container]:grid [&_.example-container]:grid-cols-1 [&_.example-container]:gap-6 [&_.example-container]:items-center
              [&_.example-before]:p-4 [&_.example-before]:md:p-6 [&_.example-before]:bg-red-50 [&_.example-before]:dark:bg-red-900/10 [&_.example-before]:border-2 [&_.example-before]:border-red-300 [&_.example-before]:dark:border-red-800 [&_.example-before]:rounded-xl [&_.example-before]:shadow-lg [&_.example-before]:overflow-x-auto
              [&_.example-after]:p-4 [&_.example-after]:md:p-6 [&_.example-after]:bg-green-50 [&_.example-after]:dark:bg-green-900/10 [&_.example-after]:border-2 [&_.example-after]:border-green-300 [&_.example-after]:dark:border-green-800 [&_.example-after]:rounded-xl [&_.example-after]:shadow-lg [&_.example-after]:overflow-x-auto
              [&_.example-arrow]:text-3xl [&_.example-arrow]:md:text-4xl [&_.example-arrow]:text-blue-500 [&_.example-arrow]:font-bold [&_.example-arrow]:text-center [&_.example-arrow]:my-4 [&_.example-arrow]:md:my-0
              
              [&_.highlight-box]:my-8 [&_.highlight-box]:p-4 [&_.highlight-box]:md:p-6 [&_.highlight-box]:bg-gradient-to-r [&_.highlight-box]:from-blue-500/10 [&_.highlight-box]:to-cyan-500/10 [&_.highlight-box]:border [&_.highlight-box]:border-blue-500/30 [&_.highlight-box]:rounded-xl [&_.highlight-box]:text-center [&_.highlight-box]:text-lg [&_.highlight-box]:md:text-xl [&_.highlight-box]:font-semibold [&_.highlight-box]:shadow-lg [&_.highlight-box]:break-words
              
              [&_.cta-inline]:my-10 [&_.cta-inline]:p-6 [&_.cta-inline]:md:p-8 [&_.cta-inline]:bg-gradient-to-r [&_.cta-inline]:from-blue-600/10 [&_.cta-inline]:via-purple-600/10 [&_.cta-inline]:to-pink-600/10 [&_.cta-inline]:border-2 [&_.cta-inline]:border-blue-500/30 [&_.cta-inline]:rounded-2xl [&_.cta-inline]:text-center [&_.cta-inline]:text-xl [&_.cta-inline]:md:text-2xl [&_.cta-inline]:font-bold [&_.cta-inline]:shadow-2xl [&_.cta-inline]:break-words
              
              [&_.final-stat]:my-12 [&_.final-stat]:p-6 [&_.final-stat]:md:p-10 [&_.final-stat]:text-center [&_.final-stat]:bg-gradient-to-br [&_.final-stat]:from-green-500/20 [&_.final-stat]:via-emerald-500/20 [&_.final-stat]:to-teal-500/20 [&_.final-stat]:border-2 [&_.final-stat]:border-green-500/40 [&_.final-stat]:rounded-3xl [&_.final-stat]:text-2xl [&_.final-stat]:md:text-4xl [&_.final-stat]:font-bold [&_.final-stat]:text-green-600 [&_.final-stat]:dark:text-green-400 [&_.final-stat]:shadow-2xl [&_.final-stat]:break-words
            ">
              <MDXRemote
                source={post.content}
                options={{
                  mdxOptions: {
                    remarkPlugins: [remarkGfm],
                    rehypePlugins: [
                      rehypeHighlight,
                      rehypeSlug,
                      [
                        rehypeAutolinkHeadings,
                        {
                          behavior: 'wrap',
                          properties: {
                            className: ['anchor'],
                          },
                        },
                      ],
                    ],
                  },
                }}
              />
            </div>

            {/* CTA Card */}
            <Card className="mt-20 p-10 bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-purple-500/10 border-2 border-blue-500/30 backdrop-blur-sm shadow-2xl shadow-blue-500/20">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">FREE & OPEN SOURCE</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-3 text-slate-900 dark:text-white">
                    Ready to Protect Your Data?
                  </h3>
                  <p className="text-lg text-slate-700 dark:text-slate-400 leading-relaxed">
                    Try SafetyLayer now and secure your sensitive information before sharing it with AI. No sign-up required, works 100% offline in your browser.
                  </p>
                </div>
                <Link href="/#live-demo">
                  <Button size="lg" className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/50 whitespace-nowrap px-8 py-6 text-lg">
                    Try the Tool
                    <ExternalLink className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </Card>
          </article>

          {/* Sidebar - Table of Contents */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <Card className="p-6 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-white/10 shadow-lg">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Table of Contents</h3>
                </div>
                {headings.length > 0 ? (
                  <nav>
                    <ul className="space-y-1">
                      {headings.map((heading, index) => (
                        <li
                          key={index}
                          className={heading.level === 3 ? 'ml-4' : ''}
                        >
                          <a
                            href={`#${heading.id}`}
                            className={`text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all block py-2 px-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 ${
                              heading.level === 2 ? 'font-medium' : 'text-sm'
                            }`}
                          >
                            {heading.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                ) : (
                  <p className="text-sm text-slate-600 dark:text-slate-400">No headings found</p>
                )}
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
