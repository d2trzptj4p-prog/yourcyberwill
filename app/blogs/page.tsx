import { getSortedPostsData } from '@/lib/posts';
import Link from 'next/link';
import { Footer } from '@/app/components/footer';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'The Digital Legacy Blog | YourCyberWill',
  description: 'Expert guides on digital inheritance, crypto self-custody protection, and securing your passwords for the people who matter most.',
  alternates: {
    canonical: 'https://www.yourcyberwill.com/blog',
  },
};

export default function BlogArchive() {
  const posts = getSortedPostsData();

  return (
    <div className="min-h-screen bg-white text-neutral-800 flex flex-col justify-between selection:bg-amber-100 selection:text-amber-900">
      
      {/* 1. STICKY BRAND HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-neutral-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-24 flex items-center justify-between">
          {/* Prefetching the home route for instant return speeds */}
          <Link href="/" prefetch={true} className="flex items-center gap-2.5 select-none transition-opacity hover:opacity-90">
            <div className="flex h-12 w-48 items-center justify-center overflow-hidden select-none">
              <img
                className="min-h-full min-w-full scale-150 object-cover"
                src="/textlogo.png"
                alt="yourcyberwill Logo"
              />
            </div>
          </Link>
          
          <Link href="/" prefetch={true}>
            <Button>
                Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* 2. MAIN ARCHIVE CONTENT */}
      <main className="flex-grow max-w-5xl w-full mx-auto px-6 sm:px-8 pt-24 pb-32">
        
        {/* Section Heading */}
        <div className="max-w-2xl mb-20 space-y-6">
          <h1 className="text-4xl sm:text-6xl md:text-5xl tracking-tighter text-neutral-900 leading-none ">
            Our Blogs ({posts?.length || 0}) <br />
          </h1>
          <p className="text-xl text-neutral-600 leading-relaxed">
            Practical advice written by security engineers on how to protect, manage, and pass down your digital assets, files, and crypto securely.
          </p>
        </div>

        {/* Dynamic Spaced-Out Blog Post List */}
        <div className="space-y-8 flex mt-10 flex-col">
          {posts.map((post) => (
            /* FIX: The entire block element is now wrapped in a primary Link wrapper with strict prefetching activated */
            <Link 
              key={post.slug}
              href={`/blog/${post.slug}`} 
              prefetch={true}
              className="block group"
            >
              <article 
                className="flex flex-col bg-slate-100 cursor-pointer group-hover:bg-slate-200/80 p-8 rounded-3xl px-8 items-start transition-all duration-200 border border-transparent group-hover:border-slate-200"
              >
                {/* Post Metadata line */}
                <div className="flex items-center gap-3 text-sm text-neutral-400 mb-4 ">
                  <span>{post.date}</span>
                  <span>•</span>
                  <span className="text-blue-500 tracking-wider uppercase text-xs">Legacy Strategy</span>
                </div>

                {/* Title element responds elegantly to the master hover state wrapper */}
                <h2 className="text-2xl sm:text-3xl tracking-tight text-neutral-900 mb-4 leading-snug group-hover:text-blue-500 transition-colors">
                  {post.title}
                </h2>

                {/* Description Snippet */}
                <p className="text-lg text-neutral-600 mb-6 leading-relaxed max-w-3xl">
                  {post.description}
                </p>

                {/* Clean Read More Button Accent */}
                <div 
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-neutral-900 transition-colors"
                >
                  Read full guide 
                  <span className="transform translate-x-0 group-hover:translate-x-1.5 transition-transform duration-200">→</span>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* Empty State Fallback if you have no files inside content/posts */}
        {posts.length === 0 && (
          <div className="text-center py-20 border border-dashed border-slate-200 rounded-2xl">
            <p className="text-neutral-500 text-lg">No guides published yet. Check back soon!</p>
          </div>
        )}

      </main>

      {/* 3. FOOTER */}
      <Footer />

    </div>
  );
}