import { Geist, Geist_Mono, Cairo } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Load Cairo via next/font to ensure reliable font loading and preloading
const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata = {
  title: "RitajDZ - رتاج",
  description: "منصة رتاج - اكتشف، شارك، وتعلم",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable}  antialiased`}
      >
        {children}
        
      </body>
    </html>
  );
}
