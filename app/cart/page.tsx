export default function CartPage() {
    return (
      <section className="pt-10">
        <h1 className="text-4xl font-black uppercase tracking-tight">Cart</h1>
        <p className="mt-2 text-sm font-semibold text-black/70">
          Your selected records and gear will show up here.
        </p>
  
        <div className="mt-6 border-4 border-black bg-white p-6 shadow-[6px_6px_0_0_#000]">
          <p className="font-bold">Your cart is empty.</p>
        </div>
      </section>
    );
  }