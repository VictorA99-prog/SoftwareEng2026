"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Vinyl = {
  id: string;
  name: string;
  genre: string;
  image_url: string | null;
  created_at: string;
};

export default function AdminDashboard() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [name, setName] = useState("");
  const [genre, setGenre] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const [vinyls, setVinyls] = useState<Vinyl[]>([]);

  async function loadVinyls() {
    const { data, error } = await supabase
      .from("vinyls")
      .select("id,name,genre,image_url,created_at")
      .order("created_at", { ascending: false })
      .limit(8);

    if (!error && data) setVinyls(data as Vinyl[]);
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

      if (ok) await loadVinyls();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addVinyl(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;

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

      const { error } = await supabase.from("vinyls").insert({
        name: name.trim(),
        genre: genre.trim(),
        image_url,
      });

      if (error) throw new Error(error.message);

      setName("");
      setGenre("");
      setFile(null);
      setStatus("Vinyl added!");
      await loadVinyls();
    } catch (err: any) {
      setStatus(` ${err?.message ?? "Something went wrong"}`);
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
    <div className="p-6 max-w-3xl space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase">Admin Dashboard</h1>
          <p className="text-sm opacity-80">Signed in as: {email}</p>
        </div>
        <a className="underline underline-offset-4" href="/">
          View store
        </a>
      </div>

      {/* Add Vinyl Form */}
      <div className="border-4 border-black p-5 bg-[#F7E8D6] space-y-4">
        <h2 className="text-lg font-black uppercase">Add Vinyl</h2>

        <form onSubmit={addVinyl} className="space-y-3">
          <input
            className="w-full border-2 border-black rounded p-2"
            placeholder="Vinyl name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            className="w-full border-2 border-black rounded p-2"
            placeholder="Genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            required
          />

          <input
            className="w-full"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />

          <button
            disabled={saving}
            className="rounded bg-black text-white px-4 py-2 disabled:opacity-60"
          >
            {saving ? "Adding…" : "Add vinyl"}
          </button>
        </form>

        {status ? (
          <div className="text-sm border-2 border-black p-2">{status}</div>
        ) : null}
      </div>

      {/* Recent Vinyls */}
      <div className="space-y-3">
        <h2 className="text-lg font-black uppercase">Recently Added</h2>

        {vinyls.length === 0 ? (
          <div className="border-2 border-black p-4">No vinyls yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {vinyls.map((v) => (
              <div key={v.id} className="border-2 border-black p-3 bg-white">
                {v.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={v.image_url}
                    alt={v.name}
                    className="w-full h-40 object-cover border-2 border-black"
                  />
                ) : (
                  <div className="w-full h-40 border-2 border-black bg-[#F7E8D6]" />
                )}
                <div className="mt-2 font-black uppercase">{v.name}</div>
                <div className="text-sm font-semibold opacity-80">{v.genre}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
