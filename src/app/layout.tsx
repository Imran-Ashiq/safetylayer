import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { CloneGuard } from "@/components/CloneGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://safetylayer.com'),
  title: {
    default: "SafetyLayer | Free Client-Side PII Scrubber for AI & LLMs",
    template: "%s | SafetyLayer"
  },
  description: "Securely mask sensitive data (Credit Cards, Emails, SSNs) in your browser before sending it to ChatGPT, Claude, or DeepSeek. 100% Offline & Open Source.",
  keywords: [
    "PII scrubber",
    "sanitize text for AI",
    "remove credit cards from text",
    "GDPR compliance tool",
    "offline redactor",
    "ChatGPT privacy",
    "Claude security",
    "DeepSeek data protection",
    "client-side encryption",
    "browser-based PII detection",
    "open source privacy tool",
    "reversible tokenization",
    "data masking",
    "sensitive data protection"
  ],
  authors: [{ name: "SafetyLayer Team" }],
  creator: "SafetyLayer",
  publisher: "SafetyLayer",
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://safetylayer.com",
    siteName: "SafetyLayer",
    title: "SafetyLayer | Free Client-Side PII Scrubber for AI & LLMs",
    description: "Securely mask sensitive data (Credit Cards, Emails, SSNs) in your browser before sending it to ChatGPT, Claude, or DeepSeek. 100% Offline & Open Source.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SafetyLayer | Free Client-Side PII Scrubber for AI & LLMs",
    description: "Securely mask sensitive data (Credit Cards, Emails, SSNs) in your browser before sending it to ChatGPT, Claude, or DeepSeek. 100% Offline & Open Source.",
    creator: "@safetylayer"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'uieV77BG_uMd_UUepq1I2YHVvo7O06OEbpoWVGwKfo8',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
  alternates: {
    canonical: 'https://safetylayer.vercel.app',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SafetyLayer',
    applicationCategory: 'SecurityApplication',
    operatingSystem: 'Any (Browser-based)',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: 'Securely mask sensitive data (Credit Cards, Emails, SSNs) in your browser before sending it to ChatGPT, Claude, or DeepSeek. 100% Offline & Open Source.',
    url: 'https://safetylayer.com',
    screenshot: 'https://safetylayer.com/og-image.png',
    softwareVersion: '1.0.0',
    datePublished: '2025-01-01',
    author: {
      '@type': 'Organization',
      name: 'SafetyLayer Team',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      ratingCount: '1',
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <CloneGuard />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
