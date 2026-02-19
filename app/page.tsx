import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();

  const { data: vinyls, error } = await supabase
    .from("vinyls")
    .select("id,name,genre,image_url,created_at")
    .order("created_at", { ascending: false })
    .limit(12);

  return (
    <div className="pt-10">
      <section className="relative mx-auto max-w-5xl">
        <div className="flex justify-center">
          <div className="relative">
            {/* Outer ring */}
            <div className="h-72 w-72 sm:h-80 sm:w-80 rounded-full bg-[#88A7A9] border-4 border-[#1f1f1f] flex items-center justify-center shadow-sm">
              {/* Inner sun */}
              <div className="h-56 w-56 sm:h-64 sm:w-64 rounded-full bg-[#F2D23C] border-4 border-[#1f1f1f] flex items-center justify-center">
                <div className="text-center px-6">
                  <div className="text-5xl">☼</div>
                  <p className="mt-2 font-black uppercase tracking-wide text-sm">
                    Vinyl Vibes
                  </p>
                </div>
              </div>
            </div>

            {/* sticker */}
            <div className="absolute -right-8 bottom-6 rotate-[-12deg]">
              <div
                className="bg-[#1f1f1f] text-[#F7E8D6] px-5 py-4 font-black uppercase tracking-wide text-sm shadow-sm"
                style={{
                  clipPath:
                    "polygon(10% 0%, 90% 0%, 100% 30%, 100% 70%, 90% 100%, 10% 100%, 0% 70%, 0% 30%)",
                }}
              >
                Feb 17
                <br />
                6–9 PM
              </div>
            </div>
          </div>
        </div>

        {/* big title */}
        <h1 className="mt-12 text-center font-black uppercase tracking-tight leading-[0.9] text-[56px] sm:text-[84px] md:text-[110px]">
          Paper
          <br />
          Grooves
        </h1>

        <p className="mx-auto mt-8 max-w-3xl text-center text-lg sm:text-xl font-semibold text-[#1f1f1f]/80">
          A cozy vinyl storefront for rare pressings, modern classics, and
          curated collections. Browse by genre, add to cart, and check out in a
          clean, poster-inspired UI.
        </p>


        {/* vinyl list */}
        <div className="mt-14">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              Latest Vinyls
            </h2>
            <Link
              href="/admin"
              className="relative z-50 inline-flex items-center text-sm font-semibold underline underline-offset-4"
            >
              Admin
            </Link>

          </div>

          {error ? (
            <pre className="mt-4 border-2 border-[#1f1f1f] p-3 text-sm overflow-auto">
              {error.message}
            </pre>
          ) : !vinyls || vinyls.length === 0 ? (
            <div className="mt-6 border-2 border-[#1f1f1f] p-6">
              <p className="font-semibold">
                No vinyls yet. Add one from <span className="underline">/admin</span>.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {vinyls.map((v) => (
                <div
                  key={v.id}
                  className="border-4 border-[#1f1f1f] p-3 shadow-sm bg-white"
                >
                  {v.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={v.image_url}
                      alt={v.name}
                      className="w-full h-48 object-cover border-2 border-[#1f1f1f]"
                    />
                  ) : (
                    <div className="w-full h-48 border-2 border-[#1f1f1f] bg-[#F7E8D6]" />
                  )}

                  <div className="mt-3">
                    <div className="font-black uppercase tracking-tight">
                      {v.name}
                    </div>
                    <div className="text-sm font-semibold text-[#1f1f1f]/80">
                      {v.genre}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
