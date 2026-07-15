import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { ViewTracker } from "@/components/ViewTracker";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-jakarta" });

export const metadata: Metadata = {
  title: "English Pesalam - Learn English Easily with Tamil Explanation",
  description: "Master English step by step with simple lessons and Tamil explanations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(location.pathname.indexOf('/admin')===0){var t=localStorage.getItem('admin-theme')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${jakarta.variable} font-sans antialiased bg-white text-slate-900`}
        suppressHydrationWarning={true}
      >
        <ToastProvider />
        <ViewTracker />
        {children}
      </body>
    </html>
  );
}
