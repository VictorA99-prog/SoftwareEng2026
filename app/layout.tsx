import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Paper Groove Records",
  description: "Vinyl shop storefront",
};

const navItems = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Genres", href: "/genres" },
  { label: "Cart", href: "/cart" },
  { label: "Admin", href: "/admin" },
];


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={[
          geistSans.variable,
          geistMono.variable,
          "antialiased",
          "bg-[#F7E8D6]", // cream paper
          "text-[#1f1f1f]",
        ].join(" ")}
      >
        <header className="w-full">
          <div className="mx-auto max-w-6xl px-5 pt-6">
            {/* top bar */}
            <div className="flex items-start justify-between">
              <Link
                href="#"
                className="inline-flex items-center bg-[#1f1f1f] text-[#F7E8D6] px-4 py-2 font-black tracking-wide uppercase text-lg shadow-sm"
              >
                Paper Groove
              </Link>

              <Link
                href="#"
                className="inline-flex items-center bg-[#1f1f1f] text-[#F7E8D6] px-4 py-2 font-black tracking-wide uppercase text-lg shadow-sm"
              >
                Contact Us
              </Link>
            </div>

            {/* tabs */}
            <nav className="mt-5 flex flex-wrap gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="bg-[#F7E8D6] border-2 border-[#1f1f1f] px-4 py-2 font-bold uppercase tracking-wide text-sm hover:bg-[#1f1f1f] hover:text-[#F7E8D6] transition"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-5 pb-16">{children}</main>
      </body>
    </html>
  );
}
