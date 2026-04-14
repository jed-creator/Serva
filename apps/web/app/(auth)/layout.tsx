import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <header className="border-b border-zinc-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-xl font-semibold tracking-tight text-brand-primary">
              Serva
            </span>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="border-t border-zinc-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 text-center text-xs text-zinc-500">
          © {new Date().getFullYear()} Serva · Universal Booking Marketplace
        </div>
      </footer>
    </div>
  );
}
