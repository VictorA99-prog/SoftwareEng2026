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
  title: "Sunet Vinyl & Instrument Shop",
  description: "Vinyl shop storefront",
};

const navItems = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/api/products" },
  { label: "Genres", href: "/genres" },
  { label: "Cart", href: "/cart" },
  { label: "Admin", href: "/admin/login" },
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
        <header className="sticky top-0 z-50 w-full">
  {/* subtle paper grid */}
  <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-28 bg-[#FFF3E6]" />
  <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-28 opacity-[0.12] [background-image:linear-gradient(#000_1px,transparent_1px),linear-gradient(90deg,#000_1px,transparent_1px)] [background-size:28px_28px]" />

  {/* full-bleed strip */}
  <div className="border-b-2 border-black bg-[#FFF3E6]">
    <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
      {/* top row: brand + contact */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/"
          className="group inline-flex items-center gap-3"
        >
          {/* chunky logo block */}
          <span className="inline-flex items-center rounded-sm border-2 border-black bg-black px-4 py-2 text-sm font-black uppercase tracking-widest text-[#FFF3E6] shadow-[6px_6px_0_0_#000] transition-all duration-150 group-hover:-translate-y-0.5 group-hover:shadow-[10px_10px_0_0_#000]">
            Sunset Vinyl
          </span>

          {/* minimal subtext (optional) */}
          <span className="hidden sm:inline text-xs font-black uppercase tracking-widest text-black/80">
            records + gear
          </span>
        </Link>

        <Link
          href="/contact"
          className="inline-flex items-center rounded-sm border-2 border-black bg-[#FFD6A5] px-3 py-2 text-xs font-black uppercase tracking-widest text-black shadow-[6px_6px_0_0_#000] transition-all duration-150 hover:-translate-y-0.5 hover:bg-white"
        >
          Contact
        </Link>
      </div>

      {/* nav: tape-tab bar */}
      <nav className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group inline-flex items-center rounded-sm border-2 border-black bg-black px-3 py-2 text-xs font-black uppercase tracking-widest text-[#FFF3E6] shadow-[5px_5px_0_0_#000] transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#FF6B6B] hover:text-black"
            >
              <span className="relative">
                {item.label}
                {/* tiny underline that slides in */}
                <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-current transition-all duration-150 group-hover:w-full" />
              </span>
            </Link>
          ))}

          {/* little accent tag on the right (optional) */}
          <div className="ml-auto hidden md:block">
            <div className="rounded-sm border-2 border-black bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-black shadow-[5px_5px_0_0_#000]">
              Sunset Drop
            </div>
          </div>
        </div>
      </nav>
    </div>
  </div>
</header>

        <main className="mx-auto max-w-6xl px-5 pb-16">{children}</main>
      </body>
    </html>
  );
}
