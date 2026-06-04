import { getPostBySlug, getSortedPostsData } from '@/lib/posts';
import { marked } from 'marked';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Footer } from '@/app/components/footer';
import { Button } from '@/components/ui/button';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.meta.title} | YourCyberWill`,
    description: post.meta.description,
    alternates: {
      canonical: `https://www.yourcyberwill.com/blog/${slug}`,
    },
  };
}

export async function generateStaticParams() {
  const posts = getSortedPostsData();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const htmlContent = marked.parse(post.content);

  return (
    <div className="min-h-screen bg-white text-neutral-800 flex flex-col justify-between selection:bg-amber-100 selection:text-amber-900">
      
      {/* 1. STICKY BRAND HEADER WITH FROSTED GLASS BLUR & PROGRESS TRACKER */}
      <header className="sticky top-0 z-50 w-full border-b border-neutral-100 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
        {/* Progress Bar: Light mode gradient stretching beautifully across the bottom edge */}
        <div 
          className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 origin-left w-full scale-x-0" 
          style={{ 
            animation: 'progress linear both',
            animationTimeline: 'scroll(root)' 
          }} 
        />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-24 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 select-none transition-opacity hover:opacity-90">
            <div className="flex h-12 w-48 items-center justify-center overflow-hidden select-none">
              {/* Note: If your image logo has white text, make sure to use a dark-text or color variation icon here */}
              <img
                className="min-h-full min-w-full scale-150 object-cover"
                src="/textlogo.png"
                alt="yourcyberwill Logo"
              />
            </div>
          </Link>
          
          <Link href="/">
            <Button className='h-11'>
                Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* 2. MAIN PREMIUM LIGHT-MODE BLOG ARTICLE CONTENT */}
      <main className="flex-grow">
        <article className="max-w-3xl mx-auto px-6 sm:px-8 pt-24 pb-32">
          
          {/* Article Header Metadata */}
          <div className="mb-12 space-y-6 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs tracking-wide bg-amber-100 border-amber-200 text-amber-700 uppercase">
              Secure Legacy Guide
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-neutral-900 leading-[1.12]">
              {post.meta.title}
            </h1>
            
            <p className="text-xl text-neutral-600 mt-6 leading-relaxed font-normal">
              {post.meta.description}
            </p>
            
            <div className="flex items-center justify-center sm:justify-start gap-3 text-sm font-medium text-neutral-400  border-neutral-100">
              <span className="text-neutral-500">Published {post.meta.date}</span>
              <span>•</span>
              <span className="">By YourCyberWill Team</span>
            </div>
          </div>

          <div className="w-full h-[1px] bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100 my-12" />

          {/* Premium Light-Mode Typography Configuration */}
          <div 
            className="prose prose-neutral max-w-none 
              prose-headings:font-bold prose-headings:text-neutral-900 prose-headings:tracking-tight
              prose-h2:text-2xl prose-h2:sm:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:border-b prose-h2:border-neutral-100 prose-h2:pb-2
              prose-h3:text-xl prose-h3:mt-10 prose-h3:mb-4
              prose-p:text-neutral-700 prose-p:text-lg prose-p:leading-relaxed prose-p:mb-8 font-normal
              prose-strong:text-neutral-900 prose-strong:font-bold
              prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-8 prose-ol:space-y-3 prose-ol:text-neutral-700
              prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-8 prose-ul:space-y-3 prose-ul:text-neutral-700
              prose-li:text-neutral-700 prose-li:text-lg prose-li:leading-relaxed
              prose-a:text-amber-600 hover:prose-a:text-orange-600 prose-a:underline prose-a:font-medium prose-a:transition-colors
              prose-blockquote:border-l-4 prose-blockquote:border-amber-500 prose-blockquote:bg-amber-50/40 prose-blockquote:px-6 prose-blockquote:py-2 prose-blockquote:rounded-r-xl prose-blockquote:italic prose-blockquote:text-neutral-700"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {/* Clean, High-Contrast Premium Call to Action Card */}
          <div className="mt-2 20 p-8 sm:p-12 rounded-3xl border-2 border-slate-200 text-center space-y-6 relative overflow-hidden shadow-neutral-100">
            <div className="absolute -right-20 -top-20 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <h3 className="text-2xl sm:text-4xl text-neutral-900 tracking-tight">
              Secure your digital legacy in under 10 minutes.
            </h3>
            <p className="text-neutral-600 max-w-lg mx-auto text-base leading-relaxed">
              Don't leave your files, crypto wallets, and encrypted master credentials permanently locked behind a void if you ever go quiet. Build an automated zero-knowledge vault today.
            </p>
            <div className="pt-4">
              <Link href="/" >
                <Button className='h-14 px-6'>
                    Protect Your Legacy Now
                    </Button>
              </Link>
            </div>
          </div>
        </article>
      </main>

      {/* 3. CLEAN LIGHT FOOTER */}
      <Footer />

    </div>
  );
}