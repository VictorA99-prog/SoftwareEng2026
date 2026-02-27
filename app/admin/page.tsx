"use client";

import { useEffect, useMemo, useState } from "react";
import { createClientBrowser } from "@/lib/supabase/client";

type ProductRow = {
  id: number | string;
  name: string;
  artist: string | null;
  description: string | null;
  price: number | null;
  quantity: number | null;
  category: string | null;
  genre: string | null;
  image_url: string | null;
  created_at: string;
};

const GENRE_OPTIONS = [
  "Pop",
  "Rock",
  "Hip-Hop",
  "R&B",
  "Jazz",
  "Soul",
  "Funk",
  "Electronic",
  "Indie",
  "Metal",
  "Classical",
  "Country",
  "Reggae",
  "Latin",
  "Soundtrack",
  "Other",
] as const;

export default function AdminDashboard() {
  const supabase = createClientBrowser();

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // form state
  const [name, setName] = useState("");
  const [artist, setArtist] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string>(""); // string for input control
  const [quantity, setQuantity] = useState<string>("1");
  const [category, setCategory] = useState("Vinyl");

  const [genreSelect, setGenreSelect] = useState<string>("Indie");
  const [customGenre, setCustomGenre] = useState<string>("");

  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const [recent, setRecent] = useState<ProductRow[]>([]);

  const resolvedGenre = useMemo(() => {
    if (genreSelect === "Other") return customGenre.trim();
    return genreSelect.trim();
  }, [genreSelect, customGenre]);

  async function loadRecent() {
    const { data, error } = await supabase
      .from("products")
      .select("id,name,artist,description,price,quantity,category,genre,image_url,created_at")
      .order("created_at", { ascending: false })
      .limit(8);

    if (!error && data) setRecent(data as ProductRow[]);
  }

  useEffect(() => {
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const userEmail = userRes.user?.email ?? null;
      setEmail(userEmail);

      if (!userEmail) {
        window.location.assign("/admin/login");
        return;
      }

      const { data, error } = await supabase
        .from("admins")
        .select("email")
        .eq("email", userEmail)
        .maybeSingle();

      const ok = !error && !!data;
      setIsAdmin(ok);
      setLoading(false);

      if (ok) await loadRecent();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addVinyl(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;

    // basic validation
    if (!name.trim()) return setStatus("Name is required.");
    if (!resolvedGenre) return setStatus("Pick a genre (or type a custom genre).");

    const priceNum =
      price.trim() === "" ? 0 : Number(price);
    const qtyNum =
      quantity.trim() === "" ? 0 : Number(quantity);

    if (!Number.isFinite(priceNum) || priceNum < 0) return setStatus("Price must be a valid number ≥ 0.");
    if (!Number.isFinite(qtyNum) || qtyNum < 0) return setStatus("Quantity must be a valid number ≥ 0.");

    setSaving(true);
    setStatus("");

    try {
      let image_url: string | null = null;

      if (file) {
        const ext = (file.name.split(".").pop() || "png").toLowerCase();
        const path = `${crypto.randomUUID()}.${ext}`;

        const upload = await supabase.storage
          .from("vinyl-images")
          .upload(path, file, { upsert: false });

        if (upload.error) throw new Error(upload.error.message);

        const { data } = supabase.storage.from("vinyl-images").getPublicUrl(path);
        image_url = data.publicUrl;
      }

      const { error } = await supabase.from("products").insert({
        name: name.trim(),
        artist: artist.trim() || null,
        description: description.trim() || null,
        price: priceNum,
        quantity: qtyNum,
        category: category.trim() || "Vinyl",
        genre: resolvedGenre || null,
        image_url,
      });

      if (error) throw new Error(error.message);

      // reset
      setName("");
      setArtist("");
      setDescription("");
      setPrice("");
      setQuantity("1");
      setCategory("Vinyl");
      setGenreSelect("Indie");
      setCustomGenre("");
      setFile(null);

      setStatus(":D Vinyl added to products!");
      await loadRecent();
    } catch (err: any) {
      setStatus(` :( ${err?.message ?? "Something went wrong"}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-6">Loading…</div>;

  if (!isAdmin) {
    return (
      <div className="p-6 space-y-3">
        <h1 className="text-xl font-semibold">Not authorized</h1>
        <p>Signed in as: {email}</p>
        <a className="underline" href="/admin/login">
          Switch account
        </a>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase">Admin Dashboard</h1>
          <p className="text-sm opacity-80">Signed in as: {email}</p>
        </div>
        <a className="underline underline-offset-4" href="/products">
          View store
        </a>
      </div>

      {/* Add Vinyl Form */}
      <div className="border-4 border-black p-5 bg-[#F7E8D6] space-y-4 shadow-[8px_8px_0_0_#000]">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-black uppercase">Add Product (Vinyl)</h2>
          <div className="text-xs font-black uppercase tracking-widest opacity-70">
            writes to: <span className="opacity-100">products</span>
          </div>
        </div>

        <form onSubmit={addVinyl} className="space-y-4">
          {/* Row 1 */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <div className="text-xs font-black uppercase tracking-widest">Name</div>
              <input
                className="w-full border-2 border-black rounded-sm p-2 bg-white"
                placeholder="Album / Vinyl name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <div className="text-xs font-black uppercase tracking-widest">Artist</div>
              <input
                className="w-full border-2 border-black rounded-sm p-2 bg-white"
                placeholder="Artist"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <div className="text-xs font-black uppercase tracking-widest">Price</div>
              <input
                className="w-full border-2 border-black rounded-sm p-2 bg-white"
                placeholder="29.99"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <div className="text-xs font-black uppercase tracking-widest">Quantity</div>
              <input
                className="w-full border-2 border-black rounded-sm p-2 bg-white"
                placeholder="10"
                inputMode="numeric"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <div className="text-xs font-black uppercase tracking-widest">Category</div>
              <select
                className="w-full border-2 border-black rounded-sm p-2 bg-white font-black uppercase"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Vinyl">Vinyl</option>
                <option value="Instrument">Instrument</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <div className="text-xs font-black uppercase tracking-widest">Genre</div>
              <select
                className="w-full border-2 border-black rounded-sm p-2 bg-white font-black uppercase"
                value={genreSelect}
                onChange={(e) => setGenreSelect(e.target.value)}
              >
                {GENRE_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              {genreSelect === "Other" ? (
                <input
                  className="mt-2 w-full border-2 border-black rounded-sm p-2 bg-white"
                  placeholder="Type custom genre"
                  value={customGenre}
                  onChange={(e) => setCustomGenre(e.target.value)}
                />
              ) : null}
            </div>

            <div className="space-y-1">
              <div className="text-xs font-black uppercase tracking-widest">Cover Image</div>
              <input
                className="w-full"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <div className="text-[11px] font-semibold opacity-70">
                Uploads to bucket: <span className="font-black">vinyl-images</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <div className="text-xs font-black uppercase tracking-widest">Description</div>
            <textarea
              className="w-full border-2 border-black rounded-sm p-2 bg-white min-h-[96px]"
              placeholder="Short description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button
            disabled={saving}
            className="w-full sm:w-auto rounded-sm border-2 border-black bg-black text-[#F7E8D6] px-4 py-2 font-black uppercase tracking-widest shadow-[6px_6px_0_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[10px_10px_0_0_#000] disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-[6px_6px_0_0_#000]"
          >
            {saving ? "Adding…" : "Add vinyl"}
          </button>
        </form>

        {status ? (
          <div className="text-sm border-2 border-black bg-white p-3 font-semibold">
            {status}
          </div>
        ) : null}
      </div>

      {/* Recent Products */}
      <div className="space-y-3">
        <h2 className="text-lg font-black uppercase">Recently Added (Products)</h2>

        {recent.length === 0 ? (
          <div className="border-2 border-black p-4 bg-white">No products yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recent.map((p) => (
              <div
                key={String(p.id)}
                className="group border-2 border-black p-3 bg-white shadow-[6px_6px_0_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[10px_10px_0_0_#000]"
              >
                {p.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="w-full h-44 object-cover border-2 border-black"
                  />
                ) : (
                  <div className="w-full h-44 border-2 border-black bg-[#F7E8D6]" />
                )}

                <div className="mt-2 font-black uppercase truncate">{p.name}</div>
                <div className="text-sm font-semibold opacity-80 truncate">
                  {p.artist || "Unknown Artist"}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-black uppercase">
                  <span className="border-2 border-black px-2 py-1 bg-[#FFD6A5]">
                    {p.genre || "—"}
                  </span>
                  <span className="border-2 border-black px-2 py-1 bg-[#2EC4B6] text-black">
                    {p.category || "Vinyl"}
                  </span>
                  <span className="ml-auto opacity-80">
                    Qty {p.quantity ?? 0}
                  </span>
                </div>

                <div className="mt-2 text-sm font-black">
                  ${Number(p.price ?? 0).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}