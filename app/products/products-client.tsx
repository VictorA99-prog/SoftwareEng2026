"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type RawProduct = any;

type Product = {
  id: number | string;
  title: string;
  artist: string;
  description: string;
  price: number;
  quantity: number;
  image_url: string;
  category: string;
};

function normalizeProduct(p: RawProduct): Product {
  return {
    id: p.id ?? p.product_id ?? p.uuid ?? crypto.randomUUID(),
    title: String(p.title ?? p.name ?? p.product_name ?? "Untitled"),
    artist: String(p.artist ?? p.brand ?? p.maker ?? "Unknown Artist"),
    description: String(p.description ?? p.desc ?? ""),
    price: Number(p.price ?? p.cost ?? 0),
    quantity: Number(p.quantity ?? p.stock ?? p.qty ?? 0),
    image_url: String(p.image_url ?? p.image ?? p.cover_url ?? ""),
    category: String(p.category ?? p.type ?? "Vinyl"),
  };
}

function money(n: number) {
  const safe = Number.isFinite(n) ? n : 0;
  return `$${safe.toFixed(2)}`;
}

function badgeText(qty: number) {
  if (qty <= 0) return "Sold out";
  if (qty <= 3) return "Low stock";
  return "In stock";
}

// Always high contrast
function badgeStyle(qty: number) {
  if (qty <= 0) return "bg-black text-white border-white/20";
  if (qty <= 3) return "bg-[#FF3B3B] text-black border-black";
  return "bg-[#00BFA6] text-white border-black";
}

function ProductCard({ p }: { p: Product }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border-2 border-black bg-white shadow-[8px_8px_0_0_#000] transition-transform duration-200 hover:-translate-y-1">
      <div className="absolute left-3 top-3 z-10">
        <div
          className={`inline-block rounded-full border-2 px-3 py-1 text-xs font-black uppercase tracking-wider ${badgeStyle(
            p.quantity
          )}`}
        >
          {badgeText(p.quantity)}
        </div>
      </div>

      <div className="relative aspect-[1/1] w-full border-b-2 border-black bg-[#111]">
        {p.image_url ? (
          <img
            src={p.image_url}
            alt={p.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-6 text-center text-white">
            <div>
              <div className="text-sm font-black uppercase tracking-widest">No cover yet</div>
              <div className="mt-2 text-xs font-bold text-white/80">Add image_url in DB</div>
            </div>
          </div>
        )}

        {/* High contrast overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.28),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-lg font-black uppercase tracking-tight text-neutral-950">
              {p.title}
            </div>
            <div className="truncate text-sm font-extrabold text-neutral-800">
              {p.artist}
            </div>
          </div>

          {/* Price tag: white on deep teal */}
          <div className="shrink-0 rounded-xl border-2 border-black bg-[#007A6A] px-3 py-1 text-sm font-black text-white shadow-[3px_3px_0_0_#000]">
            {money(p.price)}
          </div>
        </div>

        {p.description ? (
          <div className="mt-2 line-clamp-2 text-xs font-semibold text-neutral-700">
            {p.description}
          </div>
        ) : (
          <div className="mt-2 text-xs font-bold text-neutral-600">No description yet</div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <div className="rounded-full border-2 border-black bg-[#FFD166] px-3 py-1 text-xs font-black uppercase text-black">
            {p.category}
          </div>

          <div className="text-xs font-black text-neutral-950">
            Qty: <span className="text-neutral-800">{p.quantity}</span>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            disabled={p.quantity <= 0}
            className="w-full rounded-xl border-2 border-black bg-black px-3 py-2 text-sm font-black uppercase tracking-wide text-white shadow-[3px_3px_0_0_#000] transition-all hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500 disabled:shadow-none"
          >
            Add to cart
          </button>

          <Link
            href={`/products/${p.id}`}
            className="rounded-xl border-2 border-black bg-white px-3 py-2 text-sm font-black uppercase tracking-wide text-black shadow-[3px_3px_0_0_#000] hover:bg-[#FF3B3B]"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ProductsClient() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"price_asc" | "price_desc" | "stock_desc">("stock_desc");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [category, setCategory] = useState<string>("All");

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (sort) params.set("sort", sort);
    if (inStockOnly) params.set("inStock", "1");
    if (category !== "All") params.set("category", category);
    return params.toString();
  }, [q, sort, inStockOnly, category]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr(null);

      try {
        const res = await fetch(`/api/products/all?${queryString}`);
        if (!res.ok) throw new Error(`Backend error ${res.status}`);
        const data = await res.json();

        const arr = Array.isArray(data) ? data : data?.data;
        if (!Array.isArray(arr)) throw new Error("Backend did not return an array");

        const normalized = arr.map(normalizeProduct);

        const fallback: Product[] = [
          {
            id: "demo-mj-1",
            title: "Thriller",
            artist: "Michael Jackson",
            description: "Pop legend. Full of hits.",
            price: 29.99,
            quantity: 7,
            image_url: "/covers/thriller.jpg",
            category: "Vinyl",
          },
          {
            id: "demo-weeknd-1",
            title: "After Hours",
            artist: "The Weeknd",
            description: "Modern classic. Dark, cinematic, iconic.",
            price: 28.5,
            quantity: 5,
            image_url: "/covers/after-hours.jpg",
            category: "Vinyl",
          },
          {
            id: "demo-cudi-1",
            title: "Man on the Moon: The End of Day",
            artist: "Kid Cudi",
            description: "Late night vibes. A whole era.",
            price: 27.0,
            quantity: 4,
            image_url: "/covers/motm1.jpg",
            category: "Vinyl",
          },
          {
            id: "demo-classic-1",
            title: "Abbey Road",
            artist: "The Beatles",
            description: "Timeless. Every track hits.",
            price: 26.99,
            quantity: 6,
            image_url: "/covers/abbey-road.jpg",
            category: "Vinyl",
          },
          {
            id: "demo-classic-2",
            title: "Dark Side of the Moon",
            artist: "Pink Floyd",
            description: "Classic front to back. Must have.",
            price: 31.99,
            quantity: 3,
            image_url: "/covers/dark-side.jpg",
            category: "Vinyl",
          },
          {
            id: "demo-classic-3",
            title: "Back to Black",
            artist: "Amy Winehouse",
            description: "Soulful, raw, and perfect.",
            price: 24.5,
            quantity: 8,
            image_url: "/covers/back-to-black.jpg",
            category: "Vinyl",
          },
          {
            id: "demo-classic-4",
            title: "Kind of Blue",
            artist: "Miles Davis",
            description: "Jazz masterpiece. Smooth and legendary.",
            price: 22.5,
            quantity: 5,
            image_url: "/covers/kind-of-blue.jpg",
            category: "Vinyl",
          },
          {
            id: "demo-classic-5",
            title: "The Miseducation of Lauryn Hill",
            artist: "Lauryn Hill",
            description: "Hip hop + soul classic. No skips.",
            price: 30.0,
            quantity: 2,
            image_url: "/covers/miseducation.jpg",
            category: "Vinyl",
          },
        ];

        let out = normalized.length ? normalized : fallback;

        // Client-side search/filter just in case backend ignores params
        if (q.trim()) {
          const qq = q.toLowerCase();
          out = out.filter((p) =>
            `${p.title} ${p.artist} ${p.description}`.toLowerCase().includes(qq)
          );
        }

        if (category !== "All") out = out.filter((p) => p.category === category);
        if (inStockOnly) out = out.filter((p) => p.quantity > 0);

        if (sort === "price_desc") out.sort((a, b) => b.price - a.price);
        else if (sort === "price_asc") out.sort((a, b) => a.price - b.price);
        else out.sort((a, b) => b.quantity - a.quantity);

        if (!cancelled) setItems(out);
      } catch (e: any) {
        if (!cancelled) {
          setErr(e?.message ?? "Failed to load");
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [queryString, q, sort, inStockOnly, category]);

  const categories = useMemo(() => {
    const set = new Set<string>(["All"]);
    items.forEach((p) => set.add(p.category || "Vinyl"));
    return Array.from(set);
  }, [items]);

  return (
    <section className="relative">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[#F6E7D3]" />
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(#000_1px,transparent_1px),linear-gradient(90deg,#000_1px,transparent_1px)] [background-size:32px_32px]" />
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#00BFA6] blur-3xl opacity-35" />
        <div className="absolute top-24 right-10 h-72 w-72 rounded-full bg-[#FF3B3B] blur-3xl opacity-25" />
      </div>

      {/* Hero */}
      <div className="rounded-2xl border-2 border-black bg-black p-6 text-white shadow-[10px_10px_0_0_#000]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-block rounded-full border-2 border-white bg-[#FFD166] px-4 py-2 text-xs font-black uppercase tracking-widest text-black">
              Sunset Vinyl Drop
            </div>

            <h1 className="mt-3 text-4xl font-black uppercase leading-none tracking-tight md:text-6xl">
              Shop <span className="ml-2 inline-block bg-white px-3 py-1 text-black">Vinyl</span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm font-semibold text-white/90">
              Loud UI, clean browsing, real inventory. Search, sort, filter, then add to cart.
            </p>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search title, artist, description"
              className="w-full rounded-xl border-2 border-white bg-white px-4 py-3 text-sm font-extrabold text-black placeholder:text-neutral-500 md:w-80"
            />

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="rounded-xl border-2 border-white bg-white px-4 py-3 text-sm font-black text-black"
            >
              <option value="stock_desc">Sort by availability</option>
              <option value="price_asc">Price low to high</option>
              <option value="price_desc">Price high to low</option>
            </select>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border-2 border-white bg-white px-4 py-3 text-sm font-black text-black"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-2 rounded-xl border-2 border-white bg-[#007A6A] px-4 py-3 text-sm font-black text-white shadow-[3px_3px_0_0_#000]">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="h-4 w-4"
              />
              In stock
            </label>
          </div>
        </div>

        {loading ? (
          <div className="mt-4 text-sm font-black text-white">Loading…</div>
        ) : err ? (
          <div className="mt-4 rounded-xl border-2 border-white bg-[#FF3B3B] p-3 text-sm font-black text-black">
            Backend not ready yet or env missing
            <div className="mt-1 text-xs font-black text-black">Error: {err}</div>
          </div>
        ) : null}
      </div>

      {/* Grid */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <ProductCard key={String(p.id)} p={p} />
        ))}
      </div>

      {!loading && !err && items.length === 0 ? (
        <div className="mt-8 rounded-2xl border-2 border-black bg-white p-8 text-center shadow-[10px_10px_0_0_#000]">
          <div className="text-2xl font-black uppercase text-black">No items found</div>
          <div className="mt-2 text-sm font-semibold text-neutral-700">
            Try a different search, or reset filters
          </div>
          <button
            onClick={() => {
              setQ("");
              setCategory("All");
              setInStockOnly(false);
              setSort("stock_desc");
            }}
            className="mt-5 rounded-xl border-2 border-black bg-black px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-[3px_3px_0_0_#000] hover:bg-white hover:text-black"
          >
            Reset filters
          </button>
        </div>
      ) : null}
    </section>
  );
}