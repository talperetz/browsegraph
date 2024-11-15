export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark text-foreground bg-gradient-to-r from-zinc-800 to-zinc-950 relative flex flex-col h-screen">
      <main className="container mx-auto max-w-7xl px-6 flex-grow">
        {children}
      </main>
    </div>
  );
}
