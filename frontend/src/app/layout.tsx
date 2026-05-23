import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LearningWithAhad SEO Studio",
  description: "AI-powered YouTube SEO optimization for your channel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            success: { 
              duration: 2500,
              style: { 
                background: '#10b981', 
                color: '#fff',
                fontWeight: '500'
              },
              icon: '✅'
            },
            error: { 
              duration: 4000,
              style: { 
                background: '#ef4444', 
                color: '#fff',
                fontWeight: '500'
              },
              icon: '❌'
            },
            loading: {
              duration: Infinity,
              style: { 
                background: '#6366f1', 
                color: '#fff',
                fontWeight: '500'
              },
              icon: '⏳'
            }
          }}
        />
      </body>
    </html>
  );
}
