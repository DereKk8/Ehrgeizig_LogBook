import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ehrgeizig - Fitness Tracking App",
  description: "Track your fitness journey with personalized workout logs and training split management",
  icons: {
    icon: [
      { url: '/ehrgeizig-favicon.svg', type: 'image/svg+xml' },
      { url: '/ehrgeizig-favicon.svg', sizes: '32x32' }
    ],
    shortcut: '/ehrgeizig-favicon.svg',
    apple: '/ehrgeizig-favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased bg-[#121212] text-white`}
      >
        {children}
      </body>
    </html>
  );
}
