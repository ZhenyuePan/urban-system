'use client'

import { DATA } from "@/data/resume"
import { formatDate } from "@/lib/utils"
import { Suspense, useEffect, useState, useRef } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { marked } from 'marked'

interface PostMetadata {
  title: string
  publishedAt: string
  summary: string
  image?: string
}

interface Post {
  slug: string
  metadata: PostMetadata
  source: string
}

interface Heading {
  id: string
  text: string
  level: number
  subheadings: Heading[]
}

export default function BlogPostContent({ post }: { post: Post }) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeHeading, setActiveHeading] = useState("")
  const [expandedHeadings, setExpandedHeadings] = useState<Set<string>>(new Set())
  const observerRef = useRef<IntersectionObserver | null>(null)
  const [renderedContent, setRenderedContent] = useState("")

  useEffect(() => {
    if (!post.source) {
      console.error("Post source is undefined")
      return
    }

    // Configure marked to add IDs to headings
    marked.use({
      renderer: {
        heading(text, level) {
          const slug = text.toLowerCase().replace(/[^\w]+/g, '-')
          return `<h${level} id="${slug}">${text}</h${level}>`
        }
      }
    })

    // Render Markdown content
    const rendered = marked(post.source)
    setRenderedContent(rendered)

    // Extract headings from rendered HTML
    const parser = new DOMParser()
    const doc = parser.parseFromString(rendered, 'text/html')
    const headingElements = doc.querySelectorAll('h1, h2, h3')
    const extractedHeadings: Heading[] = []
    const headingStack: Heading[] = []

    Array.from(headingElements).forEach((heading) => {
      const newHeading: Heading = {
        id: heading.id,
        text: heading.textContent || '',
        level: parseInt(heading.tagName.charAt(1)),
        subheadings: []
      }

      while (headingStack.length > 0 && headingStack[headingStack.length - 1].level >= newHeading.level) {
        headingStack.pop()
      }

      if (headingStack.length > 0) {
        headingStack[headingStack.length - 1].subheadings.push(newHeading)
      } else {
        extractedHeadings.push(newHeading)
      }

      headingStack.push(newHeading)
    })

    setHeadings(extractedHeadings)
  }, [post.source])

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id)
          }
        })
      },
      { 
        rootMargin: '-20% 0px -80% 0px',
        threshold: 0.1
      }
    )

    const observeHeadings = (headings: Heading[]) => {
      headings.forEach((heading) => {
        const element = document.getElementById(heading.id)
        if (element && observerRef.current) {
          observerRef.current.observe(element)
        }
        observeHeadings(heading.subheadings)
      })
    }

    observeHeadings(headings)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [headings])

  const scrollToHeading = (headingId: string) => {
    const element = document.getElementById(headingId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setActiveHeading(headingId)
  }

  const toggleExpanded = (headingId: string) => {
    setExpandedHeadings((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(headingId)) {
        newSet.delete(headingId)
      } else {
        newSet.add(headingId)
      }
      return newSet
    })
  }

  const renderHeadings = (headings: Heading[], level: number = 0) => (
    <ul className={`space-y-1 text-sm ${level > 0 ? 'ml-4' : ''}`}>
      {headings.map((heading) => (
        <li key={heading.id}>
          <div className="flex items-center">
            {heading.subheadings.length > 0 && (
              <button
                onClick={() => toggleExpanded(heading.id)}
                className="mr-1 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                aria-label={expandedHeadings.has(heading.id) ? "Collapse section" : "Expand section"}
              >
                {expandedHeadings.has(heading.id) ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            )}
            <button
              onClick={() => scrollToHeading(heading.id)}
              className={`flex-grow text-left py-1 px-2 rounded transition-colors duration-200 ${
                activeHeading === heading.id
                  ? 'bg-gray-100 text-gray-900 font-bold dark:bg-gray-800 dark:text-gray-100'
                  : 'hover:bg-gray-50 text-gray-600 dark:hover:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {heading.text}
            </button>
          </div>
          {expandedHeadings.has(heading.id) && heading.subheadings.length > 0 && renderHeadings(heading.subheadings, level + 1)}
        </li>
      ))}
    </ul>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.metadata.title,
            datePublished: post.metadata.publishedAt,
            dateModified: post.metadata.publishedAt,
            description: post.metadata.summary,
            image: post.metadata.image
              ? `${DATA.url}${post.metadata.image}`
              : `${DATA.url}/og?title=${post.metadata.title}`,
            url: `${DATA.url}/blog/${post.slug}`,
            author: {
              "@type": "Person",
              name: DATA.name,
            },
          }),
        }}
      />
      
      <nav className="mb-8 text-xs" aria-label="Back to blog">
        <Link href="/blog" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors duration-200 flex items-center">
          <ChevronLeft className="w-4 h-4 mr-1" aria-hidden="true" />
          Back to all articles
        </Link>
      </nav>
      
      <header className="mb-12 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-3">{post.metadata.title}</h1>
        <Suspense fallback={<p className="h-5" />}>
          <p className="text-base text-gray-500 dark:text-gray-400">
            {formatDate(post.metadata.publishedAt)}
          </p>
        </Suspense>
      </header>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 flex-shrink-0 order-2 lg:order-1">
          <nav className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto pr-4" aria-label="Table of contents">
            <h2 className="text-base font-semibold mb-3 text-gray-900 dark:text-gray-100">Contents</h2>
            {headings.length > 0 ? (
              renderHeadings(headings)
            ) : (
              <p className="text-xs text-gray-600 dark:text-gray-400">No headings found in this post.</p>
            )}
          </nav>
        </aside>
        
        <article className="flex-grow order-1 lg:order-2 prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none blog-content">
          {renderedContent ? (
            <div dangerouslySetInnerHTML={{ __html: renderedContent }} />
          ) : (
            <Alert>
              <AlertTitle>Content Unavailable</AlertTitle>
              <AlertDescription>
                The content for this blog post is currently unavailable. Please check back later.
              </AlertDescription>
            </Alert>
          )}
        </article>
      </div>
      
      <nav className="mt-12 flex justify-between text-xs" aria-label="Post navigation">
        <Link href="/blog" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors duration-200 flex items-center">
          <ChevronLeft className="w-4 h-4 mr-1" aria-hidden="true" />
          Back to all articles
        </Link>
        <Link href="#" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors duration-200 flex items-center">
          Back to top
          <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
        </Link>
      </nav>
    </div>
  )
}


