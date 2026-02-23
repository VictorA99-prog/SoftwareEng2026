"use client";

import { useEffect, useMemo, useState } from "react";

type Product = {
  id: number;
  title: string;
  artist: string;
  description?: string;
  price: number;
  quantity: number;
  image_url?: string;
};

function ProductCard({ p }: { p: Product }) {
  return (
    <div className="rounded-md border border-black bg-white p-3">
      <div className="aspect-[4/3] w-full overflow-hidden rounded-sm border border-black bg-[#F6E7D3]">
        {/* Using <img> for simplicity. Later you can switch to next/image */}
        {p.image_url ? (
          <img src={p.image_url} alt={p.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-bold uppercase">
            No image yet
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-sm font-extrabold uppercase">{p.title}</div>
        <div className="text-xs font-semibold opacity-80">{p.artist}</div>

        <div className="mt-2 flex items-center justify-between">
          <div className="text-sm font-black">${p.price.toFixed(2)}</div>
          <div className="text-xs font-bold">
            {p.quantity > 0 ? `${p.quantity} in stock` : "Out of stock"}
          </div>
        </div>
      </div>
    </div>
  );
}

const MOCK: Product[] = [
  { id: 1, title: "Rumours", artist: "Fleetwood Mac", price: 24.99, quantity: 8, image_url: "/placeholder1.jpg" },
  { id: 2, title: "Thriller", artist: "Michael Jackson", price: 29.99, quantity: 0, image_url: "/placeholder2.jpg" },
  { id: 3, title: "Random Access Memories", artist: "Daft Punk", price: 27.5, quantity: 3, image_url: "/placeholder3.jpg" },
];

export default function ProductsClient() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"price_asc" | "price_desc">("price_asc");
  const [inStockOnly, setInStockOnly] = useState(false);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    params.set("sort", sort);
    if (inStockOnly) params.set("inStock", "1");
    return params.toString();
  }, [q, sort, inStockOnly]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr(null);

      try {
        const res = await fetch(`http://localhost:5000/products?${queryString}`);
        if (!res.ok) throw new Error(`Backend error ${res.status}`);
        const data = await res.json();

        if (!Array.isArray(data)) throw new Error("Backend did not return an array yet");

        if (!cancelled) setItems(data);
      } catch (e: any) {
        if (!cancelled) {
          setErr(e?.message ?? "Failed to load");
          setItems(MOCK); // fallback so UI still demos
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [queryString]);

  return (
    <section>
      <div className="mb-4 flex flex-col gap-3 rounded-md border border-black bg-[#F6E7D3] p-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase">All Vinyl</h2>
          <p className="text-xs font-semibold opacity-80">Search, sort, and filter (in stock)</p>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title or artist"
            className="w-full border border-black bg-white px-3 py-2 text-sm font-semibold md:w-64"
          />

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="border border-black bg-white px-3 py-2 text-sm font-bold"
          >
            <option value="price_asc">Price low to high</option>
            <option value="price_desc">Price high to low</option>
          </select>

          <label className="flex items-center gap-2 text-sm font-bold">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="h-4 w-4"
            />
            In stock only
          </label>
        </div>
      </div>

      {loading ? (
        <div className="text-sm font-bold">Loading…</div>
      ) : err ? (
        <div className="mb-3 rounded-md border border-black bg-white p-3 text-sm font-bold">
          Backend not ready yet, showing mock data
          <div className="mt-1 text-xs opacity-70">Error: {err}</div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
    </section>
  );
}